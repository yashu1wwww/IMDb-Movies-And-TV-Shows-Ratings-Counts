const express = require('express');
const puppeteer = require('puppeteer');
const path = require('path');

const app = express();
const port = 3000;

app.use(express.static(path.join(__dirname, 'public')));

app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

app.get('/search', async (req, res) => {
    const query = req.query.query;
    if (!query) {
        res.status(400).send('Query parameter is required');
        return;
    }

    try {
        const browser = await puppeteer.launch({ args: ['--no-sandbox', '--disable-setuid-sandbox'] });
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
            `);
        } else {
            await browser.close();
            res.status(500).send('Valid Search Only Acceptable');
        }
    } catch (error) {
        console.error(error);
        res.status(500).send('An error occurred while processing your request');
    }
});

app.listen(port, () => {
    console.log(`Server running on port ${port}`);
});
