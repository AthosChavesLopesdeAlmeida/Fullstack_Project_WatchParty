import { Router } from "express";
import { roomController } from "../controllers/room.controller";
import { roomParticipantsController } from "../controllers/roomParticipant.controller";
import { authMiddleware } from "../middlewares/auth.middleware"; // ajuste o nome/caminho conforme o de vocês

const router = Router();

router.use(authMiddleware); // todas as rotas de /rooms exigem autenticação

// Rooms
router.post("/rooms/", roomController.create);
router.patch("/rooms/:roomId/video/:videoId", roomController.setVideo);
router.delete("/rooms/:roomId", roomController.delete);
router.get("/rooms/:roomId", roomController.findById)

// Room participants
router.post("/rooms/:roomId/invite/:invitedId", roomParticipantsController.invite);
router.post("/rooms/:roomId/enter", roomParticipantsController.enterRoom);
router.delete("/rooms/:roomId/participants", roomParticipantsController.remove);
router.delete("/rooms/:roomId/participants/:targetUserId", roomParticipantsController.kick);
router.get("/rooms/:roomId/participants", roomParticipantsController.listParticipants);
router.get("/rooms/", roomController.listMyRooms);
router.get("/:roomId/participants", roomParticipantsController.listParticipants);

export default router;