import express from "express";
import cors from "cors";
import dotenv from "dotenv";

import { connectMongo } from "./db/mongo.js";
import authRoutes from "./routes/auth.routes.js";
import usersRoutes from "./routes/users.routes.js";
import winsRoutes from "./routes/wins.routes.js";

dotenv.config();

const app = express();

// middleware
app.use(cors());
app.use(express.json());

// routes
app.use("/api/auth", authRoutes);
app.use("/api/users", usersRoutes);
app.use("/api/wins", winsRoutes);

// health check (handig voor Render)
app.get("/", (req, res) => {
	res.json({ status: "API is running" });
});

const PORT = process.env.PORT || 3000;

// connect DB first, then start server
connectMongo().then(() => {
	app.listen(PORT, () => {
		console.log(`API running on port ${PORT}`);
	});
});
