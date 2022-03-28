import { SlashCommand } from "../../lib/structures/SlashCommand";
import backup from "discord-backup";
import { EmbedFieldData } from "discord.js";

export default new SlashCommand({
	name: "backup",
	description: "Backup or restore the server.",
	userPerms: ["MANAGE_GUILD"],
	options: [
		{
			type: "SUB_COMMAND",
			name: "create",
			description: "Creates a backup of the server.",
		},
		{
			type: "SUB_COMMAND",
			name: "load",
			description: "Loads a backup of the server.",
			options: [
				{
					type: "STRING",
					name: "id",
					description: "The ID of the backup to load.",
					required: true,
				},
			],
		},
		{
			type: "SUB_COMMAND",
			name: "list",
			description: "Displays the list of backups made previously.",
		},
	],
	run: async ({ client, interaction, utils, lang }) => {
		await interaction.deferReply().catch(() => {});
		const chosenAction = interaction.options.getSubcommand();

		switch (chosenAction) {
			case "create": {
				backup
					.create(interaction.guild, {
						jsonBeautify: true,
					})
					.then((data) => {
						interaction.followUp({
							embeds: [
								client.embed.globalSuccess({
									title: "Backup Created",
									message: `Successfully created a backup with id \`${data.id}\``,
								}),
							],
						});
					})
					.catch((err) => {
						client.logger.error(new Error(err));
						interaction.followUp({
							embeds: [client.embed.globalErr({ message: "Unable to make a backup. Please contact a developer!" })],
						});
						return;
					});

				break;
			}
			case "load": {
				const ID = interaction.options.getString("id");

				await backup.fetch(ID).catch(() => {
					interaction.followUp({ embeds: [client.embed.globalErr({ message: "Please provide a valid ID." })] });
					return;
				});

				await backup.load(ID, interaction.guild).catch(() => {
					interaction.followUp({ embeds: [client.embed.globalErr({ message: "Unable to load the backup." })] });
					return;
				});

				interaction.followUp({
					embeds: [client.embed.globalSuccess({ title: "Backup Loaded", message: "Successfully Loaded the backup." })],
				});

				break;
			}
			case "list": {
				const Fields = await getFields();

				interaction.followUp({
					embeds: [
						client.embed.create({
							Author: { name: `Backups`, iconURL: interaction.guild.iconURL() },
							Description: Fields ? `Viewing **${Fields.length}** backup(s).` : "No backups created.",
							Fields,
						}),
					],
				});
			}
		}

		async function getFields() {
			const Fields: EmbedFieldData[] = [];
			const list = await backup.list();
			const backups = list.map(async (a) => {
				return await backup.fetch(a);
			});

			if (backups.length == 0) return null;

			const data = (await Promise.all(backups)).filter((b) => b.data.name == interaction.guild.name);

			data.forEach((b) => {
				Fields.push({
					name: `**ID:** \`${b.data.id}\``,
					value: `**Created:** ${utils.formatDate(b.data.createdTimestamp, "f")}\n**Size:** ${b.size} kb`,
				});
			});

			return Fields;
		}
	},
});
