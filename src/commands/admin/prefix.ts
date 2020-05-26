import { Command } from "discord-akairo";
import { Message } from "discord.js";
import { PrefixSupplier } from "discord-akairo";
import Language from "../../../languages/Language"
import { MessageEmbed } from "discord.js";
import colors from "../../misc/colors";

export default class Prefix extends Command {
    constructor() {
        super("prefix", {
            category: 'admin',
            channel: 'guild',
            aliases: ['prefix'],
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
        const lang: Language = require(`../../../languages/${langset}`);

        if (show) return await msg.channel.send(lang.prefix_default.replace('%prefix', prefixFromDB))

        if (!prefix) return await msg.channel.send(lang.prefix_set_fail_nonew)
        if (prefixFromDB === prefix) return await msg.channel.send(lang.prefix_set_fail_oldnew)

        await this.client.settings.set(msg.guild.id, "prefix", prefix)

        let embed = new MessageEmbed();
        embed.setAuthor(msg.author.tag, msg.author.displayAvatarURL());
        embed.setColor(colors.ADMIN);
        embed.setDescription(lang.prefix_set_success_embeddesc.replace('%prefix', prefix));
        embed.setTitle(lang.prefix_set_success_embedtitle.replace('%author', msg.author.tag));
        embed.setTimestamp();

        await msg.channel.send(embed)
    }
}