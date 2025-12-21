import { Router } from "express";
import bcrypt from "bcrypt";
import { getDb } from "../db/mongo.js";

const router = Router();

router.post("/", async (req, res) => {
	const db = getDb();
	const users = db.collection("users");

	const { name, email, password } = req.body;

	const passwordHash = await bcrypt.hash(password, 10);

	const user = {
		name,
		email,
		passwordHash,
		createdAt: new Date(),
	};

	const result = await users.insertOne(user);

	res.status(201).json({
		_id: result.insertedId,
		name,
		email,
		createdAt: user.createdAt,
	});
});

export default router;
