import playlist from "@/utils/music/playlist";
import { useEffect, useState } from "react";

export default function Album({
    url,
    seturl,
}: {
    url: string;
    seturl: (url: string) => void;
}) {
    // const [list, setlist] = useState([]);
    // const run = async () => {
    //     const [source, id] = url.split("/").slice(2);
    //     const result = await playlist(source as "youtube" | "spotify", id);
    //     console.log(result);
    // };

    // useEffect(() => {
    //     run();
    //     const running = setInterval(() => {
    //         run();
    //     }, 15000);
    //     return () => clearInterval(running);
    // }, []);

    return <div>Playlist</div>;
}
