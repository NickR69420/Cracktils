import { Event } from "../lib/structures/Event";
import { client } from "../index";
import { Message } from "discord.js";
import { handleCooldown } from "../lib/modules/handleCooldown";
import Args from "../lib/modules/Args";

const { config, lang, utils, embed } = client;

export default new Event("messageCreate", async (message) => {
	if (!message.guild || message.author.bot) return;

	let prefix: string;
	if (message.content.startsWith(`<@!${client.user.id}> `)) {
		prefix = `<@!${client.user.id}> `;
	} else {
		prefix = await client.db.getPrefix(message.guild.id);
	}

	const [cmd, ...args] = message.content.slice(prefix.length).trim().split(/ +/g);

	const command = client.commands.get(cmd.toLowerCase()) || client.commands.get(client.aliases.get(cmd));

	if (!command) {
		// FILTER SYSTEM

		const guild = await client.db.getGuild(message.guild.id);

		if (guild.enableFilter && !utils.hasRole(message.member, config.Roles.Staff)) {
			const words = message.content.split(" ");

			if (words.some((word) => guild.filter.map((w) => w.toLowerCase()).includes(word.toLowerCase()))) {
				message.delete();
				const m = await message.channel.send(utils.replaceText(lang.FilterSystem.FilterResponse, "USER", `<@${message.author.id}>`));

				utils.deleteMsg(m, 5000);
			}
		}

		return;
	}

	if (command && (message.author.bot || !message.content.toLowerCase().startsWith(prefix))) return;

	 const Cmd = await client.db.getCommand(command.name);

	if (!Cmd.enabled) return;

	if (command) {
		if (!utils.hasRole(message.member, client.config.Roles.Staff) && message.channel.id === client.config.Channels.General) return;

		if (command.managementOnly && !config.Management.includes(message.author.id)) return;

		if (!message.member.permissions.has(command.userPerms)) {
			return await utils.iReply(message, {
				embeds: [
					embed.globalErr({
						message: lang.GlobalErrors.NoPerms.Description,
						title: lang.GlobalErrors.NoPerms.Title,
						timestamp: true,
					}),
				],
			});
		}

		if (command.minArgs && command.minArgs > args.length) {
			return await utils.iReply(message, {
				embeds: [await utils.Usage(command.name, message.guild)],
			});
		}

		if (command.cooldown && command.cooldown > 0) {
			const onCooldown = handleCooldown({ msg: message, cmd: command });
			if (onCooldown) return;
		}

		command.run({
			args: new Args(message, args),
			message: message as Message,
			client,
			utils,
			lang,
		});
	}
});
