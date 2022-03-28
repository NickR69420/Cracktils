import { GuildMember, Role } from "discord.js";
import { SlashCommand } from "../../lib/structures/SlashCommand";

export default new SlashCommand({
	name: "giverole",
	description: "Give all or a certain user a role.",
	userPerms: ["ADMINISTRATOR"],
	options: [
		{
			name: "user",
			description: "Give a role to a specific user.",
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
					description: "The role to give.",
					type: "ROLE",
					required: true,
				},
			],
		},
		{
			name: "all",
			description: "Gives a role to all members.",
			type: "SUB_COMMAND",
			options: [
				{
					name: "role",
					description: "The role to give.",
					type: "ROLE",
					required: true,
				},
			],
		},
	],
	run: async ({ client, interaction, utils, lang }) => {
		const { Giverole } = lang.AdminModule.Commands;
		const role = interaction.options.getRole("role") as Role;

		switch (interaction.options.getSubcommand()) {
			case "user": {
				const member = interaction.options.getMember("user") as GuildMember;

				if (role.position > interaction.member.roles.highest.position)
					return interaction.reply({
						embeds: [
							client.embed.globalErr({
								message: Giverole.HigherRole[0],
							}),
						],
						ephemeral: true,
					});

				if (role.position > interaction.guild.me.roles.highest.position)
					return interaction.reply({
						embeds: [
							client.embed.globalErr({
								message: Giverole.HigherRole[0],
							}),
						],
						ephemeral: true,
					});

				if (member.user.bot) {
					return interaction.reply({
						embeds: [
							client.embed.globalErr({
								message: Giverole.isBot,
							}),
						],
						ephemeral: true,
					});
				}

				await member.roles.add(role, `Added by: ${interaction.user.tag}`).catch(() => {});

				interaction.reply({
					embeds: [
						client.embed.globalSuccess({
							title: Giverole.RoleAdded.Title,
							message: utils.replaceText(Giverole.RoleAdded.Description, "ROLE", `<@&${role.id}>`).replace("TARGET", `<@${member.id}>`),
							timestamp: true,
						}),
					],
					ephemeral: true,
				});
				break;
			}
			case "all": {
				if (role.position > interaction.member.roles.highest.position)
					return interaction.reply({
						embeds: [
							client.embed.globalErr({
								message: Giverole.HigherRole[0],
							}),
						],
						ephemeral: true,
					});

				if (role.position > interaction.guild.me.roles.highest.position)
					return interaction.reply({
						embeds: [
							client.embed.globalErr({
								message: Giverole.HigherRole[0],
							}),
						],
						ephemeral: true,
					});

				interaction.guild.members.cache
					.filter((m) => !m.user.bot)
					.forEach(async (m) => {
						await m.roles.add(role, `Added by: ${interaction.user.tag}`).catch(() => {});
					});

				interaction.reply({
					embeds: [
						client.embed.globalSuccess({
							title: Giverole.RoleAdded.Title,
							message: utils.replaceText(Giverole.RoleAdded.Description, "ROLE", `<@&${role.id}>`).replace("TARGET", `everyone`),
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
