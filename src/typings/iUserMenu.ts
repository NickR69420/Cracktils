import { ApplicationCommandDataResolvable, PermissionResolvable } from "discord.js";
import { Cracktils } from "../lib/structures/Client";
import { UInteraction } from "./Interactions";
import { lang } from "../config";
import Utils from "../lib/modules/Utils";

interface runOptions {
	client: Cracktils;
	menu: UInteraction;
	utils: Utils;
	lang: typeof lang;
}

type Run = (options: runOptions) => void;

export type iUserMenu = {
	userPerms: PermissionResolvable[];
	run: Run;
	directory?: string;
} & ApplicationCommandDataResolvable;
