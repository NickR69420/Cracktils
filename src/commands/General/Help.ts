import { EmbedFieldData, MessageActionRow, MessageSelectMenu, SelectMenuInteraction } from "discord.js";
import { Command } from "../../lib/structures/Command";

export default new Command({
	name: "help",
	description: "View the list of commands or get help on a specific command.",
	usage: "help [command]",
	userPerms: ["SEND_MESSAGES"],
	run: async ({ client, message, args, utils, lang }) => {
		const { Help } = lang.GeneralModule.Commands;
		const cmd = args.pick(0) as string;

		if (cmd) {
			const command = client.commands.get(cmd.toLowerCase()) || client.commands.get(client.aliases.get(cmd));

			if (!command) return await helpMenu();

			utils.iReply(message, {
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
								name: "Usage",
								value: (await client.db.getPrefix(message.guild.id)) + command.usage,
							},
							{
								name: "Aliases",
								value: command.aliases.map((a) => a).join(", ").length < 1 ? "None" : command.aliases.map((a) => a).join(", "),
							},
							{
								name: "Permissions Needed",
								value: formatPerm(`${command.userPerms}`),
							},
						],
						Footer: { text: Help.Syntax },
					}),
				],
			});
		} else {
			await helpMenu();
		}

		async function helpMenu() {
			const directories = [...new Set(client.commands.map((c) => c.directory))];

			const enabledModules = (await client.db.getModules()).filter((m) => m.enabled).map((m) => m.name);
			const categories = directories
				.filter((d) => enabledModules.includes(d))
				.map((dir) => {
					const commands = client.commands
						.filter((cmd) => cmd.directory == dir && cmd.enabled)
						.map((c) => {
							return {
								name: c.name,
								desc: c.description,
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

			const m = await utils.iReply(message, {
				embeds: [
					client.embed.create({
						Author: {
							name: utils.replaceText(Help.Author, "BOT", client.user.username),
							iconURL: client.user.displayAvatarURL(),
						},
						Description: Help.Description,
						Footer: {
							text: utils.replaceText(Help.Footer, "PREFIX", await client.db.getPrefix(message.guild.id)),
						},
					}),
				],
				components: menu(false),
			});

			const filter = (i: SelectMenuInteraction) => i.user.id === message.author.id;

			const collector = message.channel.createMessageComponentCollector({
				componentType: "SELECT_MENU",
				time: 60000,
				idle: 15000,
				filter,
			});

			collector.on("collect", async (i) => {
				const [directory] = i.values;
				const category = categories.find((c) => c.directory == directory);

				const list: EmbedFieldData[] = category.commands.map((c) => {
					return {
						name: c.name,
						value: Help.Emojis[0] + c.desc,
					};
				});

				await i.update({
					embeds: [
						client.embed.create({
							Title: utils.replaceText(Help.pageTitle, "DIR", directory),
							Fields: list,
							Footer: {
								text: utils.replaceText(Help.Footer, "PREFIX", await client.db.getPrefix(message.guild.id)),
							},
						}),
					],
				});
			});

			collector.on("end", () => {
				m.edit({ components: menu(true) });
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
