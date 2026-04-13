import { useEffect } from "react";
import { useSocketContext } from "../context/SocketContext";
import useConversation from "../zustand/useConversation";
import { useAuthContext } from "../context/AuthContext"; // ⚡ Imported to check who sent it
import notificationSoundFile from "../assets/sounds/notification.mp3"; 

// ⚡ GLOBAL AUDIO
const notificationSound = new Audio(notificationSoundFile);

const useListenMessages = () => {
    const { socket } = useSocketContext();
    const { addMessage, markMessagesAsSeen, addUnreadMessage } = useConversation();
    const { authUser } = useAuthContext(); // ⚡ Get the currently logged-in user

    useEffect(() => {
        if (!socket) return;

        const handleNewMessage = (newMessage) => {
            const currentChat = useConversation.getState().selectedConversation;
            
            // 1. Is this a normal message from them, or a scheduled message from ME?
            const fromMe = newMessage.senderId === authUser._id;
            
            // 2. Does it belong in the window we are currently looking at?
            const belongsToCurrentChat = fromMe 
                ? newMessage.receiverId === currentChat?._id // If I sent it, check the receiver
                : newMessage.senderId === currentChat?._id;  // If they sent it, check the sender

            // 3. Play sound ONLY if someone else sent it (no jump scares from your own scheduled messages)
            if (!fromMe) {
                try {
                    notificationSound.currentTime = 0; 
                    const playPromise = notificationSound.play();
                    if (playPromise !== undefined) {
                        playPromise.catch(err => {
                            console.warn("Browser audio policy restricted the sound:", err.message);
                        });
                    }
                } catch (err) {
                    console.error("Audio execution failed:", err);
                }
            }

            if (belongsToCurrentChat) {
                // 🟢 CHAT IS OPEN: It belongs here, so render it!
                
                if (!fromMe) {
                    newMessage.shouldShake = true; // Only shake if they sent it
                    
                    // Tell backend we saw their message
                    socket.emit("markMessagesAsSeen", {
                        conversationId: currentChat._id,
                        senderId: newMessage.senderId,
                    });
                }

                addMessage(newMessage); // ⚡ Appends the message to the UI instantly
                
            } else {
                // 🔴 CHAT IS CLOSED
                if (!fromMe) {
                    // Only give a blue unread badge if SOMEONE ELSE sent a message to a closed chat
                    addUnreadMessage(newMessage.senderId);
                }
            }
        };

        const handleMessagesSeen = ({ conversationId }) => {
            const currentChat = useConversation.getState().selectedConversation;
            if (currentChat?._id === conversationId) {
                markMessagesAsSeen(); 
            }
        };

        socket.on("newMessage", handleNewMessage);
        socket.on("messagesSeen", handleMessagesSeen);

        return () => {
            socket.off("newMessage", handleNewMessage);
            socket.off("messagesSeen", handleMessagesSeen);
        };
        
    }, [socket, addMessage, markMessagesAsSeen, addUnreadMessage, authUser]);
};

export default useListenMessages;