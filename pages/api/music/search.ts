import { NextApiRequest, NextApiResponse } from "next";
import { parse_body } from "../utils/request";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
    const { query, source } = parse_body(req.body);


}


async function search_youtube(query: string) {
    try {
        const limit: number = 100
        const endpoint = `https://www.youtube.com/results?search_query=${query}&sp=EgIQAQ%3D%3D`;

        const create_page = await fetch(encodeURI(endpoint));
        const pageData = await create_page.text();
        const ytInitData = pageData.split("var ytInitialData =");

        let page: any = null;
        if (ytInitData && ytInitData.length > 1) {
            const script_data = ytInitData[1]
                .split("</script>")[0]
                .slice(0, -1);
            page = JSON.parse(script_data);
        }

        if (page === null) {
            throw new Error("Unreachable code")
        }

        const sectionListRenderer = page.contents.twoColumnSearchResultsRenderer.primaryContents.sectionListRenderer;

        const ids: string[] = [];
        sectionListRenderer.contents.forEach((content: any) => {
            if (content.itemSectionRenderer) {
                content.itemSectionRenderer.contents.forEach((item: any) => {
                    if (item.videoRenderer) {
                        const videoRender = item.videoRenderer;

                        ids.push(videoRender.videoId)
                    }
                });
            }
        });
        // const tracks = await fetch_track(ids)
        // const itemsResult = limit !== 0 ? tracks.slice(0, limit) : tracks;
        // return {
        //     type: "youtube:search",
        //     tracks: itemsResult
        // }
    }
    catch (e: any) {
        throw new Error(e);
    }
}