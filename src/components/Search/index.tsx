import { goto } from "@/lib/url";
import convert_link from "@/utils/link";
import { useEffect, useState } from "react";

export default function SearchBar({
    seturl,
}: {
    seturl: (url: string) => void;
}) {
    const [isAuth, setAuth] = useState(false);

    const [typing, settyping] = useState("");
    const [source, setsource] = useState("");

    useEffect(() => {
        if (window.location.href.includes("auth")) {
            setAuth(true);
        }
    }, []);

    const search = () => {
        if (typing === "") return;
        if (source === "") {
            return goto(`/${typing.split(":").join("/")}`, seturl);
        }
        return goto(`/search/${source.toLocaleLowerCase()}/${typing}`, seturl);
    };

    if (isAuth) {
        return <></>;
    }

    return (
        <div
            className="flex h-[5%] pt-[5px] mb-2.5 w-full flex-row items-center justify-center"
            onKeyDown={(e) => {
                if (e.key === "Enter") {
                    search();
                }
            }}
        >
            <div className="w-full max-w-lg flex">
                <input
                    type="text"
                    className="grow px-5 py-3 rounded-l-full bg-slate-200 text-slate-700 text-base outline-none shadow-inner min-h-[30px]"
                    placeholder="Search here"
                    value={typing}
                    onChange={(e) => {
                        settyping(e.target.value);
                        const link = convert_link(e.target.value);
                        if (
                            link.source !== "spotify" &&
                            link.source !== "youtube"
                        ) {
                            setsource(
                                link.source === "youtube"
                                    ? "Youtube"
                                    : "Spotify"
                            );
                        } else {
                            setsource("");
                            const { source, id, mode } = link;
                            settyping(`${mode}:${source}:${id}`);
                        }
                    }}
                />
                {source !== "" && (
                    <div
                        className="px-5 py-2 bg-slate-200 ml-px text-slate-700 text-lg cursor-pointer flex items-center justify-center min-h-[30px] w-[100px]"
                        onClick={() => {
                            setsource(
                                source === "Youtube" ? "Spotify" : "Youtube"
                            );
                        }}
                    >
                        <span className="mt-[5%] h-full">{`${source}`}</span>
                    </div>
                )}
                <button
                    className="px-5 py-2 rounded-r-full bg-green-500 text-white text-lg cursor-pointer flex items-center justify-center transition duration-200 ease-in-out hover:bg-green-600 min-h-[30px]"
                    onClick={() => {
                        search();
                    }}
                >
                    <span className="material-icons">search</span>
                </button>
            </div>
        </div>
    );
}
