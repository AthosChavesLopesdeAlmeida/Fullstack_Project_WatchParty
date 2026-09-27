import { pgTable, uuid, pgEnum, primaryKey } from "drizzle-orm/pg-core";
import { users } from "./users";
import { rooms } from "./rooms";

/*
 * Trato o convite para a sala da seguinte maneira:
 * O usuário recebe o convite com status "pending"
 * Já é adicionado ao banco de dados como participante
 * Quando ele recusa, o registro é excluído
*/ 
export const invitationStatusEnum = pgEnum("invitation_status", [
    "pending",
    "accepted"
])

export const roomParticipants = pgTable("room_participants", {
    userId: uuid("participant_id").notNull().references(() => users.id, { onDelete: "cascade" }),
    roomId: uuid("room_id").notNull().references(() => rooms.id, { onDelete: 'cascade' }),
    invitationStatus: invitationStatusEnum("invitation_status").notNull().default("pending")
},
  (table) => ({
    pk: primaryKey({ columns: [table.userId, table.roomId] }),
  })
)