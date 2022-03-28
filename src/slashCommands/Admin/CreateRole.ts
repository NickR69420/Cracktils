import { ColorResolvable, Permissions } from "discord.js";
import { SlashCommand } from "../../lib/structures/SlashCommand";

export default new SlashCommand({
	name: "createrole",
	description: "Creates a role.",
	userPerms: ["ADMINISTRATOR"],
	options: [
		{
			name: "name",
			description: "Name of the role.",
			type: "STRING",
			required: true,
		},
		{
			name: "color",
			description: "The hex color to set as role color.",
			type: "STRING",
			required: false,
		},
		{
			name: "permissions",
			description: "The calculated permissions number. Refer https://discordapi.com/permissions.html",
			type: "INTEGER",
			required: false,
		},
	],
	run: async ({ client, interaction, utils, lang }) => {
		const { Createrole } = lang.AdminModule.Commands;

		const name = interaction.options.getString("name");
		const color = (interaction.options.getString("color") as ColorResolvable) || "#000000";
		const permInt = interaction.options.getInteger("permissions") || 0;

		if (/#([a-f]|[0-9]){6}/.test(name))
			return interaction.reply({
				embeds: [
					client.embed.globalErr({
						message: Createrole.Errors.InvalidHex,
					}),
				],
				ephemeral: true,
			});

		await interaction.reply({
			embeds: [
				client.embed.create({
					Description: "Creating role...",
					Color: client.config.EmbedColors.Default,
				}),
			],
			ephemeral: true,
		});

		try {
			const role = await interaction.guild.roles.create({
				name,
				color,
				permissions: `${BigInt(permInt)}`,
			});

			interaction.editReply({
				embeds: [
					client.embed.create({
						Title: Createrole.RoleCreated.Title,
						Description: utils.replaceText(
							utils.replaceText(Createrole.RoleCreated.Description, "ROLE", `${role}`),
							"PERMS",
							new Permissions(role.permissions)
								.toArray()
								.map((r) => `\`${r}\``)
								.join(", ")
						),
						Color: color,
					}),
				],
			});
		} catch (err) {
			client.logger.error(err);
			interaction.editReply({
				embeds: [
					client.embed.globalErr({
						message: Createrole.Errors.RoleError,
					}),
				],
			});
			return;
		}
	},
});
