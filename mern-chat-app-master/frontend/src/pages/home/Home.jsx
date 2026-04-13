import MessageContainer from "../../components/messages/MessageContainer";
import Sidebar from "../../components/sidebar/Sidebar";

const Home = () => {
    return (
        <div className='flex w-full h-screen overflow-hidden relative z-10'>
            
            {/* ⚡ 1. THE PERMANENT WALLPAPER (Never cuts off, never tiles) */}
            <div 
                className="fixed inset-0 z-[-2]"
                style={{
                    backgroundImage: "url('/chat-bg.jpeg')",
                    backgroundSize: "cover",
                    backgroundPosition: "center",
                    backgroundRepeat: "no-repeat"
                }}
            ></div>

            {/* ⚡ 2. THE GLOBAL GREY FILTER (Adjust the /50 to make it lighter or darker) */}
            {/* bg-[#0b101a]/50 gives it that sleek, slightly transparent dark grey look */}
            <div className="fixed inset-0 bg-[#0b101a]/50 z-[-1]"></div>
            
            {/* ⚡ 3. FOREGROUND APP CONTENT */}
            <Sidebar />
            <MessageContainer />
        </div>
    );
};
export default Home;