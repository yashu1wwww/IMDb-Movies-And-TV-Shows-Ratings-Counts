const express = require('express');
const puppeteer = require('puppeteer');
const NodeCache = require('node-cache');

const app = express();
const port = 3000;

const searchCache = new NodeCache({ stdTTL: 600 });

let browser;

(async () => {
    browser = await puppeteer.launch({
        headless: true,
        args: [
            '--no-sandbox',
            '--disable-setuid-sandbox',
            '--disable-dev-shm-usage',
            '--disable-accelerated-2d-canvas',
            '--disable-gpu'
        ]
    });
})();

app.get('/', (req, res) => {
    res.send(`
        <html>
            <head>
                <meta charset="UTF-8">
                <meta http-equiv="X-UA-Compatible" content="IE=edge">
                <meta name="viewport" content="width=device-width, initial-scale=1.0">
                <title>IMDB MOVIES & TV SHOWS RATINGS COUNT</title>
                <link href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.0/dist/css/bootstrap.min.css" rel="stylesheet">
                <link rel="icon" href="https://m.media-amazon.com/images/G/01/imdb/images-ANDW73HA/favicon_desktop_32x32._CB1582158068_.png" type="image/x-icon">
                <style>
                    html, body {
                        overflow: hidden;
                    }
                    body {
                        font-family: 'Arial', sans-serif;
                        display: flex;
                        justify-content: center;
                        align-items: center;
                        height: 100vh;
                        margin: 0;
                        background-image: url('https://wallpaperaccess.com/full/1567770.gif');
                        background-size: cover;
                        background-position: center;
                        color: white;
                    }
                    form {
                        display: flex;
                        flex-direction: column;
                        align-items: center;
                        background-color: rgba(225, 168, 168, 0.16);
                        padding: 83px;
                        border-radius: 39px;
                    }
                    input[type="text"] {
                        padding: 8px;
                        margin-bottom: 27px;
                        width: 317px;
                        border: 1px solid #283147;
                        border-radius: 18px;
                        background-color: rgba(255, 255, 255, 0.8);
                        color: #333;
                    }
                    button {
                        padding: 8px 16px;
                        background-color: #007bff;
                        color: white;
                        border: none;
                        border-radius: 4px;
                        cursor: pointer;
                    }
                    button:hover {
                        background-color: #0056b3;
                    }
                    .result-container {
                        text-align: center;
                        display: flex;
                        flex-direction: column;
                        align-items: center;
                    }
                    .container {
                        text-align: center;
                        background-color: #8cafe76b;
                        padding: 0px;
                        border-radius: 63px;
                    }
					h4 {
                    text-align: center;
                    color: black;
                    font-weight: bold;
                    }
                </style>
                <link href="https://cdn.jsdelivr.net/npm/tailwindcss@2.2.19/dist/tailwind.min.css" rel="stylesheet">
            </head>
            <body>
                <form action="/search" method="get" class="space-y-2">
                    <div style="text-align: center;">
                        <img src="https://e7.pngegg.com/pngimages/705/448/png-clipart-logo-imdb-film-logan-lerman-miscellaneous-celebrities-thumbnail.png" alt="IMDB Icon" style="height: 20px; width: 45px; display: inline-block;">
                        <label for="query" class="text-lg font-bold" style="color: black; text-decoration: underline; font-size: 14px; display: inline-block; vertical-align: middle;">MOVIES & TV SHOWS RATINGS COUNT</label>
                        <br>
                        <br>
                        <div style="text-align: center;">
                            <label for="query" class="text-lg font-bold" style="color: #813333e0;">VISITORS COUNT</label>
                            <br>
                            <br>
                            <a href="https://www.hitwebcounter.com" target="_blank" style="display: inline-block;">
                                <img src="https://hitwebcounter.com/counter/counter.php?page=13817460&style=0006&nbdigits=2&type=page&initCount=20" title="Counter Widget" Alt="Visit counter For Websites" border="0">
                            </a>
                            <br>
                        <div class="container" style="margin-top: 20px; text-align: center;">
                            <button style="background-color: #00000000; padding: 10px 20px; margin-right: 1px;">
                                <a href="https://yashwanthwebproject.netlify.app" style="color: black; text-decoration: none; font-size: 18px; font-weight: bold; display: block; background-color: inherit; border: 2px solid white; border-radius: 5px; padding: 5px;">
                                    Web Development Projects
                                </a>
                            </button>
                        </div>
                        <br>
                        <input type="text" id="query" name="query" required placeholder="Ex:Godzilla Or Godzilla 2014" class="px-4 py-2 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:border-blue-400 focus:ring-blue-400">
                        <br>
                        <button type="submit" class="px-4 py-2 bg-blue-500 text-white font-semibold rounded-lg shadow-md hover:bg-blue-600 focus:outline-none focus:bg-blue-600">Search</button>
                    </div>
                </form>
                <div id="result" class="result-container"></div>
                <br>
				<h4>"𝐑𝐚𝐭𝐢𝐧𝐠𝐬 𝐰𝐢𝐥𝐥 𝐚𝐩𝐩𝐞𝐚𝐫 𝐰𝐢𝐭𝐡𝐢𝐧 𝟏𝟎 𝐬𝐞𝐜𝐨𝐧𝐝𝐬"</h4>
				<br>
                <span class="px-4 py-2 bg-green-500 text-white font-semibold rounded-lg shadow-md hover:bg-green-600 focus:outline-none focus:bg-green-600">© ® Developed By Yashwanth R</span>
            </body>
        </html>
    `);
});

app.get('/search', async (req, res) => {
    const query = req.query.query;
    if (!query) {
        res.status(400).send('Query parameter is required');
        return;
    }

    const cachedResult = searchCache.get(query);
    if (cachedResult) {
        return res.send(cachedResult);
    }

    try {
        const page = await browser.newPage();

        const encodedQuery = encodeURIComponent(query);
        const url = `https://www.google.com/search?q=${encodedQuery}`;

        await page.goto(url, { waitUntil: 'domcontentloaded' });

        const imdbRatingsLink = await page.$('a[href*="imdb.com"]');
        if (imdbRatingsLink) {
            const screenshot = await imdbRatingsLink.screenshot();
            await page.close();

            const imageBase64 = screenshot.toString('base64');
            const imageSrc = `data:image/png;base64,${imageBase64}`;

            const resultHtml = `
                <html>
                    <head>
                        <meta charset="UTF-8">
                        <meta http-equiv="X-UA-Compatible" content="IE=edge">
                        <meta name="viewport" content="width=device-width, initial-scale=1.0">
                        <title>IMDB MOVIES & TV SHOWS RATINGS COUNT</title>
                        <link rel="icon" href="https://m.media-amazon.com/images/G/01/imdb/images-ANDW73HA/favicon_desktop_32x32._CB1582158068_.png" type="image/x-icon">
                        <style>
                            html, body {
                                overflow: hidden;
                            }
                            body {
                                font-family: 'Arial', sans-serif;
                                display: flex;
                                justify-content: center;
                                align-items: center;
                                height: 100vh;
                                margin: 0;
                                background-image: url('https://wallpaperaccess.com/full/1567770.gif');
                                background-size: cover;
                                background-position: center;
                                color: white;
                                flex-direction: column;
                                text-align: center;
                            }
                            .result-container {
                                display: flex;
                                flex-direction: column;
                                align-items: center;
                                background-color: rgba(0, 0, 0, 0.5);
                                padding: 20px;
                                border-radius: 8px;
                            }
                            button {
                                padding: 8px 16px;
                                background-color: #007bff;
                                color: white;
                                border: none;
                                border-radius: 4px;
                                cursor: pointer;
                            }
                            button:hover {
                                background-color: #0056b3;
                            }
                        </style>
                    </head>
                    <body>
                        <div class="result-container">
                            <h2>IMDb Ratings</h2>
                            <img src="${imageSrc}" alt="IMDb Ratings">
                            <form action="/" method="get">
                                <br>
                                <button type="submit">Search Again</button>
                            </form>
                        </div>
                    </body>
                </html>
            `;

            searchCache.set(query, resultHtml);

            res.send(resultHtml);
        } else {
            await page.close();
            res.status(500).send('Valid Search Only Acceptable');
        }
    } catch (error) {
        console.error('Error during search:', error);
        res.status(500).send('An error occurred while processing your request.');
    }
});

app.listen(port, () => {
    console.log(`Server running on port ${port}`);
});
