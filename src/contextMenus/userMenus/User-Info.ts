import { UserMenu } from "../../lib/structures/UserMenu";

export default new UserMenu({
	name: "User Info",
	type: "USER",
	userPerms: ["SEND_MESSAGES"],
	run: async ({ client, menu, utils, lang }) => {
		const { UserInfo } = lang.GeneralModule.Commands;
		const member = menu.targetMember;

		const Badges = {
			HYPESQUAD_EVENTS: UserInfo.Badges[0],
			HOUSE_BRAVERY: UserInfo.Badges[1],
			HOUSE_BRILLIANCE: UserInfo.Badges[2],
			HOUSE_BALANCE: UserInfo.Badges[3],
			EARLY_SUPPORTER: UserInfo.Badges[4],
			VERIFIED_BOT: UserInfo.Badges[5],
		};
		const userFlags = member.user.flags ? member.user.flags.toArray() : null;
		const allBadges = userFlags ? userFlags.map((f) => Badges[f]).join(" ") : "None.";
		const roles = member.roles.cache;

		menu.reply({
			embeds: [
				client.embed.create({
					Author: { name: member.user.tag, iconURL: member.user.displayAvatarURL() },
					Thumbnail: member.displayAvatarURL(),
					Fields: [
						{
							name: UserInfo.Fields[0],
							value: member.displayName,
							inline: true,
						},
						{
							name: UserInfo.Fields[1],
							value: allBadges || "None",
							inline: true,
						},
						{
							name: UserInfo.Fields[3],
							value: `${utils.formatDate(member.user.createdTimestamp, "f")} (${utils.formatDate(member.user.createdTimestamp, "R")})`,
						},
						{
							name: UserInfo.Fields[4],
							value: `${utils.formatDate(member.joinedTimestamp, "f")} (${utils.formatDate(member.joinedTimestamp, "R")})`,
						},
						{
							name: utils.replaceText(UserInfo.Fields[2], "AMT", `${roles.size}`),
							value: roles.size > 0 ? roles.map((r) => `${r}`).join(" ") : "None.",
						},
					],
					Footer: { text: utils.replaceText(UserInfo.Footer, "id", member.id) },
					Color: member.displayHexColor === "#000000" ? client.config.EmbedColors.noColor : member.displayHexColor,
				}),
			],
			ephemeral: true,
		});
	},
});
