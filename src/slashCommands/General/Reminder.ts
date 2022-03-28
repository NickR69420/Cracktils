import { SlashCommand } from "../../lib/structures/SlashCommand";
import { EmbedFieldData } from "discord.js";
import formatTime from "pretty-ms";

export default new SlashCommand({
	name: "reminder",
	description: "Make the bot remind you to do something.",
	userPerms: ["SEND_MESSAGES"],
	options: [
		{
			type: "SUB_COMMAND",
			name: "set",
			description: "Sets a reminder.",
			options: [
				{
					type: "STRING",
					name: "duration",
					description: "The duration of the reminder. Ex: 10s, 1m, 2h etc.",
					required: true,
				},
				{
					type: "STRING",
					name: "reason",
					description: "A reason to be reminded for.",
					required: false,
				},
			],
		},
		{
			type: "SUB_COMMAND",
			name: "remove",
			description: "Removes a reminder.",
			options: [
				{
					type: "STRING",
					name: "id",
					description: "The ID of the reminder to remove.",
					required: true,
				},
			],
		},
		{
			type: "SUB_COMMAND",
			name: "list",
			description: "Displays the list of reminders set.",
		},
	],
	run: async ({ client, interaction, utils, lang }) => {
		const { Reminder } = lang.GeneralModule.Commands;

		switch (interaction.options.getSubcommand()) {
			case "set": {
				const duration = interaction.options.getString("duration");
				const reason = interaction.options.getString("reason") || null;
				const totalTime = utils.ms(duration);

				if (isNaN(totalTime))
					return interaction.reply({
						embeds: [
							client.embed.globalErr({
								message: Reminder.Set.InvalidDuration,
							}),
						],
						ephemeral: true,
					});

				const time = formatTime(totalTime, { verbose: true });
				const expires = utils.getExpires(utils.getDuration(duration));
				const ID = utils.generateId();

				await client.prisma.reminder.create({
					data: {
						id: ID,
						guildId: interaction.guild.id,
						channelId: interaction.channel.id,
						userId: interaction.user.id,
						time,
						expires,
						reason,
					},
				});

				interaction.reply({
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
					ephemeral: true,
				});

				break;
			}
			case "remove": {
				const ID = interaction.options.getString("id");

				const data = await client.prisma.reminder.findUnique({
					where: {
						id: ID,
					},
				});

				if (!data)
					return interaction.reply({
						embeds: [
							client.embed.globalErr({
								message: Reminder.Remove.NoReminderFound,
							}),
						],
						ephemeral: true,
					});

				await client.prisma.reminder
					.delete({
						where: {
							id: ID,
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
							message: Reminder.Remove.Removed,
						}),
					],
					ephemeral: true,
				});

				break;
			}
			case "list": {
				const reminders = await client.prisma.reminder.findMany({
					where: {
						userId: interaction.user.id,
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

				interaction.reply({
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
					ephemeral: true,
				});

				break;
			}
		}
	},
});
