const restApi = require("./restFunctions");
const dbFunctions = require("./dbFunctions");

// Setup database
const sqlite3 = require("sqlite3").verbose();
const db = new sqlite3.Database("kalshi.db");
dbFunctions.setupDatabase();

function getDateTimeAsString() {
  let currentTime = new Date();
  return currentTime.toISOString();
}

console.log(`${getDateTimeAsString()} Querying Kalshi...`);

(async function () {

  // Retrieve list of series tickers
  let addedCount = 0;
  dbFunctions.getSeriesTickers()
  .then(async (tickers) => {
    // const ticker = tickers[0];
    // console.log(ticker);
    // const recordExists = await dbFunctions.doesSeriesExist(ticker);
    // console.log(recordExists);
    // if (!recordExists) {
    // restApi.fetchSeriesFromKalshi(ticker)
    // .then((restData) => {
    //   const results = restData.results;
    //   const ticker = results.ticker;
    //   console.log("TICKER = " + ticker);
    //   const title = results.title;
    //   const frequency = results.frequency;
    //   const category = results.category;
    //   dbFunctions.addUpdateSeries(ticker,
    //     frequency,
    //     title,
    //     category)
    // });

    // }
    console.log("Tickers: " + tickers);
    tickers.forEach(async (ticker) => {
      console.log(`Ticker: [${ticker}]`);
      const recordExists = await dbFunctions.doesSeriesExist(ticker);
      if (!recordExists) {
        console.log("Adding ticker: " + ticker);
        await restApi.fetchSeriesFromKalshi(ticker)
          .then((restData) => {
            console.log("restdata: " + JSON.stringify(restData));
            const results = restData.results;
            const ticker = results.ticker;
            console.log("TICKER = " + ticker);
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
            console.log("Error retrieving ticker: " + ticker, "Skipping", error);
          });
      }
      })       
  });

  console.log(`Processed ${addedCount} records`);
  db.close;
})();
