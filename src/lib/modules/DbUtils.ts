import { client } from "../../index";

export default class Db {
	public async setCommand(cmdName: string, enabled: boolean) {
		const data = await client.prisma.command.findUnique({
			where: {
				name: cmdName,
			},
		});

		if (!data) {
			return await client.prisma.command.create({
				data: { name: cmdName, enabled },
			});
		} else {
			return await client.prisma.command.update({
				where: {
					name: cmdName,
				},
				data: {
					enabled,
				},
			});
		}
	}

	public async getCommand(cmdName: string) {
		const data = await client.prisma.command.findUnique({
			where: {
				name: cmdName,
			},
		});

		if (!data) {
			return await client.prisma.command.create({
				data: {
					name: cmdName,
					enabled: true,
				},
			});
		} else {
			return data;
		}
	}

	public async getGuild(id: string) {
		const data = await client.prisma.guild.findUnique({ where: { id } });

		if (!data) {
			return await client.prisma.guild.create({ data: { id } });
		} else {
			return data;
		}
	}

	public async getPrefix(id: string) {
		let data = await client.prisma.guild.findUnique({ where: { id } });

		if (!data) {
			data = await client.prisma.guild.create({ data: { id } });
			return data.prefix;
		} else {
			return data.prefix;
		}
	}

	public async getGameData(userId: string, game: string) {
		const data = await client.prisma.gameData.findFirst({
			where: {
				game,
				userId,
			},
		});

		if (!data) {
			return await client.prisma.gameData.create({
				data: {
					game,
					userId,
				},
			});
		} else return data;
	}

	public async getModules() {
		return await client.prisma.module.findMany();
	}

	public async getModuleStatus(module: string) {
		let data = await client.prisma.module.findUnique({ where: { name: module } });

		if (!data) {
			data = await client.prisma.module.create({
				data: {
					name: module,
				},
			});
		}

		return data.enabled;
	}
}
