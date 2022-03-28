import { SlashCommand } from "../../lib/structures/SlashCommand";

export default new SlashCommand({
	name: "ping",
	description: "Displays Bot latency.",
	userPerms: ["SEND_MESSAGES"],
	run: async ({ client, interaction, utils, lang }) => {
		const { Ping } = lang.GeneralModule.Commands;
		const date = Date.now();
		const apiPing = client.ws.ping;

		await interaction.reply({
			embeds: [
				client.embed.create({
					Title: Ping.awaitMsg.Title,
					Color: client.config.EmbedColors.Default,
				}),
			],
		});

		interaction.editReply({
			embeds: [
				client.embed.create({
					Title: client.user.username,
					Fields: [
						{
							name: Ping.Embed.Fields[0],
							value: `\`${apiPing}ms\``,
						},
						{
							name: Ping.Embed.Fields[1],
							value: `\`${Date.now() - date}ms\``,
						},
					],
					Timestamp: true,
					Color: client.config.EmbedColors.Success,
				}),
			],
		});
	},
});
