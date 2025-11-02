import { Track } from "@/types";
import playlist from "./playlist";
import artist from "./artist";

export const add_items = async (source: string, mode: string, id: string, after_tracks: any[]) => {
    let data: any;

    if (mode === "playlist") {
        data = await playlist(source as "youtube" | "spotify", id)
    }
    else if (mode === "track") {
        data = await artist(source as "youtube" | "spotify", id)
    }

    const tracks = data.tracks as Track[];

    const shuffle = localStorage.getItem("shuffle") || "disable";

    if (shuffle === "enable") {
        for (let i = tracks.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [tracks[i], tracks[j]] = [tracks[j], tracks[i]];
        }
    }

    if (after_tracks.length < 20) {
        after_tracks.push(...tracks.slice(0, 20 - after_tracks.length).map((item: Track) => ({
            artists: item.artist.map((artist: any) => artist.name).join(", "),
            duration: item.duration,
            id: item.id,
            name: item.name,
            source: item.source,
            thumbnail: item.thumbnail,
        })
        ));
    }

    localStorage.setItem("nextfrom", JSON.stringify({
        from: `${source}:${mode}:${id}`,
        tracks: after_tracks,
    }))
}