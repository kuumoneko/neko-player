import { goto } from "@/lib/url";
import { faBars, faDatabase, faUsers } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { useState } from "react";

export default function Player({ seturl }: { seturl: (url: string) => void }) {
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
    const itemWidth = 70;

    return (
        <div className="w-[80%] h-[10%]">
            <div className="flex items-center justify-center h-[50%]">
                <div className="relative flex flex-row items-center justify-center w-[250px] h-[70px] bg-slate-600 rounded-lg">
                    <ul className="flex w-[210px]">
                        {menuItems.map((item, index) => (
                            <li
                                key={item.text}
                                className="relative z-10 w-[70px] h-[70px] list-none"
                                onClick={() => {
                                    setActiveIndex(index);
                                    goto("/" + item.url, seturl);
                                }}
                            >
                                <a
                                    href="#"
                                    className="relative flex flex-col items-center justify-center w-full text-center font-medium"
                                >
                                    <span
                                        className={`relative block text-2xl leading-[75px] text-center text-[#222327] transition-transform duration-500 
                    ${activeIndex === index ? "-translate-y-8" : ""}`}
                                    >
                                        {item.icon}
                                    </span>
                                    <span
                                        className={`absolute font-normal text-xs tracking-wider text-[#222327] transition-all duration-500 
                    ${
                        activeIndex === index
                            ? "opacity-100 translate-y-2.5"
                            : "opacity-0 translate-y-5"
                    }`}
                                    >
                                        {item.text}
                                    </span>
                                </a>
                            </li>
                        ))}

                        <div
                            className="absolute top-[-50%] w-[70px] h-[70px] bg-[#5e64be] rounded-full border-[6px] border-[#222327] transition-transform duration-500
              before:content-[''] before:absolute before:top-1/2 before:left-[-22px] before:w-5 before:h-5 before:bg-transparent before:rounded-tr-[20px] before:shadow-[1px_-10px_0_0_#222327]
              after:content-[''] after:absolute after:top-1/2 after:right-[-22px] after:w-5 after:h-5 after:bg-transparent after:rounded-tl-[20px] after:shadow-[-1px_-10px_0_0_#222327]"
                            style={{
                                transform: `translateX(${
                                    activeIndex * itemWidth
                                }px)`,
                            }}
                        ></div>
                    </ul>
                </div>
            </div>
            <div className="bg-slate-600 h-[50%] w-full rounded-4xl"></div>
        </div>
    );
}
