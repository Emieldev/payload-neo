import MongoProvider from "../providers/MongoProvider";

declare module "discord-akairo" {
    interface AkairoClient {
        settings: MongoProvider
    }
}
