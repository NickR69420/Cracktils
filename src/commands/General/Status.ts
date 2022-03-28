import { Command } from "../../lib/structures/Command";
import axios from "axios";

export default new Command({
	name: "status",
	description: "View the status of the Crackpixel Network.",
	usage: "status",
	aliases: ["ip", "online", "down"],
	userPerms: ["SEND_MESSAGES"],
	run: async ({ client, message, utils, lang }) => {
		const { Status } = lang.GeneralModule.Commands;
		axios
			.get(Status.API)
			.then((res) => {
				const { data } = res;

				let status: string;
				if (data.online) status = "Online";
				if (!data.online) status = "Offline";
				if (data.version == "Maintenance") status = "Under Maintenance";

				return utils.iReply(message, {
					embeds: [
						client.embed.create({
							Author: { name: Status.Author, iconURL: message.guild.iconURL() },
							Fields: [
								{
									name: Status.Fields[0],
									value: status,
								},
								{
									name: Status.Fields[1],
									value: `${data.players.online} / ${data.players.max}`,
								},
								{
									name: Status.Fields[2],
									value: data.motd.clean[0],
								},
							],
						}),
					],
				});
			})
			.catch(() => {
				return utils.iReply(message, { embeds: [client.embed.globalErr({ message: Status.Error })] });
			});
	},
});
