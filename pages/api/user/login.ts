import { NextApiRequest, NextApiResponse } from "next";
import { parse_body } from "../utils/request";
import Mongo_client_Component from "@/lib/mongodb";
import bcrypt from "bcrypt"
import cookie from "cookie"
import { revert } from "@/lib/pass";
import create_token from "../utils/create_token";
export default async function handler(req: NextApiRequest, res: NextApiResponse) {
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
    if (!bcrypt.compareSync(revert(password), user.password)) {
        return res.status(200).json({ ok: false, data: "Password is incorrect" })
    }
    const token = create_token(username);
    const _collection = db.collection("sessions");
    _collection.insertOne({
        username:username,
        token: token.refresh_token,
    })

    res.setHeader("Set-Cookie", cookie.serialize("refresh_token", token.refresh_token, {
        sameSite: "strict",
        path: "/",
        httpOnly: true,
        secure: true,
        maxAge: 400 * 24 * 60 * 60 * 1000
    }))
    return res.status(200).json({ ok: true, access_token: token.access_token });
}