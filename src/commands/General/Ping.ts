import { Command } from "../../lib/structures/Command";

export default new Command({
	name: "ping",
	description: "Displays Bot latency.",
	usage: "ping",
	aliases: ["pong", "latency"],
	userPerms: ["SEND_MESSAGES"],
	run: async ({ client, message, utils, lang }) => {
		const { Ping } = lang.GeneralModule.Commands;
		const apiPing = client.ws.ping;

		const m = await utils.iReply(message, {
			embeds: [
				client.embed.create({
					Title: Ping.awaitMsg.Title,
					Color: client.config.EmbedColors.Default,
				}),
			],
		});

		m.edit({
			embeds: [
				client.embed.create({
					Title: client.user.username,
					Fields: [
						{
							name: Ping.Embed.Fields[0],
							value: `\`${apiPing}ms\``,
						},
						{
							name: Ping.Embed.Fields[1],
							value: `\`${m.createdTimestamp - message.createdTimestamp}ms\``,
						},
					],
					Timestamp: true,
					Color: client.config.EmbedColors.Success,
				}),
			],
		});
	},
});
