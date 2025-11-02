export default async function artist(source: "youtube" | "spotify", id: string = "") {
    const url = `/api/music/${source}/artists`
    const res = await fetch(url, {
        method: "POST",
        body: JSON.stringify({
            id: id
        })
    })
    return (await res.json())?.data ?? { tracks: [] };
}