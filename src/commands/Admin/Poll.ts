import Args from "../../lib/modules/Args";
import { Command } from "../../lib/structures/Command";

export default new Command({
	name: "poll",
	description: "Create a poll.",
	usage: 'poll <question> "choice1" "choice2"...',
	minArgs: 1,
	aliases: ["vote"],
	userPerms: ["ADMINISTRATOR"],
	run: async ({ client, message, args, utils, lang }) => {
		message.delete();

		const { Poll } = lang.AdminModule.Commands;
		const emojis = ["1️⃣", "2️⃣", "3️⃣", "4️⃣", "5️⃣", "6️⃣"];

		const question = getQuestion(args);
		const choices = getChoices(args);

		if (choices.length > 6) {
			return utils.iReply(message, {
				embeds: [client.embed.globalErr({ message: Poll.MaxChoices })],
			});
		}

		const desc: string[] = [];
		for (let i = 0; i < choices.length; i++) {
			desc.push(`${emojis[i]} ${choices[i]}`);
		}

		const m = await message.channel.send({
			embeds: [
				client.embed.create({
					Title: question.length > 0 ? question : "New Poll",
					Description: choices.length > 0 ? desc.join("\n\n") : Poll.Poll.Description,
					Footer: {
						text: utils.replaceText(Poll.Poll.Footer, "USER", message.author.tag),
					},
					Color: client.config.EmbedColors.Default,
					Timestamp: true,
				}),
			],
		});

		if (choices.length > 0) {
			for (let i = 0; i < choices.length; i++) {
				await m.react(emojis[i]);
			}
		} else {
			await m.react(emojis[0]);
			await m.react(emojis[1]);
		}

		const msg = await message.channel.send({
			embeds: [
				client.embed.globalSuccess({
					title: Poll.Posted.Title,
					message: Poll.Posted.Description,
				}),
			],
		});

		utils.deleteMsg(msg, 2500);

		function getQuestion(args: Args) {
			const question: string[] = [];
			for (let i = 0; i < args.size; i++) {
				if ((args.pick(i) as string).startsWith('"')) break;
				else question.push(args.pick(i) as string);
			}

			return question.join(" ");
		}

		function getChoices(args: Args) {
			const choices: string[] = [];

			const OptionsRegEx = /(["'])((?:\\\1|\1\1|(?!\1).)*)\1/g;
			let choice: RegExpExecArray;
			while ((choice = OptionsRegEx.exec(args.rest(0)))) {
				choices.push(choice[2]);
			}

			return choices;
		}
	},
});
