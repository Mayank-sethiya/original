export const formatMessageDate = (dateString) => {
    const messageDate = new Date(dateString);
    const today = new Date();
    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);

    if (messageDate.toDateString() === today.toDateString()) {
        return "Today";
    } else if (messageDate.toDateString() === yesterday.toDateString()) {
        return "Yesterday";
    } else {
        // Returns "Jan 12" or "Jan 12, 2023" if it's from a previous year
        return messageDate.toLocaleDateString("en-US", {
            day: "numeric",
            month: "short",
            year: messageDate.getFullYear() !== today.getFullYear() ? "numeric" : undefined,
        });
    }
};