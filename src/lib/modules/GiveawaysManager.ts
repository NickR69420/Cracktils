import { userMention, hyperlink } from "@discordjs/builders";
import { Giveaway } from "@prisma/client";
import { GuildMember, MessageReaction, TextChannel } from "discord.js";
import EventEmitter from "events";
import { GiveawayEvents } from "../../typings/Giveaways";
import { Cracktils } from "../structures/Client";

export declare interface GiveawaysManager {
	on<K extends keyof GiveawayEvents>(event: K, listener: (...args: GiveawayEvents[K]) => void): this;
	once<K extends keyof GiveawayEvents>(event: K, listener: (...args: GiveawayEvents[K]) => void): this;
	emit<K extends keyof GiveawayEvents>(event: K, ...args: GiveawayEvents[K]): boolean;
}

export class GiveawaysManager extends EventEmitter {
	client: Cracktils;
	constructor(client: Cracktils) {
		super();

		this.client = client;
	}

	public async getGiveaway(id: string) {
		return await this.client.prisma.giveaway.findUnique({ where: { id } });
	}

	public async addReaction(id: string, userId: string) {
		await this.client.prisma.giveaway.update({
			where: {
				id,
			},
			data: {
				users: {
					push: [userId],
				},
			},
		});

		return true;
	}

	public async removeReaction(id: string, userId: string) {
		const data = await this.client.prisma.giveaway.findUnique({ where: { id } });
		if (!data) return;

		const users = data.users;
		const index = users.indexOf(userId);
		users.splice(index, 1);

		await this.client.prisma.giveaway.update({
			where: { id },
			data: {
				users: {
					set: users,
				},
			},
		});
		return true;
	}

	public async handleReactionAdd(reaction: MessageReaction, userId: string) {
		const giveaway = await this.getGiveaway(reaction.message.id);
		if (!giveaway || userId === this.client.user.id) return;
		if (giveaway.ended || giveaway.endAt <= new Date()) return;

		const data = await this.getGiveawayData(giveaway, userId);
		if (!data) return;

		const { member, message } = data;

		this.emit("giveawayJoined", member, message, giveaway);
		await this.addReaction(giveaway.id, member.id);
	}

	public async handleReactionRemove(reaction: MessageReaction, userId: string) {
		const giveaway = await this.getGiveaway(reaction.message.id);
		if (!giveaway) return;
		if (giveaway.ended || giveaway.endAt <= new Date()) return;

		const data = await this.getGiveawayData(giveaway, userId);
		if (!data) return;

		const { member, message } = data;
		this.emit("giveawayLeft", member, message, giveaway);
		await this.removeReaction(giveaway.id, member.id);
	}

	public deleteGiveaway(id: string) {
		return new Promise<boolean>(async (res, rej) => {
			const giveaway = await this.getGiveaway(id);
			if (!giveaway) return rej(false);

			const channel = (await this.client.channels.fetch(giveaway.channelId)) as TextChannel;
			if (!channel) return res(await this.delete(giveaway.id));
			const message = await channel.messages.fetch(giveaway.id);
			if (!message) return res(await this.delete(giveaway.id));
			if (message && message.deletable) message.delete();

			res(await this.delete(giveaway.id));
		});
	}

	public async delete(id: string) {
		await this.client.prisma.giveaway.delete({ where: { id } }).catch(() => {});

		return true;
	}

	public async getGiveawayData(giveaway: Giveaway, userId?: string) {
		const guild = this.client.guilds.cache.get(giveaway.guildId);
		if (!guild || !guild.available) return null;
		const channel = (await this.client.channels.fetch(giveaway.channelId)) as TextChannel;
		if (!channel) return null;
		const message = await channel.messages.fetch(giveaway.id);
		if (!message) return null;
		let member: GuildMember;
		if (userId) {
			member = await guild.members.fetch(userId);
			if (!member) return null;

			return { guild, member, channel, message };
		}
		return { guild, channel, message };
	}

	public async getWinners(giveaway: Giveaway, winnerCount?: number, filter?: string[]) {
		let reactions = giveaway.users;
		const winners: string[] = [];
		const count = winnerCount ?? giveaway.winners;
		for (let i = 0; i < count; i++) {
			if (filter) reactions = reactions.filter((r) => !filter.includes(r));

			let u = reactions[~~(Math.random() * reactions.length)];
			if (u == undefined) return;

			await this.removeReaction(giveaway.id, u);
			winners.push(u);
			break;
		}

		return winners;
	}

	public async end(giveaway: Giveaway) {
		const { Ended, Commands, WinnerEmbed } = this.client.lang.GiveawaySystem;
		const data = await this.getGiveawayData(giveaway);
		if (!data) {
			this.deleteGiveaway(giveaway.id);
			return false;
		}

		const { message } = data;
		const reactions = giveaway.users;

		const winners = await this.getWinners(giveaway);
		const allWinners = winners.map((w) => userMention(w)).join(" ") || "None.";

		await message.edit({
			content: Ended.Content,
			embeds: [
				this.client.embed.create({
					Title: message.embeds[0].title,
					Description: this.client.utils.replaceText(Ended.Description, "WINNERS", allWinners),
					Footer: { text: Ended.Footer },
					Image: message.embeds[0].image ? message.embeds[0].image.url : undefined,
					Timestamp: message.embeds[0].timestamp,
					Color: this.client.config.EmbedColors.noColor,
				}),
			],
		});

		if (reactions.length == 0) {
			this.client.utils.iReply(message, { embeds: [this.client.embed.globalErr({ message: Commands.NoOneEntered })] });
			await this.client.prisma.giveaway.update({
				where: { id: giveaway.id },
				data: {
					ended: true,
				},
			});
			return true;
		}

		message.reply({
			content: this.client.utils.replaceText(WinnerEmbed.Content, "WINNERS", allWinners),
			embeds: [
				this.client.embed.create({
					Description: WinnerEmbed.Description.replace("WINNERS", allWinners)
						.replace("PRIZE", giveaway.prize)
						.replace("URL", message.url)
						.replace("HOST", userMention(giveaway.hostedBy))
						.replace("COMMAND", `${await this.client.db.getPrefix(message.guild.id)}greroll ${message.id}`),
				}),
			],
		});

		await this.client.prisma.giveaway.update({
			where: { id: giveaway.id },
			data: {
				ended: true,
			},
		});

		return true;
	}
}
