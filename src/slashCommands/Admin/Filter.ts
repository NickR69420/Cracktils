import { codeBlock } from "@discordjs/builders";
import { SlashCommand } from "../../lib/structures/SlashCommand";

export default new SlashCommand({
	name: "filter",
	description: "Configure the word filter for Crackpixel.",
	userPerms: ["ADMINISTRATOR"],
	options: [
		{
			type: "SUB_COMMAND",
			name: "enable",
			description: "Enables the filter system.",
		},
		{
			type: "SUB_COMMAND",
			name: "disable",
			description: "Disables the filter system.",
		},
		{
			type: "SUB_COMMAND",
			name: "add",
			description: "Adds words to the filter",
			options: [
				{
					type: "STRING",
					name: "words",
					description: "Words to add to the filter",
					required: true,
				},
			],
		},
		{
			type: "SUB_COMMAND",
			name: "remove",
			description: "Removes words from the filter",
			options: [
				{
					type: "STRING",
					name: "words",
					description: "Words to remove from the filter.",
					required: true,
				},
			],
		},
		{
			type: "SUB_COMMAND",
			name: "list",
			description: "Displays the list of words currently in the filter.",
		},
	],
	run: async ({ client, interaction, utils, lang }) => {
		const { Filter } = lang.FilterSystem.Commands;

		const chosenSetting = interaction.options.getSubcommand();

		switch (chosenSetting) {
			case "enable": {
				const data = await client.db.getGuild(interaction.guild.id);

				if (data.enableFilter) {
					interaction.reply({
						embeds: [
							client.embed.globalErr({
								message: Filter.Enabled[1],
							}),
						],
						ephemeral: true,
					});
					return;
				}

				await client.prisma.guild
					.update({
						where: { id: interaction.guild.id },
						data: { enableFilter: true },
					})
					.catch((err) => {
						client.logger.error(err);
						interaction.reply({
							embeds: [
								client.embed.globalErr({
									message: lang.GlobalErrors.cmdErr,
								}),
							],
							ephemeral: true,
						});
						return;
					});

				interaction.reply({
					embeds: [
						client.embed.globalSuccess({
							message: Filter.Enabled[0],
						}),
					],
					ephemeral: true,
				});

				break;
			}
			case "disable": {
				const data = await client.db.getGuild(interaction.guild.id);

				if (!data.enableFilter) {
					interaction.reply({
						embeds: [
							client.embed.globalErr({
								message: Filter.Disabled[1],
							}),
						],
						ephemeral: true,
					});
					return;
				}

				await client.prisma.guild
					.update({
						where: { id: interaction.guild.id },
						data: { enableFilter: false },
					})
					.catch((err) => {
						client.logger.error(err);
						interaction.reply({
							embeds: [
								client.embed.globalErr({
									message: lang.GlobalErrors.cmdErr,
								}),
							],
							ephemeral: true,
						});
						return;
					});

				interaction.reply({
					embeds: [
						client.embed.globalSuccess({
							message: Filter.Disabled[0],
						}),
					],
					ephemeral: true,
				});

				break;
			}
			case "add": {
				const words = interaction.options.getString("words").split(" ");

				const invalidWords = await checkWords(words, true);

				if (invalidWords.length > 0) {
					interaction.reply({
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
						ephemeral: true,
					});

					return;
				}

				await client.prisma.guild
					.update({
						where: { id: interaction.guild.id },
						data: {
							filter: {
								push: words,
							},
						},
					})
					.catch((err) => {
						client.logger.error(err);
						interaction.reply({
							embeds: [
								client.embed.globalErr({
									message: lang.GlobalErrors.cmdErr,
								}),
							],
							ephemeral: true,
						});
						return;
					});

				interaction.reply({
					embeds: [
						client.embed.globalSuccess({
							title: Filter.Add.Title,
							message:
								words.length == 1
									? utils.replaceText(Filter.Add.Description[0], "WORD", `\`${words}\``)
									: utils.replaceText(Filter.Add.Description[1], "WORDS", words.map((w) => `\`${w}\``).join(", ")),
						}),
					],
					ephemeral: true,
				});

				break;
			}
			case "remove": {
				const words = interaction.options.getString("words").split(" ");

				const filter = (await client.db.getGuild(interaction.guild.id)).filter;
				const invalidWords = await checkWords(words);

				if (invalidWords.length > 0) {
					interaction.reply({
						embeds: [
							client.embed.globalErr({
								message: utils.replaceText(Filter.Remove.InvalidWords, "WORDS", filter.join(", ")),
							}),
						],
						ephemeral: true,
					});

					return;
				}

				const removedWords = removeWords(filter, words);

				await client.prisma.guild
					.update({
						where: { id: interaction.guild.id },
						data: {
							filter: {
								set: removedWords,
							},
						},
					})
					.catch((err) => {
						client.logger.error(err);
						interaction.reply({
							embeds: [
								client.embed.globalErr({
									message: lang.GlobalErrors.cmdErr,
								}),
							],
							ephemeral: true,
						});
						return;
					});

				interaction.reply({
					embeds: [
						client.embed.globalSuccess({
							title: Filter.Remove.Title,
							message:
								words.length == 1
									? utils.replaceText(Filter.Remove.Description[0], "WORD", `\`${words}\``)
									: utils.replaceText(Filter.Remove.Description[1], "WORDS", words.map((w) => `\`${w}\``).join(", ")),
						}),
					],
					ephemeral: true,
				});

				break;
			}
			case "list": {
				const filter = (await client.db.getGuild(interaction.guild.id)).filter;

				interaction.reply({
					embeds: [
						client.embed.create({
							Title: Filter.List,
							Description: filter.length > 0 ? codeBlock(filter.join(", ")) : "None",
							Color: client.config.EmbedColors.Default,
						}),
					],
					ephemeral: true,
				});
			}
		}

		async function checkWords(array: string[], add?: boolean) {
			const filter = (await client.db.getGuild(interaction.guild.id)).filter;
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
