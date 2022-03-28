import { MessageReaction } from "discord.js";
import { client } from "../index";
import { Event } from "../lib/structures/Event";

export default new Event("messageReactionRemove", async (reaction, user) => {
	let r: MessageReaction;
	if (reaction.partial) {
		r = await reaction.fetch();
	} else r = reaction as MessageReaction;
	if (!r) return;

	if (r.emoji.name == client.config.Other.Giveaways.UnicodeEmoji) {
		client.giveaways.handleReactionAdd(r, user.id);
	}
});
