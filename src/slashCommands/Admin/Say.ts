import { TextBasedChannel } from "discord.js";
import { SlashCommand } from "../../lib/structures/SlashCommand";

export default new SlashCommand({
	name: "say",
	description: "Make the bot send a certain message",
	userPerms: ["ADMINISTRATOR"],
	options: [
		{
			name: "content",
			description: "The content to send.",
			type: "STRING",
			required: true,
		},
		{
			name: "type",
			description: "Whether to send it in an embed or not.",
			type: "STRING",
			choices: [
				{
					name: "normal",
					value: "normal",
				},
				{
					name: "embed",
					value: "embed",
				},
			],
			required: true,
		},
		{
			name: "channel",
			description: "The channel to send it to.",
			type: "CHANNEL",
			channelTypes: ["GUILD_TEXT", "GUILD_NEWS"],
		},
	],
	run: async ({ client, interaction, lang }) => {
		const { Say } = lang.AdminModule.Commands;
		const content = interaction.options.getString("content");
		const type = interaction.options.getString("type");
		const channel = (interaction.options.getChannel("channel") as TextBasedChannel) || interaction.channel;

		if (type === "normal") {
			channel.send(content).catch(() => {
				interaction.reply({
					embeds: [
						client.embed.globalErr({
							message: Say.CouldntSend,
						}),
					],
					ephemeral: true,
				});
				return;
			});

			return interaction.reply({ content: Say.Sent, ephemeral: true });
		} else if (type === "embed") {
			channel
				.send({
					embeds: [
						client.embed.create({
							Description: content,
							Color: client.config.EmbedColors.Default,
						}),
					],
				})
				.catch(() => {
					interaction.reply({
						embeds: [
							client.embed.globalErr({
								message: Say.CouldntSend,
							}),
						],
					});
					return;
				});
			return interaction.reply({ content: Say.Sent, ephemeral: true });
		}
	},
});
