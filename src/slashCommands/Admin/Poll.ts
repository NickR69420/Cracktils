import { SlashCommand } from "../../lib/structures/SlashCommand";

export default new SlashCommand({
	name: "poll",
	description: "Create a poll.",
	userPerms: ["ADMINISTRATOR"],
	options: [
		{
			name: "question",
			description: "The question to ask.",
			type: "STRING",
			required: true,
		},
		{
			name: "choice1",
			description: "Choice 1",
			type: "STRING",
			required: false,
		},
		{
			name: "choice2",
			description: "Choice 2",
			type: "STRING",
			required: false,
		},
		{
			name: "choice3",
			description: "Choice 3",
			type: "STRING",
			required: false,
		},
		{
			name: "choice4",
			description: "Choice 4",
			type: "STRING",
			required: false,
		},
		{
			name: "choice5",
			description: "Choice 5",
			type: "STRING",
			required: false,
		},
		{
			name: "choice6",
			description: "Choice 6",
			type: "STRING",
			required: false,
		},
	],
	run: async ({ client, interaction, utils, lang }) => {
		const { Poll } = lang.AdminModule.Commands;
		const question = interaction.options.getString("question");
		const emojis = ["1️⃣", "2️⃣", "3️⃣", "4️⃣", "5️⃣", "6️⃣"];
		const interactionChoices = ["choice1", "choice2", "choice3", "choice4", "choice5", "choice6"];
		const choices = getChoices();

		const desc: string[] = [];
		for (let i = 0; i < choices.length; i++) {
			desc.push(`${emojis[i]} ${choices[i]}`);
		}

		const m = await interaction.channel.send({
			embeds: [
				client.embed.create({
					Title: question,
					Description: choices.length > 0 ? desc.join("\n\n") : Poll.Poll.Description,
					Footer: {
						text: utils.replaceText(Poll.Poll.Footer, "USER", interaction.user.tag),
					},
					Color: client.config.EmbedColors.Default,
					Timestamp: true,
				}),
			],
		});

		interaction.reply({
			embeds: [
				client.embed.globalSuccess({
					title: Poll.Posted.Title,
					message: Poll.Posted.Description,
				}),
			],
			ephemeral: true,
		});

		if (choices.length > 0) {
			for (let i = 0; i < choices.length; i++) {
				await m.react(emojis[i]);
			}
		} else {
			await m.react(emojis[0]);
			await m.react(emojis[1]);
		}

		function getChoices() {
			const choices: string[] = [];
			interactionChoices.forEach((c) => {
				const choice = interaction.options.getString(c);
				if (choice) choices.push(choice);
			});

			return choices;
		}
	},
});
