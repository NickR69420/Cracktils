import { PrismaClient } from "@prisma/client";
import chalk from "chalk";
import consola from "consola";
import { Client, ClientOptions, Collection } from "discord.js";
import { config, lang } from "../../config/index";
import { iCommand } from "../../typings/iCommand";
import { iSlash } from "../../typings/iSlash";
import Embeds from "../modules/Embeds";
import Utils from "../modules/Utils";

import { DataSource } from "typeorm";
import { LitebansBans } from "../../entity/LitebansBans";
import { LitebansHistory } from "../../entity/LitebansHistory";
import { LitebansKicks } from "../../entity/LitebansKicks";
import { LitebansMutes } from "../../entity/LitebansMutes";
import { LitebansServers } from "../../entity/LitebansServers";
import { LitebansWarnings } from "../../entity/LitebansWarnings";
import { PunishmentProof } from "../../entity/PunishmentProof";
import { iMessageMenu } from "../../typings/iMessageMenu";
import { iUserMenu } from "../../typings/iUserMenu";
import CommandHandler from "../handlers/CommandHandler";
import EventHandler from "../handlers/EventHandler";
import GiveawayHandler from "../handlers/GiveawayHandler";
import SlashHandler from "../handlers/SlashHandler";
import Db from "../modules/DbUtils";
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
	public litebansDb = new DataSource({
		type: "mysql",
		host: config.litebans.host,
		port: config.litebans.port,
		username: config.litebans.user,
		password: config.litebans.password,
		database: config.litebans.database,
		synchronize: true,
		logging: true,
		entities: [LitebansBans, LitebansHistory, LitebansKicks, LitebansMutes, LitebansServers, LitebansWarnings, PunishmentProof],
	});
	public logger = consola;
	public color = chalk;
	constructor(options: ClientOptions) {
		super(options);
		this.litebansDb.initialize().then(() => {
			console.log("Connected to Litebans database");
		});
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
