import { Command } from "discord-akairo";
import { Message } from "discord.js";
import { render } from "../../util/render-log";

export default class LogAutoCommand extends Command {
    constructor() {
        super("logAuto", {
            description: {
                name: "logs"
            },
            category: 'auto',
            regex: /http(s|):\/\/(www\.|)logs\.tf\/\d+/
        })
    }

    async exec(msg: Message, args: any) {
        await msg.channel.startTyping();
        let screenshotBuffer = await render(args.match[0]);

        msg.channel.send({
            files: [screenshotBuffer]
        });
        msg.channel.stopTyping(true);
    }
}