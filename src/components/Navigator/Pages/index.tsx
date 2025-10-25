import { goto } from "@/lib/url";
import { faDatabase, faBars, faUsers } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { useEffect, useState } from "react";

export default function ControlPages({
    seturl,
}: {
    seturl: (url: string) => void;
}) {
    const [isAuth, setAuth] = useState(false);

    useEffect(() => {
        if (window.location.href.includes("auth")) {
            setAuth(true);
        }
    }, []);

    const [activeIndex, setActiveIndex] = useState(0);

    const menuItems = [
        {
            text: "Local",
            icon: <FontAwesomeIcon icon={faDatabase} />,
            url: "local",
        },
        {
            text: "Playlists",
            icon: <FontAwesomeIcon icon={faBars} />,
            url: "playlists",
        },
        {
            text: "Artists",
            icon: <FontAwesomeIcon icon={faUsers} />,
            url: "artists",
        },
    ];
    const itemWidth = -70;
    if (isAuth) {
        return <></>;
    }
    return (
        <div className="relative flex items-center justify-center w-[400px] h-full bg-slate-700 rounded-lg">
            <ul className="flex w-[210px]">
                {menuItems.map((item, index) => (
                    <li
                        key={item.text}
                        className="relative z-10 w-[70px] h-[70px] list-none hover:cursor-pointer"
                        onClick={() => {
                            setActiveIndex(index);
                            if (
                                localStorage.getItem("url") ===
                                "/" + item.url
                            ) {
                                return;
                            }
                            goto("/" + item.url, seturl);
                        }}
                    >
                        <a className="relative flex flex-col items-center justify-center w-full text-center font-medium">
                            <span
                                className={`relative block text-2xl leading-[75px] text-center text-white transition-transform duration-500 
                            ${activeIndex === index ? "translate-y-8" : ""}`}
                            >
                                {item.icon}
                            </span>
                            <span
                                className={`absolute font-normal text-xs tracking-wider text-white transition-all duration-500 
                            ${
                                activeIndex === index
                                    ? "opacity-100 translate-y-[-15px]"
                                    : "opacity-0 translate-y-5"
                            }`}
                            >
                                {item.text}
                            </span>
                        </a>
                    </li>
                ))}

                <div
                    className="absolute top-[52%] w-[70px] h-[70px] bg-[#636ec1] rounded-full border-[6px] border-slate-900 transition-transform duration-500
                      before:content-[''] before:absolute before:top-[65%] before:left-[-18px] before:w-5 before:h-5 before:bg-transparent before:rounded-tr-[20px] before:shadow-[1px_-10px_0_0_#0f172b]
                      after:content-[''] after:absolute after:top-[65%] after:right-[-18px] after:w-5 after:h-5 after:bg-transparent after:rounded-tl-[20px] after:shadow-[-1px_-10px_0_0_#0f172b] rotate-180"
                    style={{
                        transform: `translateX(${activeIndex * itemWidth}px)`,
                    }}
                ></div>
            </ul>
        </div>
    );
}
