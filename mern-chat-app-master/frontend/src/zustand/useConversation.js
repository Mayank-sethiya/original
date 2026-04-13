import { create } from "zustand";

const useConversation = create((set) => ({
    selectedConversation: null,
    setSelectedConversation: (selectedConversation) => set({ selectedConversation }),
    
    messages: [],
    setMessages: (messages) => set({ messages: Array.isArray(messages) ? messages : [] }),
    
    // ⚡ THE FIX: A bulletproof function to add one message without wiping the array
    addMessage: (newMessage) => set((state) => ({
        messages: [...state.messages, newMessage]
    })),

    // ⚡ THE FIX: Safely updates blue ticks without needing the current array
    markMessagesAsSeen: () => set((state) => ({
        messages: state.messages.map(msg => msg.seen ? msg : { ...msg, seen: true })
    })),
    
    unreadMessages: {},
    setUnreadMessages: (unreadMap) => set({ unreadMessages: unreadMap }),
    addUnreadMessage: (userId) => set((state) => ({
        unreadMessages: { ...state.unreadMessages, [userId]: (state.unreadMessages[userId] || 0) + 1 }
    })),
    clearUnreadMessages: (userId) => set((state) => ({
        unreadMessages: { ...state.unreadMessages, [userId]: 0 }
    }))
}));

export default useConversation;