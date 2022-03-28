import { GuildMember, Role } from "discord.js";
import { SlashCommand } from "../../lib/structures/SlashCommand";

export default new SlashCommand({
	name: "takerole",
	description: "Take a role from all or a certain user.",
	userPerms: ["ADMINISTRATOR"],
	options: [
		{
			name: "user",
			description: "Takes a role from a user.",
			type: "SUB_COMMAND",
			options: [
				{
					name: "user",
					description: "The user.",
					type: "USER",
					required: true,
				},
				{
					name: "role",
					description: "The role to remove.",
					type: "ROLE",
					required: true,
				},
			],
		},
		{
			name: "everyone",
			description: "Takes a role from all members.",
			type: "SUB_COMMAND",
			options: [
				{
					name: "role",
					description: "The role to take.",
					type: "ROLE",
					required: true,
				},
			],
		},
	],
	run: async ({ client, interaction, utils, lang }) => {
		const { Takerole } = lang.AdminModule.Commands;
		const role = interaction.options.getRole("role") as Role;

		switch (interaction.options.getSubcommand()) {
			case "user": {
				const member = interaction.options.getMember("user") as GuildMember;

				if (role.position > interaction.member.roles.highest.position)
					return interaction.reply({
						embeds: [
							client.embed.globalErr({
								message: Takerole.HigherRole[0],
							}),
						],
						ephemeral: true,
					});

				if (role.position > interaction.guild.me.roles.highest.position)
					return interaction.reply({
						embeds: [
							client.embed.globalErr({
								message: Takerole.HigherRole[1],
							}),
						],
						ephemeral: true,
					});

				await member.roles.remove(role, `Removed by: ${interaction.user.tag}`).catch(() => {});

				interaction.reply({
					embeds: [
						client.embed.globalSuccess({
							title: Takerole.RoleRemoved.Title,
							message: utils.replaceText(Takerole.RoleRemoved.Description, "ROLE", `${role}`).replace("TARGET", `<@${member.id}>`),
							timestamp: true,
						}),
					],
					ephemeral: true,
				});
				break;
			}
			case "everyone": {
				if (role.position > interaction.member.roles.highest.position)
					return interaction.reply({
						embeds: [
							client.embed.globalErr({
								message: Takerole.HigherRole[0],
							}),
						],
						ephemeral: true,
					});

				if (role.position > interaction.guild.me.roles.highest.position)
					return interaction.reply({
						embeds: [
							client.embed.globalErr({
								message: Takerole.HigherRole[1],
							}),
						],
						ephemeral: true,
					});

				interaction.guild.members.cache.forEach(async (m) => {
					await m.roles.remove(role, `Removed by: ${interaction.user.tag}`);
				});

				interaction.reply({
					embeds: [
						client.embed.globalSuccess({
							title: Takerole.RoleRemoved.Title,
							message: utils.replaceText(Takerole.RoleRemoved.Description, "ROLE", `${role}`).replace("TARGET", `everyone`),
							timestamp: true,
						}),
					],
					ephemeral: true,
				});
				break;
			}
		}
	},
});
