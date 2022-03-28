import { Command } from "../../lib/structures/Command";
import { Parser } from "expr-eval";

export default new Command({
	name: "math",
	description: "Evaluate a math equation.",
	usage: "math <equation>",
	minArgs: 1,
	aliases: ["calculate", "calc"],
	userPerms: ["SEND_MESSAGES"],
	run: async ({ client, message, args, utils, lang }) => {
		const { Math } = lang.FunModule.Commands;
		const equation = args.rest(0);
		try {
			const evaluation = new Parser().evaluate(equation);

			utils.iReply(message, {
				embeds: [
					client.embed.create({
						Title: Math.Title,
						Fields: [
							{
								name: Math.Fields[0],
								value: equation,
							},
							{
								name: Math.Fields[1],
								value: `${evaluation}`,
							},
						],
					}),
				],
			});
		} catch (err) {
			utils.iReply(message, {
				embeds: [client.embed.globalErr({ message: Math.Error })],
			});
		}
	},
});
