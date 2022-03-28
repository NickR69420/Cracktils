import { PaginatedMessage } from "@sapphire/discord.js-utilities";
import { chunk } from "@sapphire/utilities";
import { SlashCommand } from "../../lib/structures/SlashCommand";

export default new SlashCommand({
	name: "command",
	description: "Enable or disabled a command.",
	userPerms: ["ADMINISTRATOR"],
	managementOnly: true,
	options: [
		{
			name: "enable",
			description: "Enable a command.",
			type: "SUB_COMMAND",
			options: [
				{
					name: "command",
					description: "The command to enable.",
					type: "STRING",
					required: true,
				},
			],
		},
		{
			name: "disable",
			description: "Disable a command.",
			type: "SUB_COMMAND",
			options: [
				{
					name: "command",
					description: "The command to disable.",
					type: "STRING",
					required: true,
				},
			],
		},
		{
			name: "list",
			description: "Displays the list of commands and their statuses.",
			type: "SUB_COMMAND",
		},
	],
	run: async ({ client, interaction, utils, lang }) => {
		await interaction.deferReply({ ephemeral: true }).catch(() => {});
		const { Command } = lang.ManagementModule.Commands;
		const chosenStatus = interaction.options.getSubcommand() == "enable" ? true : false;
		const status = interaction.options.getSubcommand() == "enable" ? "enable" : "disable";

		switch (interaction.options.getSubcommand()) {
			case status: {
				const command = interaction.options.getString("command");

				const cmd = client.commands.get(command);
				const slash = client.slashCommands.get(command);

				if (!cmd) return interaction.followUp({ embeds: [client.embed.globalErr({ message: Command.InvalidCommand })] });
				if (cmd.directory == "Management")
					return interaction.followUp({ embeds: [client.embed.globalErr({ message: Command.CantBeModified })] });

				cmd.enabled = chosenStatus;
				slash.enabled = chosenStatus;
				await client.prisma.command
					.update({
						where: { name: command },
						data: { enabled: chosenStatus },
					})
					.catch(() => {
						interaction.followUp({ embeds: [client.embed.globalErr({ message: lang.GlobalErrors.cmdErr })] });
					});

				client.commands.set(cmd.name, cmd);
				client.slashCommands.set(slash.name, slash);

				interaction.followUp({
					embeds: [
						client.embed.globalSuccess({
							title: utils.replaceText(Command.EnabledDisabled.Title, "STATUS", chosenStatus ? "Enabled" : "Disabled"),
							message: utils
								.replaceText(Command.EnabledDisabled.Description, "COMMAND", cmd.name)
								.replace("STATUS", chosenStatus ? "enabled" : "disabled"),
						}),
					],
				});

				break;
			}
			case "list": {
				const commands = client.commands.map((c) => `${c.name}`);

				const statuses = client.commands.map((c) => (c.enabled ? Command.Emojis[0] : Command.Emojis[1]));

				const paginate = new PaginatedMessage({ template: client.embed.create({}) });
				const cmdChunk = chunk(commands, 8);
				const statusChunk = chunk(statuses, 8);

				for (let i = 0; i < cmdChunk.length; i++) {
					paginate.addAsyncPageEmbed(async (embed) => {
						embed.addField("Command", cmdChunk[i].map((c) => c).join("\n"), true);
						embed.addField("Status", statusChunk[i].join("\n"), true);

						return embed;
					});
				}

				return await paginate.run(interaction, interaction.user);
			}
		}
	},
});
