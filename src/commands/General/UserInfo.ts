import { GuildMember } from "discord.js";
import { Command } from "../../lib/structures/Command";

export default new Command({
	name: "userinfo",
	description: "View your or a certain user's information.",
	usage: "userinfo [user]",
	aliases: ["info", "ui", "useri"],
	userPerms: ["SEND_MESSAGES"],
	run: async ({ client, message, args, utils, lang }) => {
		const { UserInfo } = lang.GeneralModule.Commands;
		const member = (args.get("member", 0) as GuildMember) || message.member;

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

		utils.iReply(message, {
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
							value:
								roles.size > 1
									? roles
											.map((r) => `${r}`)
											.join(" ")
											.replace(`<@&${message.guild.id}>`, "")
									: "None.",
						},
					],
					Footer: { text: utils.replaceText(UserInfo.Footer, "id", member.id) },
					Color: member.displayHexColor === "#000000" ? client.config.EmbedColors.noColor : member.displayHexColor,
				}),
			],
		});
	},
});
