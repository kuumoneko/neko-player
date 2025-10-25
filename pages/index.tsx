import { useEffect, useState } from "react";
import HomePage from "./pages/home";
import NotFound from "./404";
import Search from "./pages/search";
import Playlist from "./pages/playlists";
import Artist from "./pages/artists";
import Local from "./pages/local";

export default function Home() {
    const [url, seturl] = useState("/");
    useEffect(() => {
        const run = setInterval(() => {
            seturl(localStorage.getItem("url") ?? "/");
        }, 100);
        return () => clearInterval(run);
    }, []);

    if (url === "/") {
        return <HomePage seturl={seturl} />;
    }

    if (url.includes("/search")) {
        return <Search url={url} seturl={seturl} />;
    }

    if (url.includes("/playlists")) {
        return <Playlist seturl={seturl} />;
    }

    if (url.includes("/artists")) {
        return <Artist seturl={seturl} />;
    }

    if (url.includes("/local")) {
        return <Local seturl={seturl} />;
    }

    return <NotFound />;
}
