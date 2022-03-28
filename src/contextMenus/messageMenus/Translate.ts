import { MessageMenu } from "../../lib/structures/MessageMenu";
import translate from "@iamtraction/google-translate";

export default new MessageMenu({
	name: "Translate",
	type: "MESSAGE",
	userPerms: ["SEND_MESSAGES"],
	run: async ({ menu }) => {
		const message = menu.targetMessage;

		translate(message.content, { to: "en" })
			.then((res) => {
				menu.reply({
					content: `[${res.text}](${message.url})`,
					ephemeral: true,
				});
			})
			.catch(() => {
				return menu.reply({
					content: "Unable to translate message.",
					ephemeral: true,
				});
			});
	},
});
