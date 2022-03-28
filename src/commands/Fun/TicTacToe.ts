import { ButtonInteraction, GuildMember, MessageActionRow, MessageButton } from "discord.js";
import { Command } from "../../lib/structures/Command";

export default new Command({
	name: "tictactoe",
	description: "Play a game of tictactoe!",
	usage: "tictactoe <user>",
	minArgs: 1,
	aliases: ["ttt"],
	userPerms: ["SEND_MESSAGES"],
	run: async ({ client, message, args, utils, lang }) => {
		const { TicTacToe } = lang.FunModule.Commands;
		const member = args.get("member", 0) as GuildMember;

		let Game = [
			[0, 0, 0],
			[0, 0, 0],
			[0, 0, 0],
		];

		if (!member)
			return utils.iReply(message, {
				embeds: [await utils.Usage("tictactoe", message.guild)],
			});

		if (member.id === message.author.id || member.user.bot)
			return utils.iReply(message, {
				embeds: [
					client.embed.globalErr({
						message: TicTacToe.InvalidUser,
					}),
				],
			});

		const m = await message.reply({
			content: `<@${member.id}>`,
			embeds: [
				client.embed.create({
					Title: TicTacToe.Invite.Title,
					Description: utils.replaceText(TicTacToe.Invite.Description, "USER", `<@${message.author.id}>`),
				}),
			],
			components: [
				new MessageActionRow().addComponents(
					new MessageButton().setCustomId("ttt-accept").setLabel("Accept").setEmoji(TicTacToe.Emojis[0]).setStyle("SUCCESS"),
					new MessageButton().setCustomId("ttt-deny").setLabel("Deny").setEmoji(TicTacToe.Emojis[1]).setStyle("DANGER")
				),
			],
		});

		const collectConfirmation = utils.buttonCollector(message.channel, member.user, 60000, 1);

		collectConfirmation.on("collect", async (i) => {
			await i.deferUpdate();

			if (i.customId === "ttt-deny") {
				m.delete();
				message.reply({
					embeds: [
						client.embed.globalErr({
							title: TicTacToe.InviteCanceled.Title,
							message: utils.replaceText(TicTacToe.InviteCanceled.Descriptions[0], "USER", `<@${member.id}>`),
						}),
					],
				});
			} else if (i.customId === "ttt-accept") {
				m.delete();
				let gameOver = false;
				const players = { 1: member, 2: message.member };
				let turn = 1;
				const emojis = { 0: "➖", 1: "❌", 2: "⭕" };

				const msg = await message.reply({
					embeds: [
						client.embed.create({
							Title: TicTacToe.GameBoard.Title,
							Description: TicTacToe.GameBoard.Description.replace("PLAYER-1", `<@${players[1].id}>`)
								.replace("PLAYER-2", `<@${players[2].id}>`)
								.replace("TURN", `<@${players[turn].id}>`),
						}),
					],
					components: [
						new MessageActionRow().addComponents([
							new MessageButton().setCustomId("0-0").setEmoji(emojis[Game[0][0]]).setStyle("SECONDARY"),
							new MessageButton().setCustomId("0-1").setEmoji(emojis[Game[0][1]]).setStyle("SECONDARY"),
							new MessageButton().setCustomId("0-2").setEmoji(emojis[Game[0][2]]).setStyle("SECONDARY"),
						]),
						new MessageActionRow().addComponents([
							new MessageButton().setCustomId("1-0").setEmoji(emojis[Game[1][0]]).setStyle("SECONDARY"),
							new MessageButton().setCustomId("1-1").setEmoji(emojis[Game[1][1]]).setStyle("SECONDARY"),
							new MessageButton().setCustomId("1-2").setEmoji(emojis[Game[1][2]]).setStyle("SECONDARY"),
						]),
						new MessageActionRow().addComponents([
							new MessageButton().setCustomId("2-0").setEmoji(emojis[Game[2][0]]).setStyle("SECONDARY"),
							new MessageButton().setCustomId("2-1").setEmoji(emojis[Game[2][1]]).setStyle("SECONDARY"),
							new MessageButton().setCustomId("2-2").setEmoji(emojis[Game[2][2]]).setStyle("SECONDARY"),
						]),
					],
				});

				function row(state: boolean) {
					return [
						new MessageActionRow().addComponents([
							new MessageButton()
								.setCustomId("0-0")
								.setEmoji(emojis[Game[0][0]])
								.setStyle(Game[0][0] == 2 ? "SUCCESS" : Game[0][0] == 1 ? "DANGER" : "SECONDARY")
								.setDisabled(state),
							new MessageButton()
								.setCustomId("0-1")
								.setEmoji(emojis[Game[0][1]])
								.setStyle(Game[0][1] == 2 ? "SUCCESS" : Game[0][1] == 1 ? "DANGER" : "SECONDARY")
								.setDisabled(state),
							new MessageButton()
								.setCustomId("0-2")
								.setEmoji(emojis[Game[0][2]])
								.setStyle(Game[0][2] == 2 ? "SUCCESS" : Game[0][2] == 1 ? "DANGER" : "SECONDARY")
								.setDisabled(state),
						]),
						new MessageActionRow().addComponents([
							new MessageButton()
								.setCustomId("1-0")
								.setEmoji(emojis[Game[1][0]])
								.setStyle(Game[1][0] == 2 ? "SUCCESS" : Game[1][0] == 1 ? "DANGER" : "SECONDARY")
								.setDisabled(state),
							new MessageButton()
								.setCustomId("1-1")
								.setEmoji(emojis[Game[1][1]])
								.setStyle(Game[1][1] == 2 ? "SUCCESS" : Game[1][1] == 1 ? "DANGER" : "SECONDARY")
								.setDisabled(state),
							new MessageButton()
								.setCustomId("1-2")
								.setEmoji(emojis[Game[1][2]])
								.setStyle(Game[1][2] == 2 ? "SUCCESS" : Game[1][2] == 1 ? "DANGER" : "SECONDARY")
								.setDisabled(state),
						]),
						new MessageActionRow().addComponents([
							new MessageButton()
								.setCustomId("2-0")
								.setEmoji(emojis[Game[2][0]])
								.setStyle(Game[2][0] == 2 ? "SUCCESS" : Game[2][0] == 1 ? "DANGER" : "SECONDARY")
								.setDisabled(state),
							new MessageButton()
								.setCustomId("2-1")
								.setEmoji(emojis[Game[2][1]])
								.setStyle(Game[2][1] == 2 ? "SUCCESS" : Game[2][1] == 1 ? "DANGER" : "SECONDARY")
								.setDisabled(state),
							new MessageButton()
								.setCustomId("2-2")
								.setEmoji(emojis[Game[2][2]])
								.setStyle(Game[2][2] == 2 ? "SUCCESS" : Game[2][2] == 1 ? "DANGER" : "SECONDARY")
								.setDisabled(state),
						]),
					];
				}

				while (!gameOver) {
					msg.edit({
						embeds: [
							client.embed.create({
								Title: TicTacToe.GameBoard.Title,
								Description: TicTacToe.GameBoard.Description.replace("PLAYER-1", `<@${players[1].id}>`)
									.replace("PLAYER-2", `<@${players[2].id}>`)
									.replace("TURN", `<@${players[turn].id}>`),
							}),
						],
						components: row(false),
					});

					const i = await utils.waitForButton(players[turn].id, msg);
					await placeIntoSlot(i, turn)
						.then(async () => {
							await i.deferUpdate();

							const status = await checkStatus();

							if (status.over) {
								let p1 = await client.db.getGameData(member.id, "tictactoe");

								let p2 = await client.db.getGameData(message.author.id, "tictactoe");

								if (status.tie) {
									p1.ties += status.tie ? 1 : 0;
									p2.ties += status.tie ? 1 : 0;

									await msg.edit({
										embeds: [
											client.embed.create({
												Title: TicTacToe.GameBoard.Title,
												Description: TicTacToe.GameBoardOver.Description.replace("PLAYER-1", `<@${players[1].id}>`)
													.replace("PLAYER-2", `<@${players[2].id}>`)
													.replace("WINNER", "**TIE**"),
											}),
										],
										components: row(true),
									});

									msg.reply({
										content: TicTacToe.GameBoardOver.GameOverTie.replace("PLAYER-1", `<@${players[turn].id}>`).replace(
											"PLAYER-2",
											`<@${players[turn == 1 ? 2 : 1].id}>`
										),
									});
								} else {
									p1.wins += turn == 1 ? 1 : 0;
									p1.losses += turn == 1 ? 0 : 1;
									p2.wins += turn == 2 ? 1 : 0;
									p2.losses += turn == 2 ? 0 : 1;

									await msg.edit({
										embeds: [
											client.embed.create({
												Title: TicTacToe.GameBoard.Title,
												Description: TicTacToe.GameBoardOver.Description.replace("PLAYER-1", `<@${players[1].id}>`)
													.replace("PLAYER-2", `<@${players[2].id}>`)
													.replace("WINNER", `<@${players[turn].id}>`),
											}),
										],
										components: row(true),
									});

									msg.reply({
										content: TicTacToe.GameBoardOver.GameOverWin.replace("WINNER", `<@${players[turn].id}>`).replace(
											"LOSER",
											`<@${players[turn == 1 ? 2 : 1].id}>`
										),
									});
								}

								await client.prisma.gameData.update({
									where: { id: p1.id },
									data: {
										wins: p1.wins,
										losses: p1.losses,
										ties: p1.ties,
										total: p1.total + 1,
									},
								});
								await client.prisma.gameData.update({
									where: { id: p2.id },
									data: {
										wins: p2.wins,
										losses: p2.losses,
										ties: p2.ties,
										total: p2.total + 1,
									},
								});

								return (gameOver = true);
							} else {
								return (turn = turn == 2 ? 1 : 2);
							}
						})
						.catch((err) => {
							if (err == "invalid") {
								i.reply({
									content: TicTacToe.SpaceTaken,
									ephemeral: true,
								});
							} else {
								client.logger.error(err);
								utils.iReply(message, {
									embeds: [
										client.embed.globalErr({
											message: lang.GlobalErrors.cmdErr,
										}),
									],
								});
							}
						});
				}

				async function placeIntoSlot(i: ButtonInteraction, turn: number) {
					return new Promise<string>((res, rej) => {
						if (i.component.emoji.name == "➖") {
							const indexes = i.customId.split("-");
							Game[indexes[0]][indexes[1]] = turn;

							res("success");
						} else {
							rej("invalid");
						}
					});
				}

				async function checkStatus() {
					let over = false;
					let tie = false;

					Game.forEach(async (row) => {
						const currentRow = row.join("");
						if (currentRow.includes("111") || currentRow.includes("222")) {
							over = true;
						}
					});

					for (let i = 0; i <= 2; i++) {
						const column = `${Game[0][i]}${Game[1][i]}${Game[2][i]}`;

						if (column.includes("111") || column.includes("222")) {
							over = true;
						}
					}

					const remainingSlots = [`${Game[0][0]}${Game[1][1]}${Game[2][2]}`, `${Game[0][2]}${Game[1][1]}${Game[2][0]}`];
					remainingSlots.forEach(async (s) => {
						if (s.includes("111") || s.includes("222")) {
							over = true;
						}
					});

					const fullGame = Game.map((r) => r.join("")).join("\n");
					if (!fullGame.includes("0")) {
						over = true;
						tie = true;
					}

					return {
						over,
						tie,
					};
				}
			}
		});
	},
});
