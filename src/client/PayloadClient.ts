import { AkairoClient, CommandHandler } from "discord-akairo";
import { join, resolve } from "path";
import config from "../config";

import MongoProvider from "../providers/MongoProvider";

export default class PayloadClient extends AkairoClient {
    public settings: MongoProvider = new MongoProvider(config.MONGODB_URI, { modelNames: ["User", "Server", "Client"] });

    public commandHandler: CommandHandler = new CommandHandler(this, {
        directory: resolve(join(__dirname, "../commands/")),
        aliasReplacement: /-/g,
        allowMention: true,
        handleEdits: true,
        commandUtil: true,
        commandUtilLifetime: 3e5,
        defaultCooldown: 3000,
        prefix: msg => {
            return this.settings.get(msg.guild?.id, "prefix", config.PREFIX);
        },
    });

    constructor() {
        super({
            ownerID: config.allowedID,
        }, {
            disableMentions: "everyone",
        });
    }

    private async load() {
        this.commandHandler.loadAll();

        await this.settings.init();
    }

    public async start() {
        await this.load();
        return this.login(config.TOKEN);
    }
}