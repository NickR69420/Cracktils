import { GuildMember, TextChannel } from "discord.js";
import { SlashCommand } from "../../lib/structures/SlashCommand";

export default new SlashCommand({
	name: "report",
	description: "Report a user.",
	userPerms: ["SEND_MESSAGES"],
	options: [
		{
			name: "user",
			description: "The user to report.",
			type: "USER",
			required: true,
		},
		{
			name: "reason",
			description: "The reason for this report.",
			type: "STRING",
			required: true,
		},
	],
	run: async ({ client, interaction, utils, lang }) => {
		const { Report } = lang.GeneralModule.Commands;
		const member = interaction.options.getMember("user") as GuildMember;
		const channel = utils.findChannel(client.config.Channels.Reports, interaction.guild) as TextChannel;
		const reason = interaction.options.getString("reason");

		if (!channel)
			return interaction.reply({
				embeds: [client.embed.globalErr({ message: Report.NotSetup })],
				ephemeral: true,
			});

		if (member.user.bot) return interaction.reply({ embeds: [client.embed.globalErr({ message: Report.ReportBot })], ephemeral: true });
		if (member.id === interaction.user.id)
			return interaction.reply({ embeds: [client.embed.globalErr({ message: Report.ReportSelf })], ephemeral: true });

		channel
			.send({
				embeds: [
					client.embed.create({
						Title: Report.Report.Title,
						Fields: [
							{ name: Report.Report.Fields[0], value: `<@${member.id}>` },
							{ name: Report.Report.Fields[1], value: `<@${interaction.user.id}>` },
							{ name: Report.Report.Fields[2], value: reason },
						],
						Timestamp: true,
					}),
				],
			})
			.catch(() => {});

		interaction.reply({
			embeds: [client.embed.globalSuccess({ title: Report.Reported.Title, message: Report.Reported.Description, timestamp: true })],
			ephemeral: true,
		});
	},
});
