import { Event } from "../lib/structures/Event";
import { client } from "../index";

export default new Event("error", (error) => {
	client.logger.error(error);
});
