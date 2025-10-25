export interface Artist {
    name: string,
    id: string,
    source: "youtube" | "spotify" | "local",
    ids: string[],
    thumbnail: string
}

export interface Playlist {
    name: string,
    id: string,
    source: "youtube" | "spotify" | "local",
    ids: string[],
    thumbnail: string
}

export interface Track {
    name: string,
    id: string,
    artist: string,
    source: "youtube" | "spotify" | "local",
    thumbnail: string,
    duration: number,
    releasedDate: string // DD-MM-YYYY
}

export interface Playing_track {
    name: string,
    duration: number,
    id: string,
    source: "youtube" | "spotify" | "local",
    thumbnail: string
}

export interface PlayingUrl {
    id: string,
    url: string,
    source: "youtube" | "spotify" | "local"
}