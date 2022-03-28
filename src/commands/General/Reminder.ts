import { Command } from "../../lib/structures/Command";
import { EmbedFieldData } from "discord.js";
import formatTime from "pretty-ms";

export default new Command({
	name: "reminder",
	description: "Make the bot remind you to do something.",
	usage: "reminder <set|remove|list> <duration|ID> [reason]",
	minArgs: 1,
	aliases: ["remindme", "remind", "alarm", "timer"],
	userPerms: ["SEND_MESSAGES"],
	run: async ({ client, message, args, utils, lang }) => {
		const { Reminder } = lang.GeneralModule.Commands;
		const chosenAction = args.pick(0) as string;
		const reason = args.rest(2) || null;

		const allowedActions = ["set", "remove", "list"];
		if (!allowedActions.includes(chosenAction))
			return utils.iReply(message, {
				embeds: [
					client.embed.globalErr({
						message: utils.replaceText(Reminder.InvalidArgs, "ACTIONS", allowedActions.map((a) => `\`${a}\``).join(", ")),
					}),
				],
			});

		switch (chosenAction) {
			case "set": {
				const duration = args.pick(1) as string;

				if (!duration)
					return utils.iReply(message, {
						embeds: [
							client.embed.globalErr({
								message: Reminder.Set.InvalidDuration,
							}),
						],
					});

				const totalTime = utils.ms(duration);

				if (isNaN(totalTime))
					return utils.iReply(message, {
						embeds: [
							client.embed.globalErr({
								message: Reminder.Set.InvalidDuration,
							}),
						],
					});

				const time = formatTime(totalTime, { verbose: true });
				const expires = utils.getExpires(utils.getDuration(duration));
				const ID = utils.generateId();

				await client.prisma.reminder.create({
					data: {
						id: ID,
						guildId: message.guild.id,
						channelId: message.channel.id,
						userId: message.author.id,
						time,
						expires,
						reason,
					},
				});

				utils.iReply(message, {
					embeds: [
						client.embed.create({
							Title: Reminder.Set.ReminderSet.Title,
							Description: reason
								? utils.replaceText(Reminder.Set.ReminderSet.Descriptions[0], "REASON", reason).replace("TIME", time)
								: utils.replaceText(Reminder.Set.ReminderSet.Descriptions[1], "TIME", time),
							Footer: {
								text: utils.replaceText(Reminder.Set.ReminderSet.Footer, "id", ID),
							},
							Color: "RANDOM",
						}),
					],
				});

				break;
			}
			case "remove": {
				const ID = args.pick(1) as string;

				if (!ID)
					return utils.iReply(message, {
						embeds: [
							client.embed.globalErr({
								message: Reminder.Remove.InvalidID,
							}),
						],
					});

				const data = await client.prisma.reminder.findUnique({
					where: {
						id: ID,
					},
				});

				if (!data)
					return utils.iReply(message, {
						embeds: [
							client.embed.globalErr({
								message: Reminder.Remove.NoReminderFound,
							}),
						],
					});

				await client.prisma.reminder
					.delete({
						where: {
							id: ID,
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
							message: Reminder.Remove.Removed,
						}),
					],
				});

				break;
			}
			case "list": {
				const reminders = await client.prisma.reminder.findMany({
					where: {
						userId: message.author.id,
					},
				});

				const Fields: EmbedFieldData[] = [];
				reminders.forEach((r) => {
					Fields.push({
						name: utils.replaceText(Reminder.List.Fields[0], "id", r.id),
						value: utils
							.replaceText(Reminder.List.Fields[1], "REASON", r.reason || "No reason provided.")
							.replace("TIME", utils.formatDate(r.expires.getTime(), "R")),
					});
				});

				utils.iReply(message, {
					embeds: [
						client.embed.create({
							Title: Reminder.List.Title,
							Description:
								reminders.length > 0
									? utils.replaceText(Reminder.List.Descriptions[0], "NO", `${reminders.length}`)
									: Reminder.List.Descriptions[1],
							Fields,
							Timestamp: true,
						}),
					],
				});

				break;
			}
		}
	},
});
