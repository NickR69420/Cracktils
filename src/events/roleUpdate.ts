import { Event } from "../lib/structures/Event";
import { client } from "../index";
import { EmbedFieldData } from "discord.js";
import { roleMention } from "@discordjs/builders";

export default new Event("roleUpdate", (oldRole, newRole) => {
	const { RoleUpdated } = client.lang.LogSystem;
	const Fields: EmbedFieldData[] = [{ name: RoleUpdated.Fields[0], value: roleMention(newRole.id) }];

	if (oldRole.name !== newRole.name) {
		Fields.push({ name: RoleUpdated.Fields[1], value: `${RoleUpdated.Previously}${oldRole.name}\n${RoleUpdated.Currently}${newRole.name}` });
	}

	if (oldRole.color !== newRole.color) {
		Fields.push({
			name: RoleUpdated.Fields[2],
			value: `${RoleUpdated.Previously}${oldRole.hexColor}\n${RoleUpdated.Currently}${newRole.hexColor}`,
		});
	}

	if (oldRole.hoist !== newRole.hoist) {
		const oldH = oldRole.hoist ? "Hoisted" : "Not Hoisted";
		const newH = newRole.hoist ? "Hoisted" : "Not Hoisted";

		Fields.push({
			name: RoleUpdated.Fields[3],
			value: `${RoleUpdated.Previously}${oldH}\n${RoleUpdated.Currently}${newH}`,
		});
	}

	if (oldRole.mentionable !== newRole.mentionable) {
		const oldM = oldRole.mentionable ? "Mentionable" : "Not Mentionable";
		const newM = newRole.mentionable ? "Mentionable" : "Not Mentionable";

		Fields.push({
			name: RoleUpdated.Fields[4],
			value: `${RoleUpdated.Previously}${oldM}\n${RoleUpdated.Currently}${newM}`,
		});
	}

	if (oldRole.permissions.bitfield !== newRole.permissions.bitfield) {
		Fields.push({
			name: RoleUpdated.Fields[5],
			value: `${RoleUpdated.Previously}${oldRole.permissions
				.toArray()
				.map((p) => `\`${p}\``)
				.join(" ")}\n${RoleUpdated.Currently}${newRole.permissions
				.toArray()
				.map((p) => `\`${p}\``)
				.join(" ")}`,
		});
	}

	if (Fields.length === 1) return;

	client.utils.log("roleUpdate", {
		Title: RoleUpdated.Title,
		Fields,
		Timestamp: true,
		Color: "BLUE",
	});
});
