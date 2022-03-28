import { Command } from "../../lib/structures/Command";

export default new Command({
	name: "rockpaperscissors",
	description: "Rock, paper or scrissors?",
	usage: "rockpaperscissors <rock|paper|scissors>",
	minArgs: 1,
	aliases: ["rps"],
	userPerms: ["SEND_MESSAGES"],
	run: async ({ client, message, args, utils, lang }) => {
		const { Fields } = lang.FunModule.Commands.RockPaperScissors;
		const player = message.author;
		const choices = ["🤜", "✋", "✌"];
		const choice = args.pick(0) as string;
		const BotChoice = choices[~~(Math.random() * choices.length)];

		if (!["rock", "paper", "scissors"].includes(choice))
			return utils.iReply(message, {
				embeds: [await utils.Usage("rockpaperscissors", message.guild)],
			});

		const results = [`<@${player.id}> wins!`, `<@${client.user.id}> wins!`, `Tie.`];

		let result: string;

		if (choice == "rock") {
			if (BotChoice === choices[0]) result = results[2];
			if (BotChoice === choices[1]) result = results[1];
			if (BotChoice === choices[2]) result = results[0];

			return utils.iReply(message, {
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
			return utils.iReply(message, {
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

			return utils.iReply(message, {
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
