import { GuildMember } from "discord.js";
import { SlashCommand } from "../../lib/structures/SlashCommand";

export default new SlashCommand({
	name: "avatar",
	description: "View a user's avatar or guild avatar.",
	userPerms: ["SEND_MESSAGES"],
	options: [
		{
			name: "user",
			description: "Displays a user's avatar.",
			type: "SUB_COMMAND",
			options: [
				{
					name: "user",
					description: "The user whose avatar you want to view.",
					type: "USER",
					required: false,
				},
			],
		},
		{
			name: "guild",
			description: "Displays a user's guild avatar.",
			type: "SUB_COMMAND",
			options: [
				{
					name: "user",
					description: "The user whose avatar you want to view.",
					type: "USER",
					required: false,
				},
			],
		},
	],
	run: async ({ client, interaction }) => {
		const member = (interaction.options.getMember("user") as GuildMember) || interaction.member;
		const guild = interaction.options.getSubcommand() === "guild";

		interaction.reply({
			embeds: [
				client.embed.create({
					Author: { name: guild ? member.displayName : member.user.tag, iconURL: member.user.displayAvatarURL() },
					Image: guild
						? member.displayAvatarURL({ dynamic: true, size: 2048 })
						: member.user.displayAvatarURL({ dynamic: true, size: 2048 }),
					Color: member.displayHexColor === "#000000" ? client.config.EmbedColors.noColor : member.displayHexColor,
				}),
			],
		});
	},
});
