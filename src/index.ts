import dotenv from "dotenv";
import TelegramBot from "node-telegram-bot-api";
import { downloader, launchBrowser } from "./downloader";
import { bytesToReadable } from "./util/conversions";
import * as date from "./util/date-related";
import { input } from "./util/console";
dotenv.config();

const bot = new TelegramBot(process.env.BOT_TOKEN as string, { polling: true });

(async () => {

    const headlessAnswer = await input("Show the browser window? (y/n) ");

    await launchBrowser(!["yes", "y"].includes(headlessAnswer.toLowerCase().trim()));
    const me = await bot.getMe();

    const jobs: { [chatId: string]: boolean } = {};
    bot.on("message", async (message) => {
        if (message.text?.startsWith("/start")) {
            return await bot.sendMessage(message.chat.id, `Hello! With this bot you can download Instagram reels. Just provide the video link here and I'll do the rest of the work!`);
        }
        const link = message.text?.replaceAll("/reels/", "/reel/");
        if (!link) return;
        if (!(/https?:\/\/(?:www.)?instagram.com\/reel\/([^\/?#&]+).*/g).test(link)) {
            return await bot.sendMessage(message.chat.id, "Invalid Instagram reel link.");
        }
        if (jobs[message.chat.id]) {
            return await bot.sendMessage(message.chat.id, "You are already downloading another video. Wait for it to finish.");
        }
        let status = await bot.sendMessage(message.chat.id, "Fetching video...");
        jobs[message.chat.id] = true;
        const downloadEvents = downloader(link);
        downloadEvents.once("detected", (video) => {
            bot.editMessageText(
                `Video info fetched:\n\n${[
                    `${video.author.username} - ${video.uploadedAt ? `${date.relativeTime(video.uploadedAt, "en-US")}` : "Upload date unknown"}`,
                    video.description || "No description",
                ].filter(e => e).join("\n")}`,
                {
                    chat_id: message.chat.id,
                    message_id: status.message_id,
                }
            )
        });
        downloadEvents.on("downloading", async (size) => {
            status = await bot.sendMessage(
                message.chat.id,
                `Downloading and uploading ${bytesToReadable(size, { decimals: 1 })}...`
            )
        });
        downloadEvents.once("done", async (buffer) => {
            downloadEvents.removeAllListeners();
            try {
                await bot.sendVideo(message.chat.id, buffer);
            } catch (err: any) {
                console.log(err);
                bot.editMessageText(`An error ocurred while uploading the video:\n\n${err.toString()}`, {
                    chat_id: message.chat.id,
                    message_id: status.message_id,
                });
            }
            jobs[message.chat.id] = false;
        });
        downloadEvents.once("error", (err) => {
            downloadEvents.removeAllListeners();
            jobs[message.chat.id] = false;
            bot.editMessageText(`An error ocurred while downloading the video:\n\n${err.toString()}`, {
                chat_id: message.chat.id,
                message_id: status.message_id,
            });
        });
    });

    console.log(`Bot initialized as @${me.username} and Puppeteer launched.`);

})();