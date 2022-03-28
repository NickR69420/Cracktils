import { Command } from "../../lib/structures/Command";
import backup from "discord-backup";
import { EmbedFieldData } from "discord.js";

export default new Command({
	name: "backup",
	description: "Backup or restore the server.",
	usage: "backup <create|load|list> [id]",
	minArgs: 1,
	aliases: ["backups"],
	userPerms: ["MANAGE_GUILD"],
	run: async ({ client, message, args, utils }) => {
		const chosenAction = args.pick(0) as string;
		const allowedActions = ["create", "load", "list"];

		if (!allowedActions.includes(chosenAction)) {
			return utils.iReply(message, {
				embeds: [
					client.embed.globalErr({
						message: `You can only ${allowedActions.map((a) => `\`${a}\``).join(", ")}`,
					}),
				],
			});
		}

		switch (chosenAction) {
			case "create": {
				backup
					.create(message.guild, {
						jsonBeautify: true,
					})
					.then((data) => {
						utils.iReply(message, {
							embeds: [
								client.embed.globalSuccess({
									title: "Backup Created",
									message: `Successfully created a backup with id \`${data.id}\``,
								}),
							],
						});
					})
					.catch((err) => {
						client.logger.error(new Error(err));
						utils.iReply(message, {
							embeds: [client.embed.globalErr({ message: "Unable to make a backup. Please contact a developer!" })],
						});
						return;
					});

				break;
			}
			case "load": {
				const ID = args.pick(1) as string;

				if (!ID) return utils.iReply(message, { embeds: [client.embed.globalErr({ message: "Please provide a valid ID." })] });

				await backup.fetch(ID).catch(() => {
					utils.iReply(message, { embeds: [client.embed.globalErr({ message: "Please provide a valid ID." })] });
					return;
				});

				await backup.load(ID, message.guild).catch(() => {
					utils.iReply(message, { embeds: [client.embed.globalErr({ message: "Unable to load the backup." })] });
					return;
				});

				utils.iReply(message, {
					embeds: [client.embed.globalSuccess({ title: "Backup Loaded", message: "Successfully Loaded the backup." })],
				});

				break;
			}
			case "list": {
				const Fields = await getFields();

				utils.iReply(message, {
					embeds: [
						client.embed.create({
							Author: { name: `Backups`, iconURL: message.guild.iconURL() },
							Description: Fields ? `Viewing **${Fields.length}** backup(s).` : "No backups created.",
							Fields,
						}),
					],
				});
			}
		}

		async function getFields() {
			const Fields: EmbedFieldData[] = [];
			const list = await backup.list();
			const backups = list.map(async (a) => {
				return await backup.fetch(a);
			});

			if (backups.length == 0) return null;

			const data = (await Promise.all(backups)).filter((b) => b.data.name == message.guild.name);

			data.forEach((b) => {
				Fields.push({
					name: `**ID:** \`${b.data.id}\``,
					value: `**Created:** ${utils.formatDate(b.data.createdTimestamp, "f")}\n**Size:** ${b.size} kb`,
				});
			});

			return Fields;
		}
	},
});
