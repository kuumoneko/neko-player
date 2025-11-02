export default async function search(query: string, source: string, type: string) {
    const res = await fetch("/api/music/search", {
        method: "POST",
        body: JSON.stringify({
            query: query,
            source: source,
            type: type
        })
    })
    return res.json();
}