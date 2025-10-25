import { youtube_api_key } from "@/types";
import Player from "./player/index.js";

export default function create() {
    const spotify_api_key = process.env.SPOTIFY_API_KEY;
    const spotify_clientid = process.env.SPOTIFY_CLIENTID;
    const youtube_api_keys: youtube_api_key[] = [];
    const start = 1;
    while (process.env[`YOUTUBE_API_KEY${start}`]) {
        youtube_api_keys.push({
            key: process.env[`YOUTUBE_API_KEY${start}`] as string,
            isReached: false
        })
    }

    if (!spotify_api_key || !spotify_clientid) {
        throw new Error("Missing spotify environment variables, check .env file")
    }

    if (youtube_api_keys.length === 0) {
        throw new Error("Missing youtube environment variables, check .env file")
    }

    return new Player({
        youtube_api_keys,
        spotify_api_key,
        spotify_clientid
    })

}