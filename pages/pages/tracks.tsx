import List from "@/components/Show/components/list";
import Top from "@/components/Show/components/top";
import track from "@/utils/music/track";
import { useEffect, useState } from "react";

export default function Tracks() {
    const [dom, setdom] = useState(<></>);
    const run = async () => {
        const [source, id] = ((localStorage.getItem("url") as string) ?? "/")
            .split("/")
            .slice(2);
        const result = await track(source as "youtube" | "spotify", [id]);

        setdom(
            <>
                <Top
                    name={result.name}
                    thumbnail={result.thumbnail}
                    duration={result.duration}
                    source={source}
                    id={id}
                    mode="track"
                    playlist={result.tracks}
                />
                <List
                    list={result.tracks}
                    source={source}
                    id={id}
                    mode="track"
                />
            </>
        );
    };

    useEffect(() => {
        run();
        const running = setInterval(() => {
            run();
        }, 15000);
        return () => clearInterval(running);
    }, []);

    return <>{dom}</>;
}
