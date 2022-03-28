import { SlashCommand } from "../../lib/structures/SlashCommand";
import { version } from "discord.js";

export default new SlashCommand({
	name: "botinfo",
	description: "View info about Cracktils.",
	userPerms: ["SEND_MESSAGES"],
	run: async ({ client, interaction, lang }) => {
		const OS = {
			win32: "<:windows:935940078558126141> Windows",
			darwin: "<:macos:935940191770783784> MacOS",
			linux: "<:linux:935940414945521775> Linux",
		};

		const totalMemory = (process.memoryUsage().heapTotal / 1024 / 1024).toFixed(0);
		const usedMemory = (process.memoryUsage().heapUsed / 1024 / 1024).toFixed(0);

		interaction.reply({
			embeds: [
				client.embed.create({
					Author: { name: client.user.username, iconURL: client.user.displayAvatarURL() },
					Fields: [
						{
							name: "Developer",
							value: "Nickk#7480",
							inline: true,
						},
						{
							name: "Discord.js",
							value: `<:discordjs:935910943148363847> v${version}`,
							inline: true,
						},
						{
							name: "Node.js",
							value: `<:nodejs:935911888137646080> ${process.version}`,
							inline: true,
						},
						{
							name: "Operating System",
							value: OS[process.platform],
							inline: true,
						},
						{
							name: "Memory Usage",
							value: `:gear: **${usedMemory}**/**${totalMemory}mb**`,
							inline: true,
						},
					],
				}),
			],
		});
	},
});
