import Mongo_client_Component from "@/lib/mongodb";

export default async function mongo_youtube_artists(mode: "GET" | "POST", ids: string[], data?: any[]) {
    const client = await Mongo_client_Component();
    const db = client.db("youtube");
    const collection = db.collection('artists');
    await client.connect();

    if (mode === "GET") {
        let results: any[] = await collection.find({ id: { $in: ids } }).toArray()
        if (results.length === 0) {
            return "not Found"
        }
        return results
    }
    else {
        if (!data) {
            return "Invalid data"
        }
        const result = await collection.bulkWrite(data.map((item: any) => {
            return {
                updateOne: {
                    filter: { id: item.id },
                    update: { $set: { ...item } }
                }
            }
        }));
        return result
    }
}