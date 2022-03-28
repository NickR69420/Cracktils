import {
	ButtonInteraction,
	ClientEvents,
	Guild,
	GuildMember,
	Message,
	ReplyMessageOptions,
	Snowflake,
	SnowflakeUtil,
	TextBasedChannel,
	TextChannel,
	User,
} from "discord.js";
import { client } from "../..";
import MS, { StringValue } from "ms";
import { Duration } from "@sapphire/time-utilities";
import { embedOptions } from "./Embeds";
import { createPaste } from "hastebin";

export default class Utils {
	public async importFile(filePath: string) {
		return (await import(filePath))?.default;
	}

	public async iReply(message: Message, { content, embeds, components, files, attachments }: ReplyMessageOptions) {
		return await message.reply({
			content: content,
			embeds: embeds,
			components: components,
			files: files,
			attachments: attachments,
			allowedMentions: { repliedUser: false },
		});
	}

	public replaceText(str: string, replace: string, replaceWith: string) {
		return str.replace(replace, replaceWith);
	}

	public findMember(m: string, guild: Guild) {
		const member = guild.members.cache.find((mem) => mem.id === m || mem.user.username === m || mem.displayName === m);
		if (!member) return false;
		return member;
	}

	public hasRole(member: GuildMember, roleId: Snowflake, checkpos?: boolean, guild?: Guild) {
		if (checkpos) {
			const role = guild.roles.cache.get(roleId);
			if (!role) return false;
			if (role.position > member.roles.highest.position) return false;
			else return true;
		} else return member.roles.cache.has(roleId);
	}

	public findRole(r: string, guild: Guild) {
		const role = guild.roles.cache.find((role) => role.name === r || role.id === r);
		if (!role) return false;
		return role;
	}

	public findChannel(ch: string, guild: Guild) {
		const channel = guild.channels.cache.find((c) => c.name == ch || c.id === ch) as TextChannel;
		if (!channel) return false;
		return channel;
	}

	public waitForResponse(userId: Snowflake, channel: TextChannel) {
		const filter = (m: Message) => m.author.id === userId;

		return new Promise<Message>((resolve, reject) => {
			channel
				.awaitMessages({
					filter: filter,
					max: 1,
				})
				.then((msgs) => {
					resolve(msgs.first());
				})
				.catch(reject);
		});
	}

	public waitForButton(userId: Snowflake, msg: Message) {
		const filter = (i: ButtonInteraction) => i.user.id === userId;

		return new Promise<ButtonInteraction>(async (resolve, reject) => {
			await msg
				.awaitMessageComponent({
					filter,
					componentType: "BUTTON",
				})
				.then((i) => {
					resolve(i);
				})
				.catch(reject);
		});
	}

	public buttonCollector(channel: TextBasedChannel, author: User, time?: number, max?: number) {
		const filter = (i: ButtonInteraction) => i.user.id === author.id;

		return channel.createMessageComponentCollector({
			componentType: "BUTTON",
			time: time ? time : 120000,
			max: max ? max : 100000,
			filter,
		});
	}

	public deleteMsg(message: Message, timeout?: number) {
		if (timeout) {
			setTimeout(() => {
				message.delete().catch(() => {});
			}, timeout);
		} else {
			message.delete();
		}
	}

	public async Usage(command: string, guild: Guild) {
		const { usage } = client.commands.get(command);
		if (!usage) return null;

		return client.embed.globalErr({
			message: this.replaceText(client.lang.GlobalErrors.InvalidArgs.Description, "USAGE", (await client.db.getPrefix(guild.id)) + usage),
			title: client.lang.GlobalErrors.InvalidArgs.Title,
		});
	}

	public generateId() {
		return SnowflakeUtil.generate().toString();
	}

	public ms(value: any) {
		return MS(value as StringValue);
	}

	public getDuration(time: string) {
		return new Duration(time).fromNow || null;
	}

	public getExpires(duration: Date) {
		if (!isNaN(duration.getTime()) && duration.getTime() > Date.now()) {
			return new Date(duration);
		} else return null;
	}

	public formatDate(time: number, type: string) {
		return `<t:${Math.floor(time / 1000)}:${type}>`;
	}

	public capitalize(str: string) {
		return str.charAt(0).toUpperCase() + str.substring(1).toLowerCase();
	}

	public log(event: keyof ClientEvents, embed: embedOptions) {
		const { Logging } = client.config;
		if (Logging.Enabled && Logging[event].Enabled) {
			const logs = client.channels.cache.find(
				(c: TextChannel) => c.name == Logging[event].Channel || c.id === Logging[event].Channel
			) as TextChannel;
			if (!logs) return;

			logs.send({
				embeds: [client.embed.create({ Footer: { text: "Logging " }, ...embed })],
			}).catch(() => {});
		}
	}

	public async hastebin(content: string) {
		const url = await createPaste(content, {
			raw: true,
			server: "https://hastebin.com",
		});

		return url;
	}
}
