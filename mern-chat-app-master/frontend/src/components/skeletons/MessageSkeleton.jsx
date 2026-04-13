const MessageSkeleton = () => {
    return (
        <div className="opacity-70 animate-pulse">
            <div className='flex gap-3 items-center mb-4'>
                <div className='w-10 h-10 rounded-full bg-gray-600/50 shrink-0'></div>
                <div className='flex flex-col gap-2'>
                    <div className='h-4 w-40 bg-gray-600/50 rounded'></div>
                    <div className='h-4 w-24 bg-gray-600/50 rounded'></div>
                </div>
            </div>
            <div className='flex gap-3 items-center justify-end mb-4'>
                <div className='flex flex-col gap-2 items-end'>
                    <div className='h-4 w-40 bg-blue-500/20 rounded'></div>
                    <div className='h-4 w-32 bg-blue-500/20 rounded'></div>
                </div>
                <div className='w-10 h-10 rounded-full bg-blue-500/20 shrink-0'></div>
            </div>
        </div>
    );
};
export default MessageSkeleton;