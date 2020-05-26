import { Command } from "discord-akairo";
import { Message } from "discord.js";
import { User } from "../../models/User";
import { weightedRandom } from "../../util/random";
import { Server } from "../../models/Server";
import Language from "../../../languages/Language";

interface IUser {
    feetPushed: number,
    pushedToday: number,
    lastPushed: number,
    lastActiveDate: number
}

export default class PushcartCommand extends Command {
    MAX_POINTS: number;
    constructor() {
        super("pushcart", {
            category: 'pushcart',
            aliases: ["pushcart", "pushkart", "pchajwozek", "empuja"],
            channel: 'guild'
        })

        this.MAX_POINTS = 1000;
    }

    private async addCartFeet(units: number, user: IUser, id: string): Promise<"SUCCESS" | "COOLDOWN" | "CAP"> {
        if (Date.now() - user.lastPushed < 1000 * 30) return "COOLDOWN";

        if (user.pushedToday >= this.MAX_POINTS) {
            if (user.lastActiveDate != (new Date()).getDate()) {
                user.pushedToday = 0;
            }
            else return "CAP";
        }

        user.feetPushed += units;
        user.pushedToday += units;
        user.lastPushed = Date.now();
        user.lastActiveDate = (new Date()).getDate();

        await this.client.settings.set(id, "user.fun.payload", user);

        return "SUCCESS";
    }

    async exec(msg: Message) {
        let lang: Language;
        switch (msg.util.parsed.alias) {
            case "pushcart":
                lang = require(`../../../languages/english`);
                break;
            case "pushkart":
                lang = require(`../../../languages/russian`);
                break;
            case "pchajwozek":
                lang = require(`../../../languages/polish`);
                break;
            case "empuja":
                lang = require(`../../../languages/spanish`);
                break;
        }

        let user: IUser = this.client.settings.get(msg.author.id, "fun.payload", new User({
            id: msg.author.id,
            fun: {
                payload: {
                    feetPushed: 0,
                    pushedToday: 0,
                    lastPushed: new Date,
                    lastActiveDate: (new Date).getDate()
                }
            }
        }));

        let serverFeetPushed: number = this.client.settings.get(msg.guild.id, "fun.payloadFeetPushed", new Server({
            id: msg.guild.id,
            fun: {
                payloadFeetPushed: 0
            }
        }));

        const numberToPush = weightedRandom([
            { number: 3, weight: 2 },
            { number: 4, weight: 3 },
            { number: 5, weight: 5 },
            { number: 6, weight: 8 },
            { number: 7, weight: 16 },
            { number: 8, weight: 16 },
            { number: 9, weight: 16 },
            { number: 10, weight: 16 },
            { number: 11, weight: 18 },
            { number: 12, weight: 18 },
            { number: 13, weight: 16 },
            { number: 14, weight: 8 },
            { number: 15, weight: 5 },
            { number: 16, weight: 3 },
            { number: 17, weight: 2 },
        ]);

        const result = await this.addCartFeet(numberToPush, user, msg.author.id);

        if (result === "CAP") return msg.channel.send(lang.pushcart_fail_maxpoints);

        if (result === "COOLDOWN") {
            const secondsRemaining = Math.round(((user.lastPushed + 1000 * 30) - Date.now()) / 1000);
            return msg.channel.send(lang.pushcart_fail_cooldown.replace("%time", secondsRemaining.toString()));
        }

        const numberPushed: number = serverFeetPushed + numberToPush;

        await this.client.settings.set(msg.guild.id, "fun.payloadFeetPushed", numberPushed);

        await msg.channel.send(lang.pushcart_success.replace('%units', numberToPush.toString()).replace('%total', numberPushed.toString()));
    }
}