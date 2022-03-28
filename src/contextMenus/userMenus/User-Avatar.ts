import { UserMenu } from "../../lib/structures/UserMenu";

export default new UserMenu({
	name: "User Avatar",
	type: "USER",
	userPerms: ["SEND_MESSAGES"],
	run: async ({ client, menu }) => {
		const member = menu.targetMember;

		menu.reply({
			embeds: [
				client.embed.create({
					Author: { name: member.user.tag, iconURL: member.user.displayAvatarURL() },
					Image: member.user.displayAvatarURL({ dynamic: true, size: 2048 }),
					Color: member.displayHexColor === "#000000" ? client.config.EmbedColors.noColor : member.displayHexColor,
				}),
			],
			ephemeral: true,
		});
	},
});
