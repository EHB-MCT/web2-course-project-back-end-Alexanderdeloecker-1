import { Router } from "express";
import { ObjectId } from "mongodb";
import { getDb } from "../db/mongo.js";
import { authRequired } from "../middleware/auth.middleware.js";
import cloudinary from "../utils/cloudinary.js";
import { upload } from "../middleware/upload.middleware.js";

const router = Router();

/* ---------------- HELPERS ---------------- */
const winWithUserPipeline = [
	{
		$lookup: {
			from: "users",
			localField: "userId",
			foreignField: "_id",
			as: "user",
		},
	},
	{
		$unwind: {
			path: "$user",
			preserveNullAndEmptyArrays: true,
		},
	},
	{
		$project: {
			title: 1,
			description: 1,
			category: 1,
			imageUrl: 1,
			createdAt: 1,
			userId: 1,
			"user._id": 1,
			"user.name": 1,
		},
	},
];

/**
 * READ all wins (PUBLIC Wall of Fame)
 * GET /api/wins
 */
router.get("/", async (req, res) => {
	try {
		const db = getDb();
		const wins = db.collection("wins");

		const result = await wins
			.aggregate([{ $sort: { createdAt: -1 } }, ...winWithUserPipeline])
			.toArray();

		res.json(
			result.map((w) => ({
				...w,
				userId: w.userId.toString(),
				user: w.user ? { ...w.user, _id: w.user._id.toString() } : null,
			}))
		);
	} catch (err) {
		res.status(500).json({ error: "Failed to fetch wins" });
	}
});

/**
 * CREATE win (AUTH)
 * POST /api/wins
 */
router.post("/", authRequired, upload.single("image"), async (req, res) => {
	const db = getDb();
	const wins = db.collection("wins");

	const { title, description = "", category = "general" } = req.body;

	if (!title || title.length < 3) {
		return res
			.status(400)
			.json({ error: "Title must be at least 3 characters" });
	}

	let imageUrl = "";

	if (req.file) {
		const result = await cloudinary.uploader.upload(
			`data:${req.file.mimetype};base64,${req.file.buffer.toString("base64")}`,
			{ folder: "wall-of-fame" }
		);
		imageUrl = result.secure_url;
	}

	const win = {
		userId: new ObjectId(req.auth.userId),
		title,
		description,
		category,
		imageUrl,
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
	try {
		const db = getDb();
		const wins = db.collection("wins");

		const userId = new ObjectId(req.auth.userId);

		const result = await wins
			.aggregate([
				{ $match: { userId } },
				{ $sort: { createdAt: -1 } },
				...winWithUserPipeline,
			])
			.toArray();

		res.json(
			result.map((w) => ({
				...w,
				userId: w.userId.toString(),
				user: w.user ? { ...w.user, _id: w.user._id.toString() } : null,
			}))
		);
	} catch (err) {
		res.status(500).json({ error: "Failed to fetch user wins" });
	}
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
	if (!win) return res.status(404).json({ error: "Win not found" });

	if (win.userId.toString() !== req.auth.userId) {
		return res.status(403).json({ error: "Not your win" });
	}

	const { title, description, category, imageUrl } = req.body;

	await wins.updateOne(
		{ _id: win._id },
		{
			$set: {
				title: title ?? win.title,
				description: description ?? win.description,
				category: category ?? win.category,
				imageUrl: imageUrl ?? win.imageUrl,
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
	try {
		const db = getDB();
		const wins = db.collection("wins");
		const { id } = req.params;

		if (!ObjectId.isValid(id)) {
			return res.status(400).json({ error: "Invalid win id" });
		}

		const win = await wins.findOne({ _id: new ObjectId(id) });
		if (!win) {
			return res.status(404).json({ error: "Win not found" });
		}

		const winUserId =
			typeof win.userId === "string" ? win.userId : win.userId.toString();

		if (winUserId !== req.auth.userId) {
			return res.status(403).json({ error: "Not your win" });
		}

		await wins.deleteOne({ _id: new ObjectId(id) });

		return res.status(200).json({ message: "Win deleted" });
	} catch (err) {
		console.error("DELETE /wins crash:", err);
		return res.status(500).json({ error: "Server error" });
	}
});

export default router;
