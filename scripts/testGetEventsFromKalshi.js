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

logger.info(`${getDateTimeAsString()} Querying Kalshi...`);

(async function () {
  // Paginated results retrieved from Kalshi using cursor
  let allResults = [];
  let cursor;
  do {
    if (cursor) {
      logger.info(
        `${getDateTimeAsString()} Querying events data with cursor: ${cursor}!`
      );
    } else {
      logger.info(`${getDateTimeAsString()} Querying events data`);
    }
    // Fetch data from Kalshi
    const response = await restApi.fetchEventsFromKalshi(cursor);
    cursor = response.cursor;
    const foundRecords = response.results;
    // Add data to database
    dbFunctions.addEventsToDb(foundRecords);
    logger.info(
      `${getDateTimeAsString()} Iteration records: ${foundRecords.length}`
    );
    allResults = allResults.concat(foundRecords);
    logger.info(
      `${getDateTimeAsString()} Total records: ${allResults.length}`
    );
  } while (cursor);

  logger.info(`Processed ${allResults.length} records`);
  db.close;
})();
