import "dotenv/config";

import Fastify from "fastify";
import { db } from "./db/index.js";
import { sql } from "drizzle-orm";
import authRoutes from "./routes/auth.js";
import cors from "@fastify/cors";
import rateLimit from "@fastify/rate-limit";
import fastifyJwt from "@fastify/jwt";
import bookmarkRoutes from "./routes/bookmarks.js";

const JWT_SECRET = process.env.JWT_SECRET;
const FRONTEND_URL = process.env.FRONTEND_URL;

if (!FRONTEND_URL) {
  throw new Error("FRONTEND_URL environment variable is not set");
}

if (!JWT_SECRET) {
  throw new Error("JWT_SECRET environment variable is not set");
}

const fastify = Fastify({
  logger: true,
});

fastify.register(cors, {
  origin: FRONTEND_URL,
  methods: ["GET", "POST", "PUT", "DELETE"],
});

fastify.register(rateLimit, {
  max: 100,
  timeWindow: "1 minute",
});

fastify.register(fastifyJwt, {
  secret: JWT_SECRET,
  sign: { expiresIn: "1h" },
});

fastify.register(authRoutes, { prefix: "/api/auth" });

fastify.register(bookmarkRoutes, { prefix: "/api/bookmarks" });

fastify.get("/", function (request, reply) {
  reply.send({ message: "Bookmark Manager API" });
});

fastify.get("/health", async function (request, reply) {
  try {
    await db.execute(sql`SELECT 1`);
    reply.send({ status: "ok" });
  } catch {
    reply
      .status(500)
      .send({ status: "error", message: "Database connection failed" });
  }
});

fastify.listen({ port: 3000, host: "0.0.0.0" }, function (err, address) {
  if (err) {
    fastify.log.error(err);
    process.exit(1);
  }
});
