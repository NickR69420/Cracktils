import { Command } from "../../lib/structures/Command";
import { codeBlock } from "@discordjs/builders";

export default new Command({
	name: "filter",
	description: "Configure the word filter for Crackpixel.",
	usage: "filter <add|remove|list|enable|disable> [word(s)]",
	minArgs: 1,
	aliases: ["wordfilter", "badwords", "swears"],
	userPerms: ["ADMINISTRATOR"],
	run: async ({ client, message, args, utils, lang }) => {
		const { Filter } = lang.FilterSystem.Commands;
		const chosenSetting = args.pick(0) as string;
		const words = args.rest(1).split(" ");
		const allowedSettings = ["add", "remove", "enable", "disable", "list"];

		if (!allowedSettings.includes(chosenSetting)) {
			return utils.iReply(message, {
				embeds: [
					client.embed.globalErr({
						message: utils.replaceText(Filter.InvalidArgs, "SETTINGS", allowedSettings.map((w) => `\`${w}\``).join(", ")),
					}),
				],
			});
		}

		switch (chosenSetting.toLowerCase()) {
			case "enable": {
				const data = await client.db.getGuild(message.guild.id);

				if (data.enableFilter) {
					utils.iReply(message, {
						embeds: [
							client.embed.globalErr({
								message: Filter.Enabled[1],
							}),
						],
					});
					return;
				}

				await client.prisma.guild
					.update({
						where: { id: message.guild.id },
						data: { enableFilter: true },
					})
					.catch((err) => {
						client.logger.error(err);
						utils.iReply(message, {
							embeds: [
								client.embed.globalErr({
									message: lang.GlobalErrors.cmdErr,
								}),
							],
						});
						return;
					});

				utils.iReply(message, {
					embeds: [
						client.embed.globalSuccess({
							message: Filter.Enabled[0],
						}),
					],
				});

				break;
			}
			case "disable": {
				const data = await client.db.getGuild(message.guild.id);

				if (!data.enableFilter) {
					utils.iReply(message, {
						embeds: [
							client.embed.globalErr({
								message: Filter.Disabled[1],
							}),
						],
					});
					return;
				}

				await client.prisma.guild
					.update({
						where: { id: message.guild.id },
						data: { enableFilter: false },
					})
					.catch((err) => {
						client.logger.error(err);
						utils.iReply(message, {
							embeds: [
								client.embed.globalErr({
									message: lang.GlobalErrors.cmdErr,
								}),
							],
						});
						return;
					});

				utils.iReply(message, {
					embeds: [
						client.embed.globalSuccess({
							message: Filter.Disabled[0],
						}),
					],
				});

				break;
			}
			case "add": {
				if (words.length == 0)
					return utils.iReply(message, {
						embeds: [
							client.embed.globalErr({
								message: Filter.NoWord[0],
							}),
						],
					});

				const invalidWords = await checkWords(words, true);

				if (invalidWords.length > 0) {
					utils.iReply(message, {
						embeds: [
							client.embed.globalErr({
								message:
									invalidWords.length == 1
										? utils.replaceText(Filter.Add.WordAlreadyInFilter[0], "WORD", `\`${invalidWords}\``)
										: utils.replaceText(
												Filter.Add.WordAlreadyInFilter[1],
												"WORDS",
												invalidWords.map((w) => `\`${w}\``).join(", ")
										  ),
							}),
						],
					});

					return;
				}

				await client.prisma.guild
					.update({
						where: { id: message.guild.id },
						data: {
							filter: {
								push: words,
							},
						},
					})
					.catch((err) => {
						client.logger.error(err);
						utils.iReply(message, {
							embeds: [
								client.embed.globalErr({
									message: lang.GlobalErrors.cmdErr,
								}),
							],
						});
						return;
					});

				utils.iReply(message, {
					embeds: [
						client.embed.globalSuccess({
							title: Filter.Add.Title,
							message:
								words.length == 1
									? utils.replaceText(Filter.Add.Description[0], "WORD", `\`${words}\``)
									: utils.replaceText(Filter.Add.Description[1], "WORDS", words.map((w) => `\`${w}\``).join(", ")),
						}),
					],
				});

				break;
			}
			case "remove": {
				if (words.length == 0)
					return utils.iReply(message, {
						embeds: [
							client.embed.globalErr({
								message: Filter.NoWord[0],
							}),
						],
					});
				const filter = (await client.db.getGuild(message.guild.id)).filter;
				const invalidWords = await checkWords(words);

				if (invalidWords.length > 0) {
					utils.iReply(message, {
						embeds: [
							client.embed.globalErr({
								message: utils.replaceText(Filter.Remove.InvalidWords, "WORDS", filter.join(", ")),
							}),
						],
					});

					return;
				}

				const removedWords = removeWords(filter, words);

				await client.prisma.guild
					.update({
						where: { id: message.guild.id },
						data: {
							filter: {
								set: removedWords,
							},
						},
					})
					.catch((err) => {
						client.logger.error(err);
						utils.iReply(message, {
							embeds: [
								client.embed.globalErr({
									message: lang.GlobalErrors.cmdErr,
								}),
							],
						});
						return;
					});

				utils.iReply(message, {
					embeds: [
						client.embed.globalSuccess({
							title: Filter.Remove.Title,
							message:
								words.length == 1
									? utils.replaceText(Filter.Remove.Description[0], "WORD", `\`${words}\``)
									: utils.replaceText(Filter.Remove.Description[1], "WORDS", words.map((w) => `\`${w}\``).join(", ")),
						}),
					],
				});

				break;
			}
			case "list": {
				const filter = (await client.db.getGuild(message.guild.id)).filter;

				utils.iReply(message, {
					embeds: [
						client.embed.create({
							Title: Filter.List,
							Description: filter.length > 0 ? codeBlock(filter.join(", ")) : "None",
							Color: client.config.EmbedColors.Default,
						}),
					],
				});
			}
		}

		async function checkWords(array: string[], add?: boolean) {
			const filter = (await client.db.getGuild(message.guild.id)).filter;
			const invalidwords: string[] = [];
			if (add) {
				array.forEach((word) => {
					if (filter.some((w) => w.toLowerCase() === word)) invalidwords.push(word);
				});
			} else {
				array.forEach((word) => {
					if (!filter.some((w) => w.toLowerCase() === word)) invalidwords.push(word);
				});
			}

			return invalidwords;
		}

		function removeWords(array: string[], words: string[]) {
			words.forEach((word) => {
				let found = array.indexOf(word);

				return array.splice(found, 1);
			});

			return array;
		}
	},
});
