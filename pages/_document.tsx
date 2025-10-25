import { Html, Head, Main, NextScript } from "next/document";
import { useEffect } from "react";

const check_storage = (id: string) => {
    return (
        localStorage.getItem(id) === null ||
        localStorage.getItem(id) === undefined
    );
};

export default function Document() {
    useEffect(() => {
        // run once time
        localStorage.setItem("backward", "[]");
        localStorage.setItem("forward", "[]");
    }, []);
    return (
        <Html lang="en" className="" suppressHydrationWarning>
            <Head />

            <body className="antialiased">
                <Main />
                <NextScript />
            </body>
        </Html>
    );
}
