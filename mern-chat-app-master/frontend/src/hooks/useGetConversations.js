import { useEffect, useState } from "react";
import toast from "react-hot-toast";
import useConversation from "../zustand/useConversation";

const useGetConversations = () => {
    const [loading, setLoading] = useState(false);
    const [conversations, setConversations] = useState([]);
    const { setUnreadMessages } = useConversation(); 

    useEffect(() => {
        const getConversations = async () => {
            setLoading(true);
            try {
                const res = await fetch("/api/users");
                const data = await res.json();
                if (data.error) throw new Error(data.error);
                
                setConversations(data);

                const initialUnreadMap = {};
                data.forEach((user) => {
                    if (user.unreadCount > 0) initialUnreadMap[user._id] = user.unreadCount;
                });
                setUnreadMessages(initialUnreadMap);

            } catch (error) {
                toast.error(error.message);
            } finally {
                setLoading(false);
            }
        };
        getConversations();
    }, [setUnreadMessages]);

    return { loading, conversations };
};
export default useGetConversations;