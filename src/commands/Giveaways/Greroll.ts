import { userMention } from "@discordjs/builders";
import { GuildMember } from "discord.js";
import { Command } from "../../lib/structures/Command";

export default new Command({
	name: "greroll",
	description: "Create a new set of winners for a giveaway. You may also exclude specific users from winning.",
	usage: "greroll <id> [number of winners] [user1 user2 user3]",
	minArgs: 1,
	aliases: ["gr"],
	userPerms: ["MANAGE_MESSAGES"],
	run: async ({ client, message, args, utils, lang }) => {
		const { Greroll } = lang.GiveawaySystem.Commands;

		if (!utils.hasRole(message.member, client.config.Roles.JrAdmin, true, message.guild))
			return utils.iReply(message, {
				embeds: [client.embed.globalErr({ title: lang.GlobalErrors.NoPerms.Title, message: lang.GlobalErrors.NoPerms.Description })],
			});

		const id = args.pick(0) as string;
		const count = (args.pick(2, true) as number) || 1;
		const users = args.rest(1);
		const giveaway = await client.giveaways.getGiveaway(id);
		if (!giveaway) return utils.iReply(message, { embeds: [client.embed.globalErr({ message: Greroll.InvalidGiveaway })] });
		if (!giveaway.ended) return utils.iReply(message, { embeds: [client.embed.globalErr({ message: Greroll.GiveawayHasntEnded })] });

		const data = await client.giveaways.getGiveawayData(giveaway);
		if (!data) return utils.iReply(message, { embeds: [client.embed.globalErr({ message: Greroll.InvalidGiveaway })] });

		utils.deleteMsg(message);

		const { message: m } = data;
		if (giveaway.users.length == 0)
			return utils.iReply(m, { embeds: [client.embed.globalErr({ message: lang.GiveawaySystem.Commands.NoOneEntered })] });

		let excluded: string[] = [];
		if (users) excluded = excludedUsers(users);

		let winners: string[] = [];

		if (excluded.length > 0) winners = await client.giveaways.getWinners(giveaway, count, excluded);
		else winners = await client.giveaways.getWinners(giveaway, count);

		if (winners.some((w) => w == undefined))
			return utils.iReply(m, { embeds: [client.embed.globalErr({ message: lang.GiveawaySystem.Commands.NoOneEntered })] });

		m.reply({
			content: utils.replaceText(lang.GiveawaySystem.ReRolled.Content, "WINNERS", winners.map((w) => userMention(w)).join(" ")),
		});

		m.edit({
			embeds: [
				client.embed.create({
					Title: m.embeds[0].title,
					Description: utils.replaceText(lang.GiveawaySystem.Ended.Description, "WINNERS", winners.map((w) => userMention(w)).join(" ")),
					Image: m.embeds[0].image ? m.embeds[0].image.url : undefined,
					Timestamp: m.embeds[0].timestamp,
				}),
			],
		});

		function excludedUsers(a: string) {
			const exclude: string[] = [];
			const users = a.split(" ");

			if (message.mentions) {
				const mentions = message.mentions.members.map((u) => u.id);

				mentions.forEach((id) => exclude.push(id));
			}
			users.forEach((user) => {
				const member = utils.findMember(user, message.guild) as GuildMember;
				if (!member) return;
				else exclude.push(member.id);
			});

			return exclude;
		}
	},
});
