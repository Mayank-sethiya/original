// backend/cron.js
import cron from "node-cron";
import Message from "./models/message.model.js";
import { getReceiverSocketId, io } from "./socket/socket.js";

export const setupCron = () => {
	console.log("✅ Cron Job Scheduled...");

	cron.schedule("* * * * *", async () => {
		try {
			const now = new Date();
			const dueMessages = await Message.find({
				scheduledAt: { $lte: now }, 
				isSent: false
			});

			if (dueMessages.length > 0) {
				console.log(`🚀 Delivering ${dueMessages.length} messages...`);
				
				for (const msg of dueMessages) {
					msg.isSent = true;
					await msg.save();

					// 1. Prepare Payload for RECEIVER (Needs Shake/Sound) 🔔
					const receiverPayload = msg.toObject();
					receiverPayload.shouldShake = true; 

					// 2. Prepare Payload for SENDER (Silent Update) 🔕
					const senderPayload = msg.toObject();
					senderPayload.shouldShake = false; 

					const receiverSocketId = getReceiverSocketId(msg.receiverId.toString());
					const senderSocketId = getReceiverSocketId(msg.senderId.toString());

					// Emit distinct events
					if (receiverSocketId) {
                        io.to(receiverSocketId).emit("newMessage", receiverPayload);
                    }
					if (senderSocketId) {
                        io.to(senderSocketId).emit("newMessage", senderPayload);
                    }
				}
			}
		} catch (error) {
			console.error("Cron Error:", error);
		}
	});
};