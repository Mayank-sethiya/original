import { useAuthContext } from "../../context/AuthContext";
import { extractTime } from "../../utils/extractTime";
import useConversation from "../../zustand/useConversation";

const Message = ({ message }) => {
	const { authUser } = useAuthContext();
	const { selectedConversation } = useConversation();
	const fromMe = message.senderId === authUser._id;

	// ✅ FIX: If it was scheduled, use 'scheduledAt'. If not, use 'createdAt'.
	// This makes the time appear correctly (e.g., 11:26) instead of when you typed it.
	const timeSource = message.scheduledAt ? message.scheduledAt : message.createdAt;
	const formattedTime = extractTime(timeSource);

	const chatClassName = fromMe ? "chat-end" : "chat-start";
	const profilePic = fromMe ? authUser.profilePic : selectedConversation?.profilePic;
	const bubbleBgColor = fromMe ? "bg-blue-500" : "";

	const shakeClass = message.shouldShake ? "shake" : "";

	const handleSummarize = async () => {
		try {
			const res = await fetch("/api/messages/summarize", {
				method: "POST",
				headers: { "Content-Type": "application/json" },
				body: JSON.stringify({ messageContent: message.message }),
			});
			const data = await res.json();
			if (data.error) throw new Error(data.error);

			// Display the summary
			alert("📝 Summary: " + data.summary);
		} catch (error) {
			console.error(error);
			alert("Failed to summarize");
		}
	};

	return (
		<div className={`chat ${chatClassName}`}>
			<div className='chat-image avatar'>
				<div className='w-10 rounded-full'>
					<img alt='Tailwind CSS chat bubble component' src={profilePic} />
				</div>
			</div>

			<div className={`chat-bubble text-white ${bubbleBgColor} ${shakeClass} pb-2 group relative`}>
				{message.message}

				{/* Summarize Button */}
				<button 
					onClick={handleSummarize}
					className="absolute -top-5 right-0 bg-yellow-400 text-black text-[10px] px-2 py-0.5 rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
					title="Summarize this message"
				>
					✨ Summarize
				</button>
			</div>

			<div className='chat-footer opacity-50 text-xs flex gap-1 items-center'>
				{formattedTime}
				{/* 📅 Optional: Little icon to show it was a scheduled message */}
				{message.scheduledAt && <span title="Scheduled Message">📅</span>}
			</div>
		</div>
	);
};
export default Message;