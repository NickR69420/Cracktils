import { Cracktils } from "../structures/Client";
import { promisify } from "util";
import glob from "glob";
import { Event } from "../structures/Event";
import { ClientEvents } from "discord.js";
const globP = promisify(glob);

export default async (client: Cracktils) => {
	const { logger, color } = client;

	const files = await globP(`${__dirname}/../../events/*{.ts,.js}`);
	files.forEach(async (filePath) => {
		const event: Event<keyof ClientEvents> = await client.utils.importFile(filePath);

		client.on(event.event, event.run);
	});

	logger.log(color.yellow(`[Handler] Loaded ${files.length} events.`));
};
