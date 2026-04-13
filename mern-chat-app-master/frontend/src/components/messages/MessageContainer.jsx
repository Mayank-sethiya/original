import { useEffect } from "react";
import useConversation from "../../zustand/useConversation";
import Messages from "./Messages";
import MessageInput from "./MessageInput";
import { useAuthContext } from "../../context/AuthContext"; 

const MessageContainer = () => {
    const { selectedConversation, setSelectedConversation } = useConversation();

    // Clears chat when you log out
    useEffect(() => {
        return () => setSelectedConversation(null);
    }, [setSelectedConversation]);

    return (
        // ⚡ Ensure this wrapper is completely bg-transparent and h-full
        <div className='md:min-w-[450px] flex flex-col h-full w-full bg-transparent overflow-hidden'>
            {!selectedConversation ? (
                <NoChatSelected />
            ) : (
                <>
                    {/* ⚡ Clean Header */}
                    <div className='bg-[#0b101a]/40 backdrop-blur-md px-6 py-4 border-b border-slate-700/50 flex items-center z-20 shadow-sm'>
                        <span className='text-slate-400 text-sm mr-2'>To:</span>
                        <span className='text-gray-100 font-bold tracking-wide'>
                            {selectedConversation.fullName}
                        </span>
                    </div>

                    <Messages />
                    <MessageInput />
                </>
            )}
        </div>
    );
};

export default MessageContainer;

const NoChatSelected = () => {
    const { authUser } = useAuthContext(); 

    return (
        // ⚡ Completely transparent so the global background shows through
        <div className='flex items-center justify-center w-full h-full relative bg-transparent'>
            <div className='px-4 text-center sm:text-lg md:text-xl text-gray-200 font-semibold flex flex-col items-center gap-4 z-10 relative'>
                
                <div className="flex items-center justify-center gap-2 mb-2">
                    <span className='text-6xl inline-block animate-comet drop-shadow-[0_0_25px_rgba(96,165,250,1)]'>
                        ☄️
                    </span>
                </div>
                
                <p className="text-2xl tracking-wide drop-shadow-md">
                    Welcome back, <span className="text-blue-400 font-bold">{authUser?.fullName}</span>! 👋
                </p>
                <p className="text-slate-300 text-base font-normal mt-1 drop-shadow-sm">
                    Select a chat from the sidebar to start messaging
                </p>
            </div>
        </div>
    );
};