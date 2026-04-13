import { useState } from "react";
import { IoSearchSharp } from "react-icons/io5";
import useConversation from "../../zustand/useConversation";
import useGetConversations from "../../hooks/useGetConversations";
import toast from "react-hot-toast";

const SearchInput = () => {
    const [search, setSearch] = useState("");
    const { setSelectedConversation } = useConversation();
    const { conversations } = useGetConversations();

    const handleSubmit = (e) => {
        e.preventDefault();
        if (!search) return;
        if (search.length < 3) {
            return toast.error("Search term must be at least 3 characters long");
        }

        const conversation = conversations.find((c) => c.fullName.toLowerCase().includes(search.toLowerCase()));

        if (conversation) {
            setSelectedConversation(conversation);
            setSearch("");
        } else toast.error("No such user found!");
    };

    return (
        <form onSubmit={handleSubmit} className='flex items-center gap-2 px-2 mt-2'>
            <div className="relative w-full">
                <input
                    type='text'
                    placeholder='Search chats...'
                    className='w-full bg-[#1e293b] text-gray-200 text-sm rounded-xl block p-2.5 pl-4 pr-10 outline-none border border-slate-700/50 focus:border-blue-500 transition-all shadow-inner'
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                />
                <button type='submit' className='absolute inset-y-0 right-0 flex items-center pr-3 text-slate-400 hover:text-blue-500 transition-colors'>
                    <IoSearchSharp className='w-5 h-5 outline-none' />
                </button>
            </div>
        </form>
    );
};
export default SearchInput;