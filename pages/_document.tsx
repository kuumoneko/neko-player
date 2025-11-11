import { Html, Head, Main, NextScript } from "next/document";
import { useEffect } from "react";

export default function Document() {
    useEffect(() => {
        // run once time
        localStorage.setItem("backward", "[]");
        localStorage.setItem("forward", "[]");
    }, []);
    return (
        <Html lang="en" className="" suppressHydrationWarning>
            <Head />

            <body className="antialiased overflow-hidden">
                <Main />
                <NextScript />
            </body>
        </Html>
    );
}
