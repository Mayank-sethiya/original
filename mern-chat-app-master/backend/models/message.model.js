import mongoose from "mongoose";

const messageSchema = new mongoose.Schema(
	{
		senderId: {
			type: mongoose.Schema.Types.ObjectId,
			ref: "User",
			required: true,
		},
		receiverId: {
			type: mongoose.Schema.Types.ObjectId,
			ref: "User",
			required: true,
		},
		message: {
			type: String,
			required: true,
		},
		// 👇 THIS IS WHAT WAS MISSING:
		scheduledAt: {
			type: Date, // Stores the scheduled time
			default: null
		},
		isSent: {
			type: Boolean,
			default: true // Default is TRUE (sent instantly) unless we say otherwise
		}
	},
	{ timestamps: true }
);

const Message = mongoose.model("Message", messageSchema);

export default Message;