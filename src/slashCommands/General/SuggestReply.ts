import { Message } from "discord.js";
import { SlashCommand } from "../../lib/structures/SlashCommand";

export default new SlashCommand({
	name: "suggestreply",
	description: "Reply to a suggestion.",
	userPerms: ["BAN_MEMBERS"],
	options: [
		{
			name: "id",
			description: "The ID of the suggestion to reply to.",
			type: "STRING",
			required: true,
		},
		{
			name: "status",
			description: "The status to set.",
			type: "STRING",
			required: true,
			choices: [
				{
					name: "accepted",
					value: "accepted",
				},
				{
					name: "denied",
					value: "denied",
				},
				{
					name: "implemented",
					value: "implemented",
				},
			],
		},
		{
			name: "reply",
			description: "Your reply",
			type: "STRING",
			required: false,
		},
	],
	run: async ({ client, interaction, utils, lang }) => {
		const { SuggestReply } = lang.AdminModule.Commands;
		const { Channels, Suggestions } = client.config;
		const id = interaction.options.getString("id");
		const status = interaction.options.getString("status");
		const reply = interaction.options.getString("reply") || null;
		const channel = utils.findChannel(Channels.Suggestions, interaction.guild);

		if (!utils.hasRole(interaction.member, client.config.Roles.JrAdmin, true, interaction.guild))
			return interaction.reply({ content: SuggestReply.Reply.NotAllowed, ephemeral: true });

		if (!channel || !Suggestions.Enabled) return interaction.reply({ embeds: [client.embed.globalErr({ message: SuggestReply.NotSetup })] });

		const msg = (await channel.messages.fetch(id).catch(() => {
			interaction.reply({ embeds: [client.embed.globalErr({ message: SuggestReply.InvalidID })], ephemeral: true });
			return;
		})) as Message;

		if (!msg.editable) return interaction.reply({ embeds: [client.embed.globalErr({ message: SuggestReply.InvalidID })], ephemeral: true });

		const allowedStatuses = ["accepted", "denied", "implemented"];
		if (!allowedStatuses.includes(status))
			return interaction.reply({
				embeds: [
					client.embed.globalErr({
						message: utils.replaceText(SuggestReply.InvalidStatus, "STATUSES", allowedStatuses.map((a) => `\`${a}\``).join(", ")),
					}),
				],
				ephemeral: true,
			});

		const embed = msg.embeds[0];

		if (embed.hexColor !== client.config.EmbedColors.noColor)
			return interaction.reply({ embeds: [client.embed.globalErr({ message: SuggestReply.AlreadyReplied })] });

		const description = utils
			.replaceText(SuggestReply.Reply.Description, "CONTENT", embed.description)
			.replace("ACTION", capitalize(status))
			.replace("USER", interaction.user.tag)
			.replace("REPLY", `> ${reply ? reply : SuggestReply.Reply.Replies[status]}`);
		const footer = utils.replaceText(embed.footer.text, "Pending", capitalize(status));

		await msg.edit({
			embeds: [embed.setDescription(description).setFooter({ text: footer }).setColor(Suggestions.Colors[status])],
			components: [],
		});

		interaction.reply({ embeds: [client.embed.globalSuccess({ message: SuggestReply.Replied })], ephemeral: true });
	},
});

function capitalize(str: string) {
	return str.charAt(0).toUpperCase() + str.substring(1).toLowerCase();
}
