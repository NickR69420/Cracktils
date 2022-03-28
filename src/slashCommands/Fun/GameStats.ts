import { GuildMember } from "discord.js";
import { SlashCommand } from "../../lib/structures/SlashCommand";

export default new SlashCommand({
	name: "gamestats",
	description: "View a user's game stats.",
	userPerms: ["SEND_MESSAGES"],
	options: [
		{
			name: "user",
			description: "The user whose stats to view.",
			type: "USER",
			required: false,
		},
	],
	run: async ({ client, interaction, lang }) => {
		const { GameStats } = lang.FunModule.Commands;
		const member = (interaction.options.getMember("user") as GuildMember) || interaction.member;

		const c4 = await client.db.getGameData(member.id, "connect4");
		const ttt = await client.db.getGameData(member.id, "tictactoe");

		interaction.reply({
			embeds: [
				client.embed.create({
					Author: {
						name: member.user.tag,
						iconURL: member.user.displayAvatarURL(),
					},
					Title: GameStats.Title,
					Fields: [
						{
							name: GameStats.Fields[0],
							value: GameStats.Fields[1]
								.replace("WINS", `${c4.wins}`)
								.replace("LOSSES", `${c4.losses}`)
								.replace("TIES", `${c4.ties}`)
								.replace("TOTAL", `${c4.total}`),
							inline: true,
						},
						{
							name: GameStats.Fields[2],
							value: GameStats.Fields[3]
								.replace("WINS", `${ttt.wins}`)
								.replace("LOSSES", `${ttt.losses}`)
								.replace("TIES", `${ttt.ties}`)
								.replace("TOTAL", `${ttt.total}`),
							inline: true,
						},
					],
				}),
			],
		});
	},
});
