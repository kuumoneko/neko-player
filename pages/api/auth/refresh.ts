import { NextApiRequest, NextApiResponse } from "next";
import { parse_body } from "../utils/request";
import Mongo_client_Component from "@/lib/mongodb";
import create_token from "../utils/create_token";

export default async function handler(req:NextApiRequest, res: NextApiResponse) {
    if (!["POST"].includes(req.method ?? "")) {
        return res.status(200).json({
            ok: false,
            data: "Method not allowed"
        })
    }
    const refresh_token = req.cookies.refresh_token ?? "";
    const {username} = parse_body(req.body);
    
    const client = await Mongo_client_Component();
    const db = client.db("user");
    const collection = db.collection('data');
    await client.connect();
    const ressult = await collection.findOne({
        username: username
    }, {
        projection: {
            password: 0,
            _id:0,
            token: 1,
        }
    });
    if (ressult === null || ressult === undefined) {
        return res.status(200).json({ ok: false, data: "User not found" });
    }
    if (ressult.token !== refresh_token) {
        return res.status(200).json({ ok: false, data: "Invalid token" })
    }
    const token = create_token(username);
    return res.status(200).json({ ok: true, access_token: token.access_token });
}