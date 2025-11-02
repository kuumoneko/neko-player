import { Track } from "../../../types";
// import fetch_profile, { LocalStorageKeys } from "../../../utils/localStorage";

export default async function Play(item: Track, source: string, mode: string, id: string, list: any) {
    localStorage.setItem("play", "[]")
    localStorage.setItem("playing", JSON.stringify({
        name: item.name,
        artists: item.artist?.map((artist: any) => artist.name).join(", "),
        thumbnail: item.thumbnail,
        source: source,
        id: item.id,
    }))
    localStorage.setItem("time", "0");
    localStorage.setItem("repeat", (localStorage.getItem("repeat") === "disable") ? "disable" : "enable");

    let playedsongs = JSON.parse(localStorage.getItem("playedsongs") || "[]");
    const playing = JSON.parse(localStorage.getItem("playing") as string);
    playedsongs.push({
        artists: typeof playing.artists === "string" ? playing.artists : playing.artists.map((artist: any) => artist.name).join(", "),
        duration: playing.duration,
        id: playing.id,
        name: playing.name,
        source: playing.source,
        thumbnail: playing.thumbnail,
    })

    const uniqueObjectList = Array.from(new Map(playedsongs.map((item: any) => [item.id, item])).values());

    localStorage.setItem("playedsongs", JSON.stringify(uniqueObjectList));

    if (mode === "track") {
        localStorage.setItem("nextfrom", JSON.stringify({
            from: `${source}:${mode}:${id}`,
            tracks: [
                {
                    name: item.name,
                    artists: item.artist?.map((artist: any) => artist.name).join(", "),
                    thumbnail: item.thumbnail,
                    source: source,
                    id: item.id,
                    duration: item.duration
                }
            ]
        }))
        // await fetch_profile("write", LocalStorageKeys.nextfrom, {
        //     from: `${source}:${mode}:${id}`,
        //     tracks: [
        //         {
        //             name: item.name,
        //             artists: item.artist?.map((artist: any) => artist.name).join(", "),
        //             thumbnail: item.thumbnail,
        //             source: source,
        //             id: item.id,
        //             duration: item.duration
        //         }
        //     ]
        // })
    }
    else if (mode === "playlist" || mode === "liked songs" || mode === "local") {
        const other_tracks: any[] = list?.filter((track: any) => item.id !== track.id) || [];

        if (other_tracks.length > 0) {
            // check the shuffle mode
            const shuffle = localStorage.getItem("shuffle") as string;
            if (shuffle === "enable") {
                for (let i = other_tracks.length - 1; i > 0; i--) {
                    const j = Math.floor(Math.random() * (i + 1));
                    [other_tracks[i], other_tracks[j]] = [other_tracks[j], other_tracks[i]];
                }
            }
            localStorage.setItem("nextfrom", JSON.stringify({
                from: `${source}:${mode}:${id}`,
                tracks: other_tracks.slice(0, 20).map((track: Track) => {
                    return {
                        name: track.name,
                        artists: track.artist.map((artist: any) => artist.name).join(", "),
                        thumbnail: track.thumbnail,
                        source: source,
                        id: track.id,
                        duration: item.duration

                    }
                })
            }))
            // await fetch_profile("write", LocalStorageKeys.nextfrom, )
        }
    }
    else if (mode === "search") {
        localStorage.setItem("nextfrom", JSON.stringify({
            from: `${source}:track:${id}`,
            tracks: [
                {
                    name: item.name,
                    artists: item.artist.map((artist: any) => artist.name).join(", "),
                    thumbnail: item.thumbnail,
                    source: source,
                    id: item.id,
                    duration: item.duration
                }
            ]
        }))
        // await fetch_profile("write", LocalStorageKeys.nextfrom, {
        //     from: `${source}:track:${id}`,
        //     tracks: [
        //         {
        //             name: item.name,
        //             artists: item.artist.map((artist: any) => artist.name).join(", "),
        //             thumbnail: item.thumbnail,
        //             source: source,
        //             id: item.id,
        //             duration: item.duration
        //         }
        //     ]
        // })
    }
}