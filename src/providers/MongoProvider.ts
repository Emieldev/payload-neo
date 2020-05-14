import { Provider } from "discord-akairo";
import { Document, connect } from "mongoose";

import { Server, ServerModel } from "../models/Server";
import { User, UserModel } from "../models/User";

import { MongoProviderOptions } from "../misc/MongoProviderOptions";

/** Custom-built MongoDB provider
 * @extends {Provider}
 */
export default class MongoProvider extends Provider {
    private message: string;
    private uri: string;
    private models: Array<string>;

    /**
     * The MongoDB Database provider constructor
     * @param {String} uri MongoDB URI
     * @param {MongoProviderOptions} options Options to pass into the provider
     */
    public constructor(uri: string, options?: MongoProviderOptions) {
        super();

        this.uri = uri;

        const {
            modelNames,
            message = "Successfully connected to MongoDB."
        } = options || {};

        this.message = message;

        if (modelNames) this.models = modelNames;
    }

    public async init(): Promise<void> {
        try {
            await connect(this.uri, {
                useNewUrlParser: true,
                useUnifiedTopology: true
            }).then((database) => {
                if (!this.models) this.models = database.modelNames();
                console.log(this.message);
            });
        } catch (e) {
            throw new Error("Error connecting to MongoDB. Make sure you used the correct password.");
        }

        if (!this.models || this.models.length <= 0) throw new Error("Could not load Models. Check your Mongo database and ensure that your models are present, or pass them into the options yourself.");

        try {
            this.models.forEach(async model => {
                const data = require(`../models/${model}`);
                const modelFunction: any = Object.values(data)[0];
                const dbInfo = await modelFunction.find();

                for (const item of dbInfo) {
                    this.items.set(item.id, item);
                }
            });
        } catch (er) {
            throw new Error("Error while obtaining database information: " + er);
        }
    }

    /**
     * Ensures a Server Model is returned.
     * @param {String} guild Guild ID
     * @returns {ServerModel} ServerModel
     * @async true
     */
    public async ensureServer(guild: string): Promise<ServerModel> {
        if (this.items.get(guild)) return this.items.get(guild) as ServerModel;
        let server: ServerModel | null;
        server = await Server.findOne({ id: guild });

        if (!server) {
            server = new Server({
                id: guild
            });
        }

        this.items.set(guild, server);

        return server;
    }

    /**
     * Ensures a User Model is returned.
     * @param {String} userid A Discord user's ID
     * @returns {UserModel} ServerModel
     * @async true
     */
    public async ensureUser(userid: string): Promise<UserModel> {
        if (this.items.get(userid)) return this.items.get(userid) as UserModel
        let user: UserModel | null;
        user = await User.findOne({ id: userid });

        if (!user) {
            user = new User({
                id: userid
            });
        }

        this.items.set(userid, user);

        return user;
    }

    /**
     * Gets a specified value from the Mongo database.
     * @param {String} key An ID to find
     * @param value The value to get
     * @param defaultValue A default value to specify
     * @returns {*} value
     */
    public get(key: string, value: any, defaultValue: any = undefined): string | any {
        if (this.items.has(key)) {
            if (value.split('.').length == 1) return this.items.get(key)[value] ?? defaultValue;
            const props = value.split('.');

            let search = this.items.get(key);
            for (let i in props) {
                search = search[props[i]];
            }
            return search ?? defaultValue;
        }
        return defaultValue;
    }

    /**
     * Sets a specified value to the Mongo database.
     * @param key The id of a user/guild
     * @param property The property to change
     * @param value The value to set
     * @async true
     */
    public async set(key: string, property: any, value: any): Promise<Document> {
        let document: Document = this.items.get(key) || {};
        if (property.split('.').length == 1) {
            document[property] = value;
        } else {
            const props: Array<any> = property.split('.');
            let ref: Document = document;
            for (let i = 0; i < props.length - 1; i++) {
                let elem = props[i];
                if (!ref[elem]) ref[elem] = {}
                ref = ref[elem];
            }
            ref[props[props.length - 1]] = value;
        }

        await document.save()
        this.items.set(key, document);
        return document;
    }

    /**
     * Wipes out a specified ID from the database.
     * @param id The ID to clear
     * @async true
     */
    public async clear(id: string): Promise<void> {
        const document: Document = this.items.get(id);

        this.items.delete(id);
        await document.remove();
    }

    /**
     * Deletes the value at a key
     * @param {String} key An ID of a user/guild
     * @param {String} value The value to delete
     * @async true
     */
    public async delete(key: string, value: string): Promise<void> {
        await this.set(key, value, undefined);
    }
}