import { Command } from "discord-akairo";
import { Message, User, GuildMember } from "discord.js";
import Language from "../../../languages/Language"

export default class BruhCommand extends Command {
    constructor() {
        super("bruh", {
            category: 'fun',
            aliases: ["bruh"],
            args: [
                {
                    id: "mention",
                    type: "userMention",
                }
            ]
        })
    }

    async exec(msg: Message, { mention }: { mention: User | GuildMember }) {
        const langset = this.client.settings.get(msg.guild?.id, "language", "english");
        const lang: Language = require(`../../../languages/${langset}`);

        if (!mention) return await msg.channel.send(lang.bruh_nouser)
        return await msg.channel.send(lang.bruh_user.replace("%mention", mention.toString()))
    }
}