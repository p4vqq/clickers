import { MongoClient } from 'mongodb';

declare global {
    var _mongoClientPromise: Promise<MongoClient>;
}

const uri = process.env.MONGODB_URI;
if (!uri) {
    throw new Error('Пожалуйста, добавьте MONGODB_URI в .env.local');
}

const options = {};

let client: MongoClient;
let clientPromise: Promise<MongoClient>;

if (process.env.NODE_ENV === 'development') {
    if (!global._mongoClientPromise) {
        client = new MongoClient(uri, options);
        global._mongoClientPromise = client.connect();
    }
    clientPromise = global._mongoClientPromise;
} else {
    client = new MongoClient(uri, options);
    clientPromise = client.connect();
}

export async function connectToDatabase() {
    const client = await clientPromise;
    return client.db('название_вашей_базы_данных');
}