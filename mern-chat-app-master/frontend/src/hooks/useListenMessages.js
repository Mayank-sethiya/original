import { useEffect } from "react";
import { useSocketContext } from "../context/SocketContext";
import useConversation from "../zustand/useConversation";
import notificationSound from "../assets/sounds/notification.mp3"; // Make sure this path exists!

const useListenMessages = () => {
	const { socket } = useSocketContext();
	const { messages, setMessages } = useConversation();

	useEffect(() => {
		// If socket is not connected, stop here
		if (!socket) return;

		// 👂 Listen for "newMessage" event (Triggered by Sender OR Cron Job)
		socket.on("newMessage", (newMessage) => {
			
			// 1. Play Sound
			const sound = new Audio(notificationSound);
			sound.play();

			// 2. Shake Effect (Optional)
			newMessage.shouldShake = true;

			// 3. Add to Chat Window
			setMessages([...messages, newMessage]);
		});

		return () => socket.off("newMessage");
	}, [socket, setMessages, messages]);
};
export default useListenMessages;