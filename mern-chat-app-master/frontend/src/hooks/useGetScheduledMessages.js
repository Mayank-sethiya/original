import { useState } from "react";
import useConversation from "../zustand/useConversation";
import toast from "react-hot-toast";

const useGetScheduledMessages = () => {
	const [loading, setLoading] = useState(false);
	const [scheduledMessages, setScheduledMessages] = useState([]);
	const { selectedConversation } = useConversation();

	const getScheduled = async () => {
		setLoading(true);
		try {
			const res = await fetch(`/api/messages/scheduled/${selectedConversation._id}`);
			const data = await res.json();
			if (data.error) throw new Error(data.error);
			setScheduledMessages(data);
		} catch (error) {
			toast.error(error.message);
		} finally {
			setLoading(false);
		}
	};

	const removeScheduledMessage = async (messageId) => {
		try {
			const res = await fetch(`/api/messages/cancel/${messageId}`, {
				method: "DELETE",
			});
			const data = await res.json();
			if (data.error) throw new Error(data.error);
			toast.success("Message cancelled");
			setScheduledMessages((prev) => prev.filter((msg) => msg._id !== messageId));
		} catch (error) {
			toast.error(error.message);
		}
	};

	return { scheduledMessages, loading, getScheduled, removeScheduledMessage };
};
export default useGetScheduledMessages;