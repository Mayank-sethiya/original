import Conversation from "../models/conversation.model.js";
import Message from "../models/message.model.js";
import { getReceiverSocketId, io } from "../socket/socket.js";
import { GoogleGenerativeAI } from "@google/generative-ai";

// ⚡ PRIVACY SHIELD: Scrubs sensitive data before hitting 3rd party APIs
const sanitizeForAI = (text) => {
    if (!text) return "";
    let safeText = text;
    
    // 1. Hide exactly 10-digit mobile numbers
    safeText = safeText.replace(/\b\d{10}\b/g, "[HIDDEN PHONE]");
    
    // 2. Hide Indian License Plates (e.g., MP 13 AB 1234, MP04AB1234)
    safeText = safeText.replace(/\b[A-Z]{2}[\s-]?\d{1,2}[\s-]?[A-Z]{1,2}[\s-]?\d{4}\b/gi, "[HIDDEN PLATE]");
    
    // 3. Hide 6-digit Indian PIN codes (safest way to catch addresses)
    safeText = safeText.replace(/\b\d{6}\b/g, "[HIDDEN PINCODE]");

    // 4. Hide Emails
    safeText = safeText.replace(/\b[\w\.-]+@[\w\.-]+\.\w{2,4}\b/g, "[HIDDEN EMAIL]");
    
    return safeText;
};

export const sendMessage = async (req, res) => {
    try {
        const { message, scheduledAt } = req.body;
        const { id: receiverId } = req.params;
        const senderId = req.user._id;

        let conversation = await Conversation.findOne({ participants: { $all: [senderId, receiverId] } });
        if (!conversation) {
            conversation = await Conversation.create({ participants: [senderId, receiverId] });
        }

        const isScheduled = scheduledAt && scheduledAt !== "null" && scheduledAt !== "";
        let finalDate = isScheduled ? new Date(scheduledAt) : null;

        const newMessage = new Message({
            senderId, receiverId, message, scheduledAt: finalDate, isSent: !isScheduled, seen: false
        });

        if (newMessage) conversation.messages.push(newMessage._id);
        await Promise.all([conversation.save(), newMessage.save()]);

        if (!isScheduled) {
            const receiverSocketId = getReceiverSocketId(receiverId);
            if (receiverSocketId) io.to(receiverSocketId).emit("newMessage", newMessage);
        }

        res.status(201).json(newMessage);
    } catch (error) {
        res.status(500).json({ error: "Internal server error" });
    }
};

export const getMessages = async (req, res) => {
    try {
        const { id: userToChatId } = req.params;
        const senderId = req.user._id;

        const conversation = await Conversation.findOne({
            participants: { $all: [senderId, userToChatId] },
        }).populate({ path: "messages", match: { isSent: { $ne: false } } });

        if (!conversation) return res.status(200).json([]);

        // GREY SCREEN FIX: Only trigger socket if there is ACTUALLY something to update
        const unseenCount = await Message.countDocuments({ 
            senderId: userToChatId, receiverId: senderId, seen: false 
        });

        if (unseenCount > 0) {
            await Message.updateMany(
                { senderId: userToChatId, receiverId: senderId, seen: false },
                { $set: { seen: true } }
            );

            const senderSocketId = getReceiverSocketId(userToChatId);
            if (senderSocketId) {
                io.to(senderSocketId).emit("messagesSeen", { conversationId: senderId });
            }
        }

        res.status(200).json(conversation.messages);
    } catch (error) {
        res.status(500).json({ error: "Internal server error" });
    }
};

export const getScheduledMessages = async (req, res) => {
    try {
        const { id: userToChatId } = req.params;
        const senderId = req.user._id;

        const conversation = await Conversation.findOne({
            participants: { $all: [senderId, userToChatId] },
        }).populate({ path: "messages", match: { isSent: false, senderId: senderId } });

        if (!conversation) return res.status(200).json([]);
        res.status(200).json(conversation.messages);
    } catch (error) {
        res.status(500).json({ error: "Internal server error" });
    }
};

export const summarizeMessage = async (req, res) => {
    try {
        const { messageId, messageContent } = req.body; 
        if (!messageContent || !messageId) return res.status(400).json({ error: "Missing data" });

        // ⚡ APPLY THE SHIELD: Clean the message before Gemini ever sees it
        const safeContent = sanitizeForAI(messageContent);

        const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
        const model = genAI.getGenerativeModel({ model: "gemini-flash-latest" });

        const prompt = `Summarize in 1 short sentence: "${safeContent}"`;
        const result = await model.generateContent(prompt);
        const generatedSummary = result.response.text();

        await Message.findByIdAndUpdate(messageId, { summary: generatedSummary });
        res.status(200).json({ summary: generatedSummary });

    } catch (error) {
        console.error("🚨 SUMMARIZE ERROR:", error.message);

        // ⚡ GRACEFUL ERROR HANDLING: Catches the 429 Quota limit without crashing the app
        if (error.status === 429 || error.message.includes("429") || error.message.includes("Quota")) {
            return res.status(429).json({ 
                error: "AI is resting", 
                details: "You've used the AI a lot just now! Please wait about a minute before summarizing again." 
            });
        }
        
        res.status(500).json({ error: "Failed to summarize", details: "Something went wrong with the AI." });
    }
};

export const cancelScheduledMessage = async (req, res) => {
    try {
        await Message.findOneAndDelete({ _id: req.params.messageId, isSent: false });
        res.status(200).json({ message: "Cancelled" });
    } catch (error) {
        res.status(500).json({ error: "Error" });
    }
};