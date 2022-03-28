import { Command } from "../../lib/structures/Command";

export default new Command({
	name: "module",
	description: "Enable or disable a module.",
	usage: "module <module> <enable|disable>",
	aliases: ["modules", "category", "category"],
	userPerms: ["ADMINISTRATOR"],
	managementOnly: true,
	run: async ({ client, message, args, utils, lang }) => {
		const { Module } = lang.ManagementModule.Commands;
		const modules = await client.db.getModules();
		const module = args.pick(0) as string;
		const status = args.pick(1) as string;

		if (!module) {
			const status = modules.map((m) => (m.enabled ? Module.Emojis[0] : Module.Emojis[1]));

			return utils.iReply(message, {
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
		} else if (!modules.some((m) => m.name == utils.capitalize(module)))
			return utils.iReply(message, { embeds: [client.embed.globalErr({ message: Module.InvalidModule })] });
		else if (!["enable", "disable"].includes(status)) return utils.iReply(message, { embeds: [await utils.Usage("module", message.guild)] });

		const chosenModule = utils.capitalize(module);
		const chosenStatus = status == "enable" ? true : false;

		if (chosenModule === "Management") return utils.iReply(message, { embeds: [client.embed.globalErr({ message: Module.CantBeModified })] });

		await client.prisma.module
			.update({
				where: { name: chosenModule },
				data: { enabled: chosenStatus },
			})
			.catch(() => {
				utils.iReply(message, { embeds: [client.embed.globalErr({ message: lang.GlobalErrors.cmdErr })] });
			});

		utils.iReply(message, {
			embeds: [
				client.embed.globalSuccess({
					title: utils.replaceText(Module.EnabledDisabled.Title, "STATUS", chosenStatus ? "Enabled" : "Disabled"),
					message: utils
						.replaceText(Module.EnabledDisabled.Description, "MODULE", chosenModule)
						.replace("STATUS", chosenStatus ? "enabled" : "disabled"),
				}),
			],
		});
	},
});
