import { Command } from "../../lib/structures/Command";

export default new Command({
	name: "prefix",
	description: "View or configure the prefix.",
	usage: "prefix [newprefix]",
	aliases: ["setprefix", "pref"],
	userPerms: ["ADMINISTRATOR"],
	run: async ({ client, message, args, utils, lang }) => {
		const { Prefix } = lang.AdminModule.Commands;
		const newPrefix = args.rest(0);

		if (!newPrefix) {
			const prefix = await client.db.getPrefix(message.guild.id);

			utils.iReply(message, {
				embeds: [
					client.embed.create({
						Description: utils.replaceText(Prefix.View, "PREFIX", prefix),
						Color: client.config.EmbedColors.Default,
					}),
				],
			});
			return;
		}

		await client.prisma.guild
			.update({
				where: { id: message.guild.id },
				data: { prefix: newPrefix },
			})
			.catch((err) => {
				client.logger.error(err);
				utils.iReply(message, {
					embeds: [
						client.embed.globalErr({
							message: lang.GlobalErrors.cmdErr,
						}),
					],
				});
				return;
			});

		utils.iReply(message, {
			embeds: [
				client.embed.globalSuccess({
					message: utils.replaceText(Prefix.Set, "PREFIX", newPrefix),
				}),
			],
		});
	},
});
