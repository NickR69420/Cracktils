import { Role } from "discord.js";
import { SlashCommand } from "../../lib/structures/SlashCommand";

export default new SlashCommand({
	name: "roleinfo",
	description: "View information on a role.",
	userPerms: ["SEND_MESSAGES"],
	options: [
		{
			name: "role",
			description: "The role to view.",
			type: "ROLE",
			required: true,
		},
	],
	run: async ({ client, interaction, utils, lang }) => {
		const { RoleInfo } = lang.GeneralModule.Commands;
		const role = interaction.options.getRole("role") as Role;
		const roleMembers =
			role.members.size > 10
				? role.members
						.map((m) => `<@${m.id}>`)
						.slice(0, 25)
						.join(" ") + " and more..."
				: role.members.map((m) => `<@${m.id}>`).join(" ");

		interaction.reply({
			embeds: [
				client.embed.create({
					Description: `<@&${role.id}>`,
					Fields: [
						{
							name: RoleInfo.Fields[0],
							value: role.name,
							inline: true,
						},
						{
							name: RoleInfo.Fields[1],
							value: `${role.position}`,
							inline: true,
						},
						{
							name: RoleInfo.Fields[2],
							value: role.hexColor,
							inline: true,
						},
						{
							name: utils.replaceText(RoleInfo.Fields[3], "AMT", `${role.members.size}`),
							value: role.members.size > 0 ? roleMembers : "None.",
						},
						{
							name: RoleInfo.Fields[4],
							value: `${utils.formatDate(role.createdTimestamp, "f")} (${utils.formatDate(role.createdTimestamp, "R")})`,
						},
					],
					Footer: { text: utils.replaceText(RoleInfo.Footer, "id", role.id) },
					Color: role.hexColor,
				}),
			],
		});
	},
});
