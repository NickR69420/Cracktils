import { GuildMember, Role } from "discord.js";
import { Command } from "../../lib/structures/Command";

export default new Command({
	name: "message",
	description: "Message all or certain users.",
	usage: "message <user|role|all> <normal|embed> <content>",
	minArgs: 3,
	aliases: ["msg", "dm"],
	userPerms: ["ADMINISTRATOR"],
	run: async ({ client, message, args, utils, lang }) => {
		const { Message } = lang.AdminModule.Commands;
		const member = args.get("member", 0) as GuildMember;
		const role = args.get("role", 0) as Role;
		const all = ["all", "everyone", "@everyone"].some((t) => args.pick(0) == t);
		const type = ["normal", "embed"].some((t) => (args.pick(1) as string) == t);
		const content = args.rest(2);

		if ((!all && !member && !role) || !type || !content)
			return utils.iReply(message, {
				embeds: [await utils.Usage("message", message.guild)],
			});

		if (member) {
			const sent = await send(member, true);
			if (sent)
				await utils.iReply(message, {
					embeds: [client.embed.globalSuccess({ message: Message.Sent })],
				});
			return;
		}

		if (role) {
			role.members.forEach(async (m) => {
				await send(m);
			});
			await utils.iReply(message, {
				embeds: [client.embed.globalSuccess({ message: Message.Sent })],
			});
			return;
		}

		if (all) {
			message.guild.members.cache.forEach(async (m) => {
				await send(m);
			});
			await utils.iReply(message, {
				embeds: [client.embed.globalSuccess({ message: Message.Sent })],
			});
			return;
		}

		async function send(m: GuildMember, err?: boolean) {
			if (args.pick(1) == "normal") {
				await m.send(content).catch(() => {
					if (err)
						utils.iReply(message, {
							embeds: [
								client.embed.globalErr({
									message: Message.CouldntSend,
								}),
							],
						});
					return false;
				});
			} else if (args.pick(1) == "embed") {
				await m
					.send({
						embeds: [
							client.embed.create({
								Description: content,
								Color: client.config.EmbedColors.Default,
							}),
						],
					})
					.catch(() => {
						if (err)
							utils.iReply(message, {
								embeds: [
									client.embed.globalErr({
										message: Message.CouldntSend,
									}),
								],
							});
						return false;
					});
			}
			return true;
		}
	},
});
