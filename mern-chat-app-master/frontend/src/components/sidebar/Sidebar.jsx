import SearchInput from "./SearchInput";
import Conversations from "./Conversations";
import LogoutButton from "./LogoutButton";
import useListenMessages from "../../hooks/useListenMessages"; 

const Sidebar = () => {
    
    useListenMessages();

    return (
        <div className='border-r border-slate-700 p-4 flex flex-col w-full md:w-[320px] min-w-[280px] bg-[#0b101a] z-10'>
            
            <div className="flex items-center gap-2 w-full mb-4 px-2">
                {/* ⚡ THE UPDATED CONTINUOUS FLOATING COMET */}
                <span className="text-2xl inline-block animate-comet drop-shadow-[0_0_12px_rgba(96,165,250,0.9)]">
                    ☄️
                </span>
                <h1 className="text-xl font-bold tracking-wide text-gray-100">
                    Comet <span className="text-blue-500">Chat</span>
                </h1>
            </div>

            <SearchInput />
            <div className='divider px-3 border-slate-700 mt-4 mb-2'></div>
            
            <div className="flex-1 overflow-y-auto pr-1 custom-scrollbar">
                <Conversations />
            </div>
            
            <div className="pt-2 border-t border-slate-700 mt-2">
                <LogoutButton />
            </div>
        </div>
    );
};
export default Sidebar;