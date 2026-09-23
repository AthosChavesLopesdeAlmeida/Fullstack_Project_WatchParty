import { friendshipRepository } from "@watch-party/db";
import { SendRequestInput } from "@watch-party/schemas";
import { userRepository } from "@watch-party/db";

export const friendshipService = {
    async sendRequest (requesterId: string, data: SendRequestInput) {
        const { addresseeEmail } = data

        // Verifica se o destinatário existe
        const addressee = await userRepository.findByEmail(addresseeEmail)
        if (!addressee) throw new Error('User not found')

        // Não pode adicionar a si mesmo como amigo
        if (requesterId === addressee.id) throw new Error('It is not possible to add yourself as a friend')

        // Impede duplicação da amizade
        const friendshipExists = await friendshipRepository.findBetween(requesterId, addressee.id)
        if (friendshipExists) throw new Error('You are either already friend with this person or the request has already been sent')

        return friendshipRepository.create(requesterId, addressee.id)
    },

    async acceptRequest (friendshipId: string, currentUserId: string) {
        // Verifica se o pedido existe 
        const friendship = await friendshipRepository.findById(friendshipId)
        if (!friendship) throw new Error('Friendship request not found')

        // Só o destinatário pode responder um pedido de amizade, e ela deve ser pendente    
        if (friendship.addresseeId !== currentUserId) throw new Error('Not allowed')
        if (friendship.status !== 'pending') throw new Error('The request has already been answered')
        
        return friendshipRepository.updateStatus(friendshipId, 'accepted')
    },

    async rejectRequest (friendshipId: string, currentUserId: string) {
        // Verifica se o pedido existe 
        const friendship = await friendshipRepository.findById(friendshipId)
        if (!friendship) throw new Error('Friendship request not found')

        // Só o destinatário pode responder um pedido de amizade    
        if (friendship.addresseeId !== currentUserId) throw new Error('Not allowed')

        return friendshipRepository.delete(friendshipId, currentUserId)
    },

    async removeFriend (friendshipId: string, currentUserId: string) {
        // Verifica se a amizade existe
        const friendship = await friendshipRepository.findById(friendshipId)
        if (!friendship) throw new Error('Friendship request not found')

        // Verifica se o usuário que quer excluir a amizade faz parte dela
        const isPartOfFriendship = 
            friendship.addresseeId === currentUserId || friendship.requesterId === currentUserId

        if (!isPartOfFriendship) throw new Error('Not allowed')

        return friendshipRepository.delete(friendshipId, currentUserId)
    }, 

    async listFriends (userId: string) {
        return friendshipRepository.listByUser(userId, 'accepted')
    },

    async listPendingRequests (userId: string) {
        return friendshipRepository.listPendingReceived(userId)
    }
}