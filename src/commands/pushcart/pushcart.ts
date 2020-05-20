import { Command } from "discord-akairo";
import { Message } from "discord.js";
import { User } from "../../models/User";
import { weightedRandom } from "../../util/random";
import { Server } from "../../models/Server";

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
            aliases: ["pushcart", "pushkart", "pchajwozek", "empujacarritos"],
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
        const langset = this.client.settings.get(msg.guild?.id, "language", "en-US");
        const lang = require(`../../../languages/${langset}`);

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

        const secondsRemaining = Math.round(((user.lastPushed + 1000 * 30) - Date.now()) / 1000);
        if (result === "COOLDOWN") return msg.channel.send(lang.pushcart_fail_cooldown.replace("%time", secondsRemaining));

        const numberPushed: number = serverFeetPushed + numberToPush;

        await this.client.settings.set(msg.guild.id, "fun.payloadFeetPushed", numberPushed);

        switch (msg.util.parsed.alias) {
            case "pushcart":
                await msg.channel.send(lang.pushcart_success.replace('%units', numberToPush).replace('%total', numberPushed));
                break;

            case "pushkart":
                await msg.channel.send(lang.pushkart_success.replace('%units', numberToPush).replace('%total', numberPushed));
                break;

            case "pchajwozek":
                await msg.channel.send(lang.pchajwozek_success.replace('%units', numberToPush).replace('%total', numberPushed));
                break;
            case "empujacarritos":
                await msg.channel.send(lang.empujacarritos_success.replace('%units', numberToPush).replace('%total', numberPushed));
                break;
        }
    }
}