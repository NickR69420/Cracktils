import { Command } from "../../lib/structures/Command";

export default new Command({
	name: "gend",
	description: "Force a giveaway to end.",
	usage: "gend <id>",
	aliases: ["gstop", "giveawayend", "giveawaystop"],
	userPerms: ["MANAGE_MESSAGES"],
	run: async ({ client, message, args, utils, lang }) => {
		const { Gend } = lang.GiveawaySystem.Commands;

		if (!utils.hasRole(message.member, client.config.Roles.JrAdmin, true, message.guild))
			return utils.iReply(message, {
				embeds: [client.embed.globalErr({ title: lang.GlobalErrors.NoPerms.Title, message: lang.GlobalErrors.NoPerms.Description })],
			});

		const id = args.pick(0) as string;
		const giveaway = await client.giveaways.getGiveaway(id);
		if (!giveaway) return utils.iReply(message, { embeds: [client.embed.globalErr({ message: Gend.InvalidGiveaway })] });
		if (giveaway.ended) return utils.iReply(message, { embeds: [client.embed.globalErr({ message: Gend.AlreadyEnded })] });

		const ended = await client.giveaways.end(giveaway);
		if (!ended) return utils.iReply(message, { embeds: [client.embed.globalErr({ message: Gend.InvalidGiveaway })] });

		message.delete();
	},
});
