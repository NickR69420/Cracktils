import { SlashCommand } from "../../lib/structures/SlashCommand";

export default new SlashCommand({
	name: "rockpaperscissors",
	description: "Rock, paper or scrissors?",
	userPerms: ["SEND_MESSAGES"],
	options: [
		{
			name: "choice",
			description: "Choose rock, paper or scissors?",
			type: "STRING",
			required: true,
			choices: [
				{
					name: "rock ⛰️",
					value: "rock",
				},
				{
					name: "paper 🧻",
					value: "paper",
				},
				{
					name: "scissors ✂️",
					value: "scissors",
				},
			],
		},
	],
	run: async ({ client, interaction, utils, lang }) => {
		const { Fields } = lang.FunModule.Commands.RockPaperScissors;
		const player = interaction.user;
		const choices = ["🤜", "✋", "✌"];
		const choice = interaction.options.getString("choice");
		const BotChoice = choices[~~(Math.random() * choices.length)];

		if (!["rock", "paper", "scissors"].includes(choice))
			return interaction.reply({
				embeds: [await utils.Usage("rockpaperscissors", interaction.guild)],
				ephemeral: true,
			});

		const results = [`<@${player.id}> wins!`, `<@${client.user.id}> wins!`, `Tie.`];

		let result: string;

		if (choice == "rock") {
			if (BotChoice === choices[0]) result = results[2];
			if (BotChoice === choices[1]) result = results[1];
			if (BotChoice === choices[2]) result = results[0];

			return interaction.reply({
				embeds: [
					client.embed.create({
						Fields: [
							{
								name: utils.replaceText(Fields[0], "USER", player.username),
								value: choices[0],
								inline: true,
							},
							{
								name: Fields[1],
								value: Fields[2],
								inline: true,
							},
							{
								name: Fields[3],
								value: BotChoice,
								inline: true,
							},
							{
								name: Fields[4],
								value: result,
							},
						],
					}),
				],
			});
		}
		if (choice == "paper") {
			if (BotChoice === choices[0]) result = results[0];
			if (BotChoice === choices[1]) result = results[2];
			if (BotChoice === choices[2]) result = results[1];
			return interaction.reply({
				embeds: [
					client.embed.create({
						Fields: [
							{
								name: utils.replaceText(Fields[0], "USER", player.username),
								value: choices[1],
								inline: true,
							},
							{
								name: Fields[1],
								value: Fields[2],
								inline: true,
							},
							{
								name: Fields[3],
								value: BotChoice,
								inline: true,
							},
							{
								name: Fields[4],
								value: result,
							},
						],
					}),
				],
			});
		}

		if (choice == "scissors") {
			if (BotChoice === choices[0]) result = results[1];
			if (BotChoice === choices[1]) result = results[0];
			if (BotChoice === choices[2]) result = results[2];

			return interaction.reply({
				embeds: [
					client.embed.create({
						Fields: [
							{
								name: utils.replaceText(Fields[0], "USER", player.username),
								value: choices[2],
								inline: true,
							},
							{
								name: Fields[1],
								value: Fields[2],
								inline: true,
							},
							{
								name: Fields[3],
								value: BotChoice,
								inline: true,
							},
							{
								name: Fields[4],
								value: result,
							},
						],
					}),
				],
			});
		}
	},
});
