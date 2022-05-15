import { CategoryChannel, Message, MessageEmbed, TextChannel } from "discord.js";
import { LitebansBans } from "../../entity/LitebansBans";
import { LitebansHistory } from "../../entity/LitebansHistory";
import { PunishmentProof } from "../../entity/PunishmentProof";

// setup basic command module
module.exports = {
	name: "set-proof",
	description: "Set proof for a given punishment.",
	usage: "setproof <punishment_id> <proofURL>",
	aliases: ["setproof"],
	userPerms: ["KICK_MEMBERS"],
	minArgs: 2,
	run: async ({ client, message, lang, utils, args: { args } }) => {
		// check if the user has the required arguments
		if (args.length < 2) {
			// if not, send a message saying you need to provide the required arguments
			let msgsaAEr = new MessageEmbed().setColor("#ff0000").setDescription("You need to provide the required arguments");
			message.channel.send({ embeds: [msgsaAEr] });
			return;
		}
		// get the punishment id from the arguments
		const punishmentIdRaw = args[0];
		// get the proof from the arguments
		const proof = args.slice(1).join(" ");
		// punishmentIdRaw is formatted like `type_id`, the type can be warning, mute, ban or kick, and the id is the punishment id. then make sure that type and id are valid and using TypeOrm.getRepostiroy on Litebans tables get the punishment, if the punishment doesn't exist, send a message saying that the punishment doesn't exist then return
		const punishmentId = punishmentIdRaw.split("_");
		if (!["warning", "mute", "ban", "kick"].includes(punishmentId[0]) || !/^\d+$/.test(punishmentId[1])) {
			let msgsaAEr = new MessageEmbed().setColor("#ff0000").setDescription("Invalid punishment id");
			message.channel.send({ embeds: [msgsaAEr] });
			return;
		}
		// if the punishment type is warning the getRepoistory() will get entity LitebansWarnings, if the punishment type is mute the getRepoistory() will get entity LitebansMutes, if the punishment type is ban the getRepoistory() will get entity LitebansBans, if the punishment type is kick the getRepoistory() will get entity LitebansKicks
		const punishment = await client.litebansDb
			.getRepository(`Litebans${punishmentId[0].charAt(0).toUpperCase() + punishmentId[0].slice(1)}s`)
			.findOne({
				where: {
					id: punishmentId[1],
				},
			});
		// check if punishment is valid
		if (!punishment) {
			// if not, send a message saying that the punishment doesn't exist
			let msgsaAEr = new MessageEmbed().setColor("#ff0000").setDescription("The punishment doesn't exist");
			message.channel.send({ embeds: [msgsaAEr] });
			return;
		}
		// check if the punishment is already set
		const punishmentReal = await client.litebansDb.getRepository(PunishmentProof).findOne({
			where: {
				punishmentId: punishmentId[1],
				punishment_type: punishmentId[0],
			},
		});
		// if the punishment is already set, send a message saying that the punishment is already set
		if (punishmentReal) {
			let msgsaAEr = new MessageEmbed().setColor("#ff0000").setDescription("The punishment is already set");
			message.channel.send({ embeds: [msgsaAEr] });
			return;
		}
		// if the punishment is not set, create a new punishment proof entity
		const proofEntity = new PunishmentProof();
		// set the punishment id
		proofEntity.punishmentId = punishmentId[1];
		// set the punishment type
		proofEntity.punishment_type = punishmentId[0];
		// set the proof url
		proofEntity.proofUrl = proof;
		// save the proof entity
		await client.litebansDb.getRepository(PunishmentProof).save(proofEntity);
		// get the Punishment using the punishment id and punishment type
		const punishmentReal2 = (await client.litebansDb
			.getRepository(`Litebans${punishmentId[0].charAt(0).toUpperCase() + punishmentId[0].slice(1)}s`)
			.findOne({
				where: {
					id: punishmentId[1],
				},
			})) as LitebansBans;

		// get player name using Litebans History
		const playerName = await client.litebansDb.getRepository(LitebansHistory).findOne({
			where: { uuid: punishmentReal2.uuid },
		});
		// send a message saying that the punishment proof has been set
		let msgsaAEr = new MessageEmbed().setColor("#00ff00").setDescription("The punishment proof has been set");
		message.channel.send({ embeds: [msgsaAEr] });
		// get all the channel from category mentioned as "proof_category" in client.config
		const proofChannel = client.channels.cache.find((channel) => channel.id === client.config.proof_category) as CategoryChannel;
		// get the channel with topic contating id of the user
		let proofChannelUser = proofChannel.children
			.map((channel) => {
				if ((channel as TextChannel).topic) {
					return (channel as TextChannel).topic === message.member.user.id ? channel : null;
				}
			})
			.filter((channel) => channel !== null)[0] as TextChannel;
		// check if the proof channel is valid, if it is, post a embed message in the proof channel
		if (proofChannelUser) {
			let proofEmbed = new MessageEmbed()
				.setColor("#00ff00")
				.setTitle(`${playerName.name}'s ${punishmentId[0]}`)
				.addField("Proof", proof)
				.addField("Player UUID", punishmentReal2.uuid)
				.addField("Player name", playerName.name)
				.addField("Staff Member", message.member.toString())
				.addField("Date", new Date().toLocaleString());
			proofChannelUser.send({ embeds: [proofEmbed] });
			return;
		}
		// if the proof channel is not valid, create a new text channel with topic contating id of the user
		const proofChannelUserNew = await proofChannel.guild.channels.create(`${message.member.user.username}-proofs`, {
			type: "GUILD_TEXT",
			topic: message.member.id,
			parent: proofChannel,
		});
		// post a embed message in the proof channel
		let proofEmbed = new MessageEmbed()
			.setColor("#00ff00")
			.setTitle(`${playerName.name}'s ${punishmentId[0]}`)
			.addField("Proof", proof)
			.addField("Player UUID", punishmentReal2.uuid)
			.addField("Player name", playerName.name)
			.addField("Staff Member", message.member.toString())
			.addField("Date", new Date().toLocaleString());
		proofChannelUserNew.send({ embeds: [proofEmbed] });
		return;
	},
};
