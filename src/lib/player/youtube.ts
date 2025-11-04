import { Playlist, Track, Api_key, Artist } from "@/types";
import iso8601DurationToMilliseconds from "@/utils/time";
import mongo_youtube_tracks from "../../../pages/api/mongodb/youtube/tracks";
import mongo_youtube_playlists from "../../../pages/api/mongodb/youtube/playlists";

function getNextResetTimestamp() {
    const now = new Date();

    // UTC+7 offset in milliseconds
    const utc7OffsetMs = 7 * 60 * 60 * 1000;

    // Convert current UTC time to UTC+7
    const localTime = new Date(now.getTime() + utc7OffsetMs);

    // Set reset time to 3:00 PM UTC+7 today
    const resetLocal = new Date(localTime);
    resetLocal.setHours(15, 0, 0, 0); // 15:00:00.000

    // If current time is past 3:00 PM, move to next day
    if (localTime > resetLocal) {
        resetLocal.setDate(resetLocal.getDate() + 1);
    }

    // Convert reset time back to UTC
    const resetUTC = new Date(resetLocal.getTime() - utc7OffsetMs);
    return resetUTC.getTime(); // returns timestamp in milliseconds
}

const endpoints: { [key: string]: { url: string, params: any } } = {
    "playlist_data": {
        "url": "https://youtube.googleapis.com/youtube/v3/playlists",
        "params": {
            "part": "snippet",
            "fields": "items.snippet.title"
        }
    },
    "playlist_item": {
        "url": "https://youtube.googleapis.com/youtube/v3/playlistItems",
        "params": {
            "part": "snippet",
            "fields": "etag,nextPageToken,items(snippet(description,resourceId.videoId,thumbnails.default.url)),pageInfo.totalResults"
        }
    },
    "duration": {
        "url": "https://youtube.googleapis.com/youtube/v3/videos",
        "params": {
            "part": "contentDetails",
            "fields": "nextPageToken,items(contentDetails.duration,id)"
        }
    },
    "contentRating": {
        "url": "https://youtube.googleapis.com/youtube/v3/videos",
        "params": {
            "part": "contentDetails",
            "fields": "nextPageToken,items(contentDetails.contentRating,id)"
        }
    },
    "videos": {
        "url": "https://youtube.googleapis.com/youtube/v3/videos",
        "params": {
            "part": "snippet,contentDetails",
            "fields": "etag,nextPageToken,items(id,snippet(thumbnails.default.url,channelId,channelTitle,title,publishedAt,liveBroadcastContent),contentDetails.duration)"
        }
    },
    "artist": {
        "url": "https://youtube.googleapis.com/youtube/v3/channels",
        "params": {
            "part": "snippet,contentDetails,statistics",
            "fields": "etag,nextPageToken,items(id,snippet(title,thumbnails.default.url),contentDetails.relatedPlaylists.uploads,statistics.videoCount)"
        }
    }
}

export enum EndPoints {
    PlaylistData = "playlist_data",
    PlaylistItem = "playlist_item",
    Duration = "duration",
    ContentRating = "contentRating",
    Videos = "videos",
    Search = "search",
    Artist = "artist"
}

export default class Youtube {
    private api_keys: Api_key[] = [];
    private maxResults = 50;
    private running: any[] = [];

    constructor(option: { api_keys: Api_key[] }) {
        this.api_keys = option.api_keys;
    }

    getRandomItem(list: any[]) {
        const randomIndex = Math.floor(Math.random() * list.length);
        return list[randomIndex];
    }

    chose_api_key(): string {
        const temp = this.api_keys.filter((item: Api_key) => {
            return item.isReached === false
        })
        return this.getRandomItem(temp).key
    }

    async get_data(doc: "tracks" | "playlists" | "artists", ids: string[]) {

        let data = null;
        if (doc === "tracks") {
            data = await mongo_youtube_tracks("GET", ids)
        }
        else if (doc === "playlists") {
            data = await mongo_youtube_playlists("GET", ids)
        }
        else if (doc === "artists") {
            data = await mongo_youtube_tracks("GET", ids)
        }
        return data;
    }

    async write_data(doc: "tracks" | "playlists" | "artists", ids: string[], data: any) {
        if (doc === "tracks") {
            await mongo_youtube_tracks("POST", ids, data)
        }
        else if (doc === "playlists") {
            await mongo_youtube_playlists("POST", ids, data)
        }
        else if (doc === "artists") {
            await mongo_youtube_tracks("POST", ids, data)
        }
    }

    async fetch_data(
        url: string,
        etag?: string
    ) {
        let done = false;
        let data: any;
        while (!done) {
            const key = this.chose_api_key();
            if (key?.length === 0 || key === undefined || key === null) {
                throw new Error("Reach quota of all apikey, try to add new one")
            }

            let header: any = {
                'Content-Type': 'application/json',
            };
            if (etag && etag.length > 0) {
                header["If-None-Match"] = etag
            }
            const response = await fetch(`${url}&key=${key}`, {
                method: "GET",
                headers: header
            })
            if (response.status === 304 && response.statusText === "Not Modified") {
                data = null
                done = true
            }
            if (response.status === 404) {
                throw new Error("Not found")
            }
            else {
                try {
                    data = await response.text();
                    if (data.length === 0) {
                        data = null;
                        done = true;
                    } else {
                        try {
                            data = JSON.parse(data)
                            // console.log(data)
                        }
                        catch (e) {
                            console.log(e)
                            // console.log(`${url}&key=${key}`)
                            // console.log(data)
                        }
                        if (data?.error && data?.error?.errors[0].reason === "quotaExceeded") {
                            const temp = this.api_keys;
                            const indexx = temp.findIndex((item: Api_key) => {
                                return item.key === key;
                            })
                            temp[indexx] = {
                                key: temp[indexx].key,
                                isReached: true,
                                when: getNextResetTimestamp()
                            }
                            this.api_keys = temp;
                        }
                        else if (data?.error === null || data?.error === undefined) {
                            done = true;
                        }
                        else {
                            throw new Error(data?.error ?? "")
                        }
                    }
                }
                catch (e) {
                    console.log("error")
                    console.log(e)
                }
            }
        }
        return data;
    }

    create_end_point(endpoint: { url: string, params: any }) {
        let url = endpoint.url + "?" + new URLSearchParams(endpoint.params).toString();
        return url;
    }

    async fetch_playlist_name(id: string): Promise<string | null> {
        const url = `${this.create_end_point(endpoints[EndPoints.PlaylistData])}&id=${id}`
        let data = await this.fetch_data(url)
        return data?.items[0]?.snippet?.title || null;
    }

    async fetch_track(ids: string[]): Promise<Track[]> {
        try {
            ids = Array.from(new Set([...ids]));
            const tracks: Track[] = await this.get_data("tracks", ids) as Track[];
            const tracks_in_database: Track[] = tracks.filter(
                (item: {
                    name: string,
                    id: string
                }) => {
                    return item.name !== undefined
                })

            const tracks_out_database = tracks.filter(
                (item: {
                    name: string,
                    id: string
                }) => {
                    return item.name === undefined
                })

            const temp_tracks: Track[] = []
            if (tracks_out_database.length > 0) {
                let st = 0, ed = 49;
                if (ed > tracks_out_database.length - 1) {
                    ed = tracks_out_database.length - 1;
                }

                const url = `${this.create_end_point(endpoints[EndPoints.Videos])}`;

                while (st <= tracks_out_database.length - 1) {
                    const endpoint = url + `&id=${tracks_out_database.map((item: any) => item.id).slice(st, ed + 1).join("%2C")}`
                    const data: any = await this.fetch_data(endpoint);
                    for (const item of data.items) {

                        temp_tracks.push({
                            etag: "",
                            source: "youtube",
                            thumbnail: item.snippet.thumbnails.default.url as string ?? "",
                            artist: [
                                {
                                    name: item.snippet.channelTitle as string,
                                    id: item.snippet.channelId as string
                                }
                            ],
                            name: item.snippet.title as string,
                            id: item.id as string,
                            duration: item.snippet.liveBroadcastContent === "none" ? iso8601DurationToMilliseconds(item.contentDetails.duration) : 0, // in miliseconds
                            releasedDate: item.snippet.publishedAt.split("T")[0] as unknown as string ?? "",
                            music_url: null
                        })
                    }
                    st = ed + 1;
                    ed = st + 49;
                    if (ed > tracks_out_database.length - 1) {
                        ed = tracks_out_database.length - 1;
                    }
                }
            }

            const res = [...tracks_in_database, ...temp_tracks]
            if (temp_tracks.length > 0) {
                this.write_data("tracks", tracks_out_database.map((item: any) => item.id), temp_tracks)
            }
            return res;
        }
        catch (e: any) {
            console.error(e)
            throw new Error(e.message);
        }
    }

    fetch_playlist(id: string, pagetoken: string = ""): Promise<Playlist> {
        return new Promise(async (resolve, reject) => {
            const tracks: string[] = [];
            const url = `${this.create_end_point(endpoints[EndPoints.PlaylistItem])}&maxResults=${this.maxResults}&playlistId=${id}`;
            let this_playlist = (await this.get_data("playlists", [id]) as any)[0] as unknown as Playlist ?? { ids: [] };
            try {
                let thumbnail: string = "";
                if (this_playlist && ((this_playlist.ids as string[] ?? []).length) > 0) {
                    const tracks = await this.fetch_track(this_playlist.ids as string[]);
                    resolve({
                        source: "youtube",
                        name: this_playlist.name,
                        id: this_playlist.id,
                        etag: this_playlist.etag,
                        thumbnail: this_playlist.thumbnail,
                        duration: tracks.reduce((item: number, b: Track) => item + (b.duration as number), 0),
                        tracks: tracks
                    })
                }
                if (this.running.filter((item: any) => { item.name === `playlist:${id}` }).length === 0) {
                    this.running.push({
                        name: `playlist:${id}`
                    })
                } else {
                    return;
                }
                resolve({} as any)
                let etag = (this_playlist?.etag && this_playlist?.etag?.length > 0) ? this_playlist?.etag : undefined;
                let done = false;
                while (!done && pagetoken !== undefined && pagetoken !== null) {
                    const endpoint = url + `&pageToken=${pagetoken}`;
                    let video = await this.fetch_data(endpoint, etag);
                    if (video === null && (this_playlist.ids as string[] ?? []).length >= video?.pageInfo?.totalResults) {
                        done = true
                        break;
                    }
                    else if ((this_playlist.ids as string[] ?? []).length === video?.pageInfo?.totalResults) {
                        done = true
                        break;
                    }
                    else {
                        video = await this.fetch_data(endpoint);
                    }

                    if (pagetoken === "") {
                        etag = video?.etag ?? ""
                    }

                    if (thumbnail === "") {
                        thumbnail = video.items[0].snippet.thumbnails.default.url;
                    }

                    for (const item of video.items.filter((item: any) => {
                        return item.snippet.description !== "This video is private." && item.snippet.description !== "This video is unavailable.";
                    })) {
                        tracks.push(item.snippet.resourceId.videoId)
                    }
                    this_playlist = {
                        etag: etag ?? "",
                        thumbnail: thumbnail,
                        name: this_playlist.name ?? await this.fetch_playlist_name(id),
                        ids: Array.from(new Set([...tracks, ...this_playlist.ids as [] ?? []])),
                        id: id,
                        source: "youtube",
                        duration: 0
                    }
                    pagetoken = video.nextPageToken
                }
                this.running = this.running.filter((item: { name: string }) => { return item.name !== `playlist:${id}` })
                this.write_data("playlists", [id], [this_playlist]);
            }
            catch (e) {
                this.running = this.running.filter((item: { name: string }) => { return item.name !== `playlist:${id}` })
                console.error(e)
            }
        })
    }

    async fetch_contentRating(ids: string[]): Promise<any> {
        const durations: any = {};
        let st = 0, ed = 49;
        if (ed > ids.length - 1) {
            ed = ids.length - 1;
        }
        const url = `${this.create_end_point(endpoints[EndPoints.ContentRating])}`

        try {
            while (st <= ids.length - 1) {
                const endpoint = url + `&id=${ids.slice(st, ed + 1).join("%2C")}`
                const data: any = await this.fetch_data(endpoint);
                (data.items as any[]).forEach((item: any) => {
                    durations[item.id] = item.contentDetails.contentRating
                })
                st = ed + 1;
                ed = st + 49;
                if (ed > ids.length - 1) {
                    ed = ids.length - 1;
                }
            }
            return durations;
        }
        catch (e) {
            console.error(e);
            return durations;
        }
    }

    async search(query: string, type: "video" | "playlist" | "artist" | "") {
        try {
            const limit: number = 100
            let endpoint = `https://www.youtube.com/results?search_query=${query}`;

            const playlist_sp = "EgIQAw%253D%253D"
            const video_sp = "EgIQAQ%253D%253D"
            const channel_sp = "EgIQAg%253D%253D"

            if (type === "video") {
                endpoint += `&sp=${video_sp}`;
            }
            else if (type === "playlist") {
                endpoint += `&sp${playlist_sp}`;
            }
            else if (type === "artist") {
                endpoint += `&sp=${channel_sp}`;
            }

            const create_page = await fetch(encodeURI(endpoint));
            const pageData = await create_page.text();
            const ytInitData = pageData.split("var ytInitialData =");

            let page: any = null;
            if (ytInitData && ytInitData.length > 1) {
                const script_data = ytInitData[1]
                    .split("</script>")[0]
                    .slice(0, -1);
                page = JSON.parse(script_data);
            }

            if (page === null) {
                throw new Error("Unreachable code")
            }

            const sectionListRenderer = page.contents.twoColumnSearchResultsRenderer.primaryContents.sectionListRenderer;

            const ids: string[] = [];
            const artist_ids: any[] = []
            const playlist_ids: any[] = []
            sectionListRenderer.contents.forEach((content: any) => {
                if (content.itemSectionRenderer) {
                    content.itemSectionRenderer.contents.forEach((item: any) => {
                        if (item.videoRenderer && type === "video") {
                            const videoRender = item.videoRenderer;

                            ids.push(videoRender.videoId)
                        }
                        else if (item.lockupViewModel && type === "playlist") {
                            const playListRender = item.lockupViewModel;
                            playlist_ids.push({
                                type: "youtube:playlist",
                                id: playListRender.metadata.lockupMetadataViewModel.metadata.contentMetadataViewModel.metadataRows[playListRender.metadata.lockupMetadataViewModel.metadata.contentMetadataViewModel.metadataRows.length - 1].metadataParts[0].text.commandRuns[0].onTap.innertubeCommand.commandMetadata.webCommandMetadata.url.split("list=")[1] ?? "",
                                name: playListRender.metadata.lockupMetadataViewModel.title.content,
                                thumbnail: playListRender.contentImage.collectionThumbnailViewModel.primaryThumbnail.thumbnailViewModel.image.sources[0].url
                            })
                        }
                        else if (item.channelRenderer && type === "artist") {
                            const channelRenderer = item.channelRenderer;
                            artist_ids.push({
                                type: "youtube:artist",
                                id: channelRenderer.channelId,
                                name: channelRenderer.title.simpleText,
                                thumbnail: `https:${channelRenderer.thumbnail.thumbnails[0].url}`
                            })
                        }
                    });
                }
            });
            let itemsResult = [] as unknown as Track[];
            if (ids.length > 0) {
                const tracks = await this.fetch_track(ids)
                itemsResult = limit !== 0 ? tracks.slice(0, limit) : tracks;
            }

            return {
                type: "youtube:search",
                tracks: itemsResult,
                playlists: playlist_ids,
                artists: artist_ids
            }
        }
        catch (e: any) {
            throw new Error(e);
        }
    }

    async fetch_artist(id: string, pagetoken: string = ''): Promise<Artist> {
        if (this.running.filter((item: any) => { item.name === `artist:${id}` }).length === 0) {
            this.running.push({
                name: `artist:${id}`
            })
        } else {
            return null as unknown as Artist;
        }
        let this_artist = (await this.get_data("artists", [id]) as Artist[])[0] ?? {};
        try {
            let etag = (this_artist?.etag && this_artist.etag?.length > 0) ? this_artist?.etag : undefined
            const url = `${this.create_end_point(endpoints[EndPoints.Artist])}&id=${id}`;
            const item = (await this.fetch_data(url, etag) as any);
            if (item === null) {
                let playlist_id = this_artist.playlistId ?? "";
                if (playlist_id === "") {
                    const temping = (await this.fetch_data(url) as any);
                    playlist_id = temping.items[0].contentDetails.relatedPlaylists.uploads
                }
                const playlist = await this.fetch_playlist(playlist_id)
                const artist_tracks = playlist.tracks as Track[];
                this.write_data("artists", [id], [{
                    ...this_artist,
                    playlistId: playlist_id
                }]);
                this.running = this.running.filter((item: { name: string }) => { return item.name !== `artist:${id}` })

                return {
                    source: "youtube",
                    name: this_artist.name,
                    id: this_artist.id,
                    tracks: artist_tracks,
                    thumbnail: this_artist.thumbnail,
                    playlistId: playlist_id
                }
            }
            etag = item.etag;
            const itemm = item.items[0];
            let playlist_id = itemm.contentDetails.relatedPlaylists.uploads;
            const artist_playlist = await this.fetch_playlist(playlist_id)
            const artist_tracks = artist_playlist.tracks as Track[];
            this_artist = {
                source: "youtube",
                etag: etag,
                id: id,
                name: itemm.snippet.title,
                thumbnail: itemm.snippet?.thumbnails?.default?.url || "",
                // videoCount: itemm.statistics.videoCount,
                playlistId: playlist_id,
                tracks: []
            }
            this.write_data("artists", [id], [this_artist]);
            this.running = this.running.filter((item: { name: string }) => { return item.name !== `artist:${id}` })

            return {
                source: "youtube",
                name: itemm.snippet.title,
                id: itemm.id,
                tracks: artist_tracks,
                thumbnail: itemm.snippet?.thumbnails?.default?.url || "",
                playlistId: playlist_id
            }
        }
        catch (e) {
            this.running = this.running.filter((item: { name: string }) => { return item.name !== `artist:${id}` })
            console.error(e);
            return null as unknown as Artist;
        }
    }

    async get_new_tracks(ids: string[]) {
        // const new_tracks = this.getdata("new_tracks") ?? {};

        const base_playlist__url = `${this.create_end_point(endpoints[EndPoints.PlaylistItem])}&maxResults=${this.maxResults}`;
        const base_artist__url = `${this.create_end_point(endpoints[EndPoints.Artist])}`;

        const artist = async (id: string): Promise<string> => {
            let this_artist: Artist = this.get_data("artists", [id]) as unknown as Artist ?? {};
            const artist_url = base_artist__url + `&id=${id}`;

            const artist_etag = (this_artist?.etag && this_artist?.etag?.length > 0) ? this_artist?.etag : undefined;

            let artist = await this.fetch_data(artist_url, artist_etag);

            let playlistId: string = "",
                thumbnail = "", name = "";
            if (artist === null) {
                if (this_artist.playlistId && this_artist.playlistId?.length > 0) {
                    playlistId = this_artist.playlistId;
                    thumbnail = this_artist.thumbnail;
                    name = this_artist.name
                }
                else {
                    artist = await this.fetch_data(artist_url);
                }
            }
            if (artist !== null) {
                const itemm = artist.items[0];
                playlistId = itemm.contentDetails.relatedPlaylists.uploads;
                thumbnail = itemm.snippet.thumbnails.default.url || "";
                name = itemm.snippet.title;

                this_artist = {
                    source: "youtube",
                    etag: artist.etag,
                    name: name,
                    id: itemm.id,
                    thumbnail: thumbnail,
                    playlistId: playlistId,
                    tracks: []
                }
            }

            this.write_data("artists", [id], [this_artist]);
            return playlistId;
        }

        const playlist = async (id: string) => {

            // check playlist
            let this_playlist: Playlist = this.get_data("playlists", [id]) as unknown as Playlist ?? { ids: [] };
            const playlist_etag = (this_playlist?.etag && this_playlist?.etag?.length > 0) ? this_playlist?.etag : undefined;

            // check new_tracks
            let this_new_tracks: any = { etag: "", ids: [] };
            const new_tracks_etag = this_new_tracks.etag && this_new_tracks?.etag?.length > 0 ? this_new_tracks?.etag : undefined;

            // fetch data
            const playlist_url = base_playlist__url + `&playlistId=${id}`;
            const videos = await this.fetch_data(playlist_url, playlist_etag);

            if (videos === null &&
                playlist_etag && new_tracks_etag &&
                playlist_etag !== new_tracks_etag
            ) {
                this_new_tracks.ids = this_playlist.ids;
                this_new_tracks.etag = playlist_etag;
            }
            else if (videos === null) {
                this_new_tracks.ids.push(...this_playlist.ids?.slice(0, 6) ?? [])
            }
            else {
                const TotalResult = videos.pageInfo.totalResults;
                this_new_tracks.ids.push(...videos.items.slice(0, 6).map((item: any) => { return item.snippet.resourceId.videoId }))
                const ids = Array.from(new Set([...this_playlist.ids ?? [], ...this_new_tracks.ids]));
                if (ids.length <= TotalResult) {
                    this.fetch_playlist(id);
                }
                else {
                    this_playlist.ids = ids;
                    this_playlist.etag = videos.etag;
                    // this_playlist.length = TotalResult;
                    this.write_data("playlists", [id], [this_playlist]);
                }
            }
            // new_tracks[id] = this_new_tracks;
            return this_new_tracks.ids;
        }

        try {
            const new_tracks: string[] = []
            for (const id of ids) {
                try {
                    const playlistId = await artist(id);
                    const ids = await playlist(playlistId);
                    new_tracks.push(...ids);

                }
                catch (e) {
                    console.log(id);
                    console.log(e);
                }

            }

            const tracks = await this.fetch_track(new_tracks);
            return tracks;
        } catch (e) {
            console.error(e);
            return []
        }
    }
}