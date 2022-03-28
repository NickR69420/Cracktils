import { userMention } from "@discordjs/builders";
import { GuildMember, TextChannel } from "discord.js";
import { SlashCommand } from "../../lib/structures/SlashCommand";

export default new SlashCommand({
	name: "giveaway",
	description: "The giveaway system.",
	userPerms: ["MANAGE_MESSAGES"],
	options: [
		{
			name: "create",
			description: "Create a giveaway.",
			type: "SUB_COMMAND",
			options: [
				{
					name: "duration",
					description: "The duration of the giveaway. Ex: 10s, 1m, 2h etc.",
					type: "STRING",
					required: true,
				},
				{
					name: "prize",
					description: "The thing you want to giveaway.",
					type: "STRING",
					required: true,
				},
				{
					name: "channel",
					description: "The channel to post the giveaway in.",
					type: "CHANNEL",
					channelTypes: ["GUILD_TEXT", "GUILD_NEWS"],
					required: true,
				},
				{
					name: "description",
					description: "The description of the prize.",
					type: "STRING",
					required: false,
				},
				{
					name: "thumbnail",
					description: "The thumnail image of the giveaway.",
					type: "STRING",
					required: false,
				},
				{
					name: "winners",
					description: "The number of winners that can be chosen. Default is 1.",
					type: "INTEGER",
					required: false,
				},
			],
		},
		{
			name: "delete",
			description: "Deletes an ongoing giveaway.",
			type: "SUB_COMMAND",
			options: [
				{
					name: "id",
					description: "The id of the giveaway to delete.",
					type: "STRING",
					required: true,
				},
			],
		},
		{
			name: "reroll",
			description: "Create a new set of winners for a giveaway. You may also exclude specific users from winning.",
			type: "SUB_COMMAND",
			options: [
				{
					name: "id",
					description: "The id of the giveaway to delete.",
					type: "STRING",
					required: true,
				},
				{
					name: "winners",
					description: "The number of winners to reroll. Default is 1.",
					type: "INTEGER",
					required: false,
				},
				{
					name: "exclude",
					description: "The users to exclude from winning. You may provide the users' IDs or usernames.",
					type: "INTEGER",
					required: false,
				},
			],
		},
		{
			name: "end",
			description: "Force a giveaway to end.",
			type: "SUB_COMMAND",
			options: [
				{
					name: "id",
					description: "The id of the giveaway to end.",
					type: "STRING",
					required: true,
				},
			],
		},
	],
	run: async ({ client, interaction, utils, lang }) => {
		await interaction.deferReply({ ephemeral: true }).catch(() => {});

		const { Gcreate, Gdelete, Greroll, Gend } = lang.GiveawaySystem.Commands;
		const { member, options, guild } = interaction;
		if (!utils.hasRole(member, client.config.Roles.JrAdmin, true, guild))
			return interaction.followUp({
				embeds: [client.embed.globalErr({ title: lang.GlobalErrors.NoPerms.Title, message: lang.GlobalErrors.NoPerms.Description })],
			});

		switch (options.getSubcommand()) {
			case "create": {
				const time = options.getString("duration");
				const prize = options.getString("prize");
				const desc = options.getString("description") || null;
				const winners = options.getInteger("winners") || 1;
				const thumbnail = options.getString("thumbnail") || "na";
				const channel = options.getChannel("channel") as TextChannel;

				if (invalidTime(time)) return interaction.followUp({ embeds: [client.embed.globalErr({ message: Gcreate.InvalidTime })] });

				if (winners < 1) return interaction.followUp({ embeds: [client.embed.globalErr({ message: Gcreate.InvalidWinners })] });

				const duration = utils.getDuration(time);
				const endsAt = utils.getExpires(duration);

				const m = await channel.send({
					embeds: [
						client.embed.create({
							Title: `${prize}`,
							Description: Gcreate.Giveaway.Description.replace("DESC", desc || "")
								.replace("EMOJI", client.config.Other.Giveaways.DiscordEmoji)
								.replace("HOST", `<@${interaction.user.id}>`)
								.replace("WINNERS", `${winners}`)
								.replace("TIMER", utils.formatDate(endsAt.getTime(), "R")),
							Footer: { text: Gcreate.Giveaway.Footer },
							Image: thumbnail.includes("http") ? thumbnail : undefined,
							Timestamp: endsAt,
						}),
					],
				});

				interaction.followUp({ embeds: [client.embed.globalSuccess({ message: Gcreate.Created })] });

				await m.react(client.config.Other.Giveaways.UnicodeEmoji);
				await client.prisma.giveaway.create({
					data: {
						id: m.id,
						channelId: m.channel.id,
						guildId: guild.id,
						endAt: endsAt,
						winners,
						hostedBy: interaction.user.id,
						prize,
					},
				});

				break;
			}
			case "delete": {
				const id = options.getString("id");

				client.giveaways
					.deleteGiveaway(id)
					.then(() => {
						return interaction.followUp({
							embeds: [client.embed.globalSuccess({ message: Gdelete.Deleted })],
						});
					})
					.catch(() => {
						return interaction.followUp({
							embeds: [client.embed.globalErr({ message: Gdelete.InvalidGiveaway })],
						});
					});
			}
			case "reroll": {
				const id = options.getString("id");
				const count = options.getInteger("winners") || 1;
				const users = options.getString("exclude");

				const giveaway = await client.giveaways.getGiveaway(id);
				if (!giveaway) return interaction.followUp({ embeds: [client.embed.globalErr({ message: Greroll.InvalidGiveaway })] });
				if (!giveaway.ended) return interaction.followUp({ embeds: [client.embed.globalErr({ message: Greroll.GiveawayHasntEnded })] });
				const data = await client.giveaways.getGiveawayData(giveaway);
				if (!data) return interaction.followUp({ embeds: [client.embed.globalErr({ message: Greroll.InvalidGiveaway })] });

				interaction.followUp("Rerolling!");

				const { message: m } = data;
				if (giveaway.users.length == 0)
					return utils.iReply(m, { embeds: [client.embed.globalErr({ message: lang.GiveawaySystem.Commands.NoOneEntered })] });

				let excluded: string[] = [];
				if (users) excluded = excludedUsers(users);

				let winners: string[] = [];

				if (excluded.length > 0) winners = await client.giveaways.getWinners(giveaway, count, excluded);
				else winners = await client.giveaways.getWinners(giveaway, count);

				if (winners.some((w) => w == undefined))
					return utils.iReply(m, { embeds: [client.embed.globalErr({ message: lang.GiveawaySystem.Commands.NoOneEntered })] });

				m.reply({
					content: utils.replaceText(lang.GiveawaySystem.ReRolled.Content, "WINNERS", winners.map((w) => userMention(w)).join(" ")),
				});

				m.edit({
					embeds: [
						client.embed.create({
							Title: m.embeds[0].title,
							Description: utils.replaceText(
								lang.GiveawaySystem.Ended.Description,
								"WINNERS",
								winners.map((w) => userMention(w)).join(" ")
							),
							Timestamp: m.embeds[0].timestamp,
						}),
					],
				});
			}
			case "end": {
				const id = options.getString("id");

				interaction.editReply("Ending giveaway...");

				const giveaway = await client.giveaways.getGiveaway(id);
				if (!giveaway) return interaction.followUp({ embeds: [client.embed.globalErr({ message: Gend.InvalidGiveaway })] });
				if (giveaway.ended) return interaction.followUp({ embeds: [client.embed.globalErr({ message: Gend.AlreadyEnded })] });

				const ended = await client.giveaways.end(giveaway);
				if (!ended) return interaction.followUp({ embeds: [client.embed.globalErr({ message: Gend.InvalidGiveaway })] });

				interaction.followUp({ content: "Ended!", ephemeral: true });
			}
		}

		function invalidTime(time: string) {
			const ms = utils.ms(time);

			if (isNaN(ms)) return true;
			else return false;
		}

		function excludedUsers(a: string) {
			const exclude: string[] = [];
			const users = a.split(" ");

			users.forEach((user) => {
				const member = utils.findMember(user, interaction.guild) as GuildMember;
				if (!member) return;
				else exclude.push(member.id);
			});

			return exclude;
		}
	},
});
