import { Cracktils } from "../structures/Client";

export default async (client: Cracktils) => {
	const { GiveawayJoined, GiveawayLeft } = client.lang.GiveawaySystem;
	const enabled = await client.db.getModuleStatus("Giveaways");
	if (!enabled) return;

	client.giveaways.on("giveawayJoined", (member, message, giveaway) => {
		member
			.send({
				embeds: [
					client.embed.create({
						Author: { name: GiveawayJoined.Author, iconURL: member.user.displayAvatarURL() },
						Description: GiveawayJoined.Description.replace("PRIZE", giveaway.prize).replace("URL", message.url),
					}),
				],
			})
			.catch(() => {});
	});

	client.giveaways.on("giveawayLeft", (member, message, giveaway) => {
		member
			.send({
				embeds: [
					client.embed.create({
						Author: { name: GiveawayLeft.Author, iconURL: member.user.displayAvatarURL() },
						Description: GiveawayLeft.Description.replace("PRIZE", giveaway.prize).replace("URL", message.url),
					}),
				],
			})
			.catch(() => {});
	});

	client.giveaways.on("giveawayEnded", async (m, giveaway) => {
		await client.giveaways.end(giveaway);
	});
};
