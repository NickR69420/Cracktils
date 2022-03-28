import { Event } from "../lib/structures/Event";
import { client } from "../index";
import { roleMention } from "@discordjs/builders";

export default new Event("roleCreate", (role) => {
	const { RoleCreated } = client.lang.LogSystem;

	client.utils.log("roleCreate", {
		Title: RoleCreated.Title,
		Fields: [{ name: RoleCreated.Fields[0], value: roleMention(role.id) }],
		Timestamp: role.createdTimestamp,
		Color: client.config.EmbedColors.Success,
	});
});
