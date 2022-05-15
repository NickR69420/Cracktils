if (+process.version.slice(1).split("v")[0] < 16.6) {
	console.log(new Error("This bot needs Node JS version 16.6 or higher"));
	process.exit(1);
}

import { Cracktils } from "./lib/structures/Client";
import "reflect-metadata";

export const client = new Cracktils({
	intents: 32767,
});

client.init();

process.on("unhandledRejection", (r, p) => {
	client.logger.error(r);
});

process.on("uncaughtException", (err, org) => {
	client.logger.error(err, org);
});
