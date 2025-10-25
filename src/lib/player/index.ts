import { youtube_api_key, PlayerOption } from "@/types";

export default class Player {
    private youtube_api_keys: youtube_api_key[] = [];
    private spotify_api_key: string = "";
    private spotify_clientid: string = "";

    constructor(option: PlayerOption) {
        this.youtube_api_keys = option.youtube_api_keys;
        this.spotify_api_key = option.spotify_api_key;
        this.spotify_clientid = option.spotify_clientid;
    }
}