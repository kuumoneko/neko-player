import playlist from "@/utils/music/playlist";
import { useEffect, useState } from "react";

export default function Playlist({
    url,
    seturl,
}: {
    url: string;
    seturl: (url: string) => void;
}) {
    const [list, setlist] = useState([]);
    useEffect(() => {
        async function run() {
            const [source, id] = url.split("/").slice(2);
            const result = await playlist(source as "youtube" | "spotify", id);
            setlist(result.tracks);
        }
        run();
    }, [url]);

    return <div>Playlist</div>;
}
