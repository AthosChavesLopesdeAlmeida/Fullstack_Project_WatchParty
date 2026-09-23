import { pgTable, pgEnum, uuid, varchar,text, timestamp } from "drizzle-orm/pg-core";
import { users } from "./users";

export const videoStatusEnum = pgEnum("video_status", [
  "pending",
  "processing",
  "ready",
  "failed",
]);

export const videos = pgTable("videos", {
    id: uuid("id").primaryKey().defaultRandom(),
    posterId: uuid("poster_id").notNull().references(() => users.id, { onDelete: "cascade" }),
    videoName: varchar("video_name", { length: 255 }).notNull(),
    rawKey: text("raw_key").notNull(), // Caminho do vídeo no S3
    processedUrl: text("processed_url"), // preenchido só quando o worker termina (nullable)
    status: videoStatusEnum("status").notNull().default("pending"),
    createdAt: timestamp("created_at").defaultNow().notNull()
})