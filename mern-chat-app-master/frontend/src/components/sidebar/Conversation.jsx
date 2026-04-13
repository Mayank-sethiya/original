import { useSocketContext } from "../../context/SocketContext";
import useConversation from "../../zustand/useConversation";

const Conversation = ({ conversation, lastIdx, emoji }) => {
    const { selectedConversation, setSelectedConversation, unreadMessages, clearUnreadMessages } = useConversation();

    const isSelected = selectedConversation?._id === conversation._id;
    const { onlineUsers } = useSocketContext();
    const isOnline = onlineUsers.includes(conversation._id);

    const profilePic = conversation.profilePic || "/default-avatar.png";
    const unreadCount = unreadMessages[conversation._id] || 0; 

    const handleSelect = () => {
        setSelectedConversation(conversation);
        clearUnreadMessages(conversation._id);
    };

    return (
        <>
            <div
                className={`flex gap-3 items-center hover:bg-slate-800 rounded-xl p-3 cursor-pointer transition-colors
                ${isSelected ? "bg-slate-800 border-l-4 border-blue-500" : "border-l-4 border-transparent"}
            `}
                onClick={handleSelect}
            >
                <div className={`avatar ${isOnline ? "online" : ""}`}>
                    <div className='w-11 rounded-full shadow-sm bg-slate-700'>
                        <img src={profilePic} alt='avatar' onError={(e) => { e.target.src = "/default-avatar.png"; }} />
                    </div>
                </div>

                <div className='flex flex-col flex-1 overflow-hidden'>
                    <div className='flex gap-2 justify-between items-center'>
                        <p className={`text-[15px] font-semibold truncate ${isSelected ? "text-white" : "text-gray-300"}`}>
                            {conversation.fullName}
                        </p>
                        
                        <div className="flex items-center gap-3">
                            {unreadCount > 0 && !isSelected && (
                                <span className="bg-blue-600 text-white text-[10px] font-bold px-2 py-0.5 rounded-full min-w-[20px] text-center shadow-[0_0_8px_rgba(37,99,235,0.8)]">
                                    {unreadCount}
                                </span>
                            )}
                            {/* ⚡ INCREASED EMOJI SIZE HERE */}
                            <span className='text-2xl drop-shadow-md'>{emoji}</span>
                        </div>
                    </div>
                </div>
            </div>
            {!lastIdx && <div className='divider my-0 py-0 h-[1px] bg-slate-800/50 mx-2' />}
        </>
    );
};
export default Conversation;