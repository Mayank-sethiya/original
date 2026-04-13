import User from "../models/user.model.js";
import Message from "../models/message.model.js"; // ⚡ NEW: Required to count unread messages

// 1. GET USERS FOR SIDEBAR (Now includes Unread Badge Counts)
export const getUsersForSidebar = async (req, res) => {
    try {
        const loggedInUserId = req.user._id;

        // .lean() is crucial here: it converts mongoose docs to plain JS objects so we can add 'unreadCount'
        const filteredUsers = await User.find({ _id: { $ne: loggedInUserId } })
            .select("-password")
            .lean(); 

        // ⚡ Loop through each user and count unseen messages sent to YOU
        const usersWithUnreadCounts = await Promise.all(
            filteredUsers.map(async (user) => {
                const unreadCount = await Message.countDocuments({
                    senderId: user._id,           // The other user sent it
                    receiverId: loggedInUserId,   // You received it
                    seen: false                   // You haven't looked at it yet
                });
                
                return { ...user, unreadCount };
            })
        );

        res.status(200).json(usersWithUnreadCounts);
    } catch (error) {
        console.error("Error in getUsersForSidebar: ", error.message);
        res.status(500).json({ error: "Internal server error" });
    }
};

// 2. UPDATE AVATAR (Your existing code untouched)
export const updateAvatar = async (req, res) => {
    try {
        const { profilePic, gender } = req.body;
        const userId = req.user._id; 

        if (!profilePic || !gender) {
            return res.status(400).json({ error: "Profile picture and gender are required" });
        }

        // Find the user and update their fields, returning the updated document
        const updatedUser = await User.findByIdAndUpdate(
            userId,
            { profilePic: profilePic, gender: gender },
            { new: true } 
        ).select("-password");

        if (!updatedUser) {
            return res.status(404).json({ error: "User not found" });
        }

        res.status(200).json(updatedUser);
    } catch (error) {
        console.error("Error in updateAvatar controller: ", error.message);
        res.status(500).json({ error: "Internal server error" });
    }
};