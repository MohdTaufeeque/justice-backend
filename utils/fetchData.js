const puppeteer = require('puppeteer');

const fetchFromIndianKanoon = async (sectionNumber) => {
    try {
        const browser = await puppeteer.launch({ headless: "new" });
        const page = await browser.newPage();

        // Fake user-agent to avoid bot detection
        await page.setUserAgent('Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36');

        const searchUrl = `https://indiankanoon.org/search/?formInput=IPC%20${sectionNumber}`;
        await page.goto(searchUrl, { waitUntil: 'domcontentloaded' });

        const results = await page.evaluate(() => {
            const data = [];
            document.querySelectorAll('div.result_title').forEach((element, index) => {
                if (index < 3) {
                    const title = element.innerText.trim();
                    const link = "https://indiankanoon.org" + element.querySelector('a').getAttribute('href');
                    data.push({ title, link });
                }
            });
            return data;
        });

        await browser.close();
        return results.length > 0 ? results : null;

    } catch (error) {
        console.error("❌ Error fetching data from Indian Kanoon using Puppeteer:", error);
        return null;
    }
};

module.exports = { fetchFromIndianKanoon };
