const express = require('express');
const puppeteer = require('puppeteer');

const app = express();
const port = 3000;

// Serve the HTML form for the search box
app.get('/', (req, res) => {
    res.send(`
        <html>
            <head>
                <style>
                    /* CSS Styles */
                    body {
                        font-family: 'Arial', sans-serif;
                        display: flex;
                        justify-content: center;
                        align-items: center;
                        height: 100vh;
                        margin: 0;
                    }
                    form {
                        display: flex;
                        flex-direction: column;
                        align-items: center;
                    }
                    input[type="text"] {
                        padding: 8px;
                        margin-bottom: 8px;
                        width: 300px;
                        border: 1px solid #ccc;
                        border-radius: 4px;
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
                    }
                </style>
                <link href="https://cdn.jsdelivr.net/npm/tailwindcss@2.2.19/dist/tailwind.min.css" rel="stylesheet">
            </head>
            <body>
                <form action="/search" method="get" class="space-y-2">
                    <label for="query" class="text-lg font-semibold">Imdb Movie Ratings</label>
                    <input type="text" id="query" name="query" required placeholder="movie name or movie name with ratings" class="px-4 py-2 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:border-blue-400 focus:ring-blue-400">
                    <button type="submit" class="px-4 py-2 bg-blue-500 text-white font-semibold rounded-lg shadow-md hover:bg-blue-600 focus:outline-none focus:bg-blue-600">Search</button>
                </form>
                <div id="result" class="result-container"></div> <!-- This is where the screenshot will be displayed -->
            </body>
        </html>
    `);
});

// Handle the form submission and perform the search
app.get('/search', async (req, res) => {
    const query = req.query.query;
    if (!query) {
        res.status(400).send('Query parameter is required');
        return;
    }

    const browser = await puppeteer.launch();
    const page = await browser.newPage();

    const encodedQuery = encodeURIComponent(query);
    const url = `https://www.google.com/search?q=${encodedQuery}`;

    await page.goto(url, { waitUntil: 'networkidle2' });

    // Capture screenshot of the IMDb ratings section
    const imdbRatingsLink = await page.$('a[href*="imdb.com"]');
    if (imdbRatingsLink) {
        // Capture screenshot of the IMDb ratings link
        const screenshot = await imdbRatingsLink.screenshot();
        await browser.close();

        const imageBase64 = screenshot.toString('base64');
        const imageSrc = `data:image/png;base64,${imageBase64}`;

        // Send HTML response with the image embedded and a "Search Again" button
        res.send(`
            <html>
                <body>
                    <div class="result-container">
                        <h2>IMDb Ratings</h2>
                        <img src="${imageSrc}" alt="IMDb Ratings">
                        <form action="/" method="get">
                            <button type="submit">Search Again</button>
                        </form>
                    </div>
                </body>
            </html>
        `);
    } else {
        await browser.close();
        res.status(500).send('IMDb ratings link not found');
    }
});

app.listen(port, () => {
    console.log(`Server running on port ${port}`);
});