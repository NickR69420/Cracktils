import { Command } from "../../lib/structures/Command";
import { createPaste } from "hastebin";
import { inspect } from "util";
import { codeBlock } from "@discordjs/builders";
import { isThenable } from "@sapphire/utilities";

export default new Command({
	name: "eval",
	description: "Evaluates code.",
	usage: "eval <code>",
	minArgs: 1,
	aliases: ["ev"],
	userPerms: ["ADMINISTRATOR"],
	managementOnly: true,
	run: async ({ client, message, args, utils, lang }) => {
		const { Eval } = lang.ManagementModule.Commands;
		const hidden = [client.token, client.config.devToken, client.config.Token];
		const symbolRegex = /(\.|\\|\?)/g;
		const evalRegex = new RegExp(
			`(${hidden.reduce((a, p = "") => `${a}${a ? "|" : ""}${p.replace(symbolRegex, (capture) => "\\" + capture)}`, "")})`,
			"g"
		);

		let code = args.rest(0);
		if (code.includes("await")) code = `(async () => {\n${code}\n})()`;

		try {
			let result = eval(code);
			const type = getType(result)

			if (isThenable(result)) await result;
			if (typeof result !== "string") result = inspect(result);

			let output: any = codeBlock("ts", result.replace(evalRegex, "lol no"));

			if (output.length > 300) {
				output = await createPaste(result.replace(evalRegex, "lol no"), {
					raw: true,
					server: "https://hastebin.com",
				});
			}

			utils.iReply(message, {
				embeds: [
					client.embed.create({
						Author: {
							name: Eval.Author,
							iconURL: message.author.displayAvatarURL(),
						},
						Fields: [
							{
								name: Eval.Fields[0],
								value: codeBlock("ts", args.rest(0)),
							},
							{
								name: Eval.Fields[1],
								value: output,
							},
						],
						Footer: {
							text: utils.replaceText(Eval.Footer, "TYPE", type),
						},
						Color: client.config.EmbedColors.Success,
					}),
				],
			});
		} catch (error) {
			utils.iReply(message, {
				embeds: [
					client.embed.create({
						Author: {
							name: Eval.Author,
							iconURL: message.author.displayAvatarURL(),
						},
						Fields: [
							{
								name: Eval.Fields[0],
								value: codeBlock("ts", args.rest(0)),
							},
							{
								name: Eval.Fields[2],
								value: codeBlock("bash", `${error}`),
							},
						],

						Color: client.config.EmbedColors.Error,
					}),
				],
			});
		}

		function getType(value: any) {
			const type = typeof value;

			switch (type) {
				case "object":
					return value === null ? "null" : value.constructor ? value.constructor.name : "Object";
				case "function":
					return `${value.constructor.name}(${value.length}-arity)`;
				case "undefined":
					return "void";
				default:
					return `${type}`;
			}
		}
	},
});
