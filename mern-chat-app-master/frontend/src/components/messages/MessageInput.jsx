import { useState, useRef, useEffect } from "react";
import { BsSend, BsCalendar, BsClockHistory, BsEmojiSmile } from "react-icons/bs";
import { MdOutlineCancel, MdCheckCircle, MdDeleteOutline } from "react-icons/md";
import useSendMessage from "../../hooks/useSendMessage";
import useConversation from "../../zustand/useConversation";
import { useSocketContext } from "../../context/SocketContext";
import EmojiPicker from "emoji-picker-react";
import toast from "react-hot-toast";

const MessageInput = () => {
    const [message, setMessage] = useState("");
    const [scheduledAt, setScheduledAt] = useState("");
    const [showEmojiPicker, setShowEmojiPicker] = useState(false);
    
    // Modal States
    const [isScheduleModalOpen, setIsScheduleModalOpen] = useState(false);
    const [isPendingModalOpen, setIsPendingModalOpen] = useState(false);
    const [pendingMessages, setPendingMessages] = useState([]);

    const { loading, sendMessage } = useSendMessage();
    const { selectedConversation } = useConversation();
    const { socket } = useSocketContext();
    const dateInputRef = useRef(null);

    // --- 1. THE FETCH FUNCTION (Gets REAL messages from the DB) ---
    const fetchPendingMessages = async () => {
        if (!selectedConversation?._id) return;
        try {
            const res = await fetch(`/api/messages/scheduled/${selectedConversation._id}`);
            const data = await res.json();
            if (!data.error) {
                setPendingMessages(data);
            }
        } catch (error) {
            console.error("Failed to fetch pending messages", error);
        }
    };

    // --- 2. FIX FOR "WRONG CHAT" BUG ---
    // Clears the list the second you switch chats, then gets the correct ones
    useEffect(() => {
        setPendingMessages([]); 
        fetchPendingMessages();
    }, [selectedConversation?._id]);

    // --- 3. FIX FOR "STUCK GREEN DOT" BUG ---
    // Listens for the Cron Job. When it sends, it deletes the REAL ID from the list.
    useEffect(() => {
        if (!socket) return;
        const handleNewMessage = (newMessage) => {
            setPendingMessages((prev) => prev.filter(msg => msg._id !== newMessage._id));
        };
        socket.on("newMessage", handleNewMessage);
        return () => socket.off("newMessage", handleNewMessage);
    }, [socket]);

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!message) return;
        
        // Save these temporarily before we clear the input
        const timeToSchedule = scheduledAt;
        
        await sendMessage(message, scheduledAt);
        
        setMessage("");
        setScheduledAt("");
        setShowEmojiPicker(false);
        
        // Instead of making a fake message, fetch the REAL one from the database!
        if (timeToSchedule) {
            await fetchPendingMessages(); 
        }
    };

    const handleEmojiClick = (emojiObject) => {
        setMessage((prev) => prev + emojiObject.emoji);
    };

    const openScheduleModal = () => {
        setIsScheduleModalOpen(true);
        setTimeout(() => dateInputRef.current?.showPicker(), 100);
    };

    const cancelPendingMessage = async (messageId) => {
        try {
            const res = await fetch(`/api/messages/cancel/${messageId}`, { method: "DELETE" });
            const data = await res.json();
            
            // Handle the case where the message sent literally a second before they clicked delete
            if (data.error) {
                toast.error("Message already sent or doesn't exist");
                setPendingMessages(pendingMessages.filter(msg => msg._id !== messageId));
                return;
            }
            
            toast.success("Scheduled message cancelled");
            setPendingMessages(pendingMessages.filter(msg => msg._id !== messageId));
        } catch (error) {
            toast.error("Error cancelling message");
        }
    };

    return (
        <div className="w-full p-3 sm:p-4 bg-[#0f172a] border-t border-slate-800 relative">
            
            {/* EMOJI PICKER POPUP */}
            {showEmojiPicker && (
                <div className="absolute bottom-20 left-4 z-50 shadow-2xl">
                    <EmojiPicker 
                        theme="dark" 
                        onEmojiClick={handleEmojiClick} 
                        searchDisabled={true}
                        width={300}
                        height={400}
                    />
                </div>
            )}

            <form onSubmit={handleSubmit} className="flex items-center gap-3 w-full">
                
                {/* --- LEFT: EMOJI BUTTON --- */}
                <button 
                    type="button" 
                    onClick={() => setShowEmojiPicker(!showEmojiPicker)}
                    className="text-slate-400 hover:text-yellow-400 hover:bg-slate-800 p-2.5 rounded-full transition-colors shrink-0"
                >
                    <BsEmojiSmile size={22} />
                </button>

                {/* --- CENTER/RIGHT: INPUT & TOOLS --- */}
                <div className="relative flex-1 flex items-center">
                    <input
                        type='text'
                        className='w-full bg-[#1e293b] border border-slate-700 focus:border-blue-500 text-gray-200 text-sm rounded-full block py-3.5 pl-5 pr-[110px] outline-none shadow-inner transition-all placeholder-slate-500'
                        placeholder='Type your message...'
                        value={message}
                        onChange={(e) => setMessage(e.target.value)}
                    />

                    <div className="absolute right-1.5 flex items-center gap-1">
                        
                        <button 
                            type="button" 
                            onClick={() => setIsPendingModalOpen(true)}
                            className="relative text-slate-400 hover:text-green-400 hover:bg-slate-700 p-2 rounded-full transition-colors"
                            title="Pending Messages"
                        >
                            <BsClockHistory size={18} />
                            {pendingMessages.length > 0 && (
                                <span className="absolute top-1 right-1 w-2 h-2 bg-green-500 rounded-full border border-[#1e293b]"></span>
                            )}
                        </button>

                        <button 
                            type="button" 
                            onClick={openScheduleModal}
                            className="relative text-slate-400 hover:text-blue-400 hover:bg-slate-700 p-2 rounded-full transition-colors"
                            title="Schedule Message"
                        >
                            <BsCalendar size={18} />
                            {scheduledAt && (
                                <span className="absolute top-1 right-1 w-2 h-2 bg-blue-500 rounded-full border border-[#1e293b]"></span>
                            )}
                        </button>

                        <button 
                            type='submit' 
                            className='text-white bg-blue-600 hover:bg-blue-500 rounded-full shadow-md flex items-center justify-center w-8 h-8 ml-1 transition-colors'
                            disabled={loading || (!message && !scheduledAt)}
                        >
                            {loading ? <div className='loading loading-spinner loading-xs'></div> : <BsSend size={14} className="-ml-0.5" />}
                        </button>
                    </div>
                </div>
            </form>

            {/* --- MODAL 1: PICK DATE/TIME --- */}
            {isScheduleModalOpen && (
                <div className="fixed inset-0 bg-black/80 z-[9999] flex items-center justify-center p-4">
                    <div className="bg-[#0f172a] rounded-xl shadow-2xl border border-slate-700 p-6 w-[90%] max-w-sm relative flex flex-col gap-4">
                        <div className="flex justify-between items-center border-b border-slate-800 pb-3">
                            <h3 className="text-sm font-semibold text-gray-200 flex items-center gap-2">
                                <BsCalendar className="text-blue-500"/> Pick Date & Time
                            </h3>
                            <button type="button" onClick={() => setIsScheduleModalOpen(false)} className="text-slate-500 hover:text-gray-300">✕</button>
                        </div>
                        <input 
                            ref={dateInputRef}
                            type="datetime-local" 
                            className="w-full p-2.5 rounded-lg bg-[#1e293b] text-gray-200 border border-slate-700 focus:border-blue-500 outline-none text-sm mb-2 [color-scheme:dark]"
                            value={scheduledAt}
                            onChange={(e) => setScheduledAt(e.target.value)}
                        />
                        <div className="flex justify-end gap-2 mt-2">
                            <button type="button" onClick={() => { setScheduledAt(""); setIsScheduleModalOpen(false); }} className="px-4 py-2 rounded-lg bg-slate-800 text-gray-400 hover:bg-slate-700 flex justify-center items-center gap-2 text-xs font-medium">
                                <MdOutlineCancel size={16} /> Cancel
                            </button>
                            <button type="button" onClick={() => setIsScheduleModalOpen(false)} disabled={!scheduledAt} className="px-5 py-2 rounded-lg bg-blue-600 hover:bg-blue-500 text-white text-xs font-semibold flex justify-center items-center gap-2 disabled:opacity-50 shadow-md">
                                <MdCheckCircle size={16} /> Confirm
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* --- MODAL 2: PENDING MESSAGES VIEWER --- */}
            {isPendingModalOpen && (
                <div className="fixed inset-0 bg-black/80 z-[9999] flex items-center justify-center p-4">
                    <div className="bg-[#0f172a] rounded-xl shadow-2xl border border-slate-700 p-6 w-[90%] max-w-md relative flex flex-col gap-4 max-h-[80vh]">
                        <div className="flex justify-between items-center border-b border-slate-800 pb-3">
                            <h3 className="text-sm font-semibold text-gray-200 flex items-center gap-2">
                                <BsClockHistory className="text-green-500"/> Pending Messages
                            </h3>
                            <button type="button" onClick={() => setIsPendingModalOpen(false)} className="text-slate-500 hover:text-gray-300">✕</button>
                        </div>
                        <div className="overflow-y-auto pr-2 space-y-3">
                            {pendingMessages.length === 0 ? (
                                <p className="text-slate-500 text-xs text-center py-4">No pending messages.</p>
                            ) : (
                                pendingMessages.map((msg) => (
                                    <div key={msg._id} className="bg-[#1e293b] p-3 rounded-lg border border-slate-700 flex justify-between items-start gap-3">
                                        <div className="flex flex-col gap-1 overflow-hidden w-full">
                                            <p className="text-gray-300 text-sm truncate">{msg.message || "⚠️ Empty Message Error"}</p>
                                            {msg.scheduledAt && (
                                                <p className="text-blue-400 text-[10px]">
                                                    Sends: {new Date(msg.scheduledAt).toLocaleString()}
                                                </p>
                                            )}
                                        </div>
                                        <button onClick={() => cancelPendingMessage(msg._id)} className="text-slate-500 hover:text-red-500 p-1 shrink-0" title="Cancel Message">
                                            <MdDeleteOutline size={18} />
                                        </button>
                                    </div>
                                ))
                            )}
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};
export default MessageInput;