import { Cracktils } from "../lib/structures/Client";
import { CInteraction } from "./Interactions";
import { ChatInputApplicationCommandData, PermissionResolvable } from "discord.js";
import Utils from "../lib/modules/Utils";
import { lang } from "../config/index";

interface runOptions {
	client: Cracktils;
	interaction: CInteraction;
	utils: Utils;
	lang: typeof lang;
}

type Run = (options: runOptions) => void;

export type iSlash = ChatInputApplicationCommandData & {
	userPerms: PermissionResolvable[];
	cooldown?: number;
	enabled?: boolean;
	managementOnly?: boolean;
	run: Run;
	directory?: string;
	filePath?: string;
};
