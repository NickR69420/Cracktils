import { channelMention, userMention } from "@discordjs/builders";
import { EmbedFieldData, Message } from "discord.js";
import { client } from "../index";
import { Event } from "../lib/structures/Event";

export default new Event("messageDelete", async (message) => {
	const { MessageDeleted } = client.lang.LogSystem;

	let msg: Message;
	if (message.partial) msg = await message.fetch();
	else msg = message as Message;

	if (!msg.guild || !msg.content || msg.content.length === 0 || msg.content === "") return;

	const Fields: EmbedFieldData[] = [
		{
			name: MessageDeleted.Fields[0],
			value: userMention(msg.author.id),
			inline: true,
		},
		{
			name: MessageDeleted.Fields[1],
			value: channelMention(msg.channel.id),
			inline: true,
		},
		{
			name: MessageDeleted.Fields[2],
			value: msg.content.length >= 1024 ? await client.utils.hastebin(msg.content) : msg.content,
		},
	];

	const executor = await fetchExecutor();

	if (executor && executor !== msg.author.id) {
		Fields.push({
			name: MessageDeleted.Fields[3],
			value: userMention(executor),
		});
	}

	if (msg.attachments.size) {
		Fields.push({
			name: MessageDeleted.Fields[4],
			value: msg.attachments
				.map((a, k) => {
					return `[${a.name}](${a.proxyURL})`;
				})
				.join("\n"),
		});
	}

	client.utils.log("messageDelete", {
		Title: MessageDeleted.Title,
		Fields,
		Timestamp: true,
		Color: "RED",
	});

	async function fetchExecutor() {
		const audit = await message.guild.fetchAuditLogs({
			limit: 1,
			type: "MESSAGE_DELETE",
		});

		const deleted = audit.entries.first();

		if (!deleted) return null;

		return deleted.executor.id;
	}
});
