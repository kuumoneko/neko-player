import List from "@/components/Search/list";
import search from "@/utils/music/search";
import { useEffect, useState } from "react";

export default function Search({
    url,
    seturl,
}: {
    url: string;
    seturl: (url: string) => void;
}) {
    const [searchh, setsearch] = useState({
        query: "",
        source: "",
        type: "",
        result: {
            type: "",
            tracks: [],
            playlists: [],
            artists: [],
        },
    });

    useEffect(() => {
        async function run() {
            const [source, type, query] = url.split("/").slice(2);
            const res = await search(query, source, type);
            setsearch({
                query,
                source,
                type,
                result: res.data,
            });
        }
        run();
    }, [url]);
    return (
        <>
            {[
                ...(searchh?.result?.tracks ?? {}),
                ...(searchh?.result?.playlists ?? []),
                ...(searchh?.result?.artists ?? []),
            ].length > 0 && (
                <List
                    list={
                        url.split("/").slice(2)[1] === "video"
                            ? searchh.result.tracks
                            : url.split("/").slice(2)[1] === "playlist"
                            ? searchh.result.playlists
                            : searchh.result.artists ?? []
                    }
                    source={url.split("/").slice(2)[0]}
                    type={url.split("/").slice(2)[1]}
                    id=""
                    mode="search"
                />
            )}
        </>
    );
}
