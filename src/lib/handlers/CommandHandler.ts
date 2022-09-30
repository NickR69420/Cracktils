import { Cracktils } from "../structures/Client";
import { iCommand } from "../../typings/iCommand";
import { promisify } from "util";
import glob from "glob";
const globP = promisify(glob);

export default async (client: Cracktils) => {
	const files = await globP(`${__dirname}/../../commands/*/*{.ts,.js}`);
	files.forEach(async (filePath) => {
		const command: iCommand = await client.utils.importFile(filePath);
		if (!command.name) return;

		const split = filePath.split("/");
		const directory = split[split.length - 2];
		const prop = {
			cooldown: client.config.Commands[command.name]?.cooldown || 0,
			//enabled: (await client.db.getCommand(command.name)).enabled || (await client.db.getModuleStatus(directory)),
			enabled: true,
			directory,
			filePath,
			...command,
		};

		if (command.aliases) {
			command.aliases.forEach((a) => client.aliases.set(a, command.name));
		}

		client.commands.set(command.name, prop);
	});
};
