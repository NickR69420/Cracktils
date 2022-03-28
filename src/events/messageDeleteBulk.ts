import { Event } from "../lib/structures/Event";
import { channelMention, userMention } from "@discordjs/builders";
import { EmbedFieldData } from "discord.js";
import { client } from "../index";

export default new Event("messageDeleteBulk", async (messages) => {
	const { MessageBulkDeleted } = client.lang.LogSystem;

	const deletedBy = await fetchExecutor();

	const Fields: EmbedFieldData[] = [
		{
			name: MessageBulkDeleted.Fields[0],
			value: channelMention(messages.first().channel.id),
			inline: true,
		},
		{
			name: MessageBulkDeleted.Fields[1],
			value: `${messages.size}`,
			inline: true,
		},
	];

	if (deletedBy) {
		Fields.push({ name: MessageBulkDeleted.Fields[2], value: userMention(deletedBy), inline: true });
	}

	client.utils.log("messageDeleteBulk", {
		Title: MessageBulkDeleted.Title,
		Fields,
		Timestamp: true,
		Color: client.config.EmbedColors.Error,
	});

	async function fetchExecutor() {
		const audit = await messages.first().guild.fetchAuditLogs({
			limit: 1,
			type: "MESSAGE_BULK_DELETE",
		});

		const deleted = audit.entries.first();

		if (!deleted) return null;

		return deleted.executor.id;
	}
});
