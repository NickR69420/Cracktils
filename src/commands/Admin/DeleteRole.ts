import { MessageActionRow, MessageButton, Role } from "discord.js";
import { Command } from "../../lib/structures/Command";

export default new Command({
	name: "deleterole",
	description: "Deletes a role.",
	usage: "deleterole <role>",
	minArgs: 1,
	aliases: ["delrole", "removerole"],
	userPerms: ["MANAGE_ROLES"],
	run: async ({ client, message, args, utils, lang }) => {
		const { Deleterole } = lang.AdminModule.Commands;

		const role = args.get("role") as Role;
		if (!role)
			return message.channel.send({
				embeds: [
					client.embed.globalErr({
						message: lang.GlobalErrors.InvalidRole,
					}),
				],
			});

		if (message.member.id !== message.guild.ownerId && role.position > message.member.roles.highest.position)
			return message.channel.send({
				embeds: [
					client.embed.globalErr({
						message: Deleterole.HigherRole,
					}),
				],
			});

		const msg = await utils.iReply(message, {
			embeds: [client.embed.create({ Title: Deleterole.Confirmation })],
			components: [
				new MessageActionRow().addComponents(
					new MessageButton().setCustomId("deleterole-delete").setStyle("SUCCESS").setLabel("Delete").setEmoji("✅"),
					new MessageButton().setCustomId("deleterole-cancel").setStyle("DANGER").setLabel("Cancel").setEmoji("❌")
				),
			],
		});

		utils.buttonCollector(message.channel, message.author).on("collect", async (i) => {
			await i.deferUpdate();

			if (i.customId === "deleterole-delete") {
				msg.delete();
				await message.guild.roles.delete(role as Role, `Deleted by: ${message.author.tag}`).catch((err: any) => {
					client.logger.error(err);
					message.channel.send({
						embeds: [
							client.embed.globalErr({
								message: Deleterole.DeleteError,
							}),
						],
					});
					return;
				});

				utils.iReply(message, {
					embeds: [
						client.embed.globalSuccess({
							message: Deleterole.Deleted,
						}),
					],
				});
			} else if (i.customId === "deleterole-cancel") {
				msg.delete();
				message.channel.send({
					embeds: [
						client.embed.globalErr({
							message: Deleterole.Canceled,
						}),
					],
				});
			}
		});
	},
});
