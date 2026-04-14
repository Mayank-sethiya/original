import MessageContainer from "../../components/messages/MessageContainer";
import Sidebar from "../../components/sidebar/Sidebar";
import useConversation from "../../zustand/useConversation";

const Home = () => {
    const { selectedConversation } = useConversation();

    return (
        // ⚡ No gaps, no padding, fills the entire screen
        <div className='flex w-full h-screen overflow-hidden bg-[#0b101a] m-0 p-0'>
            
            {/* SIDEBAR: Left side. Snaps flush. */}
            <div className={`w-full md:w-[320px] lg:w-[350px] flex-shrink-0 h-full border-r border-slate-700 bg-[#0b101a] ${selectedConversation ? "hidden md:block" : "block"}`}>
                <Sidebar />
            </div>

            {/* MESSAGE CONTAINER: Right side. Takes the rest of the screen. */}
            <div className={`flex-1 h-full relative ${selectedConversation ? "block" : "hidden md:block"}`}>
                
                {/* Wallpaper applied strictly to the chat area background */}
                <div 
                    className="absolute inset-0 z-0 opacity-40"
                    style={{
                        backgroundImage: "url('/chat-bg.jpeg')",
                        backgroundSize: "cover",
                        backgroundPosition: "center",
                    }}
                ></div>

                {/* The actual chat content */}
                <div className="relative z-10 w-full h-full">
                    <MessageContainer />
                </div>
            </div>

        </div>
    );
};
export default Home;