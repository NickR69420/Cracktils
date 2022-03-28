import { CommandInteraction, GuildMember, Message, MessageContextMenuInteraction, UserContextMenuInteraction } from "discord.js";

export interface CInteraction extends CommandInteraction {
	member: GuildMember;
}

export interface UInteraction extends UserContextMenuInteraction {
	member: GuildMember;
	targetMember: GuildMember;
}

export interface MInteraction extends MessageContextMenuInteraction {
	member: GuildMember;
	targetMessage: Message;
}
