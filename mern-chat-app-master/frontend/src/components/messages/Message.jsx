import { useState } from "react";
import { useAuthContext } from "../../context/AuthContext";
import { extractTime } from "../../utils/extractTime";
import useConversation from "../../zustand/useConversation";
import { BsCheck, BsCheckAll } from "react-icons/bs"; 
import toast from "react-hot-toast"; // ⚡ IMPORTED TOAST

const Message = ({ message }) => {
    const { authUser } = useAuthContext();
    const { selectedConversation } = useConversation();
    
    const [isSummarizing, setIsSummarizing] = useState(false);
    const [localSummary, setLocalSummary] = useState(message.summary || null);
    
    const fromMe = message.senderId === authUser._id;

    const timeSource = message.scheduledAt ? message.scheduledAt : message.createdAt;
    const formattedTime = extractTime(timeSource);

    const chatClassName = fromMe ? "chat-end" : "chat-start";
    
    const rawProfilePic = fromMe ? authUser.profilePic : selectedConversation?.profilePic;
    const profilePic = rawProfilePic || "/default-avatar.png";

    const bubbleBgColor = fromMe ? "bg-blue-600 text-white" : "bg-[#1e293b] text-gray-200";
    const shakeClass = message.shouldShake ? "shake" : "";

    const handleSummarize = async () => {
        if (localSummary) return; 
        
        setIsSummarizing(true); 
        try {
            const res = await fetch("/api/messages/summarize", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ messageId: message._id, messageContent: message.message }),
            });
            const data = await res.json();
            
            // ⚡ If the backend sent an error (like our 429 Quota error), throw the details!
            if (data.error) {
                throw new Error(data.details || data.error); 
            }
            
            setLocalSummary(data.summary);
        } catch (error) {
            // ⚡ Display the friendly error message beautifully on the screen
            toast.error(error.message, {
                duration: 4000, 
            });
        } finally {
            setIsSummarizing(false); 
        }
    };

    return (
        <div className={`chat ${chatClassName} mb-2`}>
            <div className='chat-image avatar'>
                <div className='w-9 h-9 rounded-full bg-slate-800 shadow-md'>
                    <img 
                        alt='User' 
                        src={profilePic} 
                        onError={(e) => { e.target.src = "/default-avatar.png"; }}
                    />
                </div>
            </div>

            <div className={`chat-bubble shadow-sm ${bubbleBgColor} ${shakeClass} pb-2 group relative`}>
                {message.message}

                {localSummary && (
                    <div className={`absolute ${fromMe ? 'right-0' : 'left-0'} -top-2 translate-y-[-100%] opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 bg-[#0f172a] text-gray-300 text-xs p-3 rounded-xl border border-slate-700 shadow-2xl w-64 z-[60] pointer-events-none`}>
                        <div className="flex items-center gap-1 mb-1.5">
                            <span className="text-[10px] uppercase tracking-wider font-bold text-yellow-400">✨ AI Summary</span>
                        </div>
                        <p className="leading-relaxed whitespace-pre-wrap">{localSummary}</p>
                    </div>
                )}

                {!localSummary && !fromMe && (
                    <button 
                        onClick={handleSummarize}
                        disabled={isSummarizing}
                        className={`absolute -top-4 left-0 bg-yellow-400 text-black font-semibold text-[10px] px-3 py-1 rounded-full border border-yellow-600 z-10 transition-opacity duration-200 disabled:opacity-100 disabled:cursor-wait ${isSummarizing ? 'opacity-100' : 'opacity-0 group-hover:opacity-100 hover:bg-yellow-500'}`}
                        title="Summarize this message"
                    >
                        {isSummarizing ? "⏳" : "✨"}
                    </button>
                )}
            </div>

            <div className='chat-footer opacity-80 text-[10px] mt-1 flex gap-1 items-center text-slate-400'>
                {formattedTime}
                {message.scheduledAt && <span title="Scheduled Message" className="ml-1">📅</span>}
                
                {fromMe && (
                    <span className={`text-[15px] ml-0.5 ${message.seen ? 'text-blue-500' : 'text-slate-500'}`}>
                        {message.seen ? <BsCheckAll /> : <BsCheck />}
                    </span>
                )}
                
                {localSummary && <span title="Summary Available" className="text-yellow-500 ml-1">✨</span>}
            </div>
        </div>
    );
};
export default Message;