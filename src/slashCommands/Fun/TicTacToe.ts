import { ButtonInteraction, GuildMember, Message, MessageActionRow, MessageButton } from "discord.js";
import { SlashCommand } from "../../lib/structures/SlashCommand";

export default new SlashCommand({
	name: "tictactoe",
	description: "Play a game of tictactoe!",
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
		const { TicTacToe } = lang.FunModule.Commands;
		const member = interaction.options.getMember("user") as GuildMember;

		let Game = [
			[0, 0, 0],
			[0, 0, 0],
			[0, 0, 0],
		];

		if (member.id === interaction.user.id || member.user.bot)
			return interaction.reply({
				embeds: [
					client.embed.globalErr({
						message: TicTacToe.InvalidUser,
					}),
				],
				ephemeral: true,
			});

		const message = (await interaction.reply({
			content: `<@${member.id}>`,
			embeds: [
				client.embed.create({
					Title: TicTacToe.Invite.Title,
					Description: utils.replaceText(TicTacToe.Invite.Description, "USER", `<@${interaction.user.id}>`),
				}),
			],
			components: [
				new MessageActionRow().addComponents(
					new MessageButton().setCustomId("ttt-accept").setLabel("Accept").setEmoji(TicTacToe.Emojis[0]).setStyle("SUCCESS"),
					new MessageButton().setCustomId("ttt-deny").setLabel("Deny").setEmoji(TicTacToe.Emojis[1]).setStyle("DANGER")
				),
			],
			fetchReply: true,
		})) as Message;

		const collectConfirmation = utils.buttonCollector(message.channel, member.user, 60000, 1);

		collectConfirmation.on("collect", async (i) => {
			await i.deferUpdate();

			if (i.customId === "ttt-deny") {
				message.reply({
					embeds: [
						client.embed.globalErr({
							title: TicTacToe.InviteCanceled.Title,
							message: utils.replaceText(TicTacToe.InviteCanceled.Descriptions[0], "USER", `<@${member.id}>`),
						}),
					],
				});
			} else if (i.customId === "ttt-accept") {
				let gameOver = false;
				const players = { 1: member, 2: interaction.member };
				let turn = 1;
				const emojis = { 0: "➖", 1: "❌", 2: "⭕" };

				const msg = await message.edit({
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
								if (status.tie) {
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
