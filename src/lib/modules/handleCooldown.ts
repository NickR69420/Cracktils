import { Collection, Message } from "discord.js";
import { CInteraction } from "../../typings/Interactions";
import { iCommand } from "../../typings/iCommand";
import { iSlash } from "../../typings/iSlash";
import pms from "pretty-ms";
const cooldowns = new Map<string, Collection<string, number>>();

import { client } from "../../index";
const { utils, lang } = client;

export function handleCooldown({ msg, slash, cmd, slashCmd }: options) {
	if (msg && cmd) {
		if (!cooldowns.has(cmd.name)) {
			cooldowns.set(cmd.name, new Collection());
		}

		const now = Date.now();
		const timeStamps = cooldowns.get(cmd.name);
		const cooldown = cmd.cooldown * 1000;

		if (timeStamps.has(msg.author.id)) {
			const expires = timeStamps.get(msg.author.id) + cooldown;

			if (now < expires) {
				const timeLeft = expires - now;

				utils.iReply(msg, {
					embeds: [
						client.embed.globalErr({
							message: utils.replaceText(lang.GlobalErrors.Cooldown.Description, "TIME", pms(timeLeft, { verbose: true })),
							title: lang.GlobalErrors.Cooldown.Title,
						}),
					],
				});
				return true;
			}
		}

		timeStamps.set(msg.author.id, now);

		setTimeout(() => {
			timeStamps.delete(msg.author.id);
		}, cooldown);
		return false;
	} else if (slash && slashCmd) {
		if (!cooldowns.has(slashCmd.name)) {
			cooldowns.set(slashCmd.name, new Collection());
		}

		const now = Date.now();
		const timeStamps = cooldowns.get(slashCmd.name);
		const cooldown = slashCmd.cooldown * 1000;

		if (timeStamps.has(slash.user.id)) {
			const expires = timeStamps.get(slash.user.id) + cooldown;

			if (now < expires) {
				const timeLeft = expires - now;

				slash.reply({
					embeds: [
						client.embed.globalErr({
							message: utils.replaceText(lang.GlobalErrors.Cooldown.Description, "TIME", pms(timeLeft, { verbose: true })),
							title: lang.GlobalErrors.Cooldown.Title,
						}),
					],
					ephemeral: true,
				});
				return true;
			}
		}

		timeStamps.set(slash.user.id, now);

		setTimeout(() => {
			timeStamps.delete(slash.user.id);
		}, cooldown);
		return false;
	}
}

export interface options {
	msg?: Message;
	slash?: CInteraction;
	cmd?: iCommand;
	slashCmd?: iSlash;
}
