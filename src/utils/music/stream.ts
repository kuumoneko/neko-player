export default async function stream(source: "youtube" | "spotify", id: string) {
    const res = await fetch("/api/music/stream", {
        method: "POST",
        body: JSON.stringify({
            source: source,
            id: id
        })
    })
    return (await res.json()).data;
}