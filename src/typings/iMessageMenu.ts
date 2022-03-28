import { ApplicationCommandDataResolvable, PermissionResolvable } from "discord.js";
import { Cracktils } from "../lib/structures/Client";
import { MInteraction } from "./Interactions";
import { lang } from "../config";
import Utils from "../lib/modules/Utils";

interface runOptions {
	client: Cracktils;
	menu: MInteraction;
	utils: Utils;
	lang: typeof lang;
}

type Run = (options: runOptions) => void;

export type iMessageMenu = {
	userPerms: PermissionResolvable[];
	run: Run;
	directory?: string;
} & ApplicationCommandDataResolvable;
