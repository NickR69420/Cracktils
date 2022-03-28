import { Event } from "../lib/structures/Event";
import { NonThreadGuildBasedChannel } from "discord.js";
import { client } from "../index";

export default new Event("channelDelete", (channel: NonThreadGuildBasedChannel) => {
	const { ChannelDeleted } = client.lang.LogSystem;
	if (!channel.guild) return;

	const Types = {
		GUILD_TEXT: "Text",
		GUILD_NEWS: "News",
		GUILD_STORE: "Store",
		GUILD_VOICE: "Voice",
		GUILD_STAGE_VOICE: "Stage",
		GUILD_CATEGORY: "Category",
	};

	client.utils.log("channelDelete", {
		Title: ChannelDeleted.Title,
		Fields: [
			{
				name: ChannelDeleted.Fields[0],
				value: channel.name,
				inline: true,
			},
			{
				name: ChannelDeleted.Fields[1],
				value: Types[channel.type],
				inline: true,
			},
		],
		Color: "RED",
		Timestamp: true,
	});
});
