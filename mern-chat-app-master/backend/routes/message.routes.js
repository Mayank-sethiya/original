import express from "express";
import { 
    getMessages, 
    sendMessage, 
    summarizeMessage, 
    cancelScheduledMessage, 
    getScheduledMessages // 👈 Import new function
} from "../controllers/message.controller.js";
import protectRoute from "../middleware/protectRoute.js";

const router = express.Router();

router.get("/:id", protectRoute, getMessages);
router.get("/scheduled/:id", protectRoute, getScheduledMessages); // 👈 New Route
router.post("/send/:id", protectRoute, sendMessage);
router.post("/summarize", protectRoute, summarizeMessage);
router.delete("/cancel/:messageId", protectRoute, cancelScheduledMessage);

export default router;