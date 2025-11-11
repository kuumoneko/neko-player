import { Track } from "@/types";

export default async function Queue(item: Track, source: string) {

    const queue = JSON.parse(localStorage.getItem("queue") ?? "[]")
    const removeDuplicates = (list: any[]) => {
        return Array.from(new Set(list));
    };
    queue.push({
        name: item.name,
        artists: item.artist.map((artist: any) => artist.name).join(", "),
        thumbnail: item.thumbnail,
        source: source,
        id: item.id,
        duration: item.duration,
        time: 0,
    })
    const temp = removeDuplicates(queue);
    localStorage.setItem("queue", JSON.stringify(temp));
}