import { Command } from "discord-akairo";
import { Message } from "discord.js";
import { PrefixSupplier } from "discord-akairo";
import Language from "../../../languages/Language"

export default class Prefix extends Command {
    constructor() {
        super("prefix", {
            category: 'admin',
            channel: 'guild',
            aliases: ['language', 'lang'],
            args: [
                {
                    id: "prefix",
                    type: "string",
                },
                {
                    id: "show",
                    type: "flag",
                    flag: "--show",
                    match: "flag"
                }
            ],
            userPermissions: ["MANAGE_GUILD"]
        })
    }

    async exec(msg: Message, { prefix, show }: { prefix: string, show: boolean }) {
        const langset = this.client.settings.get(msg.guild.id, "language", "english");
        const prefixFromDB = this.client.settings.get(msg.guild.id, "prefix", (this.handler.prefix as PrefixSupplier)(msg));
        const lang: Language = require(`../../../languages/langset`);

        if (show) return await msg.channel.send(';')
    }
}