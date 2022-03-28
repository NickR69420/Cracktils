import { Command } from "../../lib/structures/Command";

export default new Command({
	name: "coinflip",
	description: "Flip a coin.",
	usage: "coinflip [heads/tails]",
	aliases: ["cf"],
	userPerms: ["SEND_MESSAGES"],
	run: async ({ client, message, args, utils, lang }) => {
		const { CoinFlip } = lang.FunModule.Commands;
		const coin = { Head: CoinFlip.HeadIcon, Tail: CoinFlip.TailIcon };
		const side = Object.keys(coin)[Math.floor(Math.random() * 2)];

		if (!args.pick(0))
			return utils.iReply(message, {
				embeds: [
					client.embed.create({
						Title: CoinFlip.Title,
						Description: utils.replaceText(CoinFlip.Description, "RESULT", side.toLowerCase()),
						Thumbnail: Object.values(coin)[Object.keys(coin).indexOf(side)],
						Footer: {
							text: utils.replaceText(CoinFlip.Footer, "USER", message.author.tag),
							iconURL: message.author.displayAvatarURL(),
						},
					}),
				],
			});
		else {
			const chosenSide = utils.replaceText((args.pick(0) as string).toLowerCase(), "s", "");

			if (!["head", "tail"].includes(chosenSide))
				return utils.iReply(message, {
					embeds: [await utils.Usage("coinflip", message.guild)],
				});

			const win = side.toLowerCase() == chosenSide ? true : false;

			return utils.iReply(message, {
				embeds: [
					client.embed.create({
						Title: CoinFlip.Title,
						Description: utils.replaceText(CoinFlip.Description, "RESULT", side.toLowerCase()),
						Thumbnail: Object.values(coin)[Object.keys(coin).indexOf(side)],
						Footer: {
							text: win ? CoinFlip.Results[0] : CoinFlip.Results[1],
							iconURL: message.author.displayAvatarURL(),
						},
					}),
				],
			});
		}
	},
});
