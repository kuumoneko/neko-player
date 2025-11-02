export default async function playlist(source: "youtube" | "spotify", id: string = "") {
    const url = `/api/music/${source}/playlists`
    const res = await fetch(url, {
        method: "POST",
        body: JSON.stringify({
            id: id
        })
    })
    return (await res.json())?.data ?? { tracks: [] };
}