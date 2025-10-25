import { NextApiRequest, NextApiResponse } from "next";
import { parse_body } from "../../utils/request";
import Mongo_client_Component from "@/lib/mongodb";
import bcrypt from "bcrypt"

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
    if (!["POST", "GET"].includes(req.method ?? "")) {
        return res.status(200).json({
            ok: false,
            data: "Method not allowed"
        })
    }
    const { username, password } = parse_body(req.body);
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
    if (!bcrypt.compareSync(password, user.password)) {
        return res.status(200).json({ ok: false, data: "Password is incorrect" })
    }
    const token = Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);
    await collection.updateOne({
        username: username
    }, {
        $set: {
            token: token
        }
    });
    return res.status(200).json({ ok: true, data: token });
}