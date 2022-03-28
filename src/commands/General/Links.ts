import { MessageActionRow, MessageButton } from "discord.js";
import { Command } from "../../lib/structures/Command";

export default new Command({
	name: "links",
	description: "View all links related to Crackpixel!",
	usage: "links",
	aliases: ["link", "support"],
	userPerms: ["SEND_MESSAGES"],
	run: async ({ client, message, utils }) => {
		const { Links } = client.config;

		const row = new MessageActionRow();
		Links.forEach((l) => {
			row.addComponents(new MessageButton().setLabel(l.label).setStyle("LINK").setURL(l.url));
		});

		utils.iReply(message, {
			embeds: [
				client.embed.create({
					Author: {
						name: "All links related to Crackpixel!",
						iconURL: message.guild.iconURL(),
					},
				}),
			],
			components: [row],
		});
	},
});
