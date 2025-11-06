import { NextApiRequest, NextApiResponse } from 'next';
import { parse_body } from '../utils/request';
import { Artist, Track } from '@/types';
import Player from '@/lib/player';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
    const { data }: { data: Artist[] } = parse_body(req.body);

    const youtube_ids = data.filter((item: Artist) => item.source === "youtube").map((item: Artist) => item.id);
    const spotify_ids = data.filter((item: Artist) => item.source === "spotify").map((item: Artist) => item.id);
    const player = Player.getInstance();
    let youtube_new_tracks: Track[] = [], spotify_new_tracks: Track[] = [];

    await Promise.all([
        player.youtube.get_new_tracks(youtube_ids).then((item: Track[]) => { youtube_new_tracks = item }),
        player.spotify.get_new_tracks(spotify_ids).then((item: Track[]) => { spotify_new_tracks = item })
    ]);

    const results = Array.from(new Set([...youtube_new_tracks, ...spotify_new_tracks]));
    return res.status(200).json({
        ok: true,
        data: results
    })
}