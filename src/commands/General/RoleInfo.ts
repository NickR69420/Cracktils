import { Role } from "discord.js";
import { Command } from "../../lib/structures/Command";

export default new Command({
	name: "roleinfo",
	description: "View information on a role.",
	usage: "roleinfo <role>",
	aliases: ["rinfo", "role"],
	userPerms: ["SEND_MESSAGES"],
	run: async ({ client, message, args, utils, lang }) => {
		const { RoleInfo } = lang.GeneralModule.Commands;
		const role = args.get("role", 0) as Role;

		if (!role || args.pick(0) == "@everyone") return utils.iReply(message, { embeds: [await utils.Usage("roleinfo", message.guild)] });

		const roleMembers =
			role.members.size > 10
				? role.members
						.map((m) => `<@${m.id}>`)
						.slice(0, 25)
						.join(" ") + " and more..."
				: role.members.map((m) => `<@${m.id}>`).join(" ");

		utils.iReply(message, {
			embeds: [
				client.embed.create({
					Description: `<@&${role.id}>`,
					Fields: [
						{
							name: RoleInfo.Fields[0],
							value: role.name,
							inline: true,
						},
						{
							name: RoleInfo.Fields[1],
							value: `${role.position}`,
							inline: true,
						},
						{
							name: RoleInfo.Fields[2],
							value: role.hexColor,
							inline: true,
						},
						{
							name: utils.replaceText(RoleInfo.Fields[3], "AMT", `${role.members.size}`),
							value: role.members.size > 0 ? roleMembers : "None.",
						},
						{
							name: RoleInfo.Fields[4],
							value: `${utils.formatDate(role.createdTimestamp, "f")} (${utils.formatDate(role.createdTimestamp, "R")})`,
						},
					],
					Footer: { text: utils.replaceText(RoleInfo.Footer, "id", role.id) },
					Color: role.hexColor,
				}),
			],
		});
	},
});
