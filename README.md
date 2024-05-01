# 🤖 Instagram Reel Downloader Bot
Telegram bot to download Instagram videos or reels.

https://github.com/justcarlux/instagram-reel-downloader-bot/assets/131912633/8d3f77a5-1f24-4fb9-8e64-3bd5b4301b63

## 💻 Running

- Install Node.js if you don't have it.
- Clone this repository.
- Install all the required dependencies with `npm install`.
- Copy the contents of `example.env` in a new file called `.env` and write the Telegram bot token there.
- Build the proyect using `npm run build`. Then run `npm run start:build` to start the bot.
- You can also just run `npm run start:dev` to run the proyect using **ts-node**.
- You can also use `npm run start:watch` to run the proyect using **ts-node** with **nodemon**.

When running the bot, it will ask you whether to show the browser window or not (using for scrapping reels data). Depending on the environment you may want to just refuse to that, but in some cases showing the window looks like to bypass Instagram's bot detection better.
