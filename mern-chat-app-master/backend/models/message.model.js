import mongoose from "mongoose";

const messageSchema = new mongoose.Schema(
    {
        senderId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
        receiverId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
        message: { type: String, required: true },
        scheduledAt: { type: Date, default: null },
        isSent: { type: Boolean, default: true },
        seen: { type: Boolean, default: false },
        summary: { type: String, default: null }
    },
    { timestamps: true }
);

export default mongoose.model("Message", messageSchema);