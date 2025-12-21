import { Router } from "express";
import bcrypt from "bcrypt";
import { getDb } from "../db/mongo.js";
import { signToken } from "../utils/jwt.js";

const router = Router();

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
