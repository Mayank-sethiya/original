import { Server } from "socket.io";
import http from "http";
import express from "express";
import Message from "../models/message.model.js";

const app = express();
const server = http.createServer(app);
const io = new Server(server, {
	cors: {
		// ✅ Allow both local development and your Render production URL
		origin: ["http://localhost:3000", "https://chat-app-lmgi.onrender.com"],
		methods: ["GET", "POST"],
	},
});

export const getReceiverSocketId = (receiverId) => userSocketMap[receiverId];
const userSocketMap = {}; 

io.on("connection", (socket) => {
    const userId = socket.handshake.query.userId;
    if (userId !== "undefined") userSocketMap[userId] = socket.id;

    io.emit("getOnlineUsers", Object.keys(userSocketMap));

    // Handle real-time read receipts safely
    socket.on("markMessagesAsSeen", async ({ conversationId, senderId }) => {
        try {
            await Message.updateMany(
                { senderId: senderId, receiverId: userId, seen: false },
                { $set: { seen: true } }
            );

            const senderSocketId = getReceiverSocketId(senderId);
            if (senderSocketId) {
                io.to(senderSocketId).emit("messagesSeen", { conversationId: userId });
            }
        } catch (error) {
            console.log("Socket Seen Error:", error);
        }
    });

    socket.on("disconnect", () => {
        delete userSocketMap[userId];
        io.emit("getOnlineUsers", Object.keys(userSocketMap));
    });
});

export { app, io, server };