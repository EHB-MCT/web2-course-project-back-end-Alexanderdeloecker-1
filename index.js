import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import { MongoClient, ObjectId } from "mongodb";
import bcrypt from "bcrypt";

dotenv.config();

console.log(">>> INDEX.JS IS RUNNING <<<");

const app = express();
const port = process.env.PORT || 3000;

// --------------------
// MIDDLEWARE
// --------------------
app.use(cors());
app.use(express.json());

// log ALLE inkomende requests (super belangrijk voor debugging)
app.use((req, res, next) => {
	console.log(`>>> INCOMING ${req.method} ${req.url}`);
	next();
});

// --------------------
// MONGO
// --------------------
const client = new MongoClient(process.env.MONGO_URI);
let db;
let usersCollection;
let winsCollection;

// --------------------
// TEST ROUTE
// --------------------
app.get("/", (req, res) => {
	res.send("Wall of Fame API is running");
});

// --------------------
// USERS
// --------------------
console.log(">>> REGISTERING ROUTES <<<");

// CREATE USER
console.log(">>> REGISTER POST /api/users <<<");
app.post("/api/users", async (req, res) => {
	console.log(">>> HIT POST /api/users <<<");

	try {
		const { name, email, password } = req.body;

		if (!name || !email || !password) {
			return res.status(400).json({
				message: "name, email and password are required",
			});
		}

		const existingUser = await usersCollection.findOne({ email });
		if (existingUser) {
			return res.status(409).json({
				message: "User already exists",
			});
		}

		const passwordHash = await bcrypt.hash(password, 10);

		const newUser = {
			name,
			email,
			passwordHash,
			createdAt: new Date(),
		};

		const result = await usersCollection.insertOne(newUser);

		res.status(201).json({
			id: result.insertedId,
			name,
			email,
		});
	} catch (error) {
		console.error("ERROR IN POST /api/users", error);
		res.status(500).json({
			message: "Failed to create user",
		});
	}
});

// GET ALL USERS (test / later frontend)
app.get("/api/users", async (req, res) => {
	console.log(">>> HIT GET /api/users <<<");

	try {
		const users = await usersCollection
			.find({}, { projection: { passwordHash: 0 } })
			.toArray();

		res.json(users);
	} catch (error) {
		console.error("ERROR IN GET /api/users", error);
		res.status(500).json({ message: "Failed to fetch users" });
	}
});

// --------------------
// START SERVER
// --------------------
async function startServer() {
	try {
		await client.connect();
		console.log("Connected to MongoDB");

		db = client.db("wallOfFame");
		usersCollection = db.collection("users");
		winsCollection = db.collection("wins");

		console.log("Collections ready: users, wins");

		app.listen(port, () => {
			console.log(`Server running on http://localhost:${port}`);
		});
	} catch (error) {
		console.error("Failed to start server:", error);
	}
}

startServer();
