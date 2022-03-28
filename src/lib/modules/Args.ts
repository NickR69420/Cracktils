import { Message, TextBasedChannel } from "discord.js";
import { client } from "../../index";

export default class Args {
	msg: Message;
	args: string[];
	constructor(msg: Message, args: string[]) {
		this.msg = msg;
		this.args = args;
	}

	public get size() {
		return this.args.length;
	}

	public pick(index: number, Int?: boolean) {
		if (Int) {
			return parseInt(this.args[index]);
		}
		return this.args[index];
	}

	public rest(index: number) {
		return this.args.slice(index).join(" ");
	}

	public get(options: getOptions, index?: number) {
		const message = this.msg;
		const arg = this.args[index ? index : 0];
		if (options === "member") {
			return message.mentions.members.first() || client.utils.findMember(arg, message.guild);
		}
		if (options === "role") {
			return message.mentions.roles.first() || client.utils.findRole(arg, message.guild);
		}
		if (options === "user") {
			const user = message.mentions.users.first() || client.users.cache.find((u) => u.username === arg || u.id === arg);
			if (!user) return false;
			return user;
		}
		if (options === "channel") {
			const channel = message.mentions.channels.first() || client.utils.findChannel(arg, message.guild);
			if (!channel) return false;
			return channel as TextBasedChannel;
		}
	}
}

type getOptions = "member" | "role" | "user" | "channel";
