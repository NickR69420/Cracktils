import { Event } from "../lib/structures/Event";
import { client } from "../index";
import { Role } from "discord.js";
import { roleMention, userMention } from "@discordjs/builders";

export default new Event("guildMemberUpdate", (oldMember, newMember) => {
	const { MemberRoleAdded, MemberRoleRemoved, DisplayNameUpdated } = client.lang.LogSystem;

	const oldRoles = oldMember.roles.cache.map((r) => r);
	const newRoles = newMember.roles.cache.map((r) => r);

	if (oldRoles !== newRoles) {
		const removedRoles = difference(oldRoles, newRoles);
		const addedRoles = difference(newRoles, oldRoles);

		if (removedRoles.length > 0) {
			const role = client.utils.findRole(removedRoles[0].id, oldMember.guild) as Role;

			client.utils.log("guildMemberUpdate", {
				Title: MemberRoleRemoved.Title,
				Fields: [
					{ name: MemberRoleRemoved.Fields[0], value: userMention(newMember.id), inline: true },
					{ name: MemberRoleRemoved.Fields[1], value: roleMention(role.id), inline: true },
				],
				Timestamp: true,
				Color: "BLUE",
			});
		} else if (addedRoles.length > 0) {
			const role = client.utils.findRole(addedRoles[0].id, oldMember.guild) as Role;

			client.utils.log("guildMemberUpdate", {
				Title: MemberRoleAdded.Title,
				Fields: [
					{ name: MemberRoleAdded.Fields[0], value: userMention(newMember.id), inline: true },
					{ name: MemberRoleAdded.Fields[1], value: roleMention(role.id), inline: true },
				],
				Timestamp: true,
				Color: "BLUE",
			});
		}
	}

	const oldNick = oldMember.displayName;
	const newNick = newMember.displayName;

	if (oldNick !== newNick) {
		client.utils.log("guildMemberUpdate", {
			Title: DisplayNameUpdated.Title,
			Fields: [
				{ name: DisplayNameUpdated.Fields[0], value: `${userMention(newMember.id)}` },
				{ name: DisplayNameUpdated.Fields[1], value: oldNick },
				{ name: DisplayNameUpdated.Fields[2], value: newNick },
			],
			Timestamp: true,
			Color: "BLUE",
		});
	}

	function difference(roles1: Role[], roles2: Role[]) {
		return roles1.filter((r) => {
			return roles2.indexOf(r) < 0;
		});
	}
});
