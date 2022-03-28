import { GuildMember } from "discord.js";
import { Command } from "../../lib/structures/Command";

export default new Command({
	name: "gamestats",
	description: "View a user's game stats.",
	usage: "gamestats [user]",
	aliases: ["games", "gstats"],
	userPerms: ["SEND_MESSAGES"],
	run: async ({ client, message, args, utils, lang }) => {
		const { GameStats } = lang.FunModule.Commands;
		const member = (args.get("member", 0) as GuildMember) || message.member;

		const c4 = await client.db.getGameData(member.id, "connect4");
		const ttt = await client.db.getGameData(member.id, "tictactoe");

		utils.iReply(message, {
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
