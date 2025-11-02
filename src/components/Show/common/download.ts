import fetch_profile, { LocalStorageKeys } from "@/utils/profile";
import { Track } from "../../../types";

export default async function download(item: Track, source: string) {
    const queue = await fetch_profile("get", LocalStorageKeys.download_queue);
    queue.push({
        name: item.name,
        mode: "track",
        source: source,
        id: item.id,
    })
    await fetch_profile("write", LocalStorageKeys.download_queue, queue);
}