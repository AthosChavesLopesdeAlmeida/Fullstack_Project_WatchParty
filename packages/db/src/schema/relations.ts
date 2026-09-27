import { relations } from "drizzle-orm";
import { rooms } from "./rooms";
import { users } from "./users";
import { videos } from "./videos";
import { roomParticipants } from "./room_participants";

// Uma sala pode ter muitos participantes, mas apenas um host e um vídeo
export const roomRelations = relations(rooms, ({ many, one }) => ({
    participants: many(roomParticipants),
    host: one(users, { fields: [rooms.hostId], references: [users.id]}),
    currentVideo: one(videos, { fields: [rooms.currentVideoId], references: [videos.id]})
}))

// Um participante só pode estar em uma sala 
// Obviamente, um participante só pode corresponder a um usuário
export const participantsRelations = relations(roomParticipants, ({ one }) => ({
    room: one(rooms, { fields: [roomParticipants.roomId], references: [rooms.id]}),
    users: one(users, { fields: [roomParticipants.userId], references: [users.id]})
}))