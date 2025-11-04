import List from "@/components/Show/components/list";
import Top from "@/components/Show/components/top";
import album from "@/utils/music/album";
import { useEffect, useState } from "react";

export default function Albums({
    url,
    seturl,
}: {
    url: string;
    seturl: (url: string) => void;
}) {
    const [dom, setdom] = useState(<></>);
    const run = async () => {
        console.log(localStorage.getItem("url") as string);
        const [source, id] = ((localStorage.getItem("url") as string) ?? "/")
            .split("/")
            .slice(2);
        console.log(source, id);
        const result = await album(source as "youtube" | "spotify", id);
        console.log(result);
        setdom(
            <>
                <Top
                    name={result.name}
                    thumbnail={result.thumbnail}
                    duration={result.duration}
                    source={source}
                    id={id}
                    mode="album"
                    playlist={result.tracks ?? []}
                />
                <List
                    list={result.tracks ?? []}
                    source={source}
                    id={id}
                    mode="album"
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
