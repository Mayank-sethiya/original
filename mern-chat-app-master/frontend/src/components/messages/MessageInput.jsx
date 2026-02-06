import { useState, useRef } from "react";
import { BsSend, BsCalendar } from "react-icons/bs";
import { MdOutlineCancel, MdCheckCircle } from "react-icons/md";
import useSendMessage from "../../hooks/useSendMessage";

const MessageInput = () => {
	const [message, setMessage] = useState("");
	const [scheduledAt, setScheduledAt] = useState("");
	const [isModalOpen, setIsModalOpen] = useState(false);
	const { loading, sendMessage } = useSendMessage();
	
	const dateInputRef = useRef(null);

	const handleSubmit = async (e) => {
		e.preventDefault();
		if (!message) return;

		// ✅ Pass BOTH text and date to the hook
		await sendMessage(message, scheduledAt);

		setMessage("");
		setScheduledAt("");
	};

	const openModal = () => {
		setIsModalOpen(true);
		setTimeout(() => dateInputRef.current?.showPicker(), 100);
	};

	const confirmSchedule = () => {
		if (!scheduledAt) return;
		setIsModalOpen(false);
	};

	const cancelSchedule = () => {
		setScheduledAt("");
		setIsModalOpen(false);
	};

	return (
		<div className="relative w-full">
			<form className='px-2 sm:px-4 my-3' onSubmit={handleSubmit}>
				<div className='w-full relative'>
					<input
						type='text'
						className='border text-sm rounded-lg block w-full p-2.5 bg-gray-700 border-gray-600 text-white pr-20'
						placeholder='Send a message'
						value={message}
						onChange={(e) => setMessage(e.target.value)}
					/>

					<div className="absolute inset-y-0 right-0 flex items-center pr-3 gap-3">
						<div className="relative group">
							<button 
								type="button" 
								onClick={openModal}
								className="text-gray-400 hover:text-white transition-colors p-2"
								title="Schedule Message"
							>
								<BsCalendar size={18} />
							</button>
							
							{scheduledAt && (
								<span className="absolute top-1 right-1 flex h-3 w-3">
									<span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-yellow-400 opacity-75"></span>
									<span className="relative inline-flex rounded-full h-3 w-3 bg-yellow-500"></span>
								</span>
							)}
						</div>

						<button type='submit' className='flex items-center text-gray-400 hover:text-white p-2'>
							{loading ? <div className='loading loading-spinner'></div> : <BsSend size={18} />}
						</button>
					</div>
				</div>
				
				{scheduledAt && (
					<div className="text-[10px] sm:text-xs text-yellow-500 mt-1 ml-1 flex flex-wrap items-center gap-1">
						<span>📅 Scheduled: {new Date(scheduledAt).toLocaleString()}</span>
						<button type="button" onClick={cancelSchedule} className="text-red-400 hover:text-red-300 ml-2 underline">
							(Clear)
						</button>
					</div>
				)}
			</form>

			{isModalOpen && (
				<div className="fixed inset-0 bg-black/70 z-[9999] flex items-center justify-center p-4 backdrop-blur-sm">
					<div className="bg-gray-800 rounded-xl shadow-2xl border border-gray-600 p-5 w-[90%] max-w-sm relative flex flex-col gap-4">
						<div className="flex justify-between items-center border-b border-gray-700 pb-3">
							<h3 className="text-lg font-bold text-white flex items-center gap-2">
								<BsCalendar className="text-yellow-400"/> Schedule
							</h3>
							<button onClick={cancelSchedule} className="text-gray-400 hover:text-white text-xl">✕</button>
						</div>

						<input 
							ref={dateInputRef}
							type="datetime-local" 
							className="w-full p-3 rounded bg-gray-700 text-white border border-gray-600 focus:border-blue-500 outline-none text-base mb-4"
							value={scheduledAt}
							onChange={(e) => setScheduledAt(e.target.value)}
						/>

						<div className="flex flex-col sm:flex-row justify-end gap-3 mt-auto">
							<button 
								onClick={cancelSchedule}
								className="w-full sm:w-auto px-4 py-3 sm:py-2 rounded-lg bg-gray-700 text-gray-200 hover:bg-gray-600 flex justify-center items-center gap-2"
							>
								<MdOutlineCancel size={20} /> Cancel
							</button>
							
							<button 
								onClick={confirmSchedule}
								disabled={!scheduledAt}
								className="w-full sm:w-auto px-4 py-3 sm:py-2 rounded-lg bg-blue-600 hover:bg-blue-500 text-white font-bold flex justify-center items-center gap-2 disabled:opacity-50"
							>
								<MdCheckCircle size={20} /> Confirm
							</button>
						</div>
					</div>
				</div>
			)}
		</div>
	);
};
export default MessageInput;