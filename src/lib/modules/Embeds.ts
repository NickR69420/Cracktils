import { ColorResolvable, EmbedAuthorData, EmbedFieldData, EmbedFooterData, MessageEmbed } from "discord.js";
import { client } from "../../index";

export default class Embeds {
	public create({ Author, Color, Description, Fields, Footer, Image, Thumbnail, Timestamp, Title, URL }: embedOptions) {
		const Embed = new MessageEmbed();

		if (Author) Embed.setAuthor(Author);
		if (Title) Embed.setTitle(Title);
		if (Color) Embed.setColor(Color || "RANDOM");
		else Embed.setColor(client.config.EmbedColors.Default);
		if (Footer) Embed.setFooter(Footer);
		if (Description) Embed.setDescription(Description);
		if (Fields) Embed.setFields(Fields);
		if (Thumbnail) Embed.setThumbnail(Thumbnail);
		if (Image) Embed.setImage(Image);
		if (URL) Embed.setURL(URL);
		if (Timestamp === true) Embed.setTimestamp();
		if (Timestamp && Timestamp !== true && new Date(Timestamp)) Embed.setTimestamp(new Date(Timestamp));

		return Embed;
	}

	public globalErr({ message, title, timestamp }: presetOne) {
		const Embed = new MessageEmbed().setDescription(message).setColor(client.config.EmbedColors.Error);
		if (title) Embed.setTitle(title);
		if (timestamp) Embed.setTimestamp();

		return Embed;
	}

	public globalSuccess({ message, title, timestamp }: presetOne) {
		const Embed = new MessageEmbed().setDescription(message).setColor(client.config.EmbedColors.Success);
		if (title) Embed.setTitle(title);
		if (timestamp) Embed.setTimestamp();

		return Embed;
	}
}

export interface embedOptions {
	Author?: EmbedAuthorData;
	Color?: ColorResolvable;
	Description?: string;
	Fields?: EmbedFieldData[];
	Footer?: EmbedFooterData;
	Image?: string;
	Thumbnail?: string;
	Timestamp?: Date | number | boolean;
	Title?: string;
	URL?: string;
}

export interface presetOne {
	title?: string;
	message: string;
	timestamp?: boolean;
}
