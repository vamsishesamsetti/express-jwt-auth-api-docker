import "dotenv/config";
import express from "express";
import cors from "cors";
import helmet from "helmet";
import rateLimit from "express-rate-limit";
import { ZodError } from "zod";
import authRoutes from "./routes/auth.js";

const app = express();

app.use(helmet());
app.use(cors({ origin: process.env.CORS_ORIGIN || "*", credentials: true }));
app.use(express.json());

const authLimiter = rateLimit({ windowMs: 60_000, max: 20 });

app.get("/health", (_req, res) => res.json({ ok: true, ts: new Date().toISOString() }));

app.use("/api/auth", authLimiter, authRoutes);

app.use((_req, res) => res.status(404).json({ error: "Not found" }));

app.use((err, _req, res, _next) => {
  if (err instanceof ZodError) {
    return res.status(400).json({ error: "ValidationError", details: err.errors });
  }
  console.error(err);
  res.status(err.status || 500).json({ error: err.message || "Internal error" });
});

const PORT = Number(process.env.PORT) || 4000;
app.listen(PORT, () => console.log(`API listening on :${PORT}`));
