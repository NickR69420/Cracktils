import { channelMention, userMention } from "@discordjs/builders";
import { EmbedFieldData, Message, PartialMessage } from "discord.js";
import { client } from "../index";
import { Event } from "../lib/structures/Event";

export default new Event("messageUpdate", async (oldMessage, newMessage) => {
	const { MessageEdited } = client.lang.LogSystem;

	if (!oldMessage.guild || !oldMessage.content || oldMessage.content.length === 0 || oldMessage.content === "" || oldMessage.member.user.bot)
		return;
	if (!newMessage.content || newMessage.content.length === 0 || newMessage.content === "" || newMessage.pinned) return;

	const Fields: EmbedFieldData[] = [
		{ name: MessageEdited.Fields[0], value: userMention(newMessage.author.id), inline: true },

		{ name: MessageEdited.Fields[1], value: channelMention(newMessage.channel.id), inline: true },
		{
			name: MessageEdited.Fields[2],
			value: await checkMessage(oldMessage),
		},
		{
			name: MessageEdited.Fields[3],
			value: await checkMessage(newMessage),
		},
	];

	if (newMessage.attachments.size) {
		Fields.push({
			name: MessageEdited.Fields[4],
			value: newMessage.attachments
				.map((a, b) => {
					return `[${a.name}](${a.proxyURL})`;
				})
				.join("\n"),
		});
	}

	client.utils.log("messageUpdate", {
		Title: MessageEdited.Title,
		Description: MessageEdited.Description.replace("URL", newMessage.url),
		Fields,
		Timestamp: true,
		Color: "BLUE",
	});

	async function checkMessage(m: Message | PartialMessage) {
		if (m.content.length > 1000) return await client.utils.hastebin(m.content);
		else return m.content;
	}
});
