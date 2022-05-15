import { MessageEmbed } from "discord.js";
import { LitebansBans } from "../../entity/LitebansBans";
import { LitebansHistory } from "../../entity/LitebansHistory";
import { LitebansKicks } from "../../entity/LitebansKicks";
import { LitebansMutes } from "../../entity/LitebansMutes";
import { LitebansWarnings } from "../../entity/LitebansWarnings";
import { PunishmentProof } from "../../entity/PunishmentProof";
import { Command } from "../../lib/structures/Command";

export default new Command({
	name: "punishmentlookup",
	description: "Lookup for punishments of user.",
	usage: "punishmentlookup <ign> [staff]",
	aliases: ["pl"],
	userPerms: ["KICK_MEMBERS"],
	minArgs: 1,
	run: async ({ client, message, args: { args } }) => {
		if (!args[0]) {
			message.channel.send("Please provide a username");
			return;
		}

		const username = args[0];
		const staffMember = args[1];
		try {
			// Gets the user's uuid with LitebansHistory orm entity.
			let user = await client.litebansDb.getRepository(LitebansHistory).findOne({
				where: {
					name: username,
				},
			});

			let uuidOfUser = user.uuid;
			// Gets the ban, warnings and mutes of user through uuid of the user.
			//
			let searchObj: any = {
				where: {
					uuid: uuidOfUser,
				},
				take: 10,
			};
			if (staffMember) {
				searchObj.where.banned_by_name = staffMember;
			}
			let bans = (await client.litebansDb.getRepository(LitebansBans).find(searchObj)).map((ban) => {
				ban["type"] = "ban";
				return ban;
			});
			let mutes = (await client.litebansDb.getRepository(LitebansMutes).find(searchObj)).map((mute) => {
				mute["type"] = "mute";
				return mute;
			});
			let kicks = (await client.litebansDb.getRepository(LitebansKicks).find(searchObj)).map((kick) => {
				kick["type"] = "kick";
				return kick;
			});
			let warnings = await client.litebansDb.getRepository(LitebansWarnings).find(searchObj);
			let punishmentLookup = bans.concat(mutes).concat(kicks as any) as any;
			let punishmentLookupSorted = punishmentLookup.sort((a, b) => {
				// Parse a.time and b.time and compare them
				let aTime = new Date(a.time);
				let bTime = new Date(b.time);
				return bTime.getTime() - aTime.getTime();
			});
			let embed = new MessageEmbed()
				.setTitle(`${username}'s punishments`)
				.setColor(0x00ff00)
				.setTimestamp()
				.setAuthor({
					name: message.author.username,
					iconURL: message.author.avatarURL(),
				})
				.setFooter({ text: "Copyright (c) Crackpixel" });
			// Loop through 11 punishments and add them to the embed
			for (let i = 0; i < 11; i++) {
				if (punishmentLookupSorted[i]) {
					// check for punishment proof
					let type = punishmentLookupSorted[i].type;
					let proof = await client.litebansDb.getRepository(PunishmentProof).findOne({
						where: {
							punishment_type: type,
							punishmentId: punishmentLookupSorted[i].id,
						},
					});
					if (!proof) proof = new PunishmentProof();
					// If the punishment is a ban, add the ban to the embed
					if (type === "ban") {
						let ban = punishmentLookupSorted[i] as LitebansBans;
						embed.addField(
							`Ban#${i + 1}`,
							`**ID**: ${type}_${ban.id}\n**Reason**: ${ban.reason}\n**Banned by**: ${ban.bannedByName}\n**Banned at**: ${new Date(
								parseInt(ban.time)
							)}\n**Banned until**: ${ban.until == "0" ? "Permanent" : new Date(parseInt(ban.until))}\n**IP Ban**: ${
								ban.ipban ? "Yes" : "No"
							}\n**Proof**: ${proof.proofUrl ? proof.proofUrl : "None"}`
						);
					}
					// If the punishment is a mute, add the mute to the embed
					if (type === "mute") {
						let mute = punishmentLookupSorted[i] as LitebansMutes;
						embed.addField(
							`Mute#${i + 1}`,
							`**ID**: ${type}_${mute.id}\n**Reason**: ${mute.reason}\n**Muted by**: ${mute.bannedByName}\n**Muted at**: ${new Date(
								parseInt(mute.time)
							)}\n**Muted until**: ${mute.until == "0" ? "Permanent" : new Date(parseInt(mute.until))}\n**Proof**: ${
								proof.proofUrl ? proof.proofUrl : "None"
							}`
						);
					}
					// If the punishment is a kick, add the kick to the embed
					if (type === "kick") {
						let kick = punishmentLookupSorted[i] as LitebansKicks;
						embed.addField(
							`Kick#${i + 1}`,
							`**ID**: ${type}_${kick.id}\n**Reason**: ${kick.reason}\n**Kicked by**: ${kick.bannedByName}\n**Kicked at**: ${new Date(
								parseInt(kick.time)
							)}\n**Proof**: ${proof.proofUrl ? proof.proofUrl : "None"}`
						);
					}
				}
			}
			let warningEmbed = new MessageEmbed()
				.setTitle(`${username}'s warnings`)
				.setColor(0x00ff00)
				.setTimestamp()
				.setAuthor({
					name: message.author.username,
					iconURL: message.author.avatarURL(),
				})
				.setFooter({ text: "Made by SeniorTeams" });

			// loop through top 11 warnings and add them to the embed
			for (let i = 0; i < 11; i++) {
				if (warnings[i]) {
					let warning = warnings[i] as LitebansWarnings;
					warningEmbed.addField(
						`Warning#${i + 1}`,
						`**Reason**: ${warning.reason}\n**Warned by**: ${warning.bannedByName}\n**Warned at**: ${new Date(parseInt(warning.time))}`
					);
				}
			}
			// Send the message to user's Dm
			await message.author.send({ embeds: [embed, warningEmbed] });
			// Sends message to the same channel saying that history has been sent.
			embed = new MessageEmbed().setDescription(`History of ${username} has been sent to your DM`).setColor(0x00ff00);
			await message.delete();
			let maessage = await message.channel.send({ embeds: [embed] });
			// Wait for 5 sec and delete the message
			setTimeout(() => {
				maessage.delete();
			}, 5000);
		} catch (err) {
			message.channel.send("The provided user doesn't exist on database.");
			console.log(err);
			return;
		}
	},
});
