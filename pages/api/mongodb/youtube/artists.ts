import Mongo_client_Component from "@/lib/mongodb";

export default async function mongo_youtube_artists(mode: "GET" | "POST", ids: string[], data?: any[]) {
    const client = await Mongo_client_Component();
    const db = client.db("youtube");
    const collection = db.collection('artists');
    await client.connect();

    if (mode === "GET") {
        let results: any[] = await collection.find({ id: { $in: ids } }, { projection: { _id: 0 } }).toArray()

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
                    update: { $set: { ...item } },
                    upsert: true
                }
            }
        }));
        return result
    }
}