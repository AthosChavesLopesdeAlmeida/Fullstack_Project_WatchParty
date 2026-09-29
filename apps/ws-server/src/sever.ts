import { WebSocketServer } from "ws";
import { authenticateConnection } from "./auth/authenticate";
import { joinRoom, leaveRoom, broadcastToRoom } from "./connections";
import { handleMessage, handleDisconnect } from "./handlers/room.handlers"; // roteador de mensagens

export function startServer() {
  const wss = new WebSocketServer({ port: Number(process.env.PORT) });

  wss.on("connection", (socket, req) => {
    const userId = authenticateConnection(req);
    if (!userId) {
      socket.close(1008, "Unauthorized"); // 1008 = código de status WebSocket p/ "policy violation"
      return;
    }

    socket.on("message", (raw) => {
      const message = JSON.parse(raw.toString());
      handleMessage(socket, userId, message).catch((err) => {
        console.error("Error processing the message:", err);
        socket.send(JSON.stringify({ type: "error", message: "Internal error" }));
      });
    });

    socket.on("close", () => {
      handleDisconnect(socket).catch((err) => {
        console.error("Error processing disconnection:", err);
      });
    });
  });

  console.log(`WS server running on port ${process.env.PORT}`);
}