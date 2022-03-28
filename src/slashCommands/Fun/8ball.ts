import { SlashCommand } from "../../lib/structures/SlashCommand";
import axios from "axios";

export default new SlashCommand({
	name: "8ball",
	description: "Ask the magical 8 ball a question and get an answer.",
	userPerms: ["SEND_MESSAGES"],
	options: [
		{
			name: "question",
			description: "The question to ask the magic 8ball.",
			type: "STRING",
			required: true,
		},
	],
	run: async ({ client, interaction, utils, lang }) => {
		const { MagicBall } = lang.FunModule.Commands;

		let question = interaction.options.getString("question");
		if (!question.endsWith("?")) {
			question = question + "?";
		}

		try {
			const api = utils.replaceText(MagicBall.API, "DATA", `${encodeURIComponent(question)}`);

			const { data } = await axios.get(api);

			interaction.reply({
				embeds: [
					client.embed.create({
						Title: MagicBall.Title,
						Fields: [
							{
								name: MagicBall.Fields[0],
								value: question,
							},
							{
								name: MagicBall.Fields[1],
								value: data.magic.answer,
							},
						],
						Color: "RANDOM",
					}),
				],
			});
		} catch (err) {
			client.logger.error(err);
			interaction.reply({
				embeds: [
					client.embed.globalErr({
						message: lang.GlobalErrors.cmdErr,
					}),
				],
				ephemeral: true,
			});
		}
	},
});
