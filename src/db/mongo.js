import { MongoClient } from "mongodb";

const uri = process.env.MONGODB_URI;

let client;
let db;

export async function connectMongo() {
	if (!uri) {
		throw new Error("MONGODB_URI missing");
	}

	client = new MongoClient(uri);
	await client.connect();
	db = client.db();

	console.log("MongoDB connected");
}

export function getDb() {
	if (!db) {
		throw new Error("MongoDB not connected");
	}
	return db;
}
