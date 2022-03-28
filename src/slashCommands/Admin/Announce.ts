import { TextChannel, Role, Message, TextBasedChannel } from "discord.js";
import { SlashCommand } from "../../lib/structures/SlashCommand";

export default new SlashCommand({
	name: "announce",
	description: "Create an announcement.",
	cooldown: 0,
	userPerms: ["ADMINISTRATOR"],
	run: async ({ client, interaction, lang, utils }) => {
		const { Announce } = lang.AdminModule.Commands;
		const { Questions } = Announce;
		let answers = [];
		let toTag: string;
		const tagRoles: string[] = [];
		let msgIDs: string[] = [];

		const message = (await interaction.reply({
			content: "Setting it up!",
			fetchReply: true,
		})) as Message;

		askQuestions(0, true);

		async function askQuestions(i: number, askQuestion: boolean) {
			const question = Questions[i];

			if (askQuestion)
				await message.channel
					.send({
						embeds: [
							client.embed.create({
								Title: utils.replaceText(Announce.AnnouncementSetup, "POS", `${i + 1}/5`),
								Description: question,
							}),
						],
					})
					.then((m) => msgIDs.push(m.id));

			const res = await utils.waitForResponse(interaction.user.id, message.channel as TextChannel);

			msgIDs.push(res.id);
			if (res.content.toLowerCase() === "cancel")
				return utils.iReply(message, {
					embeds: [
						client.embed.globalErr({
							message: Announce.SetupCanceled,
						}),
					],
				});
			else if (i === 2) {
				if (res.mentions.channels.first()) {
					answers.push(res.mentions.channels.first());
				} else {
					if (res.content == "here") answers.push(message.channel);
					else if (res.content == "default") {
						const channel = utils.findChannel(client.config.Channels.Announcements, message.guild);

						if (!channel) {
							const msg = await message.channel.send({
								embeds: [
									client.embed.globalErr({
										title: Announce.InvalidChannel.Title,
										message: Announce.InvalidChannel.Description,
									}),
								],
							});
							utils.deleteMsg(msg, 2500);
							return askQuestions(i, false);
						} else answers.push(channel);
					} else {
						const msg = await message.channel.send({
							embeds: [
								client.embed.globalErr({
									title: Announce.InvalidChannel.Title,
									message: Announce.InvalidChannel.Description,
								}),
							],
						});
						utils.deleteMsg(msg, 2500);
						return askQuestions(i, false);
					}
				}
			} else if (i === 3) {
				if (res.content == "everyone") toTag = "@everyone";
				if (res.content == "here") toTag = "@here";
				if (!!res.mentions.roles.first()) toTag = res.mentions.roles.map((r) => `<@${r.id}>`).join(" ");
				if (
					res.content
						.toLowerCase()
						.replace(/\s+/g, "")
						.split(",")
						.some((r) => utils.findRole(r, res.guild))
				) {
					res.content
						.toLowerCase()
						.replace(/\s+/g, "")
						.split(",")
						.forEach((rolename) => {
							if (utils.findRole(rolename, res.guild)) {
								const r = utils.findRole(rolename, res.guild) as Role;
								tagRoles.push(r.id);
							}
						});
				}
			} else answers.push(res.content);

			if (i >= Questions.length - 1) finishAnnouncement();
			else askQuestions(++i, true);
		}

		async function finishAnnouncement() {
			const ch = answers[2] as TextBasedChannel;

			ch.send({
				content: tagRoles.length > 0 ? tagRoles.join(" ") : toTag,
				embeds: [
					client.embed.create({
						Title: utils.replaceText(Announce.Announcement.Title, "TITLE", answers[0]),
						Description: answers[1],
						Thumbnail: answers[3].includes("http") ? answers[3] : undefined,
						Footer: {
							text: utils.replaceText(Announce.Announcement.Footer, "USER", interaction.user.tag),
						},
						Color: client.config.EmbedColors.Default,
						Timestamp: true,
					}),
				],
			});
			msgIDs.forEach(async (id) => (await message.channel.messages.fetch(id)).delete());
			const m = await message.channel.send({
				embeds: [
					client.embed.globalSuccess({
						title: Announce.Posted.Title,
						message: Announce.Posted.Description,
					}),
				],
			});
			utils.deleteMsg(m, 2500);
		}
	},
});
