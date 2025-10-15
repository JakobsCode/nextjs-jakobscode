import { betterAuth } from "better-auth";
import { MongoClient } from "mongodb";
import { mongodbAdapter } from "better-auth/adapters/mongodb";
import { apiKey } from "better-auth/plugins";

const client = new MongoClient(process.env.MONGO_DB_URL as string);
export const db = client.db();

export const auth = betterAuth({
    database: mongodbAdapter(db, {
        client
    }),
    socialProviders: {
        google: { 
            accessType: "offline", 
            prompt: "select_account consent", 
            clientId: process.env.GOOGLE_CLIENT_ID as string, 
            clientSecret: process.env.GOOGLE_CLIENT_SECRET as string, 
        }, 
    },
    plugins: [ 
        apiKey() 
    ] 
});