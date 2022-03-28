import { ColorResolvable, HexColorString, Permissions, TextChannel } from "discord.js";
import { Command } from "../../lib/structures/Command";

export default new Command({
	name: "createrole",
	description: "Creates a role.",
	usage: "createrole",
	aliases: ["rolecreate", "crole"],
	userPerms: ["ADMINISTRATOR"],
	run: async ({ client, message, lang, utils }) => {
		const { Createrole } = lang.AdminModule.Commands;

		let name: string;
		let color: ColorResolvable;
		let permissions: number;

		const msg = await message.channel.send({
			embeds: [
				client.embed.create({
					Title: utils.replaceText(Createrole.RoleSetup.Title, "POS", "1/3"),
					Description: Createrole.RoleSetup.Questions[0],
				}),
			],
		});
		const Name = await utils.waitForResponse(message.author.id, message.channel as TextChannel);
		name = Name.content;
		await Name.delete();

		msg.edit({
			embeds: [
				client.embed.create({
					Title: utils.replaceText(Createrole.RoleSetup.Title, "POS", "2/3"),
					Description: Createrole.RoleSetup.Questions[1],
				}),
			],
		});
		let hex = false;
		while (!hex) {
			const Hex = await utils.waitForResponse(message.author.id, message.channel as TextChannel);
			await Hex.delete();
			if (!/#([a-f]|[0-9]){6}/.test(Hex.content))
				return message.channel
					.send({
						embeds: [
							client.embed.globalErr({
								message: Createrole.Errors.InvalidHex,
							}),
						],
					})
					.then((m) => utils.deleteMsg(m, 2500));
			color = Hex.content as HexColorString;
			hex = true;
		}

		msg.edit({
			embeds: [
				client.embed.create({
					Title: utils.replaceText(Createrole.RoleSetup.Title, "POS", "3/3"),
					Description: Createrole.RoleSetup.Questions[2],
				}),
			],
		});
		let n = false;
		while (!n) {
			const Number = await utils.waitForResponse(message.author.id, message.channel as TextChannel);
			await Number.delete();
			if (parseInt(Number.content) === NaN)
				return message.channel
					.send({
						embeds: [
							client.embed.globalErr({
								message: Createrole.Errors.InvalidNumber,
							}),
						],
					})
					.then((m) => utils.deleteMsg(m, 2500));
			permissions = parseInt(Number.content);
			n = true;
		}
		const role = await message.guild.roles.create({
			name,
			color,
			permissions: `${BigInt(permissions)}`,
			reason: `Created by: ${message.author.tag}`,
		});

		msg.edit({
			embeds: [
				client.embed.create({
					Title: Createrole.RoleCreated.Title,
					Description: utils.replaceText(
						utils.replaceText(Createrole.RoleCreated.Description, "ROLE", `${role}`),
						"PERMS",
						new Permissions(role.permissions)
							.toArray()
							.map((r) => `\`${r}\``)
							.join(", ")
					),
					Color: color,
				}),
			],
		});
	},
});
