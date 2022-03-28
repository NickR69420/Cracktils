import { ReloadModules } from "../../lib/modules/ReloadModules";
import { SlashCommand } from "../../lib/structures/SlashCommand";

export default new SlashCommand({
	name: "reload",
	description: "Reload certain aspects of the bot.",
	userPerms: ["ADMINISTRATOR"],
	managementOnly: true,
	options: [
		{
			name: "all",
			description: "Reloads the bot.",
			type: "SUB_COMMAND",
		},
		{
			name: "commands",
			description: "Reloads all commands.",
			type: "SUB_COMMAND",
		},
		{
			name: "slash",
			description: "Reloads all slash commands.",
			type: "SUB_COMMAND",
		},
		{
			name: "events",
			description: "Reloads all events.",
			type: "SUB_COMMAND",
		},
	],
	run: async ({ client, interaction, utils, lang }) => {
		const { Reload } = lang.ManagementModule.Commands;
		const allowedActions = ["events", "commands", "slash", "all"];
		const chosenAction = interaction.options.getSubcommand();
		if (!allowedActions.includes(chosenAction))
			return interaction.reply({
				embeds: [
					client.embed.globalErr({
						message: utils.replaceText(Reload.InvalidAction, "ACTIONS", allowedActions.map((a) => `\`${a}\``).join(", ")),
					}),
				],
			});

		const reload = new ReloadModules(client);

		switch (chosenAction) {
			case "all": {
				interaction.reply({
					embeds: [client.embed.create({ Title: Reload.All[0] })],
					ephemeral: true,
				});

				await reload.all();

				break;
			}
			case "commands": {
				interaction.reply({
					embeds: [client.embed.create({ Title: Reload.Commands[0] })],
					ephemeral: true,
				});

				await reload.Commands();

				break;
			}
			case "slash": {
				interaction.reply({
					embeds: [client.embed.create({ Title: Reload.SlashCommands[0] })],
					ephemeral: true,
				});

				await reload.Slash();

				break;
			}
			case "events": {
				interaction.reply({
					embeds: [client.embed.create({ Title: Reload.Events[0] })],
					ephemeral: true,
				});

				await reload.Events();

				break;
			}
		}
	},
});
