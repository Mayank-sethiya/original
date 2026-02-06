import { useState } from "react";
import useConversation from "../zustand/useConversation";
import toast from "react-hot-toast";

const useSendMessage = () => {
	const [loading, setLoading] = useState(false);
	const { messages, setMessages, selectedConversation } = useConversation();

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
				setMessages([...messages, data]);
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