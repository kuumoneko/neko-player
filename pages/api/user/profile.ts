import { NextApiRequest, NextApiResponse } from "next";
import { parse_body } from "../utils/request";
import Mongo_client_Component from "@/lib/mongodb";
import authen from "../auth/index"

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
    if (!["POST"].includes(req.method ?? "")) {
        return res.status(200).json({
            ok: false,
            data: "Method not allowed"
        })
    }
    const { mode, id, key, data } = parse_body(req.body);
    const auth = req.headers.authorization;

    if (!auth) {
        return res.status(200).json({ ok: false, data: "No token" });
    }
    const access_token = auth.split(" ")[1];
    if (!access_token) {
        return res.status(200).json({ ok: false, data: "No token" });
    }
    const token = req.cookies.refresh_token ?? "";
    if (!token) {
        return res.status(200).json({ ok: false, data: "No refresh token" });
    }
    const authencation: any = await authen(access_token, token)
    if (typeof authencation === "string") {
        return res.status(200).json({ ok: false, data: authencation });
    }

    const client = await Mongo_client_Component();
    const db = client.db("user");
    const collection = db.collection('data');
    const _collection = db.collection("sessions");
    const session = await _collection.findOne({
        username: authencation.username,
        token: token
    })
    if (session === null || session === undefined) {
        return res.status(200).json({ ok: false, data: "Invalid refresh token" });
    }

    if (mode === "get") {
        const data = authencation[key];
        return res.status(200).json({ ok: true, data: data ?? [], access_token: authencation.access_token ?? ""})
    }
    else {
        const result = await collection.updateOne({ id: id }, {
            $set: {
                [key]: typeof data === "string" ? JSON.parse(data) : data
            }
        })
        return res.status(200).json({ ok: true, data: result, access_token: authencation.access_token ?? "" })
    }
}