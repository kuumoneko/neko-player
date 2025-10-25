import Nav from "@/components/Navigator";
import Player from "@/components/Player";
import SearchBar from "@/components/Search";
import { useState } from "react";

export default function Template({ children }: { children: React.ReactNode }) {
    const [url, seturl] = useState("/");

    return (
        <div className="w-screen h-screen flex flex-col items-center justify-center bg-slate-900 cursor-default select-none">
            <Nav seturl={seturl} />
            <div className="w-full h-[85%]">
                <div className="h-[5%] bg-slate-900"></div>
                <SearchBar seturl={seturl} />
                <div className="h-[90%]">{children}</div>
            </div>
            <Player seturl={seturl} />
        </div>
    );
}
