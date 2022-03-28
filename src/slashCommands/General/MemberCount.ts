import { SlashCommand } from "../../lib/structures/SlashCommand";

export default new SlashCommand({
	name: "membercount",
	description: "View the server's member count.",
	userPerms: ["SEND_MESSAGES"],
	run: async ({ client, interaction, lang }) => {
		const { MemberCount } = lang.GeneralModule.Commands;
		const count = (await interaction.guild.members.fetch()).size.toString();

		interaction.reply({
			embeds: [client.embed.create({ Title: MemberCount.Title, Description: count })],
		});
	},
});
