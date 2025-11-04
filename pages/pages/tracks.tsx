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
                    name={result[0].name}
                    thumbnail={result[0].thumbnail}
                    duration={result[0].duration}
                    source={source}
                    id={id}
                    mode="track"
                    playlist={result}
                />
                <List list={result} source={source} id={id} mode="track" />
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
