import { Command } from "../../lib/structures/Command";
import axios from "axios";

export default new Command({
	name: "8ball",
	description: "Ask the magical 8 ball a question and get an answer.",
	usage: "8ball <question>",
	minArgs: 1,
	aliases: ["magicball"],
	userPerms: ["SEND_MESSAGES"],
	run: async ({ client, message, args, utils, lang }) => {
		const { MagicBall } = lang.FunModule.Commands;

		let question = args.rest(0);
		if (!question.endsWith("?")) {
			question = question + "?";
		}

		try {
			const api = utils.replaceText(MagicBall.API, "DATA", `${encodeURIComponent(question)}`);

			const { data } = await axios.get(api);

			utils.iReply(message, {
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
			utils.iReply(message, {
				embeds: [
					client.embed.globalErr({
						message: lang.GlobalErrors.cmdErr,
					}),
				],
			});
		}
	},
});
