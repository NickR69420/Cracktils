import { SlashCommand } from "../../lib/structures/SlashCommand";

export default new SlashCommand({
	name: "rolldice",
	description: "Rolls a dice.",
	userPerms: ["SEND_MESSAGES"],
	run: async ({ client, interaction, utils, lang }) => {
		const { RollDice } = lang.FunModule.Commands;

		const sides = {
			1: RollDice.Sides[0],
			2: RollDice.Sides[1],
			3: RollDice.Sides[2],
			4: RollDice.Sides[3],
			5: RollDice.Sides[4],
			6: RollDice.Sides[5],
		};

		const dice = Object.keys(sides)[Math.floor(Math.random() * Object.keys(sides).length)];

		await interaction.reply({
			embeds: [
				client.embed.create({
					Description: RollDice.RollingDice,
					Color: "RANDOM",
				}),
			],
		});

		interaction.editReply({
			embeds: [
				client.embed.create({
					Title: RollDice.Title,
					Description: utils.replaceText(RollDice.Description, "RESULT", dice),
					Thumbnail: Object.values(sides)[Object.keys(sides).indexOf(dice)],
				}),
			],
		});
	},
});
