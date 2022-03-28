import { UserMenu } from "../../lib/structures/UserMenu";

export default new UserMenu({
	name: "Guild Avatar",
	type: "USER",
	userPerms: ["SEND_MESSAGES"],
	run: async ({ client, menu }) => {
		const member = menu.targetMember;

		menu.reply({
			embeds: [
				client.embed.create({
					Author: { name: member.displayName, iconURL: member.user.displayAvatarURL() },
					Image: member.displayAvatarURL({ dynamic: true, size: 2048 }),

					Color: member.displayHexColor === "#000000" ? client.config.EmbedColors.noColor : member.displayHexColor,
				}),
			],
			ephemeral: true,
		});
	},
});
