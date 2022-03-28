import { GuildMember, Role } from "discord.js";
import { Command } from "../../lib/structures/Command";

export default new Command({
	name: "giverole",
	description: "Give all or a certain user a role.",
	usage: "giverole <role> <user|everyone> ",
	minArgs: 2,
	aliases: ["addrole", "role", "rank"],
	userPerms: ["ADMINISTRATOR"],
	run: async ({ client, message, args, utils, lang }) => {
		const { Giverole } = lang.AdminModule.Commands;
		const role = args.get("role", 0) as Role;
		const everyone = ["all", "everyone", "@everyone"].some((t) => (args.pick(1) as string) == t);
		const member = args.get("member", 1) as GuildMember;

		if (!role || (!everyone && !member))
			return utils.iReply(message, {
				embeds: [await utils.Usage("giverole", message.guild)],
			});

		if (role.position > message.member.roles.highest.position)
			return utils.iReply(message, {
				embeds: [client.embed.globalErr({ message: Giverole.HigherRole[0] })],
			});

		if (role.position > message.guild.me.roles.highest.position)
			return utils.iReply(message, {
				embeds: [
					client.embed.globalErr({
						message: Giverole.HigherRole[0],
					}),
				],
			});

		if (everyone) {
			message.guild.members.cache
				.filter((m) => !m.user.bot)
				.forEach(async (m) => {
					await m.roles.add(role, `Added by: ${message.author.tag}`).catch(() => {});
				});
		} else {
			if (member.user.bot) {
				return utils.iReply(message, {
					embeds: [
						client.embed.globalErr({
							message: Giverole.isBot,
						}),
					],
				});
			}

			await member.roles.add(role, `Added by: ${message.author.tag}`).catch(() => {});
		}

		utils.iReply(message, {
			embeds: [
				client.embed.globalSuccess({
					title: Giverole.RoleAdded.Title,
					message: utils
						.replaceText(Giverole.RoleAdded.Description, "ROLE", `<@&${role.id}>`)
						.replace("TARGET", everyone ? "everyone" : `<@${member.id}>`),
					timestamp: true,
				}),
			],
		});
	},
});
