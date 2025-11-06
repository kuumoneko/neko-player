import Mongo_client_Component from "@/lib/mongodb";

export default async function mongo_spotify_tracks(mode: "GET" | "POST", ids: string[], data?: any) {
    const client = await Mongo_client_Component();
    const db = client.db("spotify");
    const collection = db.collection('tracks');
    await client.connect();
    if (mode === "GET") {
        let results: any[] = await collection.find({ id: { $in: ids } }, { projection: { _id: 0 } }).toArray()
        return ids.map((id: string) => {
            const temp = results.find((result: any) => {
                return result.id === id
            }) ?? { id: id, name: undefined };
            return temp;
        })
    }
    else {
        if (!data) {
            return "Invalid data"
        }
        const temp = data.map((item: any) => {
            return {
                updateOne: {
                    filter: { id: item.id },
                    update: { $set: { ...item } },
                    upsert: true
                }
            }
        })
        const result = await collection.bulkWrite(temp, { ordered: false });
        return result
    }
}