import type { NextConfig } from "next";

const nextConfig: NextConfig = {
    outputFileTracingIncludes: {
        '/*': ['./node_modules/youtube-po-token-generator/vendor/**'],
    },
}

export default nextConfig;
