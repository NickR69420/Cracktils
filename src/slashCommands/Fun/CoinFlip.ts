import { SlashCommand } from "../../lib/structures/SlashCommand";

export default new SlashCommand({
	name: "coinflip",
	description: "Flip a coin.",
	userPerms: ["SEND_MESSAGES"],
	options: [
		{
			name: "side",
			description: "The side to choose.",
			type: "STRING",
			required: false,
			choices: [
				{
					name: "heads",
					value: "heads",
				},
				{
					name: "tails",
					value: "tails",
				},
			],
		},
	],
	run: async ({ client, interaction, utils, lang }) => {
		const { CoinFlip } = lang.FunModule.Commands;
		const coin = { Head: CoinFlip.HeadIcon, Tail: CoinFlip.TailIcon };
		const side = Object.keys(coin)[Math.floor(Math.random() * 2)];
		const chosenSide = interaction.options.getString("side");

		if (!chosenSide)
			return interaction.reply({
				embeds: [
					client.embed.create({
						Title: CoinFlip.Title,
						Description: utils.replaceText(CoinFlip.Description, "RESULT", side.toLowerCase()),
						Thumbnail: Object.values(coin)[Object.keys(coin).indexOf(side)],
						Footer: {
							text: utils.replaceText(CoinFlip.Footer, "USER", interaction.user.tag),
							iconURL: interaction.user.displayAvatarURL(),
						},
					}),
				],
			});
		else {
			const win = side.toLowerCase() == chosenSide ? true : false;

			return interaction.reply({
				embeds: [
					client.embed.create({
						Title: CoinFlip.Title,
						Description: utils.replaceText(CoinFlip.Description, "RESULT", side.toLowerCase()),
						Thumbnail: Object.values(coin)[Object.keys(coin).indexOf(side)],
						Footer: {
							text: win ? CoinFlip.Results[0] : CoinFlip.Results[1],
							iconURL: interaction.user.displayAvatarURL(),
						},
					}),
				],
			});
		}
	},
});
