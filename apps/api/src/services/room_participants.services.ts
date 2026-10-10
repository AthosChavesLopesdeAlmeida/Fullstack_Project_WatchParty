import { roomRepository } from "@watch-party/db";
import { roomParticipantsRepository } from "@watch-party/db";
import { userRepository } from "@watch-party/db";

export const roomParticipantsService = {
    async invite(hostRequestId: string, invitedId: string, roomId: string) {
        const existingUser = await userRepository.findById(invitedId);
        if (!existingUser) throw new Error("User not found");

        const existingRoom = await roomRepository.findById(roomId);
        if (!existingRoom) throw new Error("Room not found");

        if (existingRoom.hostId !== hostRequestId) {
            throw new Error("Only the host can invite participants");
        }

        return roomParticipantsRepository.invite(invitedId, roomId);
    },

    async enterRoom (invitedId: string, roomId: string) {
        const existingUser = await userRepository.findById(invitedId)
        if (!existingUser) throw new Error("User not found")

        const existingRoom = await roomRepository.findById(roomId)
        if (!existingRoom) throw new Error("Room not found")

        const participant = await roomParticipantsRepository.enterRoom(invitedId, roomId)
        return participant     
    },

    async remove(targetUserId: string, roomId: string, requesterId: string) {
        const existingRoom = await roomRepository.findById(roomId);
        if (!existingRoom) throw new Error("Room not found");

        const isSelfRemoval = requesterId === targetUserId;
        const isHostRemoving = requesterId === existingRoom.hostId;

        if (!isSelfRemoval && !isHostRemoving) {
            throw new Error("Apenas o host pode remover outros participantes");
        }

        await roomParticipantsRepository.remove(targetUserId, roomId);
    },
    
    async listParticipants (roomId: string, requesterId: string) {
        const room = await roomRepository.findById(roomId);
        if (!room) throw new Error("Room not found");

        const members = await roomParticipantsRepository.listParticipants(roomId);

        // Verifica se o usuário faz parte da sala
        const isMember = room.hostId === requesterId || members.some((m) => m.userId === requesterId);
        if (!isMember) throw new Error("You are not a member of this room");

        return members.map((m) => ({ ...m, isHost: m.userId === room.hostId }));
    }
}