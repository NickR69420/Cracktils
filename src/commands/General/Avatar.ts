import { GuildMember } from "discord.js";
import { Command } from "../../lib/structures/Command";

export default new Command({
	name: "avatar",
	description: "View a user's avatar or guild avatar.",
	usage: "avatar [user] [-g]",
	aliases: ["av", "pfp"],
	userPerms: ["SEND_MESSAGES"],
	run: async ({ client, message, args, utils }) => {
		const member = (args.get("member", 0) as GuildMember) || message.member;
		const flag = args.rest(0).includes("-g");

		utils.iReply(message, {
			embeds: [
				client.embed.create({
					Author: { name: flag ? member.displayName : member.user.tag, iconURL: member.user.displayAvatarURL() },
					Image: flag
						? member.displayAvatarURL({ dynamic: true, size: 2048 })
						: member.user.displayAvatarURL({ dynamic: true, size: 2048 }),
					Color: member.displayHexColor === "#000000" ? client.config.EmbedColors.noColor : member.displayHexColor,
				}),
			],
		});
	},
});
