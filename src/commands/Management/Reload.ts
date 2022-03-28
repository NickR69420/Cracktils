import { Command } from "../../lib/structures/Command";
import { ReloadModules } from "../../lib/modules/ReloadModules";

export default new Command({
	name: "reload",
	description: "Reload certain aspects of the bot.",
	usage: "reload <events|commands|slash|all>",
	minArgs: 1,
	aliases: ["restart"],
	userPerms: ["ADMINISTRATOR"],
	managementOnly: true,
	run: async ({ client, message, args, utils, lang }) => {
		const { Reload } = lang.ManagementModule.Commands;
		const allowedActions = ["events", "commands", "slash", "all"];
		const chosenAction = args.pick(0) as string;

		if (!allowedActions.includes(chosenAction))
			return utils.iReply(message, {
				embeds: [
					client.embed.globalErr({
						message: utils.replaceText(Reload.InvalidAction, "ACTIONS", allowedActions.map((a) => `\`${a}\``).join(", ")),
					}),
				],
			});

		const reload = new ReloadModules(client);

		switch (chosenAction) {
			case "all": {
				const msg = await utils.iReply(message, {
					embeds: [client.embed.create({ Title: Reload.All[0] })],
				});

				await reload.all();

				msg.edit({ embeds: [client.embed.globalSuccess({ message: Reload.All[1] })] });
				break;
			}
			case "commands": {
				const msg = await utils.iReply(message, {
					embeds: [client.embed.create({ Title: Reload.Commands[0] })],
				});

				await reload.Commands();

				msg.edit({ embeds: [client.embed.globalSuccess({ message: Reload.Commands[1] })] });
				break;
			}
			case "slash": {
				const msg = await utils.iReply(message, {
					embeds: [client.embed.create({ Title: Reload.SlashCommands[0] })],
				});

				await reload.Slash();

				msg.edit({ embeds: [client.embed.globalSuccess({ message: Reload.SlashCommands[1] })] });
				break;
			}
			case "events": {
				const msg = await utils.iReply(message, {
					embeds: [client.embed.create({ Title: Reload.Events[0] })],
				});

				await reload.Events();

				msg.edit({ embeds: [client.embed.globalSuccess({ message: Reload.Events[1] })] });
				break;
			}
		}
	},
});
