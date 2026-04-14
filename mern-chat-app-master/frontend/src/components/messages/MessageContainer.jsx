import { useEffect } from "react";
import useConversation from "../../zustand/useConversation";
import Messages from "./Messages";
import MessageInput from "./MessageInput";
import { useAuthContext } from "../../context/AuthContext";
import { useSocketContext } from "../../context/SocketContext";

const MessageContainer = () => {
    const { selectedConversation, setSelectedConversation } = useConversation();
    const { onlineUsers } = useSocketContext();

    useEffect(() => {
        return () => setSelectedConversation(null);
    }, [setSelectedConversation]);

    // Crash-proof online check
    const isOnline = Array.isArray(onlineUsers) 
        ? onlineUsers.includes(selectedConversation?._id) 
        : false;

    return (
        <div className='flex flex-col h-full w-full bg-transparent overflow-hidden'>
            {!selectedConversation ? (
                <NoChatSelected />
            ) : (
                <>
                    {/* SLEEK HEADER */}
                    <div className='bg-[#0f1520]/95 backdrop-blur-md px-3 md:px-4 py-2 border-b border-slate-700/80 flex items-center gap-3 z-20 w-full shadow-sm flex-shrink-0'>
                        
                        <button 
                            className="md:hidden text-slate-300 hover:text-white transition-colors"
                            onClick={() => setSelectedConversation(null)}
                        >
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                            </svg>
                        </button>

                        {/* ⚡ Avatar: Still uses the dynamic 'online' class to keep the green bubble */}
                        <div className={`avatar ${isOnline ? "online" : ""}`}>
                            <div className="w-8 h-8 md:w-9 md:h-9 rounded-full border border-slate-600 bg-slate-800 overflow-hidden">
                                <img src={selectedConversation?.profilePic || "https://avatar.iran.liara.run/public"} alt='profile' className="w-full h-full object-cover" />
                            </div>
                        </div>

                        <div className="flex flex-col justify-center">
                            <span className='text-gray-100 font-semibold text-sm md:text-base leading-tight tracking-wide'>
                                {selectedConversation?.fullName || "User"}
                            </span>
                            {/* ⚡ THE FIX: Text color is now permanently text-slate-400 */}
                            <span className="text-[10px] md:text-xs font-medium tracking-wide text-slate-400">
                                {isOnline ? 'Online' : 'Offline'}
                            </span>
                        </div>
                    </div>

                    {/* Messages Area */}
                    <div className="flex-1 overflow-auto">
                        <Messages />
                    </div>
                    
                    {/* Input Bar Area */}
                    <div className="flex-shrink-0">
                        <MessageInput />
                    </div>
                </>
            )}
        </div>
    );
};

export default MessageContainer;

const NoChatSelected = () => {
    const { authUser } = useAuthContext(); 
    return (
        <div className='flex items-center justify-center w-full h-full relative bg-transparent'>
            <div className='px-4 text-center sm:text-lg md:text-xl text-gray-200 font-semibold flex flex-col items-center gap-3 z-10 relative'>
                <span className='text-5xl md:text-6xl inline-block animate-comet drop-shadow-[0_0_25px_rgba(96,165,250,1)]'>☄️</span>
                <p className="text-xl md:text-2xl tracking-wide drop-shadow-md">
                    Welcome back, <span className="text-blue-400 font-bold">{authUser?.fullName}</span>! 👋
                </p>
                <p className="text-slate-300 text-sm md:text-base font-normal mt-1 drop-shadow-sm">
                    Select a chat from the sidebar to start messaging
                </p>
            </div>
        </div>
    );
};