import { MessageActionRow, MessageButton } from "discord.js";
import { Command } from "../../lib/structures/Command";

export default new Command({
	name: "suggest",
	description: "Suggest something for the server.",
	usage: "suggest <idea>",
	minArgs: 1,
	aliases: ["suggestion"],
	userPerms: ["SEND_MESSAGES"],
	run: async ({ client, message, args, utils, lang }) => {
		const { Suggest } = lang.GeneralModule.Commands;
		const { Suggestions } = client.config;
		const channel = utils.findChannel(client.config.Channels.Suggestions, message.guild);

		if (!channel || !Suggestions.Enabled) return utils.iReply(message, { embeds: [client.embed.globalErr({ message: Suggest.NotSetup })] });

		const m = await channel.send({
			embeds: [
				client.embed.create({
					Author: { name: message.author.tag, iconURL: message.author.displayAvatarURL() },
					Description: `> ${args.rest(0)}`,
					Color: client.config.EmbedColors.noColor,
				}),
			],
		});

		utils.iReply(message, { embeds: [client.embed.globalSuccess({ title: Suggest.Sent.Title, message: Suggest.Sent.Description })] });

		const row = new MessageActionRow().addComponents(
			new MessageButton().setCustomId("suggestion-accepted").setEmoji(Suggestions.Emojis.Accept).setStyle("SUCCESS"),
			new MessageButton().setCustomId("suggestion-denied").setEmoji(Suggestions.Emojis.Deny).setStyle("DANGER"),
			new MessageButton().setCustomId("suggestion-implemented").setEmoji(Suggestions.Emojis.Implemented).setStyle("SECONDARY")
		);

		await m.edit({ embeds: [m.embeds[0].setFooter({ text: utils.replaceText(Suggest.Pending.Footer, "id", m.id) })], components: [row] });
		//await m.react(Suggestions.Emojis.Upvote);
		//await m.react(Suggestions.Emojis.Downvote);
	},
});
