import { Link } from "react-router-dom";
import { useState } from "react";
import useSignup from "../../hooks/useSignup";
import CometBackground from "../../components/CometBackground"; 

const SignUp = () => {
    const [inputs, setInputs] = useState({
        fullName: "",
        username: "",
        password: "",
        confirmPassword: "",
        gender: "",
        profilePic: "", 
    });

    const { loading, signup } = useSignup();

    // The available local avatars
    const maleAvatars = ["boy1.png", "boy2.png", "boy3.png", "boy4.png", "boy5.png"];
    const femaleAvatars = ["girl1.png", "girl2.png", "girl3.png", "girl4.png", "girl5.png"];

    const handleCheckboxChange = (gender) => {
        const defaultAvatar = gender === "male" ? "/avatars/boy1.png" : "/avatars/girl1.png";
        setInputs({ ...inputs, gender, profilePic: defaultAvatar });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        await signup(inputs);
    };

    return (
        <div className='flex flex-col items-center justify-center min-w-96 mx-auto min-h-screen relative'>
            <CometBackground />

            <div className='w-full max-w-md p-8 rounded-2xl bg-black/40 backdrop-filter backdrop-blur-xl border border-blue-500/20 shadow-[0_0_40px_rgba(59,130,246,0.15)] relative z-10'>
                <h1 className='text-3xl font-bold text-center text-gray-200 mb-6'>
                    Join Comet <span className='text-blue-500'>Chat</span>
                </h1>

                <form onSubmit={handleSubmit} className="space-y-3">
                    <div>
                        <input
                            type='text'
                            placeholder='Full Name'
                            className='w-full input h-10 bg-black/50 text-white placeholder-gray-500 border border-gray-600 focus:border-blue-500 transition-all'
                            value={inputs.fullName}
                            onChange={(e) => setInputs({ ...inputs, fullName: e.target.value })}
                        />
                    </div>

                    <div>
                        <input
                            type='text'
                            placeholder='Username'
                            className='w-full input h-10 bg-black/50 text-white placeholder-gray-500 border border-gray-600 focus:border-blue-500 transition-all'
                            value={inputs.username}
                            onChange={(e) => setInputs({ ...inputs, username: e.target.value })}
                        />
                    </div>

                    <div>
                        <input
                            type='password'
                            placeholder='Password'
                            className='w-full input h-10 bg-black/50 text-white placeholder-gray-500 border border-gray-600 focus:border-blue-500 transition-all'
                            value={inputs.password}
                            onChange={(e) => setInputs({ ...inputs, password: e.target.value })}
                        />
                    </div>

                    <div>
                        <input
                            type='password'
                            placeholder='Confirm Password'
                            className='w-full input h-10 bg-black/50 text-white placeholder-gray-500 border border-gray-600 focus:border-blue-500 transition-all'
                            value={inputs.confirmPassword}
                            onChange={(e) => setInputs({ ...inputs, confirmPassword: e.target.value })}
                        />
                    </div>

                    <div className="pt-2">
                        <GenderCheckbox onCheckboxChange={handleCheckboxChange} selectedGender={inputs.gender} />
                    </div>

                    {inputs.gender && (
                        <div className="pt-2 animate-fade-in">
                            <label className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2 block text-center">
                                Choose Your Avatar
                            </label>
                            <div className="flex justify-center gap-3">
                                {(inputs.gender === "male" ? maleAvatars : femaleAvatars).map((pic) => {
                                    const fullPath = `/avatars/${pic}`;
                                    const isSelected = inputs.profilePic === fullPath;
                                    return (
                                        <div 
                                            key={pic} 
                                            onClick={() => setInputs({ ...inputs, profilePic: fullPath })}
                                            className={`cursor-pointer rounded-full p-1 transition-all duration-200 ${isSelected ? 'bg-blue-500 scale-110 shadow-lg shadow-blue-500/30' : 'bg-transparent hover:bg-slate-700/50 scale-100'}`}
                                        >
                                            <div className="w-12 h-12 rounded-full bg-slate-800 overflow-hidden border border-slate-700">
                                                <img src={fullPath} alt="avatar" className="w-full h-full object-cover" />
                                            </div>
                                        </div>
                                    )
                                })}
                            </div>
                        </div>
                    )}

                    <div className="text-center pt-2">
                        <Link to={"/login"} className='text-sm text-gray-400 hover:underline hover:text-blue-500 inline-block transition-colors'>
                            Already have an account?
                        </Link>
                    </div>

                    <div className="pt-2">
                        <button className='btn btn-block h-10 bg-blue-600 hover:bg-blue-500 text-white border-none shadow-lg shadow-blue-500/30' disabled={loading}>
                            {loading ? <span className='loading loading-spinner'></span> : "Sign Up"}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

const GenderCheckbox = ({ onCheckboxChange, selectedGender }) => {
    return (
        <div className='flex gap-4 justify-center bg-black/30 p-2 rounded-lg border border-gray-700/50'>
            <div className='form-control'>
                <label className={`label gap-2 cursor-pointer transition-all duration-200 ${selectedGender === "male" ? "opacity-100" : "opacity-50 hover:opacity-100"}`}>
                    <span className='text-sm font-medium text-gray-300'>Male</span>
                    <input type='checkbox' className='checkbox checkbox-sm border-gray-500 checked:border-blue-500 checked:bg-blue-500 rounded-md' checked={selectedGender === "male"} onChange={() => onCheckboxChange("male")} />
                </label>
            </div>
            
            <div className='form-control'>
                <label className={`label gap-2 cursor-pointer transition-all duration-200 ${selectedGender === "female" ? "opacity-100" : "opacity-50 hover:opacity-100"}`}>
                    <span className='text-sm font-medium text-gray-300'>Female</span>
                    <input type='checkbox' className='checkbox checkbox-sm border-gray-500 checked:border-pink-500 checked:bg-pink-500 rounded-md' checked={selectedGender === "female"} onChange={() => onCheckboxChange("female")} />
                </label>
            </div>
        </div>
    );
};

export default SignUp;