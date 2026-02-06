import Conversation from "../models/conversation.model.js";
import Message from "../models/message.model.js";
import { getReceiverSocketId, io } from "../socket/socket.js";
import { GoogleGenerativeAI } from "@google/generative-ai";

// 1. SEND MESSAGE (Strict Logic)
export const sendMessage = async (req, res) => {
	try {
		const { message, scheduledAt } = req.body;
		const { id: receiverId } = req.params;
		const senderId = req.user._id;

		let conversation = await Conversation.findOne({
			participants: { $all: [senderId, receiverId] },
		});

		if (!conversation) {
			conversation = await Conversation.create({
				participants: [senderId, receiverId],
			});
		}

		// Check if it is scheduled
		// The backend trusts the frontend: if scheduledAt exists, it IS scheduled.
		const isScheduled = scheduledAt && scheduledAt !== "null" && scheduledAt !== "";
		let finalDate = isScheduled ? new Date(scheduledAt) : null;

		const newMessage = new Message({
			senderId,
			receiverId,
			message,
			scheduledAt: finalDate,
			// ⚡ FORCE FALSE if scheduled. No exceptions.
			isSent: isScheduled ? false : true 
		});

		if (newMessage) {
			conversation.messages.push(newMessage._id);
		}

		await Promise.all([conversation.save(), newMessage.save()]);

		// Socket Logic
		if (isScheduled) {
			console.log(`✅ Message queued for ${finalDate}. Hidden from chat.`);
		} else {
			const receiverSocketId = getReceiverSocketId(receiverId);
			if (receiverSocketId) {
				io.to(receiverSocketId).emit("newMessage", newMessage);
			}
		}

		res.status(201).json(newMessage);
	} catch (error) {
		console.log("Error in sendMessage: ", error.message);
		res.status(500).json({ error: "Internal server error" });
	}
};

// 2. GET MESSAGES (Main Chat - Hides Pending)
export const getMessages = async (req, res) => {
	try {
		const { id: userToChatId } = req.params;
		const senderId = req.user._id;

		const conversation = await Conversation.findOne({
			participants: { $all: [senderId, userToChatId] },
		}).populate({
			path: "messages",
			match: { isSent: { $ne: false } } // Hide scheduled
		});

		if (!conversation) return res.status(200).json([]);
		res.status(200).json(conversation.messages);
	} catch (error) {
		console.log("Error in getMessages: ", error.message);
		res.status(500).json({ error: "Internal server error" });
	}
};

// 3. GET SCHEDULED (Pending Box - Shows ONLY Pending)
// backend/controllers/message.controller.js

export const getScheduledMessages = async (req, res) => {
	try {
		const { id: userToChatId } = req.params;
		const senderId = req.user._id;

		const conversation = await Conversation.findOne({
			participants: { $all: [senderId, userToChatId] },
		}).populate({
			path: "messages",
			match: { 
                isSent: false,      // Must be pending
                senderId: senderId  // 🔒 CRITICAL FIX: Only show messages I SENT
            } 
		});

		if (!conversation) return res.status(200).json([]);
		res.status(200).json(conversation.messages);
	} catch (error) {
		console.log("Error in getScheduledMessages: ", error.message);
		res.status(500).json({ error: "Internal server error" });
	}
};

// 4. SUMMARIZER (Fixed with gemini-pro)
const anonymizeText = (text) => {
	if (!text) return "";
	return text.replace(/\b[\w\.-]+@[\w\.-]+\.\w{2,4}\b/g, "***").replace(/\b\d{10}\b/g, "***");
};

export const summarizeMessage = async (req, res) => {
	try {
		const { messageContent } = req.body; 
		if (!messageContent) return res.status(400).json({ error: "No text provided" });

		const safeMessage = anonymizeText(messageContent);
		const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
		// ⚡ Using standard model
		const model = genAI.getGenerativeModel({ model: "gemini-flash-latest" });

		const result = await model.generateContent(`Summarize in 1 sentence: ${safeMessage}`);
		res.status(200).json({ summary: result.response.text() });
	} catch (error) {
		console.log("Summarizer Error:", error.message);
		res.status(500).json({ error: "Failed to summarize: " + error.message });
	}
};

// 5. CANCEL SCHEDULE
export const cancelScheduledMessage = async (req, res) => {
	try {
		const { messageId } = req.params;
		await Message.findOneAndDelete({ _id: messageId, isSent: false });
		res.status(200).json({ message: "Cancelled" });
	} catch (error) {
		res.status(500).json({ error: "Error" });
	}
};