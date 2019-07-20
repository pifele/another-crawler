
// THIRD PARTY DEPENDENCIES
const axios = require('axios');
const { readFile, writeFile } = require('fs');

// INTERNAL DEPENDENCIES
const { createRegexScraper } = require('another-scraper');

// CONSTANTS
const TEST_URL = 'http://www.imdb.com/title/tt1229340/';
const STORE_FILE_ROUTE = './storedUrls.json';

// Data extractors
const dataUrlsRegexpExtractors = {
  urls: (html) => html.match(/(\b(https?|ftp|file):\/\/[-A-Z0-9+&@#\/%?=~_|!:,.;]*[-A-Z0-9+&@#\/%=~_|])/ig)
};

const saveUrlDataToFile = (url, data, targetRoute, storedData) => {
  const dataToSave = storedData
    ? { ...storedData, [url]: data }
    : { [url]: data };

  writeFile(targetRoute, JSON.stringify(dataToSave), (err) => {
    if (err) {
      throw err;
    }

    console.log(`It\'s saved, origin: ${url}`);
  });
};

const visitUrl = (url, storedUrls) => axios.get(url).then((response) => {
  const { data: html } = response;

  if (html) {
    // Create scraper
    const dataUrlsRegexpScraper = createRegexScraper(dataUrlsRegexpExtractors, html);
    // Scrap
    const extractedData = dataUrlsRegexpScraper.scrapLoadedHtml();

    // Save data
    saveUrlDataToFile(TEST_URL, extractedData, STORE_FILE_ROUTE, storedUrls)
  }
});

// Read File
readFile(STORE_FILE_ROUTE, (error, storedUrlsJson = '{}') => {
  if (error) {
    return visitUrl(TEST_URL);
  }
  const storedUrls = JSON.parse(storedUrlsJson);
  const storedUrlData = storedUrls[TEST_URL];

  if (storedUrlData) {
    return console.log({ storedUrlData });
  }

  visitUrl(TEST_URL, storedUrls);
});
