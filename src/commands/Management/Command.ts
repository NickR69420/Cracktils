import { Command } from "../../lib/structures/Command";
import { chunk } from "@sapphire/utilities";
import { PaginatedMessage } from "@sapphire/discord.js-utilities";

export default new Command({
	name: "command",
	description: "Enable or disable a command.",
	usage: "command <command> <enable|disable>",
	aliases: ["cmd", "commands"],
	userPerms: ["ADMINISTRATOR"],
	managementOnly: true,
	run: async ({ client, message, args, utils, lang }) => {
		const { Command } = lang.ManagementModule.Commands;
		const command = args.pick(0) as string;
		const status = args.pick(1) as string;

		if (!command) {
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

			return await paginate.run(message);
		} else if (!client.commands.get(command))
			return utils.iReply(message, { embeds: [client.embed.globalErr({ message: Command.InvalidCommand })] });
		else if (!["enable", "disable"].includes(status)) return utils.iReply(message, { embeds: [await utils.Usage("command", message.guild)] });

		let cmd = client.commands.get(command);
		let slash = client.slashCommands.get(command);
		const chosenStatus = status == "enable" ? true : false;

		if (cmd.directory == "Management") return utils.iReply(message, { embeds: [client.embed.globalErr({ message: Command.CantBeModified })] });

		cmd.enabled = chosenStatus;
		slash.enabled = chosenStatus;
		await client.prisma.command
			.update({
				where: { name: command },
				data: { enabled: chosenStatus },
			})
			.catch(() => {
				utils.iReply(message, { embeds: [client.embed.globalErr({ message: lang.GlobalErrors.cmdErr })] });
			});

		client.commands.set(cmd.name, cmd);
		client.slashCommands.set(slash.name, slash);

		utils.iReply(message, {
			embeds: [
				client.embed.globalSuccess({
					title: utils.replaceText(Command.EnabledDisabled.Title, "STATUS", chosenStatus ? "Enabled" : "Disabled"),
					message: utils
						.replaceText(Command.EnabledDisabled.Description, "COMMAND", cmd.name)
						.replace("STATUS", chosenStatus ? "enabled" : "disabled"),
				}),
			],
		});
	},
});
