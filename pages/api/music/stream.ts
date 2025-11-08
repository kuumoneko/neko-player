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
    // console.log(track)

    // let music_url = track.music_url ?? ""
    // if (music_url.length > 0) {
    //     const test_link_response = await fetch(music_url);
    //     if (!test_link_response.ok) {
    //         music_url = ""
    //     }
    // }

    // if (music_url !== "") {
    //     return res.status(200).json({
    //         ok: true, data: music_url
    //     })
    // }

    let musicId = "";
    if (source === "youtube") {
        musicId = id;
    } else {
        // const tracks = await player.spotify.fetch_track([id]);
        const findYtbTrack = await player.findMatchingVideo(track);
        if (!findYtbTrack) {
            return res.status(200).json({ ok: false, data: "Music not found" })
        }

        musicId = findYtbTrack.id ?? "";
    }
    // const bestAudio = await player.getAudioURLAlternative(musicId);
    // const temp = {
    //     ...track,
    //     music_url: bestAudio
    // }

    // const client = await Mongo_client_Component();
    // const db = client.db(source);
    // const collection = db.collection('tracks');
    // await client.connect();

    // collection.updateOne({ id: id }, { $set: { ...temp } }, { upsert: true });
    res.status(200).json({ ok: true, data: id })
}