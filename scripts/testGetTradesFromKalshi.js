const restApi = require("../lib/restFunctions");
const dbFunctions = require("../lib/dbFunctions");

// Setup database
const sqlite3 = require("sqlite3").verbose();
const db = new sqlite3.Database("kalshi.db");
const logger = require('../lib/logger').default;


dbFunctions.setupDatabase();

function getDateTimeAsString() {
  let currentTime = new Date();
  return currentTime.toISOString();
}

function containsLastTradeId(foundRecords, lastTradeId) {
  for (let i = 0; i < foundRecords.length; i++) {
    if (foundRecords[i].trade_id === lastTradeId) {
      return true;
    }
  }
  return false;
}

logger.info(`${getDateTimeAsString()} Querying Kalshi...`);

(async function () {
  // Paginated results retrieved from Kalshi using cursor
  let allResults = [];
  let cursor;

// What was the last trade that we downloaded from Kalshi?
const lastTradeId = await dbFunctions.getLastDownloadedTrade();
logger.info("Last trade ID: " + lastTradeId);
// return 0;

// Trades are downloaded in order from newest to oldest.
// Instead of re-downloading all trades, we should stop at the last downloaded trade
  let resultsContainLastTradeId = false;
  do {
    if (cursor) {
      logger.info(
        `${getDateTimeAsString()} Querying trades data with cursor: ${cursor}!`
      );
    } else {
      logger.info(`${getDateTimeAsString()} Querying trades data`);
    }
    // Fetch data from Kalshi
    logger.info("Fetching trades...");
    const response = await restApi.fetchTradesFromKalshi(cursor);
    logger.info("Fetching trades complete");
    cursor = response.cursor;
    const foundRecords = response.results;
    // Check for last trade ID
    logger.info("Does it include the last loaded trade?");
    resultsContainLastTradeId = containsLastTradeId(foundRecords, lastTradeId);
    logger.info("Result: " + resultsContainLastTradeId);

    // Add data to database
    await dbFunctions.addTradesToDb(foundRecords);
    logger.info(
      `${getDateTimeAsString()} Iteration records: ${foundRecords.length}`
    );
    allResults = allResults.concat(foundRecords);
    logger.info(
      `${getDateTimeAsString()} Total records: ${allResults.length}`
    );
  } while (cursor && !resultsContainLastTradeId);

  logger.info(`Processed ${allResults.length} records`);
  db.close;
})();
