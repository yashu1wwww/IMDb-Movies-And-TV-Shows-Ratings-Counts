const express = require('express');
const chromium = require('chrome-aws-lambda');
const puppeteer = require('puppeteer-core');

const app = express();
const port = process.env.PORT || 3000;

app.get('/', (req, res) => {
    res.send(`
        <html>
            <head>
                <title>IMDB MOVIES & TV SHOWS RATINGS COUNT</title>
                <link rel="icon" href="https://m.media-amazon.com/images/G/01/imdb/images-ANDW73HA/favicon_desktop_32x32._CB1582158068_.png" type="image/x-icon">
                <style>
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
                        background-color: rgba(225 168 168 / 16%);
                        padding: 83px;
                        border-radius: 39px;
                    }
                    input[type="text"] {
                        padding: 8px;
                        margin-bottom: 8px;
                        width: 300px;
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
                        padding: 20px;
                        border-radius: 63px;
                    }
                </style>
                <link href="https://cdn.jsdelivr.net/npm/tailwindcss@2.2.19/dist/tailwind.min.css" rel="stylesheet">
            </head>
            <body>
                <form action="/search" method="get" class="space-y-2">
                    <div style="text-align: center;">
                        <label for="query" class="text-lg font-bold" style="color: black; text-decoration: underline;">IMDB MOVIES & TV SHOWS RATINGS COUNT</label>
                        <br>
                        <br>
                        <div style="text-align: center;">
                            <label for="query" class="text-lg font-bold" style="color: #813333e0;">VISITORS COUNT</label>
                            <br>
                            <a href="https://www.hitwebcounter.com" target="_blank">
                                <img src="https://hitwebcounter.com/counter/counter.php?page=12946004&amp;style=0006&amp;nbdigits=4&amp;type=page&amp;initCount=1000" title="Counter Widget" alt="Visit counter For Websites" border="0">
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
                            <input type="text" id="query" name="query" required placeholder="Movie name or movie name with ratings" class="px-4 py-2 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:border-blue-400 focus:ring-blue-400">
                            <br>
                            <button type="submit" class="px-4 py-2 bg-blue-500 text-white font-semibold rounded-lg shadow-md hover:bg-blue-600 focus:outline-none focus:bg-blue-600">Search</button>
                        </div>
                    </div>
                </form>
                <div id="result" class="result-container"></div> <!-- This is where the screenshot will be displayed -->
                <br>
                <span class="px-4 py-2 bg-blue-500 text-white font-semibold rounded-lg shadow-md hover:bg-blue-600 focus:outline-none focus:bg-blue-600">© ® Developed By Yashwanth R</span>
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

    const browser = await puppeteer.launch({
        args: chromium.args,
        executablePath: await chromium.executablePath,
        headless: chromium.headless,
    });

    const page = await browser.newPage();

    const encodedQuery = encodeURIComponent(query);
    const url = `https://www.google.com/search?q=${encodedQuery}`;

    await page.goto(url, { waitUntil: 'networkidle2' });

    const imdbRatingsLink = await page.$('a[href*="imdb.com"]');
    if (imdbRatingsLink) {
        const screenshot = await imdbRatingsLink.screenshot();
        await browser.close();

        const imageBase64 = screenshot.toString('base64');
        const imageSrc = `data:image/png;base64,${imageBase64}`;

        res.send(`
            <html>
                <title>IMDB MOVIES & TV SHOWS RATINGS COUNT</title>
                <link rel="icon" href="https://m.media-amazon.com/images/G/01/imdb/images-ANDW73HA/favicon_desktop_32x32._CB1582158068_.png" type="image/x-icon">
                <style>
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
        `);
    } else {
        await browser.close();
        res.status(500).send('Valid Search Only Acceptable');
    }
});

app.listen(port, () => {
    console.log(`Server running on port ${port}`);
});
