import { UserMenu } from "../../lib/structures/UserMenu";

export default new UserMenu({
	name: "Game Stats",
	type: "USER",
	userPerms: ["SEND_MESSAGES"],
	run: async ({ client, menu, lang }) => {
		await menu.deferReply({ ephemeral: true }).catch(() => {});

		const { GameStats } = lang.FunModule.Commands;
		const member = menu.targetMember;

		const c4 = await client.db.getGameData(member.id, "connect4");
		const ttt = await client.db.getGameData(member.id, "tictactoe");

		menu.followUp({
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
