import type { FastifyInstance } from "fastify";
import { authenticate } from "../middleware/auth.js";
import { db } from "../db/index.js";
import { bookmarks, tags, bookmarkTags } from "../db/schema.js";
import { eq, and, count, ilike, or } from "drizzle-orm";
import {
  createBookmarkSchema,
  updateBookmarkSchema,
} from "../schemas/bookmark.js";

export default async function bookmarkRoutes(fastify: FastifyInstance) {
  fastify.post("/", { preHandler: [authenticate] }, async (request, reply) => {
    const result = createBookmarkSchema.safeParse(request.body);

    if (!result.success) {
      return reply.status(400).send({ error: result.error.issues });
    }

    const { title, url, description, tags: tagNames } = result.data;

    const user = request.user as { id: number; email: string };

    const newBookmark = await db
      .insert(bookmarks)
      .values({
        title,
        url,
        description,
        userId: user.id,
      })
      .returning({
        id: bookmarks.id,
        title: bookmarks.title,
        url: bookmarks.url,
        description: bookmarks.description,
      });

    const createdBookmark = newBookmark[0];

    if (!createdBookmark) {
      return reply.status(500).send({ error: "Failed to create bookmark" });
    }

    if (tagNames && tagNames.length > 0) {
      for (const tagName of tagNames) {
        let tagId;

        const existingTags = await db
          .select()
          .from(tags)
          .where(and(eq(tags.name, tagName), eq(tags.userId, user.id)))
          .limit(1);

        if (existingTags.length > 0 && existingTags[0]) {
          tagId = existingTags[0].id;
        } else {
          const newTag = await db
            .insert(tags)
            .values({ name: tagName, userId: user.id })
            .returning({ id: tags.id });

          const createdTag = newTag[0];
          if (!createdTag) {
            throw new Error("Failed to create tag");
          }
          tagId = createdTag.id;
        }

        await db.insert(bookmarkTags).values({
          bookmarkId: createdBookmark.id,
          tagId: tagId,
        });
      }
    }

    reply.status(201).send({ ...createdBookmark, tags: tagNames || [] });
  });

  fastify.get("/", { preHandler: [authenticate] }, async (request, reply) => {
    const user = request.user as { id: number; email: string };
    const {
      page = "1",
      limit = "10",
      search,
    } = request.query as {
      page?: string;
      limit?: string;
      search?: string;
    };

    const baseCondition = eq(bookmarks.userId, user.id);

    const searchPattern = `%${search?.toLowerCase()}%`;

    const whereCondition = search
      ? and(
          baseCondition,
          or(
            ilike(bookmarks.title, searchPattern),
            ilike(bookmarks.description, searchPattern),
          ),
        )
      : baseCondition;

    const totalResult = await db
      .select({ count: count() })
      .from(bookmarks)
      .where(whereCondition);

    const userBookmarks = await db
      .select()
      .from(bookmarks)
      .where(whereCondition)
      .limit(Number(limit))
      .offset((Number(page) - 1) * Number(limit));

    const total = totalResult[0]?.count ?? 0;

    const result = await Promise.all(
      userBookmarks.map(async (bookmark) => {
        const tagResults = await db
          .select({ name: tags.name })
          .from(bookmarkTags)
          .innerJoin(tags, eq(bookmarkTags.tagId, tags.id))
          .where(eq(bookmarkTags.bookmarkId, bookmark.id));

        const tagNames = tagResults.map((tag) => tag.name);

        return { ...bookmark, tags: tagNames };
      }),
    );

    reply.send({
      bookmarks: result,
      pagination: {
        page: Number(page),
        limit: Number(limit),
        total,
        totalPages: Math.ceil(total / Number(limit)),
      },
    });
  });
  fastify.put(
    "/:id",
    { preHandler: [authenticate] },
    async (request, reply) => {
      const { id } = request.params as { id: string };

      const user = request.user as { id: number; email: string };

      const result = updateBookmarkSchema.safeParse(request.body);

      if (!result.success) {
        return reply.status(400).send({ error: result.error.issues });
      }

      const { title, url, description, tags: tagNames } = result.data;

      const existingBookmark = await db
        .select()
        .from(bookmarks)
        .where(and(eq(bookmarks.id, Number(id)), eq(bookmarks.userId, user.id)))
        .limit(1);

      if (existingBookmark.length === 0) {
        return reply.status(404).send({ error: "Bookmark not found" });
      }

      const updatedBookmark = await db
        .update(bookmarks)
        .set({ title, url, description, updatedAt: new Date() })
        .where(and(eq(bookmarks.id, Number(id)), eq(bookmarks.userId, user.id)))
        .returning({
          id: bookmarks.id,
          title: bookmarks.title,
          url: bookmarks.url,
          description: bookmarks.description,
        });

      await db
        .delete(bookmarkTags)
        .where(eq(bookmarkTags.bookmarkId, Number(id)));

      await db
        .delete(bookmarkTags)
        .where(eq(bookmarkTags.bookmarkId, Number(id)));

      if (tagNames && tagNames.length > 0) {
        for (const tagName of tagNames) {
          let tagId;

          const existingTags = await db
            .select()
            .from(tags)
            .where(and(eq(tags.name, tagName), eq(tags.userId, user.id)))
            .limit(1);

          if (existingTags.length > 0 && existingTags[0]) {
            tagId = existingTags[0].id;
          } else {
            const newTag = await db
              .insert(tags)
              .values({ name: tagName, userId: user.id })
              .returning({ id: tags.id });

            const createdTag = newTag[0];
            if (!createdTag) throw new Error("Failed to create tag");
            tagId = createdTag.id;
          }

          await db.insert(bookmarkTags).values({
            bookmarkId: Number(id),
            tagId: tagId,
          });
        }
      }

      reply.send(updatedBookmark[0]);
    },
  );
  fastify.delete(
    "/:id",
    { preHandler: [authenticate] },
    async (request, reply) => {
      const { id } = request.params as { id: string };
      const user = request.user as { id: number; email: string };

      const existingBookmark = await db
        .select()
        .from(bookmarks)
        .where(and(eq(bookmarks.id, Number(id)), eq(bookmarks.userId, user.id)))
        .limit(1);

      if (existingBookmark.length === 0) {
        return reply.status(404).send({ error: "Bookmark not found" });
      }

      await db
        .delete(bookmarkTags)
        .where(eq(bookmarkTags.bookmarkId, Number(id)));

      await db
        .delete(bookmarks)
        .where(
          and(eq(bookmarks.id, Number(id)), eq(bookmarks.userId, user.id)),
        );

      reply.status(204).send();
    },
  );
}
