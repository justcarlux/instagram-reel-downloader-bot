import puppeteer from "puppeteer-extra";
import { Browser } from "puppeteer";
import { BasicTypedEventEmitter, EventData } from "./structures/BasicTypedEventEmitter";

import StealthPlugin from "puppeteer-extra-plugin-stealth";
puppeteer.use(StealthPlugin());

let browser: Browser;

export async function launchBrowser(headless: boolean) {
    browser = await puppeteer.launch({ headless: headless && "new", args: ['--no-sandbox'] });
}

export interface DetectedInstagramVideo {
    code: string,
    dimensions: {
        width: number,
        height: number
    },
    thumbnail: string,
    author: {
        username: string
    },
    uploadedAt?: Date,
    description?: string,
    videoUrl: string
}

export interface DownloadEvents extends EventData {
    detected: (video: DetectedInstagramVideo) => void,
    downloading: (size: number) => void,
    done: (buffer: Buffer) => void,
    error: (error: any) => void
}

export function downloader(url: string) {
    const emitter = new BasicTypedEventEmitter<DownloadEvents>();
    (async () => {

        const page = await browser.newPage();
        await page.goto(url);

        const timeout = setTimeout(() => { abort(new Error("Timeout after 20s")); }, 20_000);

        async function abort(err: any) {
            clearTimeout(timeout);
            page.removeAllListeners();
            await page.close();
            emitter.emit("error", err);
        }
        async function download(data: DetectedInstagramVideo) {
            clearTimeout(timeout);
            page.removeAllListeners();
            await page.close();
            emitter.emit("detected", data);
            let buffer: Buffer;
            try {
                const response = await fetch(data.videoUrl);
                const length = parseInt(response.headers.get("Content-Length") as string);
                if (!length) return abort(new Error("Content-Length of video is invalid"));
                emitter.emit("downloading", length);
                const arrayBuffer = await response.arrayBuffer();
                buffer = Buffer.from(arrayBuffer);
            } catch (err) {
                return abort(err);
            }
            emitter.emit("done", buffer);
        }

        page.on("requestfinished", async (request) => {
            if (request.url().includes("/graphql/query")) {
                try {
                    const response = await request.response();
                    const json = await response?.json();
                    if (json?.data?.xdt_shortcode_media) {
                        if (!json?.data?.xdt_shortcode_media?.is_video) {
                            throw new Error("Link doesn't belong to a video")
                        }
                        const video = json.data.xdt_shortcode_media;
                        const edgeNode = video.edge_media_to_caption?.edges[0]?.node;
                        download({
                            code: video.shortcode,
                            dimensions: video.dimensions,
                            thumbnail: video.thumbnail_src,
                            author: {
                                username: video.owner.username
                            },
                            uploadedAt: edgeNode?.created_at ? new Date((edgeNode?.created_at as number) * 1000) : undefined,
                            description: edgeNode?.text || undefined,
                            videoUrl: video.video_url
                        });
                    }
                } catch (err) {
                    return abort(err);
                }
            }
        });

    })();

    return emitter;
}
