import { Event } from "../lib/structures/Event";
import { client } from "../index";

export default new Event("emojiDelete", (emoji) => {
	const { EmojiDeleted } = client.lang.LogSystem;

	client.utils.log("emojiDelete", {
		Title: EmojiDeleted.Title,
		Fields: [
			{ name: EmojiDeleted.Fields[0], value: emoji.name },
			{ name: EmojiDeleted.Fields[1], value: emoji.id },
			{ name: EmojiDeleted.Fields[2], value: emoji.animated ? "Yes" : "No" },
			{ name: EmojiDeleted.Fields[3], value: `[Click Here](${emoji.url})` },
		],
		Image: emoji.url,
		Timestamp: true,
		Color: client.config.EmbedColors.Error,
	});
});
