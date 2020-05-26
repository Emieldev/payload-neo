import { Command } from "discord-akairo";
import { Message } from "discord.js";
import { MessageEmbed } from "discord.js";
import colors from "../../misc/colors";
import { PrefixSupplier } from "discord-akairo";
import Language from "../../../languages/Language";

export default class HelpCommand extends Command {
    constructor() {
        super("help", {
            category: 'util',
            aliases: ["help", "h"],
            args: [
                {
                    id: "command",
                    type: "commandAlias"
                }
            ],
            description: {
                usage: "[command]"
            }
        })
    }

    async exec(msg: Message, { command }: { command: Command }) {
        const langset = this.client.settings.get(msg.guild?.id, "language", "english");
        const prefix = this.client.settings.get(msg.guild?.id, "prefix", (this.handler.prefix as PrefixSupplier)(msg));
        const lang: Language = require(`../../../languages/${langset}`);
        const embed = new MessageEmbed();
        
        if (!command) {
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

        const usage = `${prefix}${command.aliases[0]} ${command.description.usage}`;

        const perms = `# ${lang.help_embedpermsuser} #\n${command.userPermissions ?? "SEND_MESSAGES"}\n\n# ${lang.help_embedpermsbot} #\n${command.clientPermissions ?? "SEND_MESSAGES"}`;
        const permsEmbed = `\`\`\`md\n${perms}\`\`\``;

        embed.setTitle(command.aliases[0] ?? command.description.name);
        embed.setDescription(lang[command.aliases[0]] ?? lang.commands_nosetdescription);
        if (command.description.usage) embed.addField(lang.help_embedusage, usage);
        if (command.aliases.length > 1) embed.addField(lang.help_embedaliases, command.aliases.map(a => a).join(", "));
        embed.addField(lang.help_embedpermissionshead, permsEmbed);
        embed.setFooter(lang.help_embedfooter.replace("%requester", msg.author.tag).replace("%prefix", prefix));
        embed.setColor(colors.COMMAND);

        msg.util.send(embed);
    }
}