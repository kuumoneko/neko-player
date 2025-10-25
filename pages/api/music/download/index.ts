import { NextApiRequest, NextApiResponse } from "next";
import { parse_body } from "../../utils/request";
import Mongo_client_Component from "@/lib/mongodb";
import bcrypt from "bcrypt";

/**
 * Download
 */
export default async function download(req: NextApiRequest, res: NextApiResponse) {
    const { username, password } = parse_body(req.body);
    const client = await Mongo_client_Component();
    const db = client.db("neko-player");
    const collection = db.collection('user');
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
    const download_queue = user.download_queue;
    

}