import { NextApiRequest, NextApiResponse } from "next";
import { parse_body } from "../utils/request";
import Mongo_client_Component from "@/lib/mongodb";
import bcrypt from "bcrypt";

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
    const hash = bcrypt.hashSync(password, 15);
    const result = await collection.insertOne({
        username: username,
        password: hash,
        token: null,
        download_queue: null,
        artists: null,
        playlist: null
    });

    return res.status(200).json({ ok: true, data: result });
}