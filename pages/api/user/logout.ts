import { NextApiRequest, NextApiResponse } from "next";
import { parse_body } from "../utils/request";
import Mongo_client_Component from "@/lib/mongodb";
import authen from "../auth/index"

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
    const { username } = parse_body(req.body);
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
    const authencation: any = authen(access_token, token)
    if (typeof authencation === "string") {
        return res.status(200).json({ ok: false, data: authencation });
    }

    const client = await Mongo_client_Component();
    const db = client.db("user");
    // const collection = db.collection('data');
    await client.connect();

    const _collection = db.collection("sessions");
    const session = await _collection.findOne({
        username: username,
        token: token
    })
    if (session !== null && session !== undefined) {
        await _collection.deleteOne({
            username: username,
            token: token
        });
    }

    res.setHeader("Set-Cookie", "refresh_token=; Path=/; Expires=Thu, 01 Jan 1970 00:00:00 GMT");
    return res.status(204).json({});
}