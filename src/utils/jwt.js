import jwt from "jsonwebtoken";

if (!process.env.JWT_SECRET) {
	throw new Error("JWT_SECRET is not set");
}

export function signToken(payload) {
	return jwt.sign(payload, process.env.JWT_SECRET, {
		expiresIn: "7d",
	});
}

export function verifyToken(token) {
	return jwt.verify(token, process.env.JWT_SECRET);
}
