import { Command } from "../../lib/structures/Command";

export default new Command({
	name: "gdelete",
	description: "Delete an ongoing giveaway.",
	usage: "gdelete <id>",
	minArgs: 1,
	aliases: ["gremove", "deletegiveaway", "giveawaydelete"],
	userPerms: ["MANAGE_MESSAGES"],
	run: async ({ client, message, args, utils, lang }) => {
		const { Gdelete } = lang.GiveawaySystem.Commands;

		if (!utils.hasRole(message.member, client.config.Roles.JrAdmin, true, message.guild))
			return utils.iReply(message, {
				embeds: [client.embed.globalErr({ title: lang.GlobalErrors.NoPerms.Title, message: lang.GlobalErrors.NoPerms.Description })],
			});

		const id = args.pick(0) as string;

		client.giveaways
			.deleteGiveaway(id)
			.then(() => {
				return utils.iReply(message, {
					embeds: [client.embed.globalSuccess({ message: Gdelete.Deleted })],
				});
			})
			.catch(() => {
				return utils.iReply(message, {
					embeds: [client.embed.globalErr({ message: Gdelete.InvalidGiveaway })],
				});
			});
	},
});
