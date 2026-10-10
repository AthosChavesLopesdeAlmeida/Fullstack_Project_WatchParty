import { roomRepository } from "@watch-party/db";
import { userRepository } from "@watch-party/db";
import { videosRepository } from "@watch-party/db";
import { createRoomInput } from "@watch-party/schemas";

export const roomService = {
    async create (userId: string, data: createRoomInput) {
        const existingUser = await userRepository.findById(userId)
        if (!existingUser) throw new Error("User not found")

        const { roomName } = data

        if (!roomName) throw new Error("Missing information")

        const room = await roomRepository.create(roomName, userId)
        return room
    },

    async setVideo(roomId: string, videoId: string, requesterId: string) {
        const existingRoom = await roomRepository.findById(roomId);
        if (!existingRoom) throw new Error("Room not found");

        if (existingRoom.hostId !== requesterId) {
            throw new Error("Only the host can choose a video");
        }

        const existingVideo = await videosRepository.findById(videoId);
        if (!existingVideo) throw new Error("Video not found");

        return roomRepository.setVideo(roomId, videoId);
    },

    async delete (roomId: string, userId: string) {
        const existingUser = await userRepository.findById(userId)
        if (!existingUser) throw new Error("User not found")

        const existingRoom = await roomRepository.findById(roomId)
        if (!existingRoom) throw new Error("Room not found")

        if (existingRoom.hostId !== userId) throw new Error("Only the host can delete the room")

        return await roomRepository.delete(roomId, userId) 
    },

    async listMyRooms(userId: string) {
        const existingUser = await userRepository.findById(userId)
        if (!existingUser) throw new Error("User not found")
            
        return roomRepository.listForUser(userId);
    },

    async findById(roomId: string) {
        return roomRepository.findById(roomId)
    }
}