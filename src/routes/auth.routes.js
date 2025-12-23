import { Router } from "express";
import bcrypt from "bcrypt";
import { getDb } from "../db/mongo.js";
import { signToken } from "../utils/jwt.js";

const router = Router();

router.post("/register", async (req, res) => {
	const db = getDb();
	const users = db.collection("users");

	const { email, password } = req.body;

	// basic validation
	if (!email || !password || password.length < 3) {
		return res.status(400).json({
			error: "Email and password required (min 3 chars)",
		});
	}

	// check if user exists
	const existingUser = await users.findOne({ email });
	if (existingUser) {
		return res.status(409).json({
			error: "User already exists",
		});
	}

	// hash password
	const passwordHash = await bcrypt.hash(password, 10);

	const result = await users.insertOne({
		email,
		passwordHash,
		createdAt: new Date(),
	});

	// auto-login after register (nice UX)
	const token = signToken({
		userId: result.insertedId.toString(),
		email,
	});

	res.status(201).json({
		message: "User registered",
		token,
	});
});

router.post("/login", async (req, res) => {
	const db = getDb();
	const users = db.collection("users");

	const { email, password } = req.body;

	const user = await users.findOne({ email });
	if (!user) {
		return res.status(401).json({ error: "Invalid credentials" });
	}

	const ok = await bcrypt.compare(password, user.passwordHash);
	if (!ok) {
		return res.status(401).json({ error: "Invalid credentials" });
	}

	const token = signToken({
		userId: user._id.toString(),
		email: user.email,
	});

	res.json({
		token,
		user: {
			_id: user._id,
			name: user.name,
			email: user.email,
		},
	});
});

export default router;
