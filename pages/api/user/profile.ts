import { NextApiRequest, NextApiResponse } from "next";
import { parse_body } from "../utils/request";
import Mongo_client_Component from "@/lib/mongodb";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
    if (!["POST"].includes(req.method ?? "")) {
        return res.status(200).json({
            ok: false,
            data: "Method not allowed"
        })
    }
    const { mode, id, key, data } = parse_body(req.body);
    const token = req.cookies.token ?? "";
    const client = await Mongo_client_Component();
    const db = client.db("user");
    const collection = db.collection('data');
    const token_data = await collection.find({ id: id }, { projection: { token: 1, _id: 0 } }).toArray();
    if (token_data.length === 0) {
        return res.status(200).json({ ok: false, data: "User not found" })
    }

    if (token !== token_data[0].token) {
        return res.status(200).json({ ok: false, data: "Invalid token" })
    }

    if (mode === "get") {
        const data = (await collection.find({ id: id }, {
            projection: {
                [key]: 1,
                _id: 0
            }
        }).toArray())[0][key] ?? []


        return res.status(200).json({ ok: true, data: data ?? [] })
    }
    else {
        const result = await collection.updateOne({ id: id }, {
            $set: {
                [key]: typeof data === "string" ? JSON.parse(data) : data
            }
        })
        return res.status(200).json({ ok: true, data: result })
    }
}