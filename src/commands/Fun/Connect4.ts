import { GuildMember, MessageActionRow, MessageButton } from "discord.js";
import { Command } from "../../lib/structures/Command";

export default new Command({
	name: "connect4",
	description: "Play a game of connect 4!",
	usage: "connect4 <user>",
	aliases: ["c4"],
	userPerms: ["SEND_MESSAGES"],
	run: async ({ client, message, args, utils, lang }) => {
		const { Connect4 } = lang.FunModule.Commands;

		let board = [
			[0, 0, 0, 0, 0, 0, 0],
			[0, 0, 0, 0, 0, 0, 0],
			[0, 0, 0, 0, 0, 0, 0],
			[0, 0, 0, 0, 0, 0, 0],
			[0, 0, 0, 0, 0, 0, 0],
			[0, 0, 0, 0, 0, 0, 0],
		];

		const member = args.get("member", 0) as GuildMember;
		if (!member)
			return utils.iReply(message, {
				embeds: [await utils.Usage("connect4", message.guild)],
			});

		if (member.id === message.author.id || member.user.bot)
			return utils.iReply(message, {
				embeds: [
					client.embed.globalErr({
						message: Connect4.PlayWithBotOrSelf,
					}),
				],
			});

		const m = await message.reply({
			content: `<@${member.id}>`,
			embeds: [
				client.embed.create({
					Title: Connect4.Invite.Title,
					Description: utils.replaceText(Connect4.Invite.Description, "USER", `<@${message.author.id}>`),
				}),
			],
			components: [
				new MessageActionRow().addComponents(
					new MessageButton().setCustomId("connect4-accept").setLabel("Accept").setEmoji(Connect4.Emojis[0]).setStyle("SUCCESS"),
					new MessageButton().setCustomId("connect4-deny").setLabel("Deny").setEmoji(Connect4.Emojis[1]).setStyle("DANGER")
				),
			],
		});

		const collectConfirmation = utils.buttonCollector(message.channel, member.user, 60000, 1);

		collectConfirmation.on("collect", async (i) => {
			await i.deferUpdate();

			if (i.customId === "connect4-deny") {
				m.delete();
				utils.iReply(message, {
					content: `<@${message.author.id}>`,
					embeds: [
						client.embed.globalErr({
							title: Connect4.InviteCanceled.Title,
							message: utils.replaceText(Connect4.InviteCanceled.Descriptions[0], "USER", `<@${member.id}>`),
						}),
					],
				});
			} else if (i.customId === "connect4-accept") {
				m.delete();
				let gameOver = false;
				const players = { 1: message.member, 2: member };
				let turn = 2;
				const emojis = ["1️⃣", "2️⃣", "3️⃣", "4️⃣", "5️⃣", "6️⃣", "7️⃣"];

				const msg = await utils.iReply(message, {
					embeds: [
						client.embed.create({
							Title: Connect4.GameBoard.Title,
							Description: Connect4.GameBoard.Description.replace("PLAYER-1", `<@${players[1].id}>`)
								.replace("PLAYER-2", `<@${players[2].id}>`)
								.replace(
									"BOARD",
									board
										.map((row) => row.join(""))
										.join("\n")
										.replace(/0/g, "⚫ ")
										.replace(/1/g, "🔴 ")
										.replace(/2/g, "🟡 ") +
										"\n" +
										emojis.join(" ")
								)
								.replace("TURN", `<@${players[turn].id}>`),
						}),
					],
					components: [
						{
							type: "ACTION_ROW",
							components: [
								new MessageButton().setCustomId("connect4-1").setEmoji(emojis[0]).setStyle("SECONDARY"),
								new MessageButton().setCustomId("connect4-2").setEmoji(emojis[1]).setStyle("SECONDARY"),
								new MessageButton().setCustomId("connect4-3").setEmoji(emojis[2]).setStyle("SECONDARY"),
								new MessageButton().setCustomId("connect4-4").setEmoji(emojis[3]).setStyle("SECONDARY"),
							],
						},
						{
							type: "ACTION_ROW",
							components: [
								new MessageButton().setCustomId("connect4-5").setEmoji(emojis[4]).setStyle("SECONDARY"),
								new MessageButton().setCustomId("connect4-6").setEmoji(emojis[5]).setStyle("SECONDARY"),
								new MessageButton().setCustomId("connect4-7").setEmoji(emojis[6]).setStyle("SECONDARY"),
							],
						},
					],
				});

				while (!gameOver) {
					msg.edit({
						embeds: [
							client.embed.create({
								Title: Connect4.GameBoard.Title,
								Description: Connect4.GameBoard.Description.replace("PLAYER-1", `<@${players[1].id}>`)
									.replace("PLAYER-2", `<@${players[2].id}>`)
									.replace(
										"BOARD",
										board
											.map((row) => row.join(""))
											.join("\n")
											.replace(/0/g, "⚫ ")
											.replace(/1/g, "🔴 ")
											.replace(/2/g, "🟡 ") +
											"\n" +
											emojis.join(" ")
									)
									.replace("TURN", `<@${players[turn].id}>`),
							}),
						],
					});

					const i = await utils.waitForButton(players[turn].id, msg);
					await dropIntoColomn(parseInt(i.customId.charAt(9)) - 1, turn)
						.then(async (res) => {
							await i.deferUpdate();

							const status = await checkBoard();

							if (status.over) {
								let p1 = await client.db.getGameData(message.author.id, "connect4");

								let p2 = await client.db.getGameData(member.id, "connect4");

								if (status.tie) {
									p1.ties += status.tie ? 1 : 0;
									p2.ties += status.tie ? 1 : 0;

									await msg.edit({
										embeds: [
											client.embed.create({
												Title: Connect4.GameBoardOver.Title,

												Description: Connect4.GameBoardOver.Description.replace("PLAYER-1", `<@${players[1].id}>`)
													.replace("PLAYER-2", `<@${players[2].id}>`)
													.replace(
														"BOARD",
														board
															.map((row) => row.join(""))
															.join("\n")
															.replace(/0/g, "⚫ ")
															.replace(/1/g, "🔴 ")
															.replace(/2/g, "🟡 ") +
															"\n" +
															emojis.join(" ")
													)
													.replace("WINNER", "**TIE**"),
											}),
										],
									});
									msg.reply({
										content: Connect4.GameBoardOver.GameOverTie.replace("PLAYER-1", `<@${players[turn].id}>`).replace(
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
												Title: Connect4.GameBoardOver.Title,
												Description: Connect4.GameBoardOver.Description.replace("PLAYER-1", `<@${players[1].id}>`)
													.replace("PLAYER-2", `<@${players[2].id}>`)
													.replace(
														"BOARD",
														board
															.map((row) => row.join(""))
															.join("\n")
															.replace(/0/g, "⚫ ")
															.replace(/1/g, "🔴 ")
															.replace(/2/g, "🟡 ") +
															"\n" +
															emojis.join(" ")
													)
													.replace("WINNER", `<@${players[turn].id}>`),
											}),
										],
									});
									msg.reply({
										content: Connect4.GameBoardOver.GameOverWin.replace("WINNER", `<@${players[turn].id}>`).replace(
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
						.catch(async (err) => {
							if (err == "column full") {
								return i.reply({
									content: Connect4.ColumnFull,
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
			}
		});

		collectConfirmation.on("end", async (i, e) => {
			if (e == "time")
				utils.iReply(m, {
					content: `<@${message.author.id}> <@${member.id}>`,
					embeds: [
						client.embed.globalErr({
							title: Connect4.InviteCanceled.Title,
							message: Connect4.InviteCanceled.Descriptions[1].replace("USER", `<@${member.id}>`),
						}),
					],
				});
		});

		async function checkBoard() {
			let over = false;
			let tie = false;

			board.forEach(async (row) => {
				const currentRow = row.join("");

				if (currentRow.includes("1111") || currentRow.includes("2222")) {
					over = true;
				}
			});

			for (let i = 0; i <= 6; i++) {
				const column = `${board[0][i]}${board[1][i]}${board[2][i]}${board[3][i]}${board[4][i]}${board[5][i]}`;
				if (column.includes("1111") || column.includes("2222")) {
					over = true;
				}
			}

			let diagnols = [
				`` + board[3][0] + board[2][1] + board[1][2] + board[0][3],
				`` + board[4][0] + board[3][1] + board[2][2] + board[1][3] + board[0][4],
				`` + board[5][0] + board[4][1] + board[3][2] + board[2][3] + board[1][4] + board[0][5],
				`` + board[5][1] + board[4][2] + board[3][3] + board[2][4] + board[1][5] + board[0][6],
				`` + board[5][2] + board[4][3] + board[3][4] + board[2][5] + board[1][6],
				`` + board[5][3] + board[4][4] + board[3][5] + board[2][6],
				`` + board[5][3] + board[4][2] + board[3][1] + board[2][0],
				`` + board[5][4] + board[4][3] + board[3][2] + board[2][1] + board[1][0],
				`` + board[5][5] + board[4][4] + board[3][3] + board[2][2] + board[1][1] + board[0][0],
				`` + board[5][6] + board[4][5] + board[3][4] + board[2][3] + board[1][2] + board[0][1],
				`` + board[4][6] + board[3][5] + board[2][4] + board[1][3] + board[0][2],
				`` + board[3][6] + board[3][5] + board[1][4] + board[0][3],
			];

			diagnols.forEach(async (d) => {
				if (d.includes("1111") || d.includes("2222")) {
					over = true;
				}
			});

			let fullBoard = board.map((row) => row.join("")).join("\n");
			if (!fullBoard.includes("0")) {
				tie = true;
				over = true;
			}

			return {
				over,
				tie,
			};
		}

		async function dropIntoColomn(column: number, turn: number) {
			return new Promise<string>(async (res, rej) => {
				let foundValidPostion = false;
				for (let row = 5; row >= 0; row--) {
					if (board[row][column] == 0) {
						board[row][column] = turn;
						foundValidPostion = true;
						return res("success");
					}

					if (row == 0 && !foundValidPostion) {
						return rej("column full");
					}
				}
			});
		}
	},
});
