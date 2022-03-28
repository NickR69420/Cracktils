import { GuildMember, Role } from "discord.js";
import { Command } from "../../lib/structures/Command";

export default new Command({
	name: "takerole",
	description: "Take a role from all or a certain user.",
	usage: "takerole <role> <user|everyone>",
	minArgs: 2,
	aliases: ["removerole", "demote"],
	userPerms: ["ADMINISTRATOR"],
	run: async ({ client, message, args, utils, lang }) => {
		const { Takerole } = lang.AdminModule.Commands;
		const role = args.get("role", 0) as Role;
		const member = args.get("member", 1) as GuildMember;
		const everyone = ["all", "everyone", "@everyone"].some((t) => (args.pick(1) as string) == t);

		if (!role || (!everyone && !member))
			return utils.iReply(message, {
				embeds: [await utils.Usage("takerole", message.guild)],
			});

		if (role.position > message.member.roles.highest.position)
			return utils.iReply(message, {
				embeds: [client.embed.globalErr({ message: Takerole.HigherRole[0] })],
			});

		if (role.position > message.guild.me.roles.highest.position)
			return utils.iReply(message, {
				embeds: [client.embed.globalErr({ message: Takerole.HigherRole[1] })],
			});

		if (everyone) {
			message.guild.members.cache.forEach(async (m) => {
				await m.roles.remove(role, `Removed by: ${message.author.tag}`).catch(() => {});
			});
		} else {
			await member.roles.remove(role);
		}

		utils.iReply(message, {
			embeds: [
				client.embed.globalSuccess({
					title: Takerole.RoleRemoved.Title,
					message: utils.replaceText(Takerole.RoleRemoved.Description, "ROLE", `${role}`).replace("TARGET", `${member}` || "everyone"),
				}),
			],
		});
	},
});
