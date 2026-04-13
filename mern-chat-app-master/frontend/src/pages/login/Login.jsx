import { useState } from "react";
import { Link } from "react-router-dom";
import useLogin from "../../hooks/useLogin";
import CometBackground from "../../components/CometBackground"; // Import the effects!

const Login = () => {
    const [username, setUsername] = useState("");
    const [password, setPassword] = useState("");

    const { loading, login } = useLogin();

    const handleSubmit = async (e) => {
        e.preventDefault();
        await login(username, password);
    };

    return (
        <div className='flex flex-col items-center justify-center min-w-96 mx-auto min-h-screen relative'>
            <CometBackground />
            
            {/* UPDATED STAND-OUT CONTAINER */}
            <div className='w-full p-8 rounded-2xl bg-black/40 backdrop-filter backdrop-blur-xl border border-blue-500/20 shadow-[0_0_40px_rgba(59,130,246,0.15)] relative z-10'>
                <h1 className='text-3xl font-bold text-center text-gray-200 mb-6'>
                    Login to Comet <span className='text-blue-500'>Chat</span>
                </h1>

                <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                        <label className='label p-1'>
                            <span className='text-sm font-medium text-gray-300'>Username</span>
                        </label>
                        <input
                            type='text'
                            placeholder='Enter username'
                            className='w-full input h-11 bg-black/50 text-white placeholder-gray-500 border border-gray-600 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-all'
                            value={username}
                            onChange={(e) => setUsername(e.target.value)}
                        />
                    </div>

                    <div>
                        <label className='label p-1'>
                            <span className='text-sm font-medium text-gray-300'>Password</span>
                        </label>
                        <input
                            type='password'
                            placeholder='Enter Password'
                            className='w-full input h-11 bg-black/50 text-white placeholder-gray-500 border border-gray-600 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-all'
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                        />
                    </div>
                    
                    <Link to='/signup' className='text-sm text-gray-400 hover:text-blue-500 hover:underline mt-2 inline-block transition-colors'>
                        {"Don't"} have an account?
                    </Link>

                    <div className="pt-2">
                        <button className='btn btn-block h-11 bg-blue-600 hover:bg-blue-500 text-white border-none shadow-lg shadow-blue-500/30' disabled={loading}>
                            {loading ? <span className='loading loading-spinner'></span> : "Login"}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};
export default Login;