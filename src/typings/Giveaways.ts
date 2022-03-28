import { GuildMember, Message } from "discord.js";
import { Giveaway } from "@prisma/client";

export interface GiveawayEvents {
	giveawayJoined: [member: GuildMember, message: Message, giveaway: Giveaway];
	giveawayLeft: [member: GuildMember, message: Message, giveaway: Giveaway];
	giveawayEnded: [message: Message, giveaway: Giveaway];
}
