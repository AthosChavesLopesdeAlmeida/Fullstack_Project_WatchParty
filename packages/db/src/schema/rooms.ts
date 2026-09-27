import { pgTable, uuid, varchar, timestamp } from "drizzle-orm/pg-core";
import { users } from "./users";
import { videos } from "./videos";

// currentVideoId não é .notNull(), pois um host pode criar uma sala para só depois escolher um vídeo
export const rooms = pgTable("rooms", {
    id: uuid("id").primaryKey().defaultRandom(),
    hostId: uuid("host_id").notNull().references(() => users.id, { onDelete: "cascade" }),
    roomName: varchar("room_name", {length: 50}).notNull(),
    currentVideoId: uuid("current_video_id").references(() => videos.id),
    createdAt: timestamp("created_at").notNull().defaultNow() 
})


