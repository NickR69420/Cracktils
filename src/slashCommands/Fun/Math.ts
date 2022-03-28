import { SlashCommand } from "../../lib/structures/SlashCommand";
import { Parser } from "expr-eval";

export default new SlashCommand({
	name: "math",
	description: "Evaluate a math equation.",
	userPerms: ["SEND_MESSAGES"],
	options: [
		{
			name: "equation",
			description: "The equation to evaluate.",
			type: "STRING",
			required: true,
		},
	],
	run: async ({ client, interaction, utils, lang }) => {
		const { Math } = lang.FunModule.Commands;
		const equation = interaction.options.getString("equation");

		try {
			const evaluation = new Parser().evaluate(equation);

			interaction.reply({
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
			interaction.reply({
				embeds: [client.embed.globalErr({ message: Math.Error })],
				ephemeral: true,
			});
		}
	},
});
