import { useEffect, useState } from "react";
import Signin from "./signin";
import Register from "./register";

export default function Auth() {    
    const [url, seturl] = useState("/");
    useEffect(() => {
        seturl(localStorage.getItem("url") ?? "/");
    }, []);
    const [isSignIn, setIsSignIn] = useState(true);

    const handleToggle = () => {
        setIsSignIn(!isSignIn);
    };

    return (
        <div className="flex items-center justify-center h-full bg-gray-900">
            <div className="form flex flex-row h-3/4 w-1/2">
                <div className="Signin h-full w-1/2 bg-slate-700 rounded-l-4xl p-4">
                    <Signin seturl={seturl} />
                </div>
                <div className="Register h-full w-1/2 bg-slate-700 rounded-r-4xl p-4">
                    <Register seturl={seturl} />
                </div>
                <div
                    className={`h-57375/100000 w-1/4 absolute bg-slate-800 ${
                        isSignIn
                            ? "right-1/4 rounded-r-4xl rounded-l-full"
                            : "left-1/4 rounded-l-4xl rounded-r-full"
                    } transition-all duration-500`}
                >
                    <div
                        className={`absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 flex flex-col items-center justify-center transition-all duration-500 z-10
                    ${isSignIn ? "opacity-100" : "opacity-0"}`}
                    >
                        <span className="text-3xl font-bold text-white">
                            Hello, Friend!
                        </span>
                        <span className="text-white">
                            Enter your personal details and gain full access to
                            our services
                        </span>
                        <button
                            className="mt-4 px-6 py-2 rounded-full bg-white text-slate-700 font-semibold hover:cursor-pointer"
                            onClick={handleToggle}
                        >
                            REGISTER
                        </button>
                    </div>
                    <div
                        className={`absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 flex flex-col items-center justify-center transition-all duration-500 z-10
                    ${isSignIn ? "opacity-0" : "opacity-100"}`}
                    >
                        <span className="text-3xl font-bold text-white">
                            Welcome Back!
                        </span>
                        <span className="text-white">
                            To keep connected with us please login with your
                            personal info
                        </span>
                        <button
                            className="mt-4 px-6 py-2 rounded-full bg-white text-slate-700 font-semibold hover:cursor-pointer"
                            onClick={handleToggle}
                        >
                            SIGN IN
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}
