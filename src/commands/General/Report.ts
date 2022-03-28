import { GuildMember, TextChannel } from "discord.js";
import { Command } from "../../lib/structures/Command";

export default new Command({
	name: "report",
	description: "Report a user.",
	usage: "report <user> <reason>",
	minArgs: 2,
	userPerms: ["SEND_MESSAGES"],
	run: async ({ client, message, args, utils, lang }) => {
		const { Report } = lang.GeneralModule.Commands;
		const member = args.get("member", 0) as GuildMember;
		const channel = utils.findChannel(client.config.Channels.Reports, message.guild) as TextChannel;
		const reason = args.rest(1) as string;

		if (!channel)
			return utils.iReply(message, {
				embeds: [client.embed.globalErr({ message: Report.NotSetup })],
			});
		if (!member) return utils.iReply(message, { embeds: [await utils.Usage("report", message.guild)] });
		if (member.user.bot) return utils.iReply(message, { embeds: [client.embed.globalErr({ message: Report.ReportBot })] });
		if (member.id === message.author.id) return utils.iReply(message, { embeds: [client.embed.globalErr({ message: Report.ReportSelf })] });

		channel
			.send({
				embeds: [
					client.embed.create({
						Title: Report.Report.Title,
						Fields: [
							{ name: Report.Report.Fields[0], value: `<@${member.id}>` },
							{ name: Report.Report.Fields[1], value: `<@${message.author.id}>` },
							{ name: Report.Report.Fields[2], value: reason },
						],
						Timestamp: true,
					}),
				],
			})
			.catch(() => {});

		message.delete();
		const m = await message.channel.send({
			embeds: [client.embed.globalSuccess({ title: Report.Reported.Title, message: Report.Reported.Description, timestamp: true })],
		});
		utils.deleteMsg(m, 10000);
	},
});
