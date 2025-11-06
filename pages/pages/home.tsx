import { Artist, Playlist, Track } from "@/types";
import home_page from "@/utils/music/home";
import { useEffect, useState } from "react";
import formatDuration from "../../src/utils/format";

export default function HomePage({
    seturl,
}: {
    seturl: (url: string) => void;
}) {
    const [artists, setartists] = useState([]);
    const [playlists, setplaylists] = useState([]);
    const [new_tracks, setnew_tracks] = useState([]);
    useEffect(() => {
        async function run() {
            const temp = await home_page();
            setartists(temp.artist);
            setplaylists(temp.playlist);
            setnew_tracks(temp.new_tracks);
        }
        run();
    }, []);
    return (
        <div className="flex flex-col items-center justify-center">
            {artists.length > 0 && (
                <div className="flex flex-col items-center">
                    <h1>Artists</h1>
                    <div className="flex flex-row">
                        {artists.map((artist: Artist) => {
                            return (
                                <div className="flex flex-row items-center">
                                    <div>
                                        <img
                                            src={artist.thumbnail}
                                            height={50}
                                            width={50}
                                        />
                                    </div>
                                    <div>{artist.name}</div>
                                </div>
                            );
                        })}
                    </div>
                </div>
            )}
            {playlists.length > 0 && (
                <div>
                    <h1>Playlists</h1>
                    <div className="flex flex-row">
                        {playlists.map((playlist: Playlist) => {
                            return (
                                <div className="flex flex-row items-center">
                                    <img src={playlist.thumbnail} alt="" />
                                    <div>{playlist.name}</div>
                                </div>
                            );
                        })}
                    </div>
                </div>
            )}
            {new_tracks.length > 0 && (
                <div className="grid grid-cols-3 gap-4">
                    {new_tracks.map((track: Track) => {
                        return (
                            <div className="flex flex-row">
                                <img src={track.thumbnail} alt="" />
                                <div className="flex flex-col">
                                    <div>{track.name}</div>
                                    <div className="flex flex-row">
                                        <div>{track.artist[0].name}</div>
                                        <div>
                                            {formatDuration(
                                                track.duration / 1000
                                            )}
                                        </div>
                                    </div>
                                </div>
                            </div>
                        );
                    })}
                </div>
            )}
        </div>
    );
}
