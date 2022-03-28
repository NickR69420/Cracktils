import { SlashCommand } from "../../lib/structures/SlashCommand";

export default new SlashCommand({
	name: "module",
	description: "Enable or disable a module.",
	userPerms: ["ADMINISTRATOR"],
	managementOnly: true,
	options: [
		{
			name: "enable",
			description: "Enable a module.",
			type: "SUB_COMMAND",
			options: [
				{
					name: "module",
					description: "The module to enable.",
					type: "STRING",
					required: true,
				},
			],
		},
		{
			name: "disable",
			description: "Disable a module.",
			type: "SUB_COMMAND",
			options: [
				{
					name: "module",
					description: "The module to disable.",
					type: "STRING",
					required: true,
				},
			],
		},
		{
			name: "list",
			description: "Displays the list of modules and their statuses.",
			type: "SUB_COMMAND",
		},
	],
	run: async ({ client, interaction, utils, lang }) => {
		await interaction.deferReply({ ephemeral: true }).catch(() => {});
		const { Module } = lang.ManagementModule.Commands;
		const modules = await client.db.getModules();
		const status = interaction.options.getSubcommand() == "enable" ? "enable" : "disable";

		switch (interaction.options.getSubcommand()) {
			case status: {
				const module = interaction.options.getString("module");
				const chosenModule = utils.capitalize(module);
				const chosenStatus = status == "enable" ? true : false;

				if (!modules.some((m) => m.name == chosenModule))
					return interaction.followUp({ embeds: [client.embed.globalErr({ message: Module.InvalidModule })] });

				if (chosenModule === "Management")
					return interaction.followUp({ embeds: [client.embed.globalErr({ message: Module.CantBeModified })] });

				await client.prisma.module
					.update({
						where: { name: chosenModule },
						data: { enabled: chosenStatus },
					})
					.catch(() => {
						interaction.followUp({ embeds: [client.embed.globalErr({ message: lang.GlobalErrors.cmdErr })] });
					});

				interaction.followUp({
					embeds: [
						client.embed.globalSuccess({
							title: utils.replaceText(Module.EnabledDisabled.Title, "STATUS", chosenStatus ? "Enabled" : "Disabled"),
							message: utils
								.replaceText(Module.EnabledDisabled.Description, "MODULE", chosenModule)
								.replace("STATUS", chosenStatus ? "enabled" : "disabled"),
						}),
					],
				});

				break;
			}
			case "list": {
				const status = modules.map((m) => (m.enabled ? Module.Emojis[0] : Module.Emojis[1]));

				return interaction.followUp({
					embeds: [
						client.embed.create({
							Fields: [
								{
									name: Module.List.Fields[0],
									value: modules.map((m) => m.name).join("\n"),
									inline: true,
								},
								{
									name: Module.List.Fields[1],
									value: status.join("\n"),
									inline: true,
								},
							],
						}),
					],
				});
			}
		}
	},
});
