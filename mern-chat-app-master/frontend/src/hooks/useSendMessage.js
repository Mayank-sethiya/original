import { useState } from "react";
import useConversation from "../zustand/useConversation";
import toast from "react-hot-toast";

const useSendMessage = () => {
    const [loading, setLoading] = useState(false);
    
    // ⚡ THE FIX: We pull 'addMessage' instead of 'messages' and 'setMessages'
    const { selectedConversation, addMessage } = useConversation();

    // ✅ CRITICAL: Must accept 'scheduledAt' as the second argument
    const sendMessage = async (message, scheduledAt) => {
        setLoading(true);
        try {
            const res = await fetch(`/api/messages/send/${selectedConversation._id}`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                // ✅ CRITICAL: Must include 'scheduledAt' in the body
                body: JSON.stringify({ message, scheduledAt }),
            });
            const data = await res.json();
            if (data.error) throw new Error(data.error);

            // Logic: If backend says "isSent: false", it's scheduled. Don't add to chat.
            if (data.isSent === false) {
                toast.success("Message Scheduled! 📅 Check Pending Box.");
            } else {
                // ⚡ THE FIX: Safely push the message to the store without wiping history
                addMessage(data);
            }
        } catch (error) {
            toast.error(error.message);
        } finally {
            setLoading(false);
        }
    };

    return { sendMessage, loading };
};
export default useSendMessage;