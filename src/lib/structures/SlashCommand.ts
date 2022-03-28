import { iSlash } from "../../typings/iSlash";

export class SlashCommand {
	constructor(slashOptions: iSlash) {
		Object.assign(this, slashOptions);
	}
}
