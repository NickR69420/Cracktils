import { SlashCommand } from "../../lib/structures/SlashCommand";
import axios from "axios";

export default new SlashCommand({
	name: "status",
	description: "View the status of the Crackpixel Network.",
	userPerms: ["SEND_MESSAGES"],
	run: async ({ client, interaction, lang }) => {
		await interaction.deferReply().catch(() => {});

		const { Status } = lang.GeneralModule.Commands;
		axios
			.get(Status.API)
			.then((res) => {
				const { data } = res;

				let status: string;
				if (data.online) status = "Online";
				if (!data.online) status = "Offline";
				if (data.version == "Maintenance") status = "Under Maintenance";

				return interaction.followUp({
					embeds: [
						client.embed.create({
							Author: { name: Status.Author, iconURL: interaction.guild.iconURL() },
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
				return interaction.followUp({ embeds: [client.embed.globalErr({ message: Status.Error })] });
			});
	},
});
