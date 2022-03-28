import { TextBasedChannel } from "discord.js";
import { Command } from "../../lib/structures/Command";

export default new Command({
	name: "say",
	description: "Make the bot send a certain message.",
	usage: "say <channel> <normal|embed> <content>",
	minArgs: 3,
	aliases: ["tell"],
	userPerms: ["ADMINISTRATOR"],
	run: async ({ client, message, args, utils, lang }) => {
		const { Say } = lang.AdminModule.Commands;
		const channel = (args.get("channel", 0) as TextBasedChannel) || message.channel;
		const type = ["normal", "embed"].some((t) => (args.pick(1) as string) == t);
		const content = args.rest(2);

		if (!type)
			return utils.iReply(message, {
				embeds: [await utils.Usage("say", message.guild)],
			});

		if (args.pick(1) == "normal") {
			channel.send(content).catch(() => {
				utils.iReply(message, {
					embeds: [
						client.embed.globalErr({
							message: Say.CouldntSend,
						}),
					],
				});
				return;
			});
			return message.delete();
		} else if (args.pick(1) == "embed") {
			channel
				.send({
					embeds: [
						client.embed.create({
							Description: content,
							Color: client.config.EmbedColors.Default,
						}),
					],
				})
				.catch(() => {
					utils.iReply(message, {
						embeds: [
							client.embed.globalErr({
								message: Say.CouldntSend,
							}),
						],
					});
					return;
				});
			return message.delete();
		}
	},
});
