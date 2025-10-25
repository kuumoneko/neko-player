import { goto, Force } from "@/lib/url";
import {
    faArrowLeft,
    faArrowsRotate,
    faArrowRight,
    faHome,
} from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { useEffect, useState } from "react";

export default function ControlPanel({
    seturl,
}: {
    seturl: (url: string) => void;
}) {
    const [backward, setbackward] = useState("[]");
    const [forward, setforward] = useState("[]");

    const [ishome, setishome] = useState(true);

    useEffect(() => {
        const run = setInterval(() => {
            setbackward((localStorage.getItem("backward") as string) || "[]");
            setforward((localStorage.getItem("forward") as string) || "[]");
            setishome(localStorage.getItem("url") === "/");
        }, 100);
        return () => clearInterval(run);
    }, []);

    return (
        <div className="controlpanel flex flex-row gap-2.5">
            <span
                className={`material-icons flex items-center gap-[5px] text-white cursor-default select-none ${
                    JSON.parse(backward).length === 0
                        ? "opacity-50 pointer-events-none"
                        : ""
                }`}
                onClick={() => {
                    const backw: string[] =
                        JSON.parse(
                            localStorage.getItem("backward") as string
                        ) || [];
                    const temp = backw.pop() || "/";
                    goto(temp, seturl, Force.backward);
                }}
            >
                <FontAwesomeIcon icon={faArrowLeft} />
            </span>
            <span
                className={`material-icons flex items-center gap-[5px] text-white cursor-default select-none`}
                onClick={() => {
                    window.location.reload();
                }}
            >
                <FontAwesomeIcon icon={faArrowsRotate} />
            </span>
            <span
                className={`material-icons flex items-center gap-[5px] text-white cursor-default select-none ${
                    JSON.parse(forward).length === 0
                        ? "opacity-50 pointer-events-none"
                        : ""
                }`}
                onClick={() => {
                    const forw: string[] =
                        JSON.parse(localStorage.getItem("forward") as string) ||
                        [];
                    const temp = forw.shift() || "/";
                    goto(temp, seturl, Force.forward);
                }}
            >
                <FontAwesomeIcon icon={faArrowRight} />
            </span>
            {/* <span
                className={`material-icons flex items-center gap-[5px] text-white cursor-default select-none ${
                    ishome ? "opacity-50 pointer-events-none" : ""
                }`}
                onClick={() => {
                    goto("/", seturl);
                }}
            >
                <FontAwesomeIcon icon={faHome} />
            </span> */}
            {/* <span
                className="material-icons flex items-center gap-[5px] text-white cursor-default select-none"
                onClick={() => {
                    goto("/queue/play", seturl);
                }}
            >
                <FontAwesomeIcon icon={faList} />
            </span>
            <span
                className="material-icons flex items-center gap-[5px] text-white cursor-default select-none"
                onClick={() => {
                    goto("/queue/download", seturl);
                }}
            >
                <FontAwesomeIcon icon={faDownload} />
            </span> */}
        </div>
    );
}
