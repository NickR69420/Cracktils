import { Message, PermissionResolvable } from "discord.js";
import Args from "../lib/modules/Args";
import Utils from "../lib/modules/Utils";
import { Cracktils } from "../lib/structures/Client";
import { lang } from "../config/index";

interface runOptions {
	client: Cracktils;
	message: Message;
	args: Args;
	utils: Utils;
	lang: typeof lang;
}

type Run = (options: runOptions) => void;

export type iCommand = {
	name: string;
	description: string;
	usage: string;
	aliases?: string[];
	minArgs?: number;
	userPerms: PermissionResolvable[];
	cooldown?: number;
	enabled?: boolean;
	managementOnly?: boolean;
	run: Run;
	directory?: string;
	filePath?: string;
};
