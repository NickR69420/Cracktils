import { Command } from "../../lib/structures/Command";

export default new Command({
	name: "membercount",
	description: "View the server's member count.",
	usage: "membercount",
	aliases: ["members"],
	userPerms: ["SEND_MESSAGES"],
	run: async ({ client, message, utils, lang }) => {
		const { MemberCount } = lang.GeneralModule.Commands;
		const count = (await message.guild.members.fetch()).size.toString();

		utils.iReply(message, {
			embeds: [client.embed.create({ Title: MemberCount.Title, Description: count })],
		});
	},
});
