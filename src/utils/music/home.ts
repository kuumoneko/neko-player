import fetch_profile, { LocalStorageKeys } from "../profile";
import logout from "../user/logout";

export default async function home_page() {
    const pin = await fetch_profile("get", LocalStorageKeys.pin) ?? [];
    if (typeof pin === "string") {
        if (pin.includes("token")) {
            await logout(localStorage.getItem("username") ?? "");
        }
        return {
            artist: [],
            playlist: [],
            new_tracks: []
        }
    }
    else {
        const artist = pin.filter((item: any) => item.mode === "artist");
        const playlist = pin.filter((item: any) => item.mode === "playlist" || item.mode === "album");
        const res = await fetch("/api/music/new_tracks", {
            method: "POST",
            body: JSON.stringify({
                data: artist
            })
        })
        const new_tracks = (await res.json()).data ?? [];

        return {
            artist: artist,
            playlist: playlist,
            new_tracks: new_tracks
        }
    }

}