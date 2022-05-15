import { Cracktils } from "../structures/Client";
import { iSlash } from "../../typings/iSlash";
import { promisify } from "util";
import glob from "glob";
import { ApplicationCommandDataResolvable, GuildApplicationCommandPermissionData } from "discord.js";
const globP = promisify(glob);

export default async (client: Cracktils) => {
	const slashCommands: ApplicationCommandDataResolvable[] = [];

	const files = await globP(`${__dirname}/../../slashCommands/*/*{.ts,.js}`);
	files.forEach(async (filePath) => {
		const slash: iSlash = await client.utils.importFile(filePath);
		if (!slash.name || !slash.description) return;

		//const cmd = await client.db.getCommand(slash.name);

		const split = filePath.split("/");
		const directory = split[split.length - 2];

		const prop = {
			cooldown: client.config.Commands[slash.name]?.cooldown || 0,
			//enabled: cmd.enabled,
			defaultPermission: false,
			directory,
			...slash,
		};

		slashCommands.push(prop);
		client.slashCommands.set(slash.name, prop);
	});

	const menus = await globP(`${__dirname}/../../contextMenus/*/*{.ts,.js}`);
	menus.forEach(async (filePath) => {
		const menu = await client.utils.importFile(filePath);
		if (!menu.type) return;

		const split = filePath.split("/");
		const directory = split[split.length - 2];
		const prop = {
			directory,
			filePath,
			...menu,
		};

		slashCommands.push(menu);
		client.contextMenus.set(menu.name, prop);
	});

	client.on("ready", async () => {
		setTimeout(() => {
			registerSlash({
				client,
				GuildId: client.config.GuildId,
				commands: slashCommands,
				reset: false,
			});
		}, 5000);
	});
};

export async function registerSlash({ client, GuildId, reset, commands }: iRegister) {
	const mainGuild = await client.guilds.fetch(GuildId);

	if (reset) {
		await mainGuild?.commands.set([]);
		client.logger.log(client.color.cyan(`[Bot] Successfully reset (/) commands.`));
		return;
	}

	if (commands) {
		await mainGuild.commands.set(commands).then(async (cmd) => {
			const getRoles = (cmdName: string) => {
				const perms = client.slashCommands.find((c) => c.name === cmdName)?.userPerms;

				if (!perms) return null;

				return mainGuild.roles.cache.filter((r) => r.permissions.has(perms) && !r.managed && client.config.Roles.allRoles.includes(r.id));
			};

			const fullPermissions: GuildApplicationCommandPermissionData[] = cmd.reduce((acc: any, v) => {
				const roles = getRoles(v.name);
				if (!roles) return acc;

				const permissions = roles.reduce((a: any, r) => {
					return [
						...a,
						{
							id: r.id,
							type: "ROLE",
							permission: true,
						},
					];
				}, []);

				return [
					...acc,
					{
						id: v.id,
						permissions,
					},
				];
			}, []);

			await mainGuild.commands.permissions.set({ fullPermissions });
		});
		client.logger.log(client.color.cyan(`[Bot] Registered (/) commands to ${mainGuild.name}.`));
	}
}

export interface iRegister {
	client: Cracktils;
	GuildId: string;
	reset?: boolean;
	commands?: ApplicationCommandDataResolvable[];
}
