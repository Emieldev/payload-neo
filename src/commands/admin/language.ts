import { Command } from "discord-akairo";
import { Message } from "discord.js";
import Language from "../../../languages/Language";
import { MessageEmbed } from "discord.js";
import colors from "../../misc/colors";

export default class LanguageCommand extends Command {
    constructor() {
        super("language", {
            category: 'admin',
            channel: 'guild',
            aliases: ['language', 'lang'],
            args: [
                {
                    id: "language",
                    type: ["english", "spanish", "polish", "finnish"]
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

    async exec(msg: Message, { language, show }: { language: string, show: boolean }) {
        const langset: string = this.client.settings.get(msg.guild?.id, "language", "english");
        const lang: Language = require(`../../../languages/${langset}`);

        if (show) return await msg.channel.send(lang.language_default.replace('%language', langset));

        if (!language) return await msg.channel.send(lang.language_set_fail_nonew);
        if (language === langset) return await msg.channel.send(lang.language_set_fail_oldnew);

        await this.client.settings.set(msg.guild.id, "language", language);

        const newLangSet: string = this.client.settings.get(msg.guild?.id, "language", "english");
        const newLang: Language = require(`../../../languages/${newLangSet}`);

        const embed = new MessageEmbed();
        embed.setAuthor(msg.author.tag, msg.author.displayAvatarURL());
        embed.setDescription(newLang.language_set_success_embeddesc.replace('%language', language));
        embed.setTitle(newLang.language_set_success_embedtitle.replace('%author', msg.author.tag));
        embed.setTimestamp();
        embed.setColor(colors.ADMIN);

        await msg.channel.send(embed);
    }
}