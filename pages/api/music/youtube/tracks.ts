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

    const { ids = [''] }: { ids: string[] } = parse_body(req.body);
    if (ids.length === 1 && ids[0].length === 0) {
        return res.status(200).json({ ok: false, data: "No Id found" })
    }
    const player = Player.getInstance();
    const result = await player.youtube.fetch_track(ids);
    return res.status(200).json({ ok: true, data: result });
}