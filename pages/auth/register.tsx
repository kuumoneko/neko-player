import { goto } from "@/lib/url";
import register from "@/utils/user/register";
import { faEye, faEyeSlash } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { useState } from "react";

export default function Register({
    seturl,
}: {
    seturl: (url: string) => void;
}) {
    const [username, setusername] = useState("");
    const [password, setpassword] = useState("");
    const [isShow, setShow] = useState(false);

    return (
        <div className="flex flex-col gap-2 items-center justify-center h-full">
            <span className="text-3xl font-bold">Register</span>
            <span>Enter your username and password</span>
            <form className="flex flex-col gap-2">
                <span>
                    Username:{" "}
                    <input
                        className="bg-slate-600 rounded-2xl px-2"
                        type="text"
                        onChange={(e) => {
                            setusername(e.target.value);
                        }}
                    />
                </span>

                <span>
                    Password:{" "}
                    <input
                        className="bg-slate-600 rounded-2xl px-2"
                        type={isShow ? "text" : "password"}
                        onChange={(e) => {
                            setpassword(e.target.value);
                        }}
                    />
                    <span>
                        <FontAwesomeIcon
                            icon={isShow ? faEye : faEyeSlash}
                            onClick={() => setShow(!isShow)}
                        />
                    </span>
                </span>
            </form>
            <button
                className="hover:cursor-pointer"
                onClick={async () => {
                    if (username.length === 0) {
                        alert("Please enter username");
                        return;
                    }
                    if (password.length === 0) {
                        alert("Please enter password");
                        return;
                    }

                    const passwordRegex =
                        /^(?=.*\d)(?=.*[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?~])[A-Z].{7,}$/;
                    if (!passwordRegex.test(password)) {
                        alert(
                            "Unvalid password. Your password need to have UpperCase at the first, number, special character and length more than 8"
                        );
                        return;
                    }

                    const res = await register(username, password);
                    if (res.ok) {
                        localStorage.setItem("usernname", username);
                        goto("/", seturl);
                        window.location.href = "/";
                    }
                }}
            >
                Register
            </button>
        </div>
    );
}
