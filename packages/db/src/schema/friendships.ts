import { pgTable, pgEnum, uuid, timestamp, unique } from "drizzle-orm/pg-core";
import { users } from "./users";


export const friendshipStatusEnum = pgEnum("friendship_status", [
    "pending",
    "accepted"
])

export const friendships = pgTable("friendships", {
    id: uuid("id").primaryKey().defaultRandom(),
    requesterId: uuid("requester_id").notNull().references(() => users.id, {onDelete: 'cascade'}),
    addresseeId: uuid("addressee_id").notNull().references(() => users.id, {onDelete: 'cascade'})   ,
    status: friendshipStatusEnum("status").notNull().default("pending"),
    createdAt: timestamp("created_at").notNull().defaultNow(),
    respondedAt: timestamp("responded_at")
}, 
(table) => ({
    uniquePair: unique().on(table.requesterId, table.addresseeId)
})
)