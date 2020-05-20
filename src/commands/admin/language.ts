import { Command } from "discord-akairo";
import { Message } from "discord.js";
import { PrefixSupplier } from "discord-akairo";

export default class Language extends Command {
    constructor() {
        super("language ", {
            category: 'admin',
            aliases: ['language', 'lang'],
        })
    }

    async exec(msg: Message) {
        const langset = this.client.settings.get(msg.guild?.id, "language", "en-US");
        const prefix = this.client.settings.get(msg.guild?.id, "prefix", (this.handler.prefix as PrefixSupplier)(msg));
        const lang = require(`../../../languages/langset`);
    }
}