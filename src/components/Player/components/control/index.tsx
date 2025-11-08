import { useState, useEffect, useRef, RefObject } from "react";
import { sleep_types } from "../../common/types/index.ts";
import {
    faShuffle,
    faStepBackward,
    faPause,
    faPlay,
    faStepForward,
    faRepeat,
} from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import formatDuration from "../../../../utils/format.ts";
import Slider from "../../common/Slider/index.tsx";
import backward from "./common/backward.ts";
import forward from "./common/forward.ts";
import stream from "@/utils/music/stream.ts";

const handleCloseTab = () => {
    try {
        // window.location.href = "https://www.google.com";
    } catch {
        return "no";
    }
};

// This component no longer needs the audioRef prop
export default function ControlUI() {
    const [played, setplayed] = useState(false);
    const [shuffle, setshuffle] = useState("disable");
    const [repeat, setrepeat] = useState("disable");
    const [isloading, setisloading] = useState(true);

    // NEW: State for the YouTube player instance and a ref for its container div
    const [player, setPlayer] = useState<any>(null); // This will hold the YT.Player instance
    const playerContainerRef = useRef<HTMLDivElement>(null);

    // This state mirrors the currently playing track to safely trigger useEffects
    const [currentTrack, setCurrentTrack] = useState({ id: "", source: "" });

    const [Time, setTime] = useState(0);
    const [duration, setduraion] = useState(0);
    const TimeSliderRef = useRef<HTMLInputElement>(null);

    // --- Core Player Logic ---

    // Effect 1: Initializes the YouTube Player or loads a new video when the track changes
    useEffect(() => {
        (async () => {
            // We only proceed if the source is YouTube and we have an ID
            let { source, id } = currentTrack;
            if (currentTrack.source !== "youtube" || !currentTrack.id) {
                const temp = await stream(
                    currentTrack.source as any,
                    currentTrack.id
                );
                source = "youtube";
                id = temp;
            }

            const onPlayerReady = (event: any) => {
                console.log("YouTube Player is ready.");
                setisloading(false);
                setduraion(event.target.getDuration());
                const volume = localStorage.getItem("volume");
                if (volume) {
                    event.target.setVolume(Number(volume));
                }
                // If the user clicked play while the player was loading, start playing.
                if (played) {
                    event.target.playVideo();
                }
            };

            const onPlayerStateChange = (event: any) => {
                if (event.data === (window as any).YT.PlayerState.PLAYING) {
                    const newDuration = event.target.getDuration();
                    if (newDuration > 0) {
                        setduraion(newDuration);
                    }
                }
                // YT.PlayerState.ENDED === 0
                if (event.data === 0) {
                    handleTrackEnd();
                }
            };

            const initializePlayer = () => {
                if (!playerContainerRef.current) return;
                const newPlayer = new (window as any).YT.Player(
                    playerContainerRef.current,
                    {
                        height: "0", // Making the player invisible
                        width: "0",
                        videoId: currentTrack.id,
                        playerVars: { controls: 0 }, // Hiding native controls
                        events: {
                            onReady: onPlayerReady,
                            onStateChange: onPlayerStateChange,
                        },
                    }
                );
                setPlayer(newPlayer);
            };

            // Check if the YouTube Iframe API script is loaded
            if (!(window as any).YT || !(window as any).YT.Player) {
                (window as any).onYouTubeIframeAPIReady = initializePlayer;
                if (
                    !document.querySelector(
                        'script[src="https://www.youtube.com/iframe_api"]'
                    )
                ) {
                    const tag = document.createElement("script");
                    tag.src = "https://www.youtube.com/iframe_api";
                    const firstScriptTag =
                        document.getElementsByTagName("script")[0];
                    firstScriptTag?.parentNode?.insertBefore(
                        tag,
                        firstScriptTag
                    );
                }
            } else {
                // If API is loaded, either create a new player or load the video into the existing one
                if (!player) {
                    initializePlayer();
                } else {
                    player.loadVideoById(currentTrack.id);
                    console.log(player.getDuration());
                }
            }
        })();
    }, [currentTrack]); // This effect is the heart of the player, running when the track changes

    // --- State Sync and UI Control ---

    // Effect 2: Periodically checks localStorage to see if the track has changed.
    useEffect(() => {
        const check = () => {
            const playing = JSON.parse(localStorage.getItem("playing") || "{}");
            // If the ID in localStorage is different from our state, update the state
            if (
                playing.id &&
                (playing.id !== currentTrack.id ||
                    playing.source !== currentTrack.source)
            ) {
                setisloading(true);
                setplayed(true); // Autoplay next song
                // This state change will trigger the main player useEffect
                setCurrentTrack({ id: playing.id, source: playing.source });

                // Update Media Session API
                navigator.mediaSession.metadata = new MediaMetadata({
                    title: playing.name,
                    artist: playing.artists,
                    artwork: [
                        {
                            src: playing.thumbnail,
                            sizes: "512x512",
                            type: "image/png",
                        },
                    ],
                });
                navigator.mediaSession.setActionHandler("play", () => {
                    setplayed(true);
                });
                navigator.mediaSession.setActionHandler("pause", () => {
                    setplayed(false);
                });
                navigator.mediaSession.setActionHandler("nexttrack", () => {
                    forward(setCurrentTrack);
                });
                navigator.mediaSession.setActionHandler("previoustrack", () => {
                    backward();
                });
            }
        };
        const run = setInterval(check, 500);
        return () => clearInterval(run);
    }, [currentTrack]);

    // Effect 3: Controls Play/Pause state
    useEffect(() => {
        if (!player || isloading) return;
        if (played) {
            player.playVideo();
        } else {
            player.pauseVideo();
        }
    }, [played, player, isloading]);

    useEffect(() => {
        const run = setInterval(() => {
            if (player && typeof player.setVolume === "function") {
                const volume = localStorage.getItem("volume");
                if (volume && player.getVolume() !== Number(volume)) {
                    player.setVolume(Number(volume));
                }
            }
        }, 100);
        return () => clearInterval(run);
    }, []);

    // Effect 4: Time tracking and other periodic checks
    useEffect(() => {
        const run = setInterval(() => {
            if (
                player &&
                typeof player.getCurrentTime === "function" &&
                player.getPlayerState() > 0
            ) {
                setTime(player.getCurrentTime());
            }
            const volume = localStorage.getItem("volume");
            if (volume && player && typeof player.setVolume === "function") {
                if (player.getVolume() !== Number(volume)) {
                    player.setVolume(Number(volume));
                }
            }
            setrepeat(localStorage.getItem("repeat") ?? "disable");
            setshuffle(localStorage.getItem("shuffle") ?? "disable");
        }, 500); // Polling every 500ms is sufficient
        return () => clearInterval(run);
    }, [player]);

    // Effect 5: Updates the slider progress bar
    useEffect(() => {
        if (TimeSliderRef.current) {
            const min = Number(TimeSliderRef.current.min);
            const max = Number(TimeSliderRef.current.max);
            const value = Time || 0;
            const percent = max > 0 ? ((value - min) / (max - min)) * 100 : 0;
            TimeSliderRef.current.style.setProperty(
                "--value-percent",
                `${percent}%`
            );
        }
    }, [Time]);

    // --- Media Session and Sleep Timer (largely unchanged) ---

    useEffect(() => {
        navigator.mediaSession.setActionHandler("play", () => {
            setplayed(true);
        });
        navigator.mediaSession.setActionHandler("pause", () => {
            setplayed(false);
        });
        navigator.mediaSession.setActionHandler("nexttrack", () => {
            forward(setCurrentTrack);
        });
        navigator.mediaSession.setActionHandler("previoustrack", () => {
            backward();
        });

        return () => {
            navigator.mediaSession.setActionHandler("play", () => {});
            navigator.mediaSession.setActionHandler("pause", () => {});
            navigator.mediaSession.setActionHandler("nexttrack", () => {});
            navigator.mediaSession.setActionHandler("previoustrack", () => {});
        };
    }, []); // Empty dependency array means this runs once

    const check_eot = (temp: sleep_types) => {
        // Check End Of Track for sleep timer.
        if (temp === sleep_types.eot) {
            localStorage.setItem("kill time", sleep_types.no);
            const res = handleCloseTab();
            if (res === "no") {
                setplayed(false);
                alert(
                    "I can't close this tab by script. Please close it by yourself."
                );
            }
        }
    };

    const handleTrackEnd = () => {
        const repeat = localStorage.getItem("repeat") ?? "disable";
        const temp = localStorage.getItem("kill time");
        check_eot(temp as sleep_types);

        if (repeat === "one" && player) {
            player.seekTo(0);
            player.playVideo();
        } else {
            forward(setCurrentTrack); // forward() should just update localStorage, the effects will handle the rest
        }
    };

    // ... your other useEffects for sleep timer can remain as they are ...

    // --- Event Handlers ---

    const handleTimeSliderChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const newTime = Number(e.target.value);
        setTime(newTime);
        if (player) {
            player.seekTo(newTime, true);
        }
    };

    const [playedsongs, setplayedsongs] = useState([]);
    useEffect(() => {
        setplayedsongs(
            JSON.parse(localStorage.getItem("playedsongs") as string) ?? []
        );
    }, []);

    return (
        <div className="flex flex-col items-center">
            {/* This div is the mount point for the hidden YouTube iframe */}
            <div
                ref={playerContainerRef}
                className="pointer-events-none absolute -top-full -left-full"
            ></div>

            <div className={`controls flex flex-row gap-2.5`}>
                {/* Shuffle Button */}
                <button
                    className="mx-0.5 p-0.5 cursor-default select-none"
                    onClick={() => {
                        const new_shuffle =
                            shuffle === "disable" ? "enable" : "disable";
                        setshuffle(new_shuffle);
                        localStorage.setItem("shuffle", new_shuffle);
                    }}
                >
                    <FontAwesomeIcon
                        icon={faShuffle}
                        className={shuffle === "disable" ? "" : "text-red-500"}
                    />
                </button>
                {/* Backward Button */}
                <button
                    className={`mx-0.5 p-0.5 cursor-default select-none ${
                        playedsongs.length === 0
                            ? "opacity-50 pointer-events-none"
                            : ""
                    }`}
                    onClick={() => backward()}
                >
                    <FontAwesomeIcon icon={faStepBackward} />
                </button>
                {/* Play/Pause Button */}
                <button
                    className="mx-0.5 p-0.5 cursor-default select-none"
                    onClick={() => {
                        setplayed(!played);
                        if (!player || isloading) return;
                        if (played) {
                            player.playVideo();
                        } else {
                            player.pauseVideo();
                        }
                    }}
                >
                    <FontAwesomeIcon icon={played ? faPause : faPlay} />
                </button>
                {/* Forward Button */}
                <button
                    className="mx-0.5 p-0.5 cursor-default select-none"
                    onClick={async () => {
                        localStorage.setItem("play", JSON.stringify([]));
                        await forward(setCurrentTrack);
                    }}
                >
                    <FontAwesomeIcon icon={faStepForward} />
                </button>
                {/* Repeat Button */}
                <button
                    className="relative mx-0.5 p-0.5 cursor-default select-none"
                    onClick={() => {
                        const new_repeat =
                            repeat === "disable"
                                ? "enable"
                                : repeat === "enable"
                                ? "one"
                                : "disable";
                        setrepeat(new_repeat);
                        localStorage.setItem("repeat", new_repeat);
                    }}
                >
                    <FontAwesomeIcon
                        icon={faRepeat}
                        className={
                            repeat === "enable"
                                ? "text-red-500"
                                : repeat === "one"
                                ? "text-green-500"
                                : ""
                        }
                    />
                    {repeat === "one" && (
                        <span className="absolute inset-0 flex items-center justify-center text-white text-[8px] font-bold pointer-events-none">
                            1
                        </span>
                    )}
                </button>
            </div>
            <div className="player flex flex-row items-center ">
                <span className="mr-[5px] cursor-default select-none text-xs w-24 text-center">
                    {duration > 0
                        ? `${formatDuration(Time)} / ${formatDuration(
                              duration
                          )}`
                        : `Loading`}
                </span>
                <Slider
                    name={"time"}
                    width={"800"}
                    reff={TimeSliderRef as RefObject<HTMLInputElement>}
                    value={Time}
                    Change={handleTimeSliderChange}
                    max={duration || 0}
                />
            </div>
        </div>
    );
}
