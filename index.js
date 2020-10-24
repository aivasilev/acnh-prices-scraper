const puppeteer = require('puppeteer');
const fs = require('fs');
const { exit } = require('process');

const scrape = async (type) => {
  try {
    const url = `https://nookipedia.com/wiki/${type}/New_Horizons`;
    const browser = await puppeteer.launch();
    const page = await browser.newPage();
    await page.goto(url, { waitUntil: 'networkidle2' });
    const result = await page.evaluate(() => {
      let arr = [];
      Array.from(document.querySelector('tbody').children).forEach(
        (el) =>
          (arr = [
            ...arr,
            {
              name: el.children[1].children[0].title,
              price: el.children[3].innerText.split(' ')[0].trim(),
              picture: el.children[2].children[0].children[0].src,
            },
          ])
      );
      return arr;
    });
    fs.writeFileSync(
      `./${type.toLowerCase()}.json`,
      JSON.stringify(result.map((el) => ({ type, ...el })))
    );
    console.log(`${type.toUpperCase()} DONE`);
  } catch (error) {
    console.error(error.message);
    exit(1);
  }
};
try {
  (async () => {
    await scrape('Fish');
    await scrape('Bugs');
    await scrape('Sea_creatures');
    exit(0);
  })();
} catch (error) {
  console.error(error.message);
  exit(1);
}
