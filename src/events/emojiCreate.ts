import { Event } from "../lib/structures/Event";
import { client } from "../index";

export default new Event("emojiCreate", (emoji) => {
	const { EmojiCreated } = client.lang.LogSystem;

	client.utils.log("emojiCreate", {
		Title: EmojiCreated.Title,
		Fields: [
			{ name: EmojiCreated.Fields[0], value: `<${emoji.animated ? "a" : ""}:${emoji.name}:${emoji.id}>` },
			{ name: EmojiCreated.Fields[1], value: emoji.name },
			{ name: EmojiCreated.Fields[2], value: emoji.id },
			{ name: EmojiCreated.Fields[3], value: emoji.animated ? "Yes" : "No" },
		],
		Timestamp: true,
		Color: client.config.EmbedColors.Success,
	});
});
