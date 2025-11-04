import { NextApiRequest, NextApiResponse } from "next";
import { parse_body } from "../utils/request";
import Mongo_client_Component from "@/lib/mongodb";
import bcrypt from "bcrypt";
import cookie from "cookie"
import { revert } from "@/lib/pass";

/**
 * Register
 */
export default async function handler(req: NextApiRequest, res: NextApiResponse) {
    const { username, password } = parse_body(req.body);

    const client = await Mongo_client_Component();
    const db = client.db("user");
    const collection = db.collection('data');
    await client.connect();
    const ressult = await collection.find({
        username: username
    }).toArray();
    if (ressult.length > 0) {
        return res.status(200).json({ ok: false, data: "User already exists" });
    }
    const hash = bcrypt.hashSync(revert(password), 15);
    const token = Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);

    const result = await collection.insertOne({
        username: username,
        password: hash,
        token: token,
        download_queue: [],
        pin: []
    });

    res.setHeader("Set-Cookie", cookie.serialize("token", token, {
        sameSite: "strict",
        maxAge: 60 * 60 * 24 * 7,
        path: "/",
        httpOnly: true,
        secure: true
    }))

    return res.status(200).json({ ok: true, data: result });
}