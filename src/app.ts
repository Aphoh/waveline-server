import { bootstrap, app } from "@wellenline/via";
import * as dotenv from "dotenv";
import * as ip from "ip";

import { cors, bodyParser, auth } from "./Http/middleware/global";
import * as mongoose from "mongoose";
import { LibraryService } from "./Services/library.service";
// tslint:disable-next-line:no-var-requires
import qr = require("qrcode-terminal");
import { Albums } from "./Http/albums";
import { Artists } from "./Http/artists";
import { Genres } from "./Http/genres";
import { Playlists } from "./Http/playlists";
import { Search } from "./Http/search";
import { System } from "./Http/system";
import { Tracks } from "./Http/tracks";

export class App {
	constructor() {
		dotenv.config();
		(<any>mongoose).Promise = global.Promise;
		bootstrap({
			port: (process.env.PORT as number | string),
			middleware: [cors, bodyParser, auth(["art", "play"])],
			resources: [Albums, Artists, Genres, Playlists, Search, System, Tracks],
		});

		app.headers = {
			"Content-Type": "application/json",
			"Access-Control-Allow-Origin": "*",
			"Access-Control-Allow-Methods": "OPTIONS, DELETE, PUT, PATCH, POST, GET",
			"Access-Control-Max-Age": 2592000,
			"Access-Control-Allow-Headers": "*",
		};

		mongoose.connect(process.env.MONGO_URL, {
			useNewUrlParser: true,
		}).then(() => {
			LibraryService.instance.sync(process.env.MUSIC_PATH, [".mp3", ".flac", ".m4a"]);
		});

		const HOST = process.env.HOST || ip.address();
		qr.generate(`${HOST}?key=${process.env.API_KEY}`);

		console.info(`[DEBUG] Server running: ${HOST}?key=${process.env.API_KEY}`);
	}
}

export default new App();
