import { NextApiRequest, NextApiResponse } from "next";
import { parse_body } from "../../utils/request";
import Player from "@/lib/player";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
    if (!["POST"].includes(req.method ?? "")) {
        return res.status(200).json({
            ok: false,
            data: "Method not allowed"
        })
    }

    const { id = '' }: { id: string } = parse_body(req.body);
    if (id.length === 0) {
        return res.status(200).json({ ok: false, data: "No Id found" })
    }
    const player = Player.getInstance();
    const result = await player.spotify.fetch_playlist(id);
    return res.status(200).json({ ok: true, data: result });
}