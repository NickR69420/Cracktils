import { GuildMember, Message, MessageActionRow, MessageButton } from "discord.js";
import { SlashCommand } from "../../lib/structures/SlashCommand";

export default new SlashCommand({
	name: "connect4",
	description: "Play a game of connect 4!",
	userPerms: ["SEND_MESSAGES"],
	options: [
		{
			name: "user",
			description: "The user to play against",
			type: "USER",
			required: true,
		},
	],
	run: async ({ client, interaction, utils, lang }) => {
		const { Connect4 } = lang.FunModule.Commands;
		const member = interaction.options.getMember("user") as GuildMember;

		let board = [
			[0, 0, 0, 0, 0, 0, 0],
			[0, 0, 0, 0, 0, 0, 0],
			[0, 0, 0, 0, 0, 0, 0],
			[0, 0, 0, 0, 0, 0, 0],
			[0, 0, 0, 0, 0, 0, 0],
			[0, 0, 0, 0, 0, 0, 0],
		];

		if (member.id === interaction.user.id || member.user.bot)
			return interaction.reply({
				embeds: [
					client.embed.globalErr({
						message: Connect4.PlayWithBotOrSelf,
					}),
				],
				ephemeral: true,
			});

		const message = (await interaction.reply({
			content: `<@${member.id}>`,
			embeds: [
				client.embed.create({
					Title: Connect4.Invite.Title,
					Description: utils.replaceText(Connect4.Invite.Description, "USER", `<@${interaction.user.id}>`),
				}),
			],
			components: [
				new MessageActionRow().addComponents(
					new MessageButton().setCustomId("connect4-accept").setLabel("Accept").setEmoji(Connect4.Emojis[0]).setStyle("SUCCESS"),
					new MessageButton().setCustomId("connect4-deny").setLabel("Deny").setEmoji(Connect4.Emojis[1]).setStyle("DANGER")
				),
			],
			fetchReply: true,
		})) as Message;

		const collectConfirmation = utils.buttonCollector(message.channel, member.user, 60000, 1);

		collectConfirmation.on("collect", async (i) => {
			await i.deferUpdate();

			if (i.customId === "connect4-deny") {
				utils.iReply(message, {
					content: `<@${interaction.user.id}>`,
					embeds: [
						client.embed.globalErr({
							title: Connect4.InviteCanceled.Title,
							message: utils.replaceText(Connect4.InviteCanceled.Descriptions[0], "USER", `<@${member.id}>`),
						}),
					],
				});
			} else if (i.customId === "connect4-accept") {
				let gameOver = false;
				const players = { 1: interaction.member, 2: member };
				let turn = 2;
				const emojis = ["1️⃣", "2️⃣", "3️⃣", "4️⃣", "5️⃣", "6️⃣", "7️⃣"];

				const msg = await message.edit({
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
								if (status.tie) {
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
									utils.iReply(msg, {
										content: Connect4.GameBoardOver.GameOverTie.replace("PLAYER-1", `<@${players[turn].id}>`).replace(
											"PLAYER-2",
											`<@${players[turn == 1 ? 2 : 1].id}>`
										),
									});
								} else {
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
									utils.iReply(msg, {
										content: Connect4.GameBoardOver.GameOverWin.replace("WINNER", `<@${players[turn].id}>`).replace(
											"LOSER",
											`<@${players[turn == 1 ? 2 : 1].id}>`
										),
									});
								}
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
