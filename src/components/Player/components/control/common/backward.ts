// import fetch_profile, { LocalStorageKeys } from "../../../../../utils/localStorage";

export default async function backward() {
    let playedsongs: any[] = JSON.parse(localStorage.getItem("playedsongs") || "[]");
    // const playing = JSON.parse(localStorage.getItem("playing") as string);
    const queue = JSON.parse(localStorage.getItem("queue") ?? "[]")
    const backward = playedsongs.pop();

    localStorage.setItem("playing", JSON.stringify({
        artists: typeof backward.artists === "string" ? backward.artists : backward.artists.map((artist: any) => artist.name).join(", "),
        duration: backward.duration,
        id: backward.id,
        name: backward.name,
        source: backward.source,
        thumbnail: backward.thumbnail,
    }))

    localStorage.setItem("playedsongs", JSON.stringify(playedsongs))
    localStorage.setItem("queue", JSON.stringify(queue))
}