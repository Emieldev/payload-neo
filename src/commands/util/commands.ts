import { Command } from "discord-akairo";
import { Message } from "discord.js";
import { MessageEmbed } from "discord.js";
import colors from "../../misc/colors";
import { PrefixSupplier } from "discord-akairo";

export default class CommandsCommand extends Command {
    constructor() {
        super("commands", {
            category: 'util',
            aliases: ["commands", "c"],
        })
    }

    async exec(msg: Message) {
        const prefix = this.client.settings.get(msg.guild?.id, "prefix", (this.handler.prefix as PrefixSupplier)(msg));
        const langset = this.client.settings.get(msg.guild?.id, "language", "english");
        const lang = require(`../../../languages/${langset}`);

        const embed = new MessageEmbed();
        let commandArray = [];
        let autoCommandArray = [];

        for (const category of this.handler.categories.values()) {
            if (category.id === "auto") {
                const auto = category.map(cmd => `\`${cmd.description.name}\``);
                autoCommandArray.push(auto);
            } else {
                const regular = category.filter((cmd) => cmd.aliases.length > 0).map((cmd) => `\`${cmd.aliases[0]}\``)
                commandArray.push(regular);
            }
        }

        embed.setTitle(lang.commands_embedtitle);
        embed.addField(lang.commands_commands, commandArray.join(", "));
        embed.addField(lang.commands_autoresponses, autoCommandArray.join(", "));
        embed.setFooter(lang.commands_embedfooter.replace("%prefix", prefix));
        embed.setColor(colors.COMMAND);

        return msg.util.send(embed);
    }
}