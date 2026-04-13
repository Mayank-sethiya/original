import { useEffect, useRef } from "react";
import useGetMessages from "../../hooks/useGetMessages";
import Message from "./Message";
import { formatMessageDate } from "../../utils/dateUtils"; // Adjust path if needed

const Messages = () => {
    const { messages, loading } = useGetMessages();
    const lastMessageRef = useRef();

    useEffect(() => {
        setTimeout(() => {
            lastMessageRef.current?.scrollIntoView({ behavior: "smooth" });
        }, 100);
    }, [messages]);

    return (
        <div className='px-4 flex-1 overflow-y-auto custom-scrollbar pt-4 bg-transparent'>
            <div className="relative z-10 pb-4 flex flex-col gap-2">
                {!loading &&
                    messages.length > 0 &&
                    messages.map((message, idx) => {
                        
                        // ⚡ CHECK IF DATE HAS CHANGED FROM PREVIOUS MESSAGE
                        // Fallback to Date.now() just in case a message lacks a timestamp
                        const currentDateStr = message.createdAt || new Date();
                        const previousDateStr = idx > 0 ? (messages[idx - 1].createdAt || new Date()) : null;
                        
                        const showDateDivider = 
                            idx === 0 || 
                            formatMessageDate(currentDateStr) !== formatMessageDate(previousDateStr);

                        return (
                            <div key={message._id}>
                                {/* ⚡ RENDER DATE DIVIDER IF NEEDED */}
                                {showDateDivider && (
                                    <div className="flex justify-center my-4">
                                        <span className="bg-[#1e293b]/80 backdrop-blur-sm text-slate-400 text-[11px] uppercase tracking-wider font-semibold px-4 py-1.5 rounded-full border border-slate-700/50 shadow-sm">
                                            {formatMessageDate(currentDateStr)}
                                        </span>
                                    </div>
                                )}
                                
                                {/* ⚡ RENDER THE ACTUAL MESSAGE BUBBLE */}
                                <div ref={idx === messages.length - 1 ? lastMessageRef : null}>
                                    <Message message={message} />
                                </div>
                            </div>
                        );
                    })}

                {/* Skeletons while loading */}
                {loading && [...Array(3)].map((_, idx) => (
                    <div key={idx} className="skeleton h-12 w-1/2 mb-4 bg-slate-800 rounded-xl mx-auto"></div>
                ))}
                
                {/* Empty State */}
                {!loading && messages.length === 0 && (
                    <p className='text-center text-slate-300 mt-10 text-sm bg-black/40 inline-block px-4 py-2 rounded-xl backdrop-blur-sm mx-auto block w-max border border-slate-700'>
                        Send a message to start the conversation
                    </p>
                )}
            </div>
        </div>
    );
};
export default Messages;