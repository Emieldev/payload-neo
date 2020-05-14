import { Command } from "discord-akairo";
import { Message } from "discord.js";
import { PrefixSupplier } from "discord-akairo";
import { UserModel, User } from "../../models/User";
import { weightedRandom } from "../../util/random";
import { ServerModel, Server } from "../../models/Server";

export default class PushcartCommand extends Command {
    MAX_POINTS: number;
    constructor() {
        super("pushcart", {
            category: 'pushcart',
            aliases: ["pushcart", "pushkart", "pchajwozek"],
            channel: 'guild',
            ratelimit: 1,
            cooldown: 30000,
        })
        this.MAX_POINTS = 1000;
    }

    async exec(msg: Message) {
        const langset = this.client.settings.get(msg.guild?.id, "language", "en-US");
        const prefix = this.client.settings.get(msg.guild?.id, "prefix", (this.handler.prefix as PrefixSupplier)(msg));
        const lang = require(`../../../languages/${langset}`);

        let user: UserModel;
        let server: ServerModel;
        user = this.client.settings.get(msg.author.id, "fun.payload", new User({
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

        server = this.client.settings.get(msg.guild.id, "fun.payloadFeetPushed", new Server({
            id: msg.guild.id,
            fun: {
                payloadFeetPushed: 0
            }
        }));

        console.log(user, server);

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
    }
}