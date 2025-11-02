import { NextApiRequest, NextApiResponse } from "next";
import { parse_body } from "../utils/request";
import Player from "@/lib/player";
export default async function handler(req: NextApiRequest, res: NextApiResponse) {
    const { query, source, type } = parse_body(req.body);
    const player = Player.getInstance();
    if (source === "spotify") {
        const result = await player.spotify.search(query, type);
        return res.status(200).json({
            ok: true,
            data: result
        });

    }
    else {
        const result = await player.youtube.search(query, type);
        return res.status(200).json({
            ok: false,
            data: result
        })
    }
}