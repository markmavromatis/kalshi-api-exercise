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

function containsLastTradeId(foundRecords, lastTradeId) {
  for (let i = 0; i < foundRecords.length; i++) {
    if (foundRecords[i].trade_id === lastTradeId) {
      return true;
    }
  }
  return false;
}

console.log(`${getDateTimeAsString()} Querying Kalshi...`);

(async function () {
  // Paginated results retrieved from Kalshi using cursor
  let allResults = [];
  let cursor;

// What was the last trade that we downloaded from Kalshi?
const lastTradeId = await dbFunctions.getLastDownloadedTrade();
console.log("Last trade ID: " + lastTradeId);
// return 0;

// Trades are downloaded in order from newest to oldest.
// Instead of re-downloading all trades, we should stop at the last downloaded trade
  let resultsContainLastTradeId = false;
  do {
    if (cursor) {
      console.log(
        `${getDateTimeAsString()} Querying trades data with cursor: ${cursor}!`
      );
    } else {
      console.log(`${getDateTimeAsString()} Querying trades data`);
    }
    // Fetch data from Kalshi
    console.log("Fetching trades...");
    const response = await restApi.fetchTradesFromKalshi(cursor);
    console.log("Fetching trades complete");
    cursor = response.cursor;
    const foundRecords = response.results;
    // Check for last trade ID
    console.log("Does it include the last loaded trade?");
    resultsContainLastTradeId = containsLastTradeId(foundRecords, lastTradeId);
    console.log("Result: " + resultsContainLastTradeId);

    // Add data to database
    await dbFunctions.addTradesToDb(foundRecords);
    console.log(
      `${getDateTimeAsString()} Iteration records: ${foundRecords.length}`
    );
    allResults = allResults.concat(foundRecords);
    console.log(
      `${getDateTimeAsString()} Total records: ${allResults.length}`
    );
  } while (cursor && !resultsContainLastTradeId);

  console.log(`Processed ${allResults.length} records`);
  db.close;
})();
