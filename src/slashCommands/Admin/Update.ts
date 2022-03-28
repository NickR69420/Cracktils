import { Message, TextChannel } from "discord.js";
import { SlashCommand } from "../../lib/structures/SlashCommand";

export default new SlashCommand({
	name: "update",
	description: "Create an update.",
	userPerms: ["ADMINISTRATOR"],
	run: async ({ client, interaction, utils, lang }) => {
		const { Update } = lang.AdminModule.Commands;
		let questions = [Update.Questions[0], Update.Questions[1], Update.Questions[2], Update.Questions[3]];

		let answers = [];
		let toTag: string;
		let tagRoles: string[] = [];
		let msgIDs: string[] = [];

		const message = (await interaction.reply({
			content: "Setting it up!",
			ephemeral: true,
			fetchReply: true,
		})) as Message;

		askQuestion(0, true);

		async function askQuestion(i: number, ask: boolean) {
			const question = questions[i];
			if (ask)
				await message.channel
					.send({
						embeds: [
							client.embed.create({
								Title: utils.replaceText(Update.UpdateSetup, "POS", `${i + 1}/4`),
								Description: question,
							}),
						],
					})
					.then((msg) => msgIDs.push(msg.id));

			const res = await utils.waitForResponse(interaction.user.id, message.channel as TextChannel);

			msgIDs.push(res.id);
			if (res.content == "cancel")
				return message.channel.send({
					embeds: [
						client.embed.globalErr({
							message: Update.SetupCanceled,
						}),
					],
				});
			else if (i == 1) {
				if (res.mentions.channels.first()) {
					answers.push(res.mentions.channels.first());
				} else {
					if (res.content == "here") answers.push(message.channel);
					else if (res.content == "default") {
						const channel = utils.findChannel(client.config.Channels.DefaultUpdates, message.guild) as TextChannel;

						if (!channel) {
							message.channel.send({
								embeds: [
									client.embed.globalErr({
										title: Update.InvalidChannel.Title,
										message: Update.InvalidChannel.Description,
									}),
								],
							});
							return askQuestion(i, false);
						} else answers.push(channel);
					} else {
						message.channel.send({
							embeds: [
								client.embed.globalErr({
									title: Update.InvalidChannel.Title,
									message: Update.InvalidChannel.Description,
								}),
							],
						});
						return askQuestion(i, false);
					}
				}
			} else if (i == 2) {
				if (res.content == "@everyone") toTag = "@everyone";
				if (!!res.mentions.roles.first()) res.mentions.roles.forEach((r) => tagRoles.push(r.id));

				if (
					res.content
						.toLowerCase()
						.replace(/\s+/g, "")
						.split(",")
						.some((rolename) => !!res.guild.roles.cache.find((r) => r.name.toLowerCase() == rolename))
				)
					res.content
						.toLowerCase()
						.replace(/\s+/g, "")
						.split(",")
						.forEach((c) => {
							if (res.guild.roles.cache.find((r) => r.name.toLowerCase() == c)) {
								tagRoles.push(res.guild.roles.cache.find((r) => r.name.toLowerCase() == c).id);
							}
						});
			} else {
				answers.push(res.content);
			}

			if (i >= questions.length - 1) finishUpdate();
			else askQuestion(++i, true);
		}

		function finishUpdate() {
			const ch = answers[1] as TextChannel;

			ch.send({
				content: tagRoles.length > 0 ? tagRoles.map((r) => `<@&${r}>`).join(" ") : toTag,
				embeds: [
					client.embed.create({
						Title: Update.Update.Title,
						Description: answers[0],
						Thumbnail: answers[2].includes("http") ? answers[2] : undefined,
						Footer: {
							text: utils.replaceText(Update.Update.Footer, "USER", interaction.user.tag),
						},
						Color: client.config.EmbedColors.Default,
					}),
				],
			});

			msgIDs.forEach(async (id) => await (await message.channel.messages.fetch(id)).delete());
			message.channel.send({
				embeds: [
					client.embed.globalSuccess({
						title: Update.Posted.Title,
						message: Update.Posted.Description,
					}),
				],
			});
		}
	},
});
