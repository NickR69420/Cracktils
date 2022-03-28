import { Message, MessageActionRow, MessageButton, Role } from "discord.js";
import { SlashCommand } from "../../lib/structures/SlashCommand";

export default new SlashCommand({
	name: "deleterole",
	description: "Deletes a role.",
	userPerms: ["MANAGE_ROLES"],
	options: [
		{
			name: "role",
			description: "The role to delete.",
			type: "ROLE",
			required: true,
		},
	],
	run: async ({ client, interaction, utils, lang }) => {
		const { Deleterole } = lang.AdminModule.Commands;

		const role = interaction.options.getRole("role") as Role;

		if (interaction.member.id !== interaction.guild.ownerId && role.position > interaction.member.roles.highest.position)
			return interaction.reply({
				embeds: [
					client.embed.globalErr({
						message: Deleterole.HigherRole,
					}),
				],
				ephemeral: true,
			});

		const msg = (await interaction.reply({
			embeds: [client.embed.create({ Title: Deleterole.Confirmation })],
			components: [
				new MessageActionRow().addComponents(
					new MessageButton().setCustomId("deleterole-delete").setStyle("SUCCESS").setLabel("Delete").setEmoji("✅"),
					new MessageButton().setCustomId("deleterole-cancel").setStyle("DANGER").setLabel("Cancel").setEmoji("❌")
				),
			],
			ephemeral: true,
			fetchReply: true,
		})) as Message;

		utils.buttonCollector(msg.channel, interaction.user).on("collect", async (i) => {
			await i.deferUpdate();

			if (i.customId === "deleterole-delete") {
				await interaction.guild.roles.delete(role, `Deleted by: ${interaction.user.id}`).catch((err: any) => {
					client.logger.error(err);
					interaction.editReply({
						embeds: [
							client.embed.globalErr({
								message: Deleterole.DeleteError,
							}),
						],
						components: [],
					});
					return;
				});

				interaction.editReply({
					embeds: [
						client.embed.globalSuccess({
							message: Deleterole.Deleted,
						}),
					],
					components: [],
				});
			} else if (i.customId === "deleterole-cancel") {
				interaction.editReply({
					embeds: [
						client.embed.globalErr({
							message: Deleterole.Canceled,
						}),
					],
					components: [],
				});
			}
		});
	},
});
