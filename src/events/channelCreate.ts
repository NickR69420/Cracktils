import { channelMention } from "@discordjs/builders";
import { client } from "../index";
import { Event } from "../lib/structures/Event";

export default new Event("channelCreate", (channel) => {
	const { ChannelCreated } = client.lang.LogSystem;
	if (!channel.guild) return;

	const Types = {
		GUILD_TEXT: "Text",
		GUILD_NEWS: "News",
		GUILD_STORE: "Store",
		GUILD_VOICE: "Voice",
		GUILD_STAGE_VOICE: "Stage",
		GUILD_CATEGORY: "Category",
	};

	client.utils.log("channelCreate", {
		Title: ChannelCreated.Title,
		Fields: [
			{
				name: ChannelCreated.Fields[0],
				value:
					channel.type == "GUILD_TEXT" || channel.type == "GUILD_NEWS" || channel.type == "GUILD_STORE"
						? channelMention(channel.id)
						: channel.name,
				inline: true,
			},
			{
				name: ChannelCreated.Fields[1],
				value: Types[channel.type],
				inline: true,
			},
		],
		Color: client.config.EmbedColors.Success,
		Timestamp: channel.createdTimestamp,
	});
});
