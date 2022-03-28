import { GuildMember, Role } from "discord.js";
import { SlashCommand } from "../../lib/structures/SlashCommand";

export default new SlashCommand({
	name: "message",
	description: "Message all or certain users.",
	userPerms: ["ADMINISTRATOR"],
	options: [
		{
			name: "user",
			description: "Message a specific user.",
			type: "SUB_COMMAND",
			options: [
				{
					name: "user",
					description: "The user.",
					type: "USER",
					required: true,
				},
				{
					name: "content",
					description: "The content to send.",
					type: "STRING",
					required: true,
				},
				{
					name: "type",
					description: "Whether to send it in an embed or not.",
					type: "STRING",
					choices: [
						{
							name: "normal",
							value: "normal",
						},
						{
							name: "embed",
							value: "embed",
						},
					],
					required: true,
				},
			],
		},
		{
			name: "role",
			description: "Messages all users with the role.",
			type: "SUB_COMMAND",
			options: [
				{
					name: "role",
					description: "The role.",
					type: "ROLE",
					required: true,
				},
				{
					name: "content",
					description: "The content to send.",
					type: "STRING",
					required: true,
				},
				{
					name: "type",
					description: "Whether to send it in an embed or not.",
					type: "STRING",
					choices: [
						{
							name: "normal",
							value: "normal",
						},
						{
							name: "embed",
							value: "embed",
						},
					],
					required: true,
				},
			],
		},
		{
			name: "all",
			description: "Messages all members.",
			type: "SUB_COMMAND",
			options: [
				{
					name: "content",
					description: "The content to send.",
					type: "STRING",
					required: true,
				},
				{
					name: "type",
					description: "Whether to send it in an embed or not.",
					type: "STRING",
					choices: [
						{
							name: "normal",
							value: "normal",
						},
						{
							name: "embed",
							value: "embed",
						},
					],
					required: true,
				},
			],
		},
	],
	run: async ({ client, interaction, utils, lang }) => {
		const { Message } = lang.AdminModule.Commands;
		const content = interaction.options.getString("content");
		const type = interaction.options.getString("type");

		switch (interaction.options.getSubcommand()) {
			case "user": {
				const member = interaction.options.getMember("user") as GuildMember;

				const sent = await send(member, true);
				if (sent)
					await interaction.reply({
						embeds: [
							client.embed.globalSuccess({
								message: Message.Sent,
							}),
						],
						ephemeral: true,
					});

				break;
			}
			case "role": {
				const role = interaction.options.getRole("role") as Role;

				role.members.forEach(async (m) => {
					await send(m);
				});

				await interaction.reply({
					embeds: [
						client.embed.globalSuccess({
							message: Message.Sent,
						}),
					],
					ephemeral: true,
				});

				break;
			}
			case "all": {
				interaction.guild.members.cache.forEach(async (m) => {
					await send(m);
				});

				await interaction.reply({
					embeds: [
						client.embed.globalSuccess({
							message: Message.Sent,
						}),
					],
					ephemeral: true,
				});

				break;
			}
		}

		async function send(m: GuildMember, err?: boolean) {
			if (type == "normal") {
				await m.send(content).catch(() => {
					if (err)
						interaction.reply({
							embeds: [
								client.embed.globalErr({
									message: Message.CouldntSend,
								}),
							],
							ephemeral: true,
						});
					return false;
				});
			}
			if (type == "embed") {
				await m
					.send({
						embeds: [
							client.embed.create({
								Description: content,
								Color: client.config.EmbedColors.Default,
							}),
						],
					})
					.catch(() => {
						if (err)
							interaction.reply({
								embeds: [
									client.embed.globalErr({
										message: Message.CouldntSend,
									}),
								],
								ephemeral: true,
							});
						return false;
					});
			}
			return true;
		}
	},
});
