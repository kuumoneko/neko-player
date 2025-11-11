import { NextApiRequest, NextApiResponse } from 'next';
import { parse_body } from '../utils/request';
import Player from '@/lib/player';
import { Track } from '@/types';
import Mongo_client_Component from '@/lib/mongodb';

export default async function hendler(req: NextApiRequest, res: NextApiResponse) {
    const { source, id }: { source: "youtube" | "spotify", id: string } = parse_body(req.body);
    const player = Player.getInstance();
    let track: Track = {} as unknown as Track;
    if (source === "spotify") {
        track = (await player.spotify.fetch_track([id]))[0] ?? null;
    }
    else {
        track = (await player.youtube.fetch_track([id]))[0] ?? null;
    }

    let musicId = "";
    if (source === "youtube") {
        musicId = id;
    } else {
        if ((track.matched ?? "").length > 0) {
            return res.status(200).json({ ok: true, data: track.matched })
        }
        const findYtbTrack = await player.findMatchingVideo(track);
        if (!findYtbTrack) {
            return res.status(200).json({ ok: false, data: "Music not found" })
        }

        musicId = findYtbTrack.id ?? "";
        const client = await Mongo_client_Component();
        const temp = {
            ...track,
            matched: musicId
        }
        const db = client.db(source);
        const collection = db.collection('tracks');
        await client.connect();

        collection.updateOne({ id: id }, { $set: { ...temp } }, { upsert: true });
    }
    res.status(200).json({ ok: true, data: musicId })
}