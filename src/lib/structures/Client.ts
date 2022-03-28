import { Awaitable, Client, ClientOptions, Collection } from "discord.js";
import { config, lang } from "../../config/index";
import { iCommand } from "../../typings/iCommand";
import { iSlash } from "../../typings/iSlash";
import { PrismaClient } from "@prisma/client";
import Utils from "../modules/Utils";
import Embeds from "../modules/Embeds";
import consola from "consola";
import chalk from "chalk";

import CommandHandler from "../handlers/CommandHandler";
import EventHandler from "../handlers/EventHandler";
import Db from "../modules/DbUtils";
import SlashHandler from "../handlers/SlashHandler";
import { iUserMenu } from "../../typings/iUserMenu";
import { iMessageMenu } from "../../typings/iMessageMenu";
import GiveawayHandler from "../handlers/GiveawayHandler";
import { GiveawaysManager } from "../modules/GiveawaysManager";

export class Cracktils extends Client {
	public commands: Collection<string, iCommand> = new Collection();
	public aliases: Collection<string, string> = new Collection();
	public slashCommands: Collection<string, iSlash> = new Collection();
	public contextMenus: Collection<string, iUserMenu | iMessageMenu> = new Collection();
	public config = config;
	public lang = lang;
	public utils = new Utils();
	public embed = new Embeds();
	public prisma = new PrismaClient();
	public db = new Db();
	public giveaways = new GiveawaysManager(this);
	public logger = consola;
	public color = chalk;
	constructor(options: ClientOptions) {
		super(options);
	}

	init() {
		this.loadHandlers();
		this.login(this.config.Dev ? this.config.devToken : this.config.Token);
	}

	loadHandlers() {
		EventHandler(this);
		CommandHandler(this);
		SlashHandler(this);
		GiveawayHandler(this);
	}
}
