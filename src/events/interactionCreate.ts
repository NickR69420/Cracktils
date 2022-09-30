import { Event } from "../lib/structures/Event";
import { client } from "../index";
import { CInteraction, UInteraction, MInteraction } from "../typings/Interactions";
import { handleCooldown } from "../lib/modules/handleCooldown";
import { iUserMenu } from "../typings/iUserMenu";
import { iMessageMenu } from "../typings/iMessageMenu";
import { GuildMember, Message, MessageEmbed } from "discord.js";

const { lang, utils, embed } = client;

export default new Event("interactionCreate", async (interaction) => {
	if (interaction.isCommand()) {
		const slash = client.slashCommands.get(interaction.commandName);

		if (!slash) {
			return interaction.reply({
				embeds: [embed.globalErr({ message: lang.GlobalErrors.cmdErr })],
				ephemeral: true,
			});
		}
		// const cmd = await client.db.getCommand(slash.name);

		// if (!cmd.enabled) {
		// 	return interaction.reply({
		// 		content: lang.GlobalErrors.disabledCommand,
		// 		ephemeral: true,
		// 	});
		// }

		if (slash) {
			if (slash.managementOnly && !client.config.Management.includes(interaction.user.id))
				return interaction.reply({
					embeds: [
						embed.globalErr({
							message: lang.GlobalErrors.NoPerms.Description,
							title: lang.GlobalErrors.NoPerms.Title,
							timestamp: true,
						}),
					],
					ephemeral: true,
				});

			if (!interaction.memberPermissions.has(slash.userPerms)) {
				return interaction.reply({
					embeds: [
						embed.globalErr({
							message: lang.GlobalErrors.NoPerms.Description,
							title: lang.GlobalErrors.NoPerms.Title,
							timestamp: true,
						}),
					],
					ephemeral: true,
				});
			}

			if (slash.cooldown) {
				const onCooldown = handleCooldown({
					slash: interaction as CInteraction,
					slashCmd: slash,
				});
				if (onCooldown) return;
			}

			try {
				slash.run({
					interaction: interaction as CInteraction,
					client,
					utils,
					lang,
				});
			} catch (err) {
				client.logger.error(new Error(err));

				if (interaction.replied) {
					return interaction
						.followUp({
							content: lang.GlobalErrors.cmdErr,
							ephemeral: true,
						})
						.catch((e: any) => {
							client.logger.error(new Error(e));
						});
				}

				if (interaction.deferred) {
					return interaction
						.editReply({
							content: lang.GlobalErrors.cmdErr,
						})
						.catch((e: any) => {
							client.logger.error(new Error(e));
						});
				}

				return interaction
					.reply({
						content: lang.GlobalErrors.cmdErr,
						ephemeral: true,
					})
					.catch((e: any) => {
						client.logger.error(new Error(e));
					});
			}
		}
	} else if (interaction.isUserContextMenu()) {
		const ctx = client.contextMenus.get(interaction.commandName) as iUserMenu;

		if (!ctx) {
			return interaction.reply({
				embeds: [embed.globalErr({ message: lang.GlobalErrors.cmdErr })],
				ephemeral: true,
			});
		}

		if (!interaction.memberPermissions.has(ctx.userPerms)) {
			return interaction.reply({
				embeds: [
					embed.globalErr({
						message: lang.GlobalErrors.NoPerms.Description,
						title: lang.GlobalErrors.NoPerms.Title,
						timestamp: true,
					}),
				],
				ephemeral: true,
			});
		}

		ctx.run({
			menu: interaction as UInteraction,
			client,
			utils,
			lang,
		});
	} else if (interaction.isMessageContextMenu()) {
		const ctx = client.contextMenus.get(interaction.commandName) as iMessageMenu;

		if (!ctx) {
			return interaction.reply({
				embeds: [embed.globalErr({ message: lang.GlobalErrors.cmdErr })],
				ephemeral: true,
			});
		}

		if (!interaction.memberPermissions.has(ctx.userPerms)) {
			return interaction.reply({
				embeds: [
					embed.globalErr({
						message: lang.GlobalErrors.NoPerms.Description,
						title: lang.GlobalErrors.NoPerms.Title,
						timestamp: true,
					}),
				],
				ephemeral: true,
			});
		}

		ctx.run({
			menu: interaction as MInteraction,
			client,
			utils,
			lang,
		});
	}
});

function capitalize(str: string) {
	return str.charAt(0).toUpperCase() + str.substring(1).toLowerCase();
}
