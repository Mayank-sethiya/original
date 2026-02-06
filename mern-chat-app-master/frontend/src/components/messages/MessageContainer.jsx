import { useEffect, useState } from "react";
import useConversation from "../../zustand/useConversation";
import MessageInput from "./MessageInput";
import Messages from "./Messages";
import { TiMessages } from "react-icons/ti";
import { BsClockHistory } from "react-icons/bs";
import { MdDelete } from "react-icons/md";
import { useAuthContext } from "../../context/AuthContext";
import useGetScheduledMessages from "../../hooks/useGetScheduledMessages";

const MessageContainer = () => {
	const { selectedConversation, setSelectedConversation } = useConversation();
	const [showScheduled, setShowScheduled] = useState(false);
	const { scheduledMessages, getScheduled, removeScheduledMessage } = useGetScheduledMessages();

	useEffect(() => {
		return () => setSelectedConversation(null);
	}, [setSelectedConversation]);

	const handleOpenModal = () => {
		setShowScheduled(true);
		getScheduled();
	};

	return (
		<div className='md:min-w-[450px] flex flex-col relative'>
			{!selectedConversation ? (
				<NoChatSelected />
			) : (
				<>
					<div className='bg-slate-500 px-4 py-2 mb-2 flex justify-between items-center'>
						<div className="flex items-center gap-2">
							<span className='label-text'>To:</span>
							<span className='text-gray-900 font-bold'>{selectedConversation.fullName}</span>
						</div>
						<button onClick={handleOpenModal} className="btn btn-xs btn-ghost text-white hover:text-yellow-300 flex items-center gap-1">
							<BsClockHistory /> Pending
						</button>
					</div>

					<Messages />
					<MessageInput />

					{showScheduled && (
						<div className="absolute inset-0 bg-black/80 z-50 flex items-center justify-center p-4">
							<div className="bg-gray-800 w-full max-w-sm rounded-lg border border-gray-600 shadow-2xl flex flex-col max-h-[80%]">
								<div className="p-4 border-b border-gray-700 flex justify-between items-center">
									<h3 className="text-white font-bold flex items-center gap-2">
										<BsClockHistory className="text-yellow-400"/> Scheduled Queue
									</h3>
									<button onClick={() => setShowScheduled(false)}>✕</button>
								</div>
								<div className="p-4 overflow-y-auto flex-1 flex flex-col gap-3">
									{scheduledMessages.length === 0 ? (
										<div className="text-center py-8 text-gray-500">No pending messages.</div>
									) : (
										scheduledMessages.map((msg) => (
											<div key={msg._id} className="bg-gray-700 p-3 rounded-lg flex justify-between items-center">
												<div className="flex flex-col mr-2">
													<span className="text-white text-sm truncate">{msg.message}</span>
													<span className="text-yellow-500 text-xs mt-1">
														⏰ {new Date(msg.scheduledAt).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
													</span>
												</div>
												<button onClick={() => removeScheduledMessage(msg._id)} className="text-red-400 hover:text-white">
													<MdDelete size={18} />
												</button>
											</div>
										))
									)}
								</div>
                                <div className="p-3 border-t border-gray-700 bg-gray-800/50 rounded-b-lg">
									<button onClick={() => setShowScheduled(false)} className="w-full bg-slate-600 text-white py-2 rounded text-sm font-bold">Close</button>
								</div>
							</div>
						</div>
					)}
				</>
			)}
		</div>
	);
};
export default MessageContainer;

const NoChatSelected = () => {
	const { authUser } = useAuthContext();
	return (
		<div className='flex items-center justify-center w-full h-full'>
			<div className='px-4 text-center sm:text-lg md:text-xl text-gray-200 font-semibold flex flex-col items-center gap-2'>
				<p>Welcome 👋 {authUser.fullName} ❄</p>
				<p>Select a chat to start messaging</p>
				<TiMessages className='text-3xl md:text-6xl text-center' />
			</div>
		</div>
	);
};