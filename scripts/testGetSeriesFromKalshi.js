const restApi = require("../lib/restFunctions");
const dbFunctions = require("../lib/dbFunctions");
const logger = require('../lib/logger').default;

// Setup database
const sqlite3 = require("sqlite3").verbose();
const db = new sqlite3.Database("kalshi.db");
dbFunctions.setupDatabase();

function getDateTimeAsString() {
  let currentTime = new Date();
  return currentTime.toISOString();
}

logger.info(`${getDateTimeAsString()} Querying Kalshi...`);

(async function () {

  // Retrieve list of series tickers
  let addedCount = 0;
  dbFunctions.getSeriesTickers()
  .then(async (tickers) => {

    logger.info("Tickers: " + tickers);
    tickers.forEach(async (ticker) => {
      logger.info(`Ticker: [${ticker}]`);
      const recordExists = await dbFunctions.doesSeriesExist(ticker);
      if (!recordExists) {
        logger.info("Adding ticker: " + ticker);
        await restApi.fetchSeriesFromKalshi(ticker)
          .then((restData) => {
            logger.info("restdata: " + JSON.stringify(restData));
            const results = restData.results;
            const ticker = results.ticker;
            logger.info("TICKER = " + ticker);
            const title = results.title;
            const frequency = results.frequency;
            const category = results.category;
            dbFunctions.addUpdateSeries(ticker,
              frequency,
              title,
              category)
            addedCount += 1;
            })
          .catch((error) => {
            logger.info("Error retrieving ticker: " + ticker, "Skipping", error);
          });
      }
      })       
  });

  logger.info(`Processed ${addedCount} records`);
  db.close;
})();
