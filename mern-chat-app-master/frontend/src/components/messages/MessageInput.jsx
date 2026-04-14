import { useState, useRef, useEffect } from "react";
import { createPortal } from "react-dom";
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

    useEffect(() => {
        setPendingMessages([]); 
        fetchPendingMessages();
    }, [selectedConversation?._id]);

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
        
        const timeToSchedule = scheduledAt;
        await sendMessage(message, scheduledAt);
        
        setMessage("");
        setScheduledAt("");
        setShowEmojiPicker(false);
        
        if (timeToSchedule) {
            await fetchPendingMessages(); 
        }
    };

    const handleEmojiClick = (emojiObject) => {
        setMessage((prev) => prev + emojiObject.emoji);
    };

    // ⚡ I ACCIDENTALLY DELETED THIS IN THE LAST MESSAGE. IT IS BACK NOW! ⚡
    const openScheduleModal = () => {
        setIsScheduleModalOpen(true);
        setTimeout(() => dateInputRef.current?.showPicker(), 100);
    };

    const cancelPendingMessage = async (messageId) => {
        try {
            const res = await fetch(`/api/messages/cancel/${messageId}`, { method: "DELETE" });
            const data = await res.json();
            
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

    // PORTAL: SCHEDULE MODAL
    const ScheduleModal = () => createPortal(
        <div 
            className="fixed inset-0 bg-[#000000cc] z-[99999] flex items-center justify-center p-4 backdrop-blur-sm transition-opacity"
            onClick={() => setIsScheduleModalOpen(false)}
        >
            <div 
                className="bg-[#0f172a] rounded-2xl shadow-2xl border border-slate-700 p-6 w-full max-w-sm relative flex flex-col gap-5 transform transition-transform"
                onClick={(e) => e.stopPropagation()}
            >
                <div className="flex justify-between items-center border-b border-slate-800 pb-3">
                    <h3 className="text-base font-semibold text-gray-200 flex items-center gap-2">
                        <BsCalendar className="text-blue-500"/> Pick Date & Time
                    </h3>
                    <button type="button" onClick={() => setIsScheduleModalOpen(false)} className="text-slate-400 hover:text-white transition-colors bg-slate-800 hover:bg-slate-700 rounded-full w-8 h-8 flex items-center justify-center">✕</button>
                </div>
                <input 
                    ref={dateInputRef}
                    type="datetime-local" 
                    className="w-full p-3 rounded-xl bg-[#1e293b] text-gray-100 border border-slate-600 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 outline-none text-sm [color-scheme:dark] transition-all"
                    value={scheduledAt}
                    onChange={(e) => setScheduledAt(e.target.value)}
                />
                <div className="flex justify-end gap-3 mt-2">
                    <button type="button" onClick={() => { setScheduledAt(""); setIsScheduleModalOpen(false); }} className="px-4 py-2.5 rounded-xl bg-slate-800 text-gray-300 hover:bg-slate-700 hover:text-white transition-colors flex items-center gap-2 text-sm font-medium">
                        <MdOutlineCancel size={18} /> Cancel
                    </button>
                    <button type="button" onClick={() => setIsScheduleModalOpen(false)} disabled={!scheduledAt} className="px-5 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-sm font-semibold flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed shadow-lg transition-all">
                        <MdCheckCircle size={18} /> Confirm
                    </button>
                </div>
            </div>
        </div>,
        document.body
    );

    // PORTAL: PENDING MESSAGES MODAL
    const PendingModal = () => createPortal(
        <div 
            className="fixed inset-0 bg-[#000000cc] z-[99999] flex items-center justify-center p-4 backdrop-blur-sm transition-opacity"
            onClick={() => setIsPendingModalOpen(false)}
        >
            <div 
                className="bg-[#0f172a] rounded-2xl shadow-2xl border border-slate-700 p-6 w-full max-w-md relative flex flex-col gap-4 max-h-[85vh] transform transition-transform"
                onClick={(e) => e.stopPropagation()}
            >
                <div className="flex justify-between items-center border-b border-slate-800 pb-3">
                    <h3 className="text-base font-semibold text-gray-200 flex items-center gap-2">
                        <BsClockHistory className="text-emerald-500"/> Pending Messages
                    </h3>
                    <button type="button" onClick={() => setIsPendingModalOpen(false)} className="text-slate-400 hover:text-white transition-colors bg-slate-800 hover:bg-slate-700 rounded-full w-8 h-8 flex items-center justify-center">✕</button>
                </div>
                
                <div className="overflow-y-auto pr-2 space-y-3 custom-scrollbar">
                    {pendingMessages.length === 0 ? (
                        <div className="flex flex-col items-center justify-center py-10 opacity-60">
                            <BsClockHistory size={40} className="text-slate-500 mb-3" />
                            <p className="text-slate-400 text-sm text-center">No messages scheduled right now.</p>
                        </div>
                    ) : (
                        pendingMessages.map((msg) => (
                            <div key={msg._id} className="bg-[#1e293b] p-3.5 rounded-xl border border-slate-700 flex justify-between items-center gap-4 hover:border-slate-500 transition-colors group">
                                <div className="flex flex-col gap-1.5 overflow-hidden w-full">
                                    <p className="text-gray-200 text-sm truncate font-medium">{msg.message || "⚠️ Empty Message Error"}</p>
                                    {msg.scheduledAt && (
                                        <div className="flex items-center gap-1.5 text-blue-400 text-xs bg-blue-500/10 w-fit px-2 py-0.5 rounded-md">
                                            <BsCalendar size={10} />
                                            <span>{new Date(msg.scheduledAt).toLocaleString([], { dateStyle: 'short', timeStyle: 'short' })}</span>
                                        </div>
                                    )}
                                </div>
                                <button onClick={() => cancelPendingMessage(msg._id)} className="text-slate-500 hover:text-red-400 bg-slate-800 hover:bg-red-500/10 p-2 rounded-lg shrink-0 transition-all opacity-80 group-hover:opacity-100" title="Cancel Message">
                                    <MdDeleteOutline size={20} />
                                </button>
                            </div>
                        ))
                    )}
                </div>
            </div>
        </div>,
        document.body
    );

    return (
        <div className="w-full px-2 py-2 sm:px-4 bg-[#0f1520]/95 backdrop-blur-md border-t border-slate-800/80 relative z-20">
            
            {showEmojiPicker && (
                <div className="absolute bottom-14 left-2 sm:left-4 z-50 shadow-2xl">
                    <EmojiPicker 
                        theme="dark" 
                        onEmojiClick={handleEmojiClick} 
                        searchDisabled={true}
                        width={280}
                        height={350}
                    />
                </div>
            )}

            <form onSubmit={handleSubmit} className="flex items-center gap-2 w-full">
                
                <button 
                    type="button" 
                    onClick={() => setShowEmojiPicker(!showEmojiPicker)}
                    className="text-slate-400 hover:text-yellow-400 hover:bg-slate-800 p-2 rounded-full transition-colors shrink-0"
                >
                    <BsEmojiSmile size={20} />
                </button>

                <div className="relative flex-1 flex items-center">
                    <input
                        type='text'
                        className='w-full bg-[#1e293b] border border-slate-700 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 text-gray-200 text-sm rounded-full block py-2.5 pl-4 pr-[100px] outline-none shadow-inner transition-all placeholder-slate-500'
                        placeholder='Type your message...'
                        value={message}
                        onChange={(e) => setMessage(e.target.value)}
                    />

                    <div className="absolute right-1 flex items-center gap-0.5">
                        
                        <button 
                            type="button" 
                            onClick={() => setIsPendingModalOpen(true)}
                            className="relative text-slate-400 hover:text-emerald-400 hover:bg-slate-700 p-1.5 rounded-full transition-colors"
                            title="Pending Messages"
                        >
                            <BsClockHistory size={16} />
                            {pendingMessages.length > 0 && (
                                <span className="absolute top-0.5 right-0.5 w-2 h-2 bg-emerald-500 rounded-full border border-[#1e293b]"></span>
                            )}
                        </button>

                        <button 
                            type="button" 
                            onClick={openScheduleModal}
                            className="relative text-slate-400 hover:text-blue-400 hover:bg-slate-700 p-1.5 rounded-full transition-colors"
                            title="Schedule Message"
                        >
                            <BsCalendar size={16} />
                            {scheduledAt && (
                                <span className="absolute top-0.5 right-0.5 w-2 h-2 bg-blue-500 rounded-full border border-[#1e293b]"></span>
                            )}
                        </button>

                        <button 
                            type='submit' 
                            className='text-white bg-blue-600 hover:bg-blue-500 rounded-full shadow-md flex items-center justify-center w-7 h-7 ml-1 transition-colors'
                            disabled={loading || (!message && !scheduledAt)}
                        >
                            {loading ? <div className='loading loading-spinner loading-xs'></div> : <BsSend size={13} className="-ml-0.5" />}
                        </button>
                    </div>
                </div>
            </form>

            {isScheduleModalOpen && <ScheduleModal />}
            {isPendingModalOpen && <PendingModal />}
            
        </div>
    );
};
export default MessageInput;