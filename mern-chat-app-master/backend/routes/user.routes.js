import express from "express";
import protectRoute from "../middleware/protectRoute.js";
// Don't forget to import the new updateAvatar function here!
import { getUsersForSidebar, updateAvatar } from "../controllers/user.controller.js";

const router = express.Router();

router.get("/", protectRoute, getUsersForSidebar);

// NEW: PUT route for updating the avatar
router.put("/update-avatar", protectRoute, updateAvatar);

export default router;