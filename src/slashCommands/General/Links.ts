import { MessageActionRow, MessageButton } from "discord.js";
import { SlashCommand } from "../../lib/structures/SlashCommand";

export default new SlashCommand({
	name: "links",
	description: "view all links related to Crackpixel!",
	userPerms: ["SEND_MESSAGES"],
	run: async ({ client, interaction }) => {
		const { Links } = client.config;

		const row = new MessageActionRow();
		Links.forEach((l) => {
			row.addComponents(new MessageButton().setLabel(l.label).setStyle("LINK").setURL(l.url));
		});

		interaction.reply({
			embeds: [
				client.embed.create({
					Author: {
						name: "All links related to Crackpixel!",
						iconURL: interaction.guild.iconURL(),
					},
				}),
			],
			components: [row],
			ephemeral: true,
		});
	},
});
