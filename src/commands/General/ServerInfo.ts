import { Command } from "../../lib/structures/Command";

export default new Command({
	name: "serverinfo",
	description: "View server information.",
	usage: "serverinfo",
	aliases: ["si", "guildinfo", "guild"],
	userPerms: ["SEND_MESSAGES"],
	run: async ({ client, message, utils, lang }) => {
		const { ServerInfo } = lang.GeneralModule.Commands;
		const { guild: g } = message;

		const members = await g.members.fetch();
		const channels = await g.channels.fetch();
		const roles = await g.roles.fetch();
		const emojis = await g.emojis.fetch();
		let allRoles =
			roles.size == 1
				? "None."
				: roles
						.map((r) => `<@&${r.id}>`)
						.join(" ")
						.replace(`<@&${g.id}>`, "");
		if (allRoles.length > 1024) {
			while (allRoles.length > 1024) {
				allRoles = allRoles.substring(0, allRoles.length - 22) + " and more...";
				allRoles = allRoles.replace(/<@\s|\s>/gm, "");
			}
		}
		const allEmojis =
			emojis.size > 30
				? emojis
						.map((e) => `<${e.animated ? "a" : ""}:${e.name}:${e.id}>`)
						.slice(0, 30)
						.join(" ")
				: emojis.size > 0
				? emojis.map((e) => `<${e.animated ? "a" : ""}:${e.name}:${e.id}>`).join(" ")
				: "None";

		utils.iReply(message, {
			embeds: [
				client.embed.create({
					Author: { name: g.name, iconURL: g.iconURL() },
					Thumbnail: g.iconURL(),
					Fields: [
						{
							name: ServerInfo.Fields[0],
							value: (await g.fetchOwner()).user.tag,
							inline: true,
						},
						{
							name: ServerInfo.Fields[1],
							value: `${utils.formatDate(g.createdTimestamp, "f")}`,
							inline: true,
						},
						{
							name: utils.replaceText(ServerInfo.Fields[4], "AMT", `${channels.size}`),
							value: utils
								.replaceText(ServerInfo.Fields[5], "CATS", `${channels.filter((c) => c.type === "GUILD_CATEGORY").size}`)
								.replace("VOICE", `${channels.filter((c) => c.type === "GUILD_VOICE").size}`)
								.replace("TEXT", `${channels.filter((c) => c.type === "GUILD_TEXT").size}`),
						},
						{
							name: utils.replaceText(ServerInfo.Fields[2], "AMT", `${members.size}`),
							value: utils
								.replaceText(ServerInfo.Fields[3], "HUMANS", `${members.filter((m) => !m.user.bot).size}`)
								.replace("BOTS", `${members.filter((m) => m.user.bot).size}`),
						},
						{
							name: utils.replaceText(ServerInfo.Fields[6], "AMT", `${roles.size}`),
							value: allRoles,
						},
						{
							name: utils.replaceText(ServerInfo.Fields[7], "AMT", `${emojis.size}`),
							value: allEmojis,
						},
					],
				}),
			],
		});
	},
});
