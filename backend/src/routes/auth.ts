import type { FastifyInstance } from "fastify";
import { db } from "../db/index.js";
import { users } from "../db/schema.js";
import bcrypt from "bcrypt";
import { eq } from "drizzle-orm";
import { registerSchema, loginSchema } from "../schemas/auth.js";

export default async function authRoutes(fastify: FastifyInstance) {
  fastify.post(
    "/register",
    {
      config: {
        rateLimit: {
          max: 5,
          timeWindow: "1 minute",
        },
      },
    },
    async (request, reply) => {
      const result = registerSchema.safeParse(request.body);

      if (!result.success) {
        return reply.status(400).send({ error: result.error.issues });
      }

      const { email, password } = result.data;

      const existingUser = await db
        .select()
        .from(users)
        .where(eq(users.email, email));

      if (existingUser.length > 0) {
        return reply.status(400).send({ error: "User already exists" });
      }

      const hashedPassword = await bcrypt.hash(password, 10);

      const newUser = await db
        .insert(users)
        .values({ email, password: hashedPassword })
        .returning({ id: users.id, email: users.email });

      const createdUser = newUser[0];

      if (!createdUser) {
        return reply.status(500).send({ error: "Failed to create user" });
      }

      const token = fastify.jwt.sign({
        id: createdUser.id,
        email: createdUser.email,
      });

      return reply.status(201).send({
        token: token,
        user: { id: createdUser.id, email: createdUser.email },
      });
    },
  );

  fastify.post(
    "/login",
    {
      config: {
        rateLimit: {
          max: 5,
          timeWindow: "1 minute",
        },
      },
    },
    async (request, reply) => {
      const result = loginSchema.safeParse(request.body);

      if (!result.success) {
        return reply.status(400).send({ error: result.error.issues });
      }

      const { email, password } = result.data;

      const existingUser = await db
        .select()
        .from(users)
        .where(eq(users.email, email))
        .limit(1);

      const user = existingUser[0];

      if (!user) {
        return reply.status(400).send({ error: "Invalid email or password" });
      }

      const isMatch = await bcrypt.compare(password, user.password);

      if (!isMatch) {
        return reply.status(400).send({ error: "Invalid email or password" });
      }

      const token = fastify.jwt.sign({ id: user.id, email: user.email });

      return reply
        .status(200)
        .send({ token: token, user: { id: user.id, email: user.email } });
    },
  );
}
