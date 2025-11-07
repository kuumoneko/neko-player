import Nav from "@/components/Navigator";
import Player from "@/components/Player";
import SearchBar from "@/components/Search";
import { useEffect, useState } from "react";

export default function Template({ children }: { children: React.ReactNode }) {
    const [url, seturl] = useState("/");
    useEffect(() => {
        // alert("This web can not play audio currently. I will fix it later.")
        const run = setInterval(() => {
            seturl(localStorage.getItem("url") ?? "/");
        }, 100);
        return () => clearInterval(run);
    }, []);

    return (
        <div className="w-screen h-screen flex flex-col items-center justify-center bg-slate-900 cursor-default select-none">
            <Nav seturl={seturl} />
            <div className="w-full h-[85%]">
                <div className="h-[5%] bg-slate-900"></div>
                <SearchBar seturl={seturl} />
                <div className="h-[90%] flex flex-col items-center justify-center">
                    {children}
                </div>
            </div>
            <Player seturl={seturl} />
        </div>
    );
}
