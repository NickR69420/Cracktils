import { Cracktils } from "../structures/Client";
import CommandHandler from "../handlers/CommandHandler";
import SlashHandler, { registerSlash } from "../handlers/SlashHandler";
import EventHandler from "../handlers/EventHandler";

export class ReloadModules {
	client: Cracktils;
	constructor(client: Cracktils) {
		this.client = client;
	}

	unregister(filePath: string) {
		try {
			delete require.cache[require.resolve(filePath)];
		} catch (err) {
			// catch error if any
		}
	}

	async Commands() {
		this.client.commands.forEach((cmd) => {
			this.unregister(cmd.filePath);
		});

		CommandHandler(this.client);
	}

	async Slash() {
		const mainGuild = await this.client.guilds.fetch(this.client.config.GuildId);
		await mainGuild.commands.set([]).catch(() => {});

		this.client.slashCommands.forEach((slash) => {
			this.unregister(slash.filePath);
		});

		SlashHandler(this.client);
		await registerSlash({
			client: this.client,
			GuildId: this.client.config.GuildId,
			reset: false,
			commands: this.client.slashCommands.map((s) => s),
		});
	}

	async Events() {
		this.client.removeAllListeners();

		EventHandler(this.client);
	}

	async all() {
		await Promise.all([await this.Events(), await this.Commands(), await this.Slash()]);

		return true;
	}
}
