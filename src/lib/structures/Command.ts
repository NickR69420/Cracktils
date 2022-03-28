import { iCommand } from "../../typings/iCommand";

export class Command {
	constructor(commandOptions: iCommand) {
		Object.assign(this, commandOptions);
	}
}
