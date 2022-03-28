import { Collection, GuildMember } from "discord.js";
import { Cracktils } from "../structures/Client";

export class OneWord {
	client: Cracktils;
	channelId: string;
	last = new Collection<string, string>();
	constructor(client: Cracktils, channel: string) {
		this.client = client;
		this.channelId = channel;

		this.start();
	}

	private isLast(mem: GuildMember) {
		const lastPerson = this.last.get("last");

		if (this.client.utils.hasRole(mem, this.client.config.Roles.Staff)) return false;
		if (mem.id === lastPerson) return true;
		return false;
	}

	private start() {
		this.client.on("messageCreate", async (msg) => {
			if (msg.channel.id === this.channelId) {
				if (this.isLast(msg.member)) {
					await msg.delete().catch(() => {});
					return;
				}

				this.last.set("last", msg.author.id);
			}
		});
	}
}
