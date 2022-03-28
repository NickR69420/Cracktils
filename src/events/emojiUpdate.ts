import { Event } from "../lib/structures/Event";
import { client } from "../index";

export default new Event("emojiUpdate", (oldEmoji, newEmoji) => {
	const { EmojiUpdated } = client.lang.LogSystem;

	client.utils.log("emojiUpdate", {
		Title: EmojiUpdated.Title,
		Fields: [
			{ name: EmojiUpdated.Fields[0], value: `<${newEmoji.animated ? "a" : ""}:${newEmoji.name}:${newEmoji.id}>` },
			{ name: EmojiUpdated.Fields[1], value: oldEmoji.name },
			{ name: EmojiUpdated.Fields[2], value: newEmoji.name },
		],
		Timestamp: true,
		Color: "BLUE",
	});
});
