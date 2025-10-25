import { goto } from "@/lib/url";
import { useEffect, useState } from "react";

export default function Account({ seturl }: { seturl: (url: string) => void }) {
    const [username, setusername] = useState("");

    useEffect(() => {
        setusername(localStorage.getItem("username") ?? "");
    }, []);
    return (
        <div>
            {username.length === 0 ? (
                <div
                    className="login bg-slate-600 px-2.5 py-1 rounded-4xl"
                    onClick={() => {
                        window.location.href = "/auth";
                    }}
                >
                    Login / Register
                </div>
            ) : (
                <div
                    className="account bg-slate-600 px-2.5 py-1 rounded-4xl"
                    onClick={() => {
                        localStorage.setItem("username", "");
                        cookieStore.delete("token");
                        goto("/", seturl);
                    }}
                >
                    Signout
                </div>
            )}
        </div>
    );
}
