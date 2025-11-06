import { Api_key, Track } from "@/types";
import Spotify from "./player/spotify";
import Youtube from "./player/youtube";
import Innertube, { Platform, Types, ClientType } from "youtubei.js";

export default class Player {
    private static instance: Player;
    public spotify: Spotify;
    public youtube: Youtube;
    private youtube_player: Innertube

    constructor() {
        const spotify_api_keys: Api_key[] = [];
        let start = 1;
        while (process.env[`SPOTIFY_API_KEY${start}`] !== undefined && process.env[`SPOTIFY_CLIENTID${start}`] !== undefined) {
            spotify_api_keys.push({
                key: process.env[`SPOTIFY_API_KEY${start}`] as string,
                client_id: process.env[`SPOTIFY_CLIENTID${start}`] as string,
                isReached: false,
                when: 0
            })
            start += 1;
        }

        this.spotify = new Spotify({ spotify_api_keys: spotify_api_keys })

        const youtube_api_keys: Api_key[] = [];
        start = 1;
        while (process.env[`YOUTUBE_API_KEY${start}`] !== undefined) {
            youtube_api_keys.push({
                key: process.env[`YOUTUBE_API_KEY${start}`] as string,
                isReached: false,
                when: 0
            })
            start += 1;
        }
        this.youtube = new Youtube({ api_keys: youtube_api_keys })
        this.youtube_player = null as unknown as Innertube;
    }

    public static getInstance(): Player {
        if (!Player.instance) {
            Player.instance = new Player();
        }
        return Player.instance;
    }

    getAudioURLAlternative(id: string): Promise<string> {
        return new Promise(async (resolve) => {
            Platform.shim.eval = async (data: Types.BuildScriptResult, env: Record<string, Types.VMPrimative>) => {
                const properties = [];

                if (env.n) {
                    properties.push(`n: exportedVars.nFunction("${env.n}")`)
                }

                if (env.sig) {
                    properties.push(`sig: exportedVars.sigFunction("${env.sig}")`)
                }

                const code = `${data.output}\nreturn { ${properties.join(', ')} }`;

                return new Function(code)();
            }

            if (this.youtube_player === null || this.youtube_player === undefined) {
                this.youtube_player = await Innertube.create({ client_type: ClientType.TV });
            }
            let url = "";
            while (url === "") {
                try {
                    const info = await this.youtube_player.getBasicInfo(id);
                    const format = info.chooseFormat({ type: 'audio', quality: 'best' });
                    if (format) {
                        url = await format.decipher(this.youtube_player.session.player) ?? "";
                    }
                    else {
                        url = "";
                        this.youtube_player = await Innertube.create({ client_type: ClientType.TV });

                    }
                    // console.log(url)
                }
                catch (e) {
                    url = "";
                    this.youtube_player = await Innertube.create({ client_type: ClientType.TV });
                }
            }
            resolve(url)
        })
    }



    /**
     * @param trackToMatch 
     * @param ids_dont_have 
     * must be youtube ids
     */
    async findMatchingVideo(trackToMatch: Track, ids_dont_have: string[] = []): Promise<Track | null> {
        const trackId = trackToMatch.id ?? "";
        const trackName = trackToMatch.name ?? "";
        const artistName = (trackToMatch.artist as any)[0].name ?? "";
        const trackDuration: number = trackToMatch.duration as number ?? 0; // in ms
        let database: any;

        if (ids_dont_have.length === 0 && trackToMatch.source.includes("spot")) {
            database = this.spotify.getdata([trackId]);
            if (database && database.matched) {
                const data = await this.youtube.fetch_track([database.matched]);
                return data[0];
            }
        }

        if (!trackName || !artistName) {
            throw new Error("Track name or artist is missing.");
        }

        const searchQuery = `${trackName} ${artistName}`;

        try {
            let searchResults = (await this.youtube.search(searchQuery, "video")).tracks as Track[];
            const ids: string[] = searchResults.map((track: Track) => {
                return track.id || ""
            }).filter((item: string) => {
                return !ids_dont_have.includes(item) && item !== ""
            })

            const contentRating = await this.youtube.fetch_contentRating(ids);

            const result_track = searchResults.map((item: Track) => {
                return {
                    type: "youtube:track",
                    thumbnail: item.thumbnail,
                    artists: item.artist,
                    name: item.name,
                    id: item.id,
                    duration: item.duration, // in miliseconds
                    releaseDate: item.releasedDate,
                    contentRating: contentRating[item.id as any]
                }
            })

            if (!searchResults || searchResults.length === 0) {
                return null;
            }

            let bestMatch: Track | null = null;
            let bestScore = -1;

            // 10 seconds
            const DURATION_TOLERANCE_MS = 60 * 1000;

            for (const ytVideo of result_track) {
                const durationDifference = Math.abs(ytVideo.duration as number - trackDuration);

                // ignore the video which has difference duration out 20 seconds
                if (durationDifference > DURATION_TOLERANCE_MS) {
                    continue;
                }

                // ignore the Age restricted video
                if (ytVideo.contentRating?.ytRating === "ytAgeRestricted") {
                    continue;
                }

                let score = 0;
                const videoTitle: string = ytVideo.name?.toLowerCase() as string;
                const channelTitle = (ytVideo.artists as any)[0]?.name.toLowerCase();
                const lowerCaseArtistName = artistName.toLowerCase();

                // Score based on title keywords and channel name
                if (videoTitle.includes(trackName.toLowerCase())) score += 2;
                if (channelTitle.includes(lowerCaseArtistName)) score += 3; // Strong indicator
                else if (videoTitle.includes(lowerCaseArtistName)) score += 1;

                if (videoTitle.includes("official audio") || videoTitle.includes("art track")) score += 5;
                else if (videoTitle.includes("official video") || videoTitle.includes("official music video")) score += 3;
                else if (videoTitle.includes("lyrics")) score += 2;

                // Add score based on duration proximity
                if (durationDifference < DURATION_TOLERANCE_MS) {
                    score += (5 * (1 - (durationDifference / DURATION_TOLERANCE_MS)));
                }

                if (score > bestScore) {
                    bestScore = score;
                    bestMatch = ytVideo as any;
                }
            }

            if (trackToMatch.source.includes("spot")) {
                database = {
                    thumbnail: trackToMatch.thumbnail,
                    artists: trackToMatch.artist,
                    music_url: database.music_url ?? null,
                    matched: bestMatch?.id,
                    name: trackToMatch.name,
                    duration: trackToMatch.duration,
                    releasedDate: trackToMatch.releasedDate
                }
                this.spotify.writedata([trackId], database);
            }

            return bestMatch ?? null;
        }
        catch (e) {
            console.error(e)
            return null
        }
    }
}