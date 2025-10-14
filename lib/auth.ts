import { betterAuth } from "better-auth";
import { MongoClient } from "mongodb";
import { mongodbAdapter } from "better-auth/adapters/mongodb";
import { oneTap } from "better-auth/plugins";

const client = new MongoClient("mongodb://localhost:27017/jakobscode");
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
        oneTap(),
    ]
});