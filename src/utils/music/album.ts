export default async function album(source: "youtube" | "spotify", id: string = "") {
    const url = `/api/music/${source}/albums`
    const res = await fetch(url, {
        method: "POST",
        body: JSON.stringify({
            ids: [id]
        })
    })
    return ((await res.json())?.data)[0] ?? { tracks: [] };
}