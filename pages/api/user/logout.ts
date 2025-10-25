import { NextApiRequest, NextApiResponse } from "next";
import { parse_body } from "../utils/request";
import Mongo_client_Component from "@/lib/mongodb";
import bcrypt from "bcrypt"

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
    const { username } = parse_body(req.body);
    const token = req.cookies.token ?? "";
    console.log(token)

    const client = await Mongo_client_Component();
    const db = client.db("user");
    const collection = db.collection('data');
    await client.connect();
    const ressult = await collection.find({
        username: username
    }).toArray();
    if (ressult.length === 0) {
        return res.status(200).json({ ok: false, data: "User not found" });
    }
    const user = ressult[0];
    if (token !== user.token) {
        return res.status(200).json({ ok: false, data: "Unvalid token" })
    }
    await collection.updateOne({
        username: username
    }, {
        $set: {
            token: null,
            expires: null
        }
    });
    res.setHeader("Set-Cookie", "token=; Path=/; Expires=Thu, 01 Jan 1970 00:00:00 GMT");
    return res.status(200).json({ ok: true });
}