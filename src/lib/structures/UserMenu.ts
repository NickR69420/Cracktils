import { iUserMenu } from "../../typings/iUserMenu";

export class UserMenu {
	constructor(menuOptions: iUserMenu) {
		Object.assign(this, menuOptions);
	}
}
