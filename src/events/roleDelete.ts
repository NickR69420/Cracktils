import { Event } from "../lib/structures/Event";
import { client } from "../index";

export default new Event("roleDelete", (role) => {
	const { RoleDeleted } = client.lang.LogSystem;

	client.utils.log("roleDelete", {
		Title: RoleDeleted.Title,
		Fields: [{ name: RoleDeleted.Fields[0], value: role.name }],
		Timestamp: true,
		Color: client.config.EmbedColors.Error,
	});
});
