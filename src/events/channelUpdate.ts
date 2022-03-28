import { Event } from "../lib/structures/Event";
import { NonThreadGuildBasedChannel, OverwriteType } from "discord.js";
import { client } from "../index";
import { channelMention } from "@discordjs/builders";
import { Permissions } from "discord-api-types";

export default new Event("channelUpdate", (oldChannel: NonThreadGuildBasedChannel, newChannel: NonThreadGuildBasedChannel) => {
	const { ChannelUpdated } = client.lang.LogSystem;
	if (!newChannel.guild) return;

	const channel =
		newChannel.type == "GUILD_TEXT" || newChannel.type == "GUILD_NEWS" || newChannel.type == "GUILD_STORE"
			? channelMention(newChannel.id)
			: newChannel.name;

	if (oldChannel.name !== newChannel.name) {
		client.utils.log("channelUpdate", {
			Title: ChannelUpdated.Title,
			Fields: [
				{
					name: ChannelUpdated.NameUpdated.Fields[0],
					value: channel,
				},
				{
					name: ChannelUpdated.NameUpdated.Fields[1],
					value: oldChannel.name,
				},
				{
					name: ChannelUpdated.NameUpdated.Fields[2],
					value: newChannel.name,
				},
			],
			Timestamp: true,
			Color: "BLUE",
		});
	}

	if (compareOverwrites(getOverwrites(oldChannel), getOverwrites(newChannel))) {
		client.utils.log("channelUpdate", {
			Title: ChannelUpdated.Title,
			Fields: [
				{ name: ChannelUpdated.PermsUpdated.Fields[0], value: channel },
				{ name: ChannelUpdated.PermsUpdated.Fields[1], value: ChannelUpdated.PermsUpdated.Fields[2] },
			],
			Timestamp: true,
			Color: "BLUE",
		});
	}

	if (newChannel.type == "GUILD_CATEGORY" && oldChannel.name !== newChannel.name) {
		client.utils.log("channelUpdate", {
			Title: ChannelUpdated.Title,
			Fields: [
				{
					name: ChannelUpdated.CategoryUpdated.Fields[0],
					value: channel,
				},
				{
					name: ChannelUpdated.CategoryUpdated.Fields[1],
					value: oldChannel.name,
				},
				{
					name: ChannelUpdated.CategoryUpdated.Fields[2],
					value: newChannel.name,
				},
			],
			Timestamp: true,
			Color: "BLUE",
		});
	}

	if (oldChannel.isText() && newChannel.isText() && oldChannel.topic !== newChannel.topic) {
		client.utils.log("channelUpdate", {
			Title: ChannelUpdated.Title,
			Fields: [
				{ name: ChannelUpdated.TopicUpdated.Fields[0], value: channel },
				{ name: ChannelUpdated.TopicUpdated.Fields[1], value: oldChannel.topic ? oldChannel.topic : "None." },
				{ name: ChannelUpdated.TopicUpdated.Fields[2], value: newChannel.topic ? newChannel.topic : "None." },
			],
			Timestamp: true,
			Color: "BLUE",
		});
	}

	function getOverwrites(channel: NonThreadGuildBasedChannel): overwrites[] {
		return channel.permissionOverwrites.cache.map((p) => {
			const { allow, deny, type } = p;

			return {
				allow: `${allow}`,
				deny: `${deny}`,
				type,
			};
		});
	}

	function compareOverwrites(original: overwrites[], updated: overwrites[]) {
		if (original.length !== updated.length) return;

		let different = false;
		updated.forEach((overwites, i) => {
			const orginalPerm = original[i];

			const check = ["allow", "deny", "type"];
			check.forEach((c) => {
				if (orginalPerm[c] !== overwites[c]) different = true;
			});
		});

		return different;
	}

	interface overwrites {
		allow: Readonly<Permissions>;
		deny: Readonly<Permissions>;
		type: OverwriteType;
	}
});
