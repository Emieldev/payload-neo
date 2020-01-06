import * as Discord from "discord.js";
import mongoose from "mongoose";
import { readdir } from "fs";
import { CommandConstructor } from "./lib/exec/Command";
import { AutoResponse, Client } from "./lib/types";
import { handleCommand, handleAutoCommand } from "./lib/manager";
import config from "./config";
import UserManager from "./lib/manager/UserManager";
import { getChangelog } from "./util/get-changelog";
import { pushNotification } from "./util/push-notification";
import Version, { saveVersion } from "./lib/external/Version";
import ServerManager from "./lib/manager/ServerManager";
import { initPrefixCache, getPrefixFromCache } from "./util/prefix";
import { ScheduledScript } from "./lib/types/ScheduledScripts";
import { handleMessageDelete, cleanCache } from "./util/snipe-cache";
import { version } from "./util/version_control";
import colors from "./lib/misc/colors";

const client: Client = new Discord.Client() as Client;
client.autoResponses = new Discord.Collection();
client.commands = new Discord.Collection();
client.scheduled = [];

client.userManager = new UserManager(client);
client.serverManager = new ServerManager(client);

client.cache = {
    prefix: {},
    snipe: {},
    pings: {},
};

mongoose.connect(config.MONGODB_URI, {
    useNewUrlParser: true
}).then(() => {
    console.log("Successfully connected to MongoDB.");
}).catch(() => {
    console.error("Error connecting to MongoDB. Make sure you used the correct password.");
    process.exit(1);
});


/**
 * Load schedules scripts.
 */
readdir(__dirname + "/scheduled", (err, files) => {
    if (err) {
        throw new Error("Error reading schedule directory: " + err);
    }

    console.log("Loading scheduled scripts...");

    files.forEach(file => {
        let script: ScheduledScript = require(__dirname + "/scheduled/" + file);

        client.scheduled.push(script);

        console.log("\tLoaded " + file);
    });
});

/**
 * Load commands.
 */
readdir(__dirname + "/preload/commands", (err, files) => {
    if (err) throw new Error("Error reading commands directory: " + err);

    console.log("Loading commands...");

    files.forEach(folder => {
        const commandInit: CommandConstructor = require(__dirname + "/preload/commands/" + folder).default;
        let command = new commandInit();

        if (!command.name) return console.warn("\t" + folder + " is not a valid command module.");

        client.commands.set(command.name, command);

        console.log("\tLoaded " + command.name);
    });
});

/**
 * Load auto commands.
 */
readdir(__dirname + "/preload/auto", (err, files) => {
    if (err) throw new Error("Error reading automatic responses directory: " + err);

    console.log("Loading autoresponses...");

    files.forEach(file => {
        let autoResponse: AutoResponse = require(__dirname + "/preload/auto/" + file);

        if (!autoResponse.name) return console.warn("\tFile " + file + " is not a valid autoresponse module.");

        client.autoResponses.set(autoResponse.name, autoResponse);

        console.log("\tLoaded " + autoResponse.name);
    });
});

client.on("messageDelete", msg => {
    handleMessageDelete(client, msg);
    cleanCache(client, msg);
});

client.on("messageUpdate", (oldMsg, newMsg) => {
    handleMessageDelete(client, oldMsg);
    cleanCache(client, oldMsg);
    if (oldMsg.content.startsWith(getPrefixFromCache(oldMsg.guild.id))) client.emit("message", (newMsg));
});


client.on("message", async msg => {
    let didhandleCommand = await handleCommand(client, msg);
    if (!didhandleCommand) await handleAutoCommand(client, msg);
});

client.on("error", error => {
    const channel = client.channels.get(config.info.errorChannel) as Discord.TextChannel;
    channel.send(null, {
        embed: {
            color: colors.red,
            timestamp: new Date(),
            title: 'Error',
            description: error.stack ? `\`\`\`x86asm\n${error.stack}\n\`\`\`` : `\`${error.toString()}\``
        }
    });
});

client.on("warn", (error, name) => {
    const channel = client.channels.get(config.info.errorChannel) as Discord.TextChannel;
    channel.send(null, {
        embed: {
            color: colors.red,
            timestamp: new Date(),
            title: `Warning: ${name}`,
            description: `\`\`\`${error}\`\`\``
        }
    });
});

client.on("log", item => {
    const channel = client.channels.get(config.info.errorChannel) as Discord.TextChannel;
    channel.send(null, {
        embed: {
            color: colors.green,
            timestamp: new Date(),
            title: `Event logger`,
            description: `\`\`\`${item}\`\`\``
        }
    });
})

client.on("ready", async () => {
    console.log(`Logged in as ${client.user.tag}, on ${client.guilds.size} guilds, serving ${client.users.size} users`);
    client.user.setActivity(`!invite | v${version}`);
    initPrefixCache();
    console.log("Done initial cacheing prefixes.");

    let waitingInterval: NodeJS.Timeout;
    waitingInterval = setInterval(async () => {
        clearInterval(waitingInterval);

        // Run scheduled scripts
        for (let i = 0; i < client.scheduled.length; i++) {
            let script = client.scheduled[i];

            if (script.every < 0) script.run(client);
            else setInterval(() => script.run(client), script.every);
        }

        let guilds = client.guilds.array();

        let changelog = getChangelog(version);

        if (!changelog) return console.warn("Error fetching changelog!");

        let startUpVersion = await Version();

        if (startUpVersion != undefined && startUpVersion == version) console.log("No new version.");
        else {
            try {
                const channel = await client.channels.get(config.info.logChannel) as Discord.TextChannel;
                if (channel) channel.send("```md\n" + changelog + "\n```");
            } catch (error) {
                console.log("Could not find channel.");
            }

            for (let i = 0; i < guilds.length; i++) {
                let notif = await pushNotification(client, guilds[i].ownerID, 2, new Discord.RichEmbed({
                    title: `${client.user.username} updated to v${version}!`,
                    description: `A new update has been released to ${client.user.username}!\nTo opt-out of these update notifications, type ${config.PREFIX}config notifications 1 in DM's.`,
                    fields: [
                        {
                            name: "Changelog",
                            value: `\`\`\`\n${changelog}\n\`\`\``
                        }
                    ],
                    footer: {
                        text: `To find out more on how to opt out of these notifications, type ${config.PREFIX}help config notifications.`
                    }
                }), version);
                console.log(`Notification: ${guilds[i].ownerID} | ${notif} | ${i + 1} of ${guilds.length}`);
            }
            await saveVersion(version);
        }
    }, 1000);
});

client.on("error", console.warn);

export default client;