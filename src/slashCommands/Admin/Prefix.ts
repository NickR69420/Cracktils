import { SlashCommand } from "../../lib/structures/SlashCommand";

export default new SlashCommand({
	name: "prefix",
	description: "View or configure the prefix.",
	userPerms: ["ADMINISTRATOR"],
	options: [
		{
			name: "view",
			description: "View the prefix.",
			type: "SUB_COMMAND",
		},
		{
			name: "set",
			description: "Set the prefix.",
			type: "SUB_COMMAND",
			options: [
				{
					name: "prefix",
					description: "The prefix to set.",
					type: "STRING",
					required: true,
				},
			],
		},
	],
	run: async ({ client, interaction, utils, lang }) => {
		const { Prefix } = lang.AdminModule.Commands;

		switch (interaction.options.getSubcommand()) {
			case "view": {
				const prefix = await client.db.getPrefix(interaction.guild.id);

				interaction.reply({
					embeds: [
						client.embed.create({
							Description: utils.replaceText(Prefix.View, "PREFIX", prefix),
							Color: client.config.EmbedColors.Default,
						}),
					],
					ephemeral: true,
				});

				break;
			}
			case "set": {
				const newPrefix = interaction.options.getString("prefix");

				await client.prisma.guild
					.update({
						where: { id: interaction.guild.id },
						data: { prefix: newPrefix },
					})
					.catch((err) => {
						client.logger.error(err);
						interaction.reply({
							embeds: [
								client.embed.globalErr({
									message: lang.GlobalErrors.cmdErr,
								}),
							],
							ephemeral: true,
						});
						return;
					});

				interaction.reply({
					embeds: [
						client.embed.globalSuccess({
							message: utils.replaceText(Prefix.Set, "PREFIX", newPrefix),
						}),
					],
					ephemeral: true,
				});
			}
		}
	},
});
