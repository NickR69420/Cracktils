import { Event } from "../lib/structures/Event";
import { client } from "../index";
import { channelMention } from "@discordjs/builders";

export default new Event("channelPinsUpdate", async (channel, date) => {
	const { ChannelPinsUpdated } = client.lang.LogSystem;

	client.utils.log("channelPinsUpdate", {
		Title: ChannelPinsUpdated.Title,
		Fields: [{ name: ChannelPinsUpdated.Fields[0], value: channelMention(channel.id) }],
		Timestamp: date || true,
		Color: "BLUE",
	});
});
