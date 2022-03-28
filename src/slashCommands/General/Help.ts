import { MessageActionRow, MessageSelectMenu, SelectMenuInteraction, EmbedFieldData } from "discord.js";
import { SlashCommand } from "../../lib/structures/SlashCommand";

export default new SlashCommand({
	name: "help",
	description: "View the list of commands or get help on a specific command.",
	userPerms: ["SEND_MESSAGES"],
	options: [
		{
			name: "command",
			description: "The command to get help on.",
			type: "STRING",
			required: false,
		},
	],
	run: async ({ client, interaction, utils, lang }) => {
		const { Help } = lang.GeneralModule.Commands;
		const cmd = interaction.options.getString("command");

		if (cmd) {
			const command = client.slashCommands.get(cmd.toLowerCase());

			if (!command) return await helpMenu();

			interaction.reply({
				embeds: [
					client.embed.create({
						Title: capitalize(command.name) + " Command",
						Fields: [
							{
								name: "Category",
								value: capitalize(command.directory),
							},
							{ name: "Description", value: command.description },
							{
								name: "Permissions Needed",
								value: formatPerm(`${command.userPerms}`),
							},
						],
					}),
				],
				ephemeral: true,
			});
		} else {
			await helpMenu();
		}

		async function helpMenu() {
			const directories = [...new Set(client.slashCommands.map((c) => c.directory))];

			const enabledModules = (await client.db.getModules()).filter((m) => m.enabled).map((m) => m.name);
			const categories = directories
				.filter((d) => enabledModules.includes(d))
				.map((dir) => {
					const commands = client.slashCommands
						.filter((cmd) => cmd.directory == dir && cmd.enabled)
						.map((c) => {
							return {
								name: c.name,
								desc: c.description,
								op: c.options ? c.options : [],
							};
						});

					return {
						directory: dir,
						commands: commands,
					};
				});

			const emojis = {
				General: Help.Emojis[1],
				Fun: Help.Emojis[2],
				Management: Help.Emojis[3],
				Admin: Help.Emojis[4],
				Giveaways: Help.Emojis[6],
			};

			function menu(state: boolean) {
				return [
					new MessageActionRow().addComponents(
						new MessageSelectMenu()
							.setCustomId("help-menu")
							.setPlaceholder(Help.Menu)
							.setDisabled(state)
							.addOptions(
								categories.map((c) => {
									return {
										label: c.directory,
										value: c.directory,
										emoji: emojis[c.directory],
									};
								})
							)
					),
				];
			}

			await interaction.reply({
				embeds: [
					client.embed.create({
						Author: {
							name: utils.replaceText(Help.Author, "BOT", client.user.username),
							iconURL: client.user.displayAvatarURL(),
						},
						Description: Help.Description,
						Footer: {
							text: utils.replaceText(Help.Footer, "PREFIX", "/"),
						},
					}),
				],
				components: menu(false),
				ephemeral: true,
			});

			const filter = (i: SelectMenuInteraction) => i.user.id === interaction.user.id;

			const collector = interaction.channel.createMessageComponentCollector({
				componentType: "SELECT_MENU",
				time: 60000,
				filter,
			});

			collector.on("collect", async (i) => {
				const [directory] = i.values;
				const category = categories.find((c) => c.directory == directory);

				const list: EmbedFieldData[] = category.commands.map((c) => {
					return {
						name: c.name,
						value:
							c.op.length > 0 && c.op[0].type == "SUB_COMMAND"
								? `${Help.Emojis[0]}${c.desc}\n${c.op.map((o) => `${Help.Emojis[5]}\`${o.name}\` ${o.description}`).join("\n")}`
								: Help.Emojis[0] + c.desc,
					};
				});

				await i.update({
					embeds: [
						client.embed.create({
							Title: utils.replaceText(Help.pageTitle, "DIR", directory),
							Fields: list,
							Footer: {
								text: utils.replaceText(Help.Footer, "PREFIX", "/"),
							},
						}),
					],
				});
			});

			collector.on("end", () => {
				interaction.editReply({ components: menu(true) });
			});
		}
	},
});

function capitalize(str: string) {
	return str.charAt(0).toUpperCase() + str.substring(1).toLowerCase();
}

function formatPerm(permission: string): string {
	permission = permission.replace(/\_/g, " ");
	const split = permission.trim().split(" ");
	const splitFixed = [];
	split.forEach((e) => {
		e = e.charAt(0).toUpperCase() + e.slice(1).toLocaleLowerCase();
		splitFixed.push(e);
	});
	return splitFixed.join(" ");
}
