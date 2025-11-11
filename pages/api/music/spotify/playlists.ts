import { NextApiRequest, NextApiResponse } from "next";
import { parse_body } from "../../utils/request";
import Player from "@/lib/player";
import { Track } from "@/types";

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


    res.status(200).json({ ok: true, data: result });
    const temp: any = await player.spotify.getdata((result?.tracks as any[] ?? []).map((item: Track) => item.id));
    const temping = []
    for (const track of result.tracks as Track[]) {
        const lmao = temp.find((item: Track) => item.id === track.id)

        if (track.matched === null && lmao.matched === null) {
            try {
                const tempp = await player.findMatchingVideo(track)
                temping.push({
                    ...track,
                    matched: tempp?.id
                })
            }
            catch (e) {
                temping.push({
                    ...track,
                    matched: null
                })
            }
        }
        else {
            temping.push({
                ...track,
                matched: lmao.matched
            })
        }
    }
    player.spotify.writedata(temping.map((item: Track) => item.id), temping)
}