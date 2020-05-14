import { Command } from "discord-akairo";
import { Message } from "discord.js";

export default class TestCommand extends Command {
    constructor() {
        super("test", {
            category: 'owner',
            aliases: ["test"],
            description: {
                usage: "<test>"
            },
            ownerOnly: true,
        })
    }

    async exec(msg: Message) {
        const storedMsg = await msg.util.reply("This is a message. React!")
        storedMsg.react('➕')
    }
}