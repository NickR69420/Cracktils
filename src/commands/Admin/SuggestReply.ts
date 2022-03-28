import { Message } from "discord.js";
import { Command } from "../../lib/structures/Command";

export default new Command({
	name: "suggestreply",
	description: "Reply to a suggestion.",
	usage: "suggestreply <id> <accepted|denied|implemented> [reply]",
	minArgs: 2,
	aliases: ["suggestionreply", "replysuggest", "replysuggestion", "sreply"],
	userPerms: ["MANAGE_ROLES"],
	run: async ({ client, message, args, utils, lang }) => {
		const { SuggestReply } = lang.AdminModule.Commands;
		const { Channels, Suggestions } = client.config;
		const id = args.pick(0) as string;
		const status = args.pick(1) as string;
		const reply = args.rest(2) || null;
		const channel = utils.findChannel(Channels.Suggestions, message.guild);

		if (!utils.hasRole(message.member, client.config.Roles.JrAdmin, true, message.guild))
			return utils.iReply(message, { content: SuggestReply.Reply.NotAllowed });

		if (!channel || !Suggestions.Enabled) return utils.iReply(message, { embeds: [client.embed.globalErr({ message: SuggestReply.NotSetup })] });

		const msg = (await channel.messages.fetch(id).catch(() => {
			utils.iReply(message, { embeds: [client.embed.globalErr({ message: SuggestReply.InvalidID })] });
			return;
		})) as Message;

		if (!msg.editable) return utils.iReply(message, { embeds: [client.embed.globalErr({ message: SuggestReply.InvalidID })] });

		const allowedStatuses = ["accepted", "denied", "implemented"];
		if (!allowedStatuses.includes(status))
			return utils.iReply(message, {
				embeds: [
					client.embed.globalErr({
						message: utils.replaceText(SuggestReply.InvalidStatus, "STATUSES", allowedStatuses.map((a) => `\`${a}\``).join(", ")),
					}),
				],
			});

		const embed = msg.embeds[0];

		if (embed.hexColor !== client.config.EmbedColors.noColor)
			return utils.iReply(message, { embeds: [client.embed.globalErr({ message: SuggestReply.AlreadyReplied })] });

		const description = utils
			.replaceText(SuggestReply.Reply.Description, "CONTENT", embed.description)
			.replace("ACTION", capitalize(status))
			.replace("USER", message.author.tag)
			.replace("REPLY", `> ${reply ? reply : SuggestReply.Reply.Replies[status]}`);
		const footer = utils.replaceText(embed.footer.text, "Pending", capitalize(status));

		msg.edit({ embeds: [embed.setDescription(description).setFooter({ text: footer }).setColor(Suggestions.Colors[status])], components: [] });

		utils.iReply(message, { embeds: [client.embed.globalSuccess({ message: SuggestReply.Replied })] });
	},
});

function capitalize(str: string) {
	return str.charAt(0).toUpperCase() + str.substring(1).toLowerCase();
}
