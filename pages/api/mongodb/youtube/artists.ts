import { NextApiRequest, NextApiResponse } from "next";
import { parse_body } from "../../utils/request";
import Mongo_client_Component from "@/lib/mongodb";
import { Track } from "@/types";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
    if (!["POST", "GET"].includes(req.method ?? "")) {
        return res.status(200).json({
            ok: false,
            data: "Method not allowed"
        })
    }
    const { ids = [''], data = [] }: { all: boolean, ids: string[], data: Track[] } = parse_body(req.body);
    const client = await Mongo_client_Component();
    const db = client.db("youtube");
    const collection = db.collection('artists');
    await client.connect();

    if (req.method === "GET") {
        let results: any[] = []
        for (const id of ids) {
            results.push(await collection.findOne({ id: id }) ?? {
                id: id,
                name: undefined
            });
        }
        if (results.length === 0) {
            return res.status(200).json({ ok: false, data: `Not found` });
        }
        return res.status(200).json({ ok: true, data: results });
    }
    else {
        const result = []
        for (const item of data) {
            const temp = await collection.updateOne({ id: item.id }, item, { upsert: true });
            result.push(temp)
        }
        return res.status(200).json({ ok: true, data: result });
    }
}