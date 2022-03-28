import { TextBasedChannel, TextChannel } from "discord.js";
import { Command } from "../../lib/structures/Command";

export default new Command({
	name: "gcreate",
	description: "Create a giveaway.",
	usage: "gcreate",
	aliases: ["gstart", "creategiveaway", "giveawaycreate"],
	userPerms: ["MANAGE_MESSAGES"],
	run: async ({ client, message, utils, lang }) => {
		const { Gcreate } = lang.GiveawaySystem.Commands;
		if (!utils.hasRole(message.member, client.config.Roles.JrAdmin, true, message.guild))
			return utils.iReply(message, {
				embeds: [client.embed.globalErr({ title: lang.GlobalErrors.NoPerms.Title, message: lang.GlobalErrors.NoPerms.Description })],
			});

		const questions = Gcreate.Setup.Questions;
		const answers: string[] = [];
		let channel: TextBasedChannel;
		let msgIDs: string[] = [];

		askQuestions(0, true);

		function askQuestions(i: number, askQuestion: boolean) {
			const question = questions[i];

			if (askQuestion)
				message.channel
					.send({
						embeds: [client.embed.create({ Title: utils.replaceText(Gcreate.Setup.Title, "POS", `${i + 1}/5`), Description: question })],
					})
					.then((m) => msgIDs.push(m.id));

			utils.waitForResponse(message.author.id, message.channel as TextChannel).then(async (msg) => {
				msgIDs.push(msg.id);
				if (["cancel", "stop"].includes(msg.content)) {
					const m = await message.channel.send({ embeds: [client.embed.globalErr({ message: Gcreate.Canceled })] });
					return msgIDs.push(m.id);
				} else if (i == 0 && invalidTime(msg.content.toLowerCase())) {
					const m = await message.channel.send({ embeds: [client.embed.globalErr({ message: Gcreate.InvalidTime })] });
					msgIDs.push(m.id);
					askQuestions(i, false);
				} else if (i == 3 && (isNaN(parseInt(msg.content)) || parseInt(msg.content) < 1)) {
					const m = await message.channel.send({ embeds: [client.embed.globalErr({ message: Gcreate.InvalidWinners })] });
					msgIDs.push(m.id);
					askQuestions(i, false);
				} else if (i == 4) {
					channel =
						msg.content == "here"
							? msg.channel
							: msg.mentions.channels.first() || (utils.findChannel(msg.content, message.guild) as TextBasedChannel);

					if (!channel) {
						const m = await message.channel.send({ embeds: [client.embed.globalErr({ message: Gcreate.InvalidChannel })] });
						msgIDs.push(m.id);
						askQuestions(i, false);
					} else {
						await finishGiveaway();
					}
				} else {
					answers.push(msg.content);
					if (i >= questions.length - 1) await finishGiveaway();
					else askQuestions(i + 1, true);
				}
			});
		}

		async function finishGiveaway() {
			msgIDs.forEach(async (m) => {
				(await message.channel.messages.fetch(m)).delete().catch(() => {});
			});
			message.delete();

			const duration = utils.getDuration(answers[0]);
			const endsAt = utils.getExpires(duration);

			const m = await channel.send({
				embeds: [
					client.embed.create({
						Title: `${answers[1]}`,
						Description: Gcreate.Giveaway.Description.replace("DESC", answers[2])
							.replace("EMOJI", client.config.Other.Giveaways.DiscordEmoji)
							.replace("HOST", `<@${message.author.id}>`)
							.replace("WINNERS", `${answers[3]}`)
							.replace("TIMER", utils.formatDate(endsAt.getTime(), "R")),
						Footer: { text: Gcreate.Giveaway.Footer },
						Image: answers[5].includes("http") ? answers[5] : undefined,
						Timestamp: endsAt,
					}),
				],
			});

			await m.react(client.config.Other.Giveaways.UnicodeEmoji);
			await client.prisma.giveaway.create({
				data: {
					id: m.id,
					channelId: m.channel.id,
					guildId: message.guild.id,
					endAt: endsAt,
					winners: parseInt(answers[3]),
					hostedBy: message.author.id,
					prize: answers[1],
				},
			});

			const msg = await message.channel.send({ embeds: [client.embed.globalSuccess({ message: Gcreate.Created })] });
			utils.deleteMsg(msg, 3000);
		}

		function invalidTime(time: string) {
			const ms = utils.ms(time);

			if (isNaN(ms)) return true;
			else return false;
		}
	},
});
