import { Command } from "discord-akairo";
import { Message } from "discord.js";
import { render } from "../../util/render-log";

interface ILogsMatch {
    [url: string]: Array<string>
}

export default class LogAutoCommand extends Command {
    constructor() {
        super("logAuto", {
            description: {
                name: "logs"
            },
            category: 'auto',
            regex: /http(s|):\/\/(www\.|)logs\.tf\/\d+/gi
        })
    }

    async exec(msg: Message, { match }: ILogsMatch) {
        let screenshotBuffer = await render(match[0]);

        msg.channel.send({
            files: [screenshotBuffer]
        });
    }
}