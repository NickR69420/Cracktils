import { iMessageMenu } from "../../typings/iMessageMenu";

export class MessageMenu {
	constructor(menuOptions: iMessageMenu) {
		Object.assign(this, menuOptions);
	}
}
