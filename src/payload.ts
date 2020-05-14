import PayloadClient from "./client/PayloadClient"

const start = async () => {
    const client = new PayloadClient();
    await client.start();
}

start();
