import { Command } from "discord-akairo";
import { Message, GuildMember, User } from "discord.js";
import { PrefixSupplier } from "discord-akairo";
import Language from "../../../languages/Language"

export default class PurgeCommand extends Command {
    constructor() {
        super("purge", {
            category: 'admin',
            aliases: ['purge'],
            userPermissions: ["MANAGE_MESSAGES"],
            clientPermissions: ["MANAGE_MESSAGES"],
            channel: "guild",
            args: [
                {
                    id: "amount",
                    type: "number",
                    limit: 100,
                    default: 10
                },
                {
                    id: "user",
                    type: "userMention",
                }
            ],
            ratelimit: 1000,
            cooldown: 1
        })
    }

    async exec(msg: Message, { amount, user }: { amount: number, user: User | GuildMember }) {
        const langset = this.client.settings.get(msg.guild?.id, "language", "english");
        const lang: Language = require(`../../../languages/${langset}`);

        await msg.channel.startTyping();

        await msg.delete();
        const startTime = Date.now();

        let channelMessages = await msg.channel.messages.fetch({
            limit: 100
        });

        if (user) {
            channelMessages = channelMessages.filter(foundMsg => {
                msg.channel.stopTyping(true);
                return msg.mentions.users.map(user => user.id).includes(foundMsg.author.id);
            });
        }

        channelMessages = channelMessages.filter(channelMessage => {
            return Date.now() - channelMessage.createdTimestamp < 1000 * 60 * 60 * 24 * 14;
        });

        const deletedMessages = await msg.channel.bulkDelete(channelMessages.map(channelMessage => channelMessage.id).slice(0, amount));

        msg.channel.stopTyping(true);
        await msg.channel.send(lang.purge_success.replace('%size', deletedMessages.size.toString()).replace('%sec', ((Date.now() - startTime) / 1000).toString()));
    }
}