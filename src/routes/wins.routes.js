import { Router } from "express";
import { ObjectId } from "mongodb";
import { getDb } from "../db/mongo.js";
import { authRequired } from "../middleware/auth.middleware.js";

const router = Router();

/**
 * READ all wins (PUBLIC Wall of Fame)
 * GET /api/wins
 */
router.get("/", async (req, res) => {
	try {
		const db = getDb();
		const wins = db.collection("wins");

		const result = await wins.find({}).sort({ createdAt: -1 }).toArray();

		res.json(result.map((w) => ({ ...w, userId: w.userId.toString() })));
	} catch (err) {
		res.status(500).json({ error: "Failed to fetch wins" });
	}
});

/**
 * CREATE win (AUTH)
 * POST /api/wins
 */
router.post("/", authRequired, async (req, res) => {
	const db = getDb();
	const wins = db.collection("wins");

	const {
		title,
		description = "",
		category = "general",
		proofUrl = "",
	} = req.body;

	if (!title || title.length < 3) {
		return res
			.status(400)
			.json({ error: "Title must be at least 3 characters" });
	}

	const win = {
		userId: new ObjectId(req.auth.userId),
		title,
		description,
		category,
		proofUrl,
		createdAt: new Date(),
	};

	const result = await wins.insertOne(win);

	res.status(201).json({
		_id: result.insertedId,
		...win,
		userId: win.userId.toString(),
	});
});

/**
 * READ own wins (AUTH)
 * GET /api/wins/me
 */
router.get("/me", authRequired, async (req, res) => {
	const db = getDb();
	const wins = db.collection("wins");

	const userId = new ObjectId(req.auth.userId);

	const result = await wins.find({ userId }).sort({ createdAt: -1 }).toArray();

	res.json(result.map((w) => ({ ...w, userId: w.userId.toString() })));
});

/**
 * UPDATE win (AUTH)
 * PUT /api/wins/:id
 */
router.put("/:id", authRequired, async (req, res) => {
	const db = getDb();
	const wins = db.collection("wins");

	const { id } = req.params;

	if (!ObjectId.isValid(id)) {
		return res.status(400).json({ error: "Invalid win id" });
	}

	const win = await wins.findOne({ _id: new ObjectId(id) });
	if (!win) {
		return res.status(404).json({ error: "Win not found" });
	}

	if (win.userId.toString() !== req.auth.userId) {
		return res.status(403).json({ error: "Not your win" });
	}

	const { title, description, category, proofUrl } = req.body;

	await wins.updateOne(
		{ _id: win._id },
		{
			$set: {
				title: title ?? win.title,
				description: description ?? win.description,
				category: category ?? win.category,
				proofUrl: proofUrl ?? win.proofUrl,
			},
		}
	);

	res.json({ message: "Win updated" });
});

/**
 * DELETE win (AUTH)
 * DELETE /api/wins/:id
 */
router.delete("/:id", authRequired, async (req, res) => {
	const db = getDb();
	const wins = db.collection("wins");

	const { id } = req.params;

	if (!ObjectId.isValid(id)) {
		return res.status(400).json({ error: "Invalid win id" });
	}

	const win = await wins.findOne({ _id: new ObjectId(id) });
	if (!win) {
		return res.status(404).json({ error: "Win not found" });
	}

	if (win.userId.toString() !== req.auth.userId) {
		return res.status(403).json({ error: "Not your win" });
	}

	await wins.deleteOne({ _id: win._id });
	res.json({ message: "Win deleted" });
});

export default router;
