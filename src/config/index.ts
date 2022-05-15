import { ColorResolvable, HexColorString, Snowflake } from "discord.js";
import { readFileSync } from "fs";
import { load } from "js-yaml";

/** Config file */
export interface configFile {
	Token: string;
	devToken: string;
	Dev: boolean;
	Management: string[];
	GuildId: string;

	EmbedColors: {
		Default: HexColorString;
		Error: HexColorString;
		Success: HexColorString;
		noColor: ColorResolvable;
	};

	litebans: {
		host: string;
		port: number;
		user: string;
		password: string;
		database: string;
	};

	proof_category: string;

	Commands: {};

	Channels: {
		General: string;
		Announcements: string;
		DefaultUpdates: string;
		Reports: string;
		Suggestions: string;
	};

	Roles: {
		Admin: Snowflake;
		JrAdmin: Snowflake;
		Staff: Snowflake;
		Member: Snowflake;
		allRoles: Snowflake[];
	};

	Links: linkButton[];

	Suggestions: {
		Enabled: boolean;
		ManageSuggestionsRole: string;
		Emojis: {
			Upvote: string;
			Downvote: string;
			Accept: string;
			Deny: string;
			Implemented: string;
		};
		Colors: {
			accept: string;
			deny: string;
			implemented: string;
		};
	};

	ActivityCycling: {
		Enabled: boolean;
		Interval: number;
		Default: Activity[];
		Activities: Activity[];
	};

	Other: {
		Giveaways: {
			DiscordEmoji: string;
			UnicodeEmoji: string;
		};
	};

	Logging: {
		Enabled: boolean;
	};
}

export const config = load(readFileSync(`${__dirname}/../../src/config/config.yml`, "utf-8")) as configFile;

/** Lang file */
export interface langFile {
	GlobalErrors: {
		NoPerms: {
			Title: string;
			Description: string;
		};
		InvalidArgs: {
			Title: string;
			Description: string;
		};
		cmdErr: string;
		disabledCommand: string;
		Cooldown: {
			Title: string;
			Description: string;
		};
		InvalidRole: string;
	};

	GeneralModule: {
		Commands: {
			Ping: {
				awaitMsg: {
					Title: string;
				};
				Embed: {
					Fields: string[];
				};
			};
			Help: {
				Author: string;
				Description: string;
				Footer: string;
				Menu: string;
				pageTitle: string;
				Emojis: string[];
				Syntax: string;
			};
			Reminder: {
				InvalidArgs: string;
				Set: {
					InvalidDuration: string;
					ReminderSet: {
						Title: string;
						Descriptions: string[];
						Footer: string;
					};
				};
				Remove: {
					InvalidID: string;
					NoReminderFound: string;
					Removed: string;
				};
				List: {
					Title: string;
					Descriptions: string[];
					Fields: string[];
				};
				Reminder: {
					Title: string;
					Descriptions: string[];
				};
			};
			Report: {
				NotSetup: string;
				ReportBot: string;
				ReportSelf: string;
				InvalidReason: string;
				Report: {
					Title: string;
					Fields: string[];
				};
				Reported: {
					Title: string;
					Description: string;
				};
			};
			Suggest: {
				NotSetup: string;
				Sent: {
					Title: string;
					Description: string;
				};
				Pending: {
					Footer: string;
				};
			};
			RoleInfo: {
				Fields: string[];
				Footer: string;
			};
			ServerInfo: {
				Fields: string[];
			};
			MemberCount: {
				Title: string;
			};
			UserInfo: {
				Fields: string[];
				Footer: string;
				Badges: string[];
			};
			Status: {
				API: string;
				Error: string;
				Author: string;
				Fields: string[];
			};
		};
	};

	FunModule: {
		Commands: {
			MagicBall: {
				API: string;
				Title: string;
				Fields: string[];
			};
			CoinFlip: {
				HeadIcon: string;
				TailIcon: string;
				Title: string;
				Description: string;
				Results: string[];
				Footer: string;
			};
			Connect4: {
				PlayWithBotOrSelf: string;
				ColumnFull: string;
				Invite: {
					Title: string;
					Description: string;
				};
				InviteCanceled: {
					Title: string;
					Descriptions: string[];
				};
				GameBoard: {
					Title: string;
					Description: string;
				};
				GameBoardOver: {
					Title: string;
					Description: string;
					GameOverWin: string;
					GameOverTie: string;
				};
				Emojis: string[];
			};
			Math: {
				Title: string;
				Fields: string[];
				Error: string;
			};
			RockPaperScissors: {
				Fields: string[];
			};
			TicTacToe: {
				InvalidUser: string;
				SpaceTaken: string;
				Emojis: string[];
				Invite: {
					Title: string;
					Description: string;
				};
				InviteCanceled: {
					Title: string;
					Descriptions: string[];
				};
				GameBoard: {
					Title: string;
					Description: string;
				};
				GameBoardOver: {
					Title: string;
					Description: string;
					GameOverWin: string;
					GameOverTie: string;
				};
			};
			RollDice: {
				Sides: string[];
				RollingDice: string;
				Title: string;
				Description: string;
			};
			GameStats: {
				Title: string;
				Fields: string[];
			};
		};
	};

	AdminModule: {
		Commands: {
			Announce: {
				Questions: string[];
				AnnouncementSetup: string;
				SetupCanceled: string;
				Posted: {
					Title: string;
					Description: string;
				};
				InvalidChannel: {
					Title: string;
					Description: string;
				};
				Announcement: {
					Title: string;
					Footer: string;
				};
			};
			Createrole: {
				Errors: {
					InvalidHex: string;
					InvalidNumber: string;
					RoleError: string;
				};
				RoleSetup: {
					Title: string;
					Questions: string[];
				};
				RoleCreated: {
					Title: string;
					Description: string;
				};
			};
			Deleterole: {
				HigherRole: string;
				DeleteError: string;
				Confirmation: string;
				Deleted: string;
				Canceled: string;
			};
			Giverole: {
				isBot: string;
				HigherRole: string[];
				RoleAdded: {
					Title: string;
					Description: string;
				};
			};
			Message: {
				CouldntSend: string;
				Sent: string;
			};
			Say: {
				CouldntSend: string;
				Sent: string;
			};
			SuggestReply: {
				NotSetup: string;
				InvalidID: string;
				InvalidStatus: string;
				AlreadyReplied: string;
				Replied: string;
				Reply: {
					NotAllowed: string;
					Description: string;
					Replies: {
						accepted: string;
						denied: string;
						implemented: string;
					};
				};
			};
			Takerole: {
				TakeFromBot: string;
				HigherRole: string[];
				RoleRemoved: {
					Title: string;
					Description: string;
				};
			};
			Update: {
				Questions: string[];
				UpdateSetup: string;
				SetupCanceled: string;
				Posted: {
					Title: string;
					Description: string;
				};
				InvalidChannel: {
					Title: string;
					Description: string;
				};
				Update: {
					Title: string;
					Footer: string;
				};
			};
			Poll: {
				MaxChoices: string;
				Poll: {
					Title: string[];
					Description: string;
					Footer: string;
				};
				Posted: {
					Title: string;
					Description: string;
				};
			};
			Prefix: {
				View: string;
				Set: string;
			};
		};
	};

	FilterSystem: {
		Commands: {
			Filter: {
				InvalidArgs: string;
				NoWord: string[];
				Disabled: string[];
				Enabled: string[];
				Add: {
					WordAlreadyInFilter: string[];
					Title: string;
					Description: string[];
				};
				Remove: {
					InvalidWords: string;
					Title: string;
					Description: string[];
				};
				List: string;
			};
		};
		FilterResponse: string;
	};

	ManagementModule: {
		Commands: {
			Eval: {
				Author: string;
				Fields: string[];
				Footer: string;
			};
			Command: {
				InvalidCommand: string;
				CantBeModified: string;
				List: {
					Fields: string[];
				};
				EnabledDisabled: {
					Title: string;
					Description: string;
				};
				Emojis: string[];
			};
			Module: {
				InvalidModule: string;
				CantBeModified: string;
				List: {
					Fields: string[];
				};
				EnabledDisabled: {
					Title: string;
					Description: string;
				};
				Emojis: string[];
			};
			Reload: {
				InvalidAction: string;
				Commands: string[];
				SlashCommands: string[];
				Events: string[];
				All: string[];
			};
		};
	};

	GiveawaySystem: {
		WinnerEmbed: {
			Content: string;
			Description: string;
		};
		ReRolled: {
			Content: string;
		};
		Ended: {
			Content: string;
			Description: string;
			Footer: string;
		};
		Commands: {
			Gcreate: {
				InvalidTime: string;
				InvalidWinners: string;
				InvalidChannel: string;
				Setup: {
					Questions: string[];
					Title: string;
				};
				Giveaway: {
					Description: string;
					Footer: string;
				};
				Created: string;
				Canceled: string;
			};
			Gdelete: {
				InvalidGiveaway: string;
				Deleted: string;
			};
			Greroll: {
				InvalidGiveaway: string;
				NoGiveaways: string;
				GiveawayHasntEnded: string;
			};
			Gend: {
				InvalidGiveaway: string;
				AlreadyEnded: string;
			};
			NoOneEntered: string;
		};
		GiveawayJoined: {
			Author: string;
			Description: string;
		};
		GiveawayLeft: {
			Author: string;
			Description: string;
		};
	};

	LogSystem: {
		MessageDeleted: {
			Title: string;
			Fields: string[];
		};
		MessageBulkDeleted: {
			Title: string;
			Fields: string[];
		};
		MessageEdited: {
			Title: string;
			Description: string;
			Fields: string[];
		};
		ChannelCreated: {
			Title: string;
			Fields: string[];
		};
		ChannelDeleted: {
			Title: string;
			Fields: string[];
		};
		ChannelPinsUpdated: {
			Title: string;
			Fields: string[];
		};
		ChannelUpdated: {
			Title: string;
			NameUpdated: {
				Fields: string[];
			};
			PermsUpdated: {
				Fields: string[];
			};
			CategoryUpdated: {
				Fields: string[];
			};
			TopicUpdated: {
				Fields: string[];
			};
		};
		MemberRoleRemoved: {
			Title: string;
			Fields: string[];
		};
		MemberRoleAdded: {
			Title: string;
			Fields: string[];
		};
		DisplayNameUpdated: {
			Title: string;
			Fields: string[];
		};
		EmojiCreated: {
			Title: string;
			Fields: string[];
		};
		EmojiDeleted: {
			Title: string;
			Fields: string[];
		};
		EmojiUpdated: {
			Title: string;
			Fields: string[];
		};
		RoleCreated: {
			Title: string;
			Fields: string[];
		};
		RoleDeleted: {
			Title: string;
			Fields: string[];
		};
		RoleUpdated: {
			Title: string;
			Fields: string[];
			Previously: string;
			Currently: string;
		};
	};
}

export const lang = load(readFileSync(`${__dirname}/../../src/config/lang.yml`, "utf-8")) as langFile;

interface linkButton {
	label: string;
	url: string;
}

interface Activity {
	type: number;
	activity: string;
}
