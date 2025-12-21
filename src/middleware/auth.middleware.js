import { verifyToken } from "../utils/jwt.js";

export function authRequired(req, res, next) {
	const header = req.headers.authorization;

	if (!header || !header.startsWith("Bearer ")) {
		return res
			.status(401)
			.json({ error: "Missing or invalid Authorization header" });
	}

	const token = header.split(" ")[1];

	try {
		req.auth = verifyToken(token);
		next();
	} catch (err) {
		return res.status(401).json({ error: "Invalid or expired token" });
	}
}
