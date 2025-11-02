export default async function track(source: "youtube" | "spotify", ids: string[] = [""]) {
    const url = `/api/music/${source}/tracks`
    const res = await fetch(url, {
        method: "POST",
        body: JSON.stringify({
            ids: ids
        })
    })
    return (await res.json())?.data ?? [];
}