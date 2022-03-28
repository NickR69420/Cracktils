import { TextChannel } from "discord.js";
import { OneWord } from "../lib/modules/OneWord";
import { Cracktils } from "../lib/structures/Client";
import { Event } from "../lib/structures/Event";

export default new Event("ready", async (client: Cracktils) => {
	const { logger, color, utils, config } = client;

	consoleInfo();
	setActivity();
	setInterval(() => checkReminders(), 5000);
	setInterval(() => checkEndedGiveaways(), 60000);
	new OneWord(client, "897528482303713320");

	function consoleInfo() {
		setTimeout(() => {
			logger.log(color.yellow(`[Handler] Loaded ${client.commands.size} commands.`));
			logger.log(color.yellow(`[Handler] Loaded ${client.slashCommands.size} slash commands.`));
			banner();
		}, 1000);
	}

	function banner() {
		logger.log(
			color.blueBright.bold(String.raw`

 ██████ ██████   █████   ██████ ██   ██ ████████ ██ ██      ███████ 
██      ██   ██ ██   ██ ██      ██  ██     ██    ██ ██      ██      
██      ██████  ███████ ██      █████      ██    ██ ██      ███████ 
██      ██   ██ ██   ██ ██      ██  ██     ██    ██ ██           ██ 
 ██████ ██   ██ ██   ██  ██████ ██   ██    ██    ██ ███████ ███████ v1.0.0  
    
 `)
		);
	}

	async function checkReminders() {
		const { Reminder } = client.lang.GeneralModule.Commands;
		const reminders = (await client.prisma.reminder.findMany()).filter((r) => r.expires.getTime() <= Date.now());

		for (const r of reminders) {
			const guild = await client.guilds.fetch(r.guildId);
			const channel = (await guild.channels.fetch(r.channelId)) as TextChannel;
			const user = await guild.members.fetch(r.userId);

			if (!guild || !channel || !user) break;

			const reminder = client.embed.create({
				Title: Reminder.Reminder.Title,
				Description: r.reason
					? utils.replaceText(Reminder.Reminder.Descriptions[0], "REASON", r.reason)
					: utils.replaceText(Reminder.Reminder.Descriptions[1], "TIME", r.time),
				Color: "RANDOM",
			});

			channel.send({ content: `<@${user.id}>`, embeds: [reminder] }).catch(() => {});
			user.send({ embeds: [reminder] }).catch(() => {});

			await client.prisma.reminder.delete({ where: { id: r.id } });
		}
	}

	function setActivity() {
		const { ActivityCycling } = config;

		if (!ActivityCycling.Enabled) {
			client.user.setActivity({ type: ActivityCycling.Default[0].type, name: ActivityCycling.Default[0].activity });
		} else {
			let i = 0;
			setInterval(() => {
				if (i === ActivityCycling.Activities.length) i = 0;

				const type = ActivityCycling.Activities[i].type;
				const name = ActivityCycling.Activities[i].activity.replace("USERS", `${client.guilds.cache.reduce((a, g) => a + g.memberCount, 0)}`);

				client.user.setActivity({ type, name });
				i++;
			}, ActivityCycling.Interval * 1000);
		}
	}

	async function checkEndedGiveaways() {
		const giveaways = (await client.prisma.giveaway.findMany()).filter((g) => g.endAt.getTime() <= Date.now() && !g.ended);

		for (const giveaway of giveaways) {
			const data = await client.giveaways.getGiveawayData(giveaway);
			if (!data) {
				await client.giveaways.deleteGiveaway(giveaway.id);
				return;
			}

			client.giveaways.emit("giveawayEnded", data.message, giveaway);
		}
	}
});
