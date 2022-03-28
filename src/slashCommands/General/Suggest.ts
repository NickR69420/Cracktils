import { MessageActionRow, MessageButton } from "discord.js";
import { SlashCommand } from "../../lib/structures/SlashCommand";

export default new SlashCommand({
	name: "suggest",
	description: "Suggest something for the server.",
	userPerms: ["SEND_MESSAGES"],
	options: [
		{
			name: "idea",
			description: "The idea to suggest",
			type: "STRING",
			required: true,
		},
	],
	run: async ({ client, interaction, utils, lang }) => {
		const { Suggest } = lang.GeneralModule.Commands;
		const { Suggestions } = client.config;
		const idea = interaction.options.getString("idea");
		const channel = utils.findChannel(client.config.Channels.Suggestions, interaction.guild);

		if (!channel || !Suggestions.Enabled)
			return interaction.reply({ embeds: [client.embed.globalErr({ message: Suggest.NotSetup })], ephemeral: true });

		const m = await channel.send({
			embeds: [
				client.embed.create({
					Author: { name: interaction.user.tag, iconURL: interaction.user.displayAvatarURL() },
					Description: `> ${idea}`,
					Color: client.config.EmbedColors.noColor,
				}),
			],
		});
		const row = new MessageActionRow().addComponents(
			new MessageButton().setCustomId("suggestion-accept").setEmoji(Suggestions.Emojis.Accept).setStyle("SUCCESS"),
			new MessageButton().setCustomId("suggestion-deny").setEmoji(Suggestions.Emojis.Deny).setStyle("DANGER"),
			new MessageButton().setCustomId("suggestion-implemented").setEmoji(Suggestions.Emojis.Implemented).setStyle("SECONDARY")
		);
		interaction.reply({
			embeds: [client.embed.globalSuccess({ title: Suggest.Sent.Title, message: Suggest.Sent.Description })],
		});

		await m.edit({ embeds: [m.embeds[0].setFooter({ text: utils.replaceText(Suggest.Pending.Footer, "id", m.id) })], components: [row] });
		// await m.react(Suggestions.Emojis.Upvote);
		// await m.react(Suggestions.Emojis.Downvote);
	},
});
