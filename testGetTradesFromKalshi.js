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
  // Paginated results retrieved from Kalshi using cursor
  let allResults = [];
  let cursor;
  do {
    if (cursor) {
      console.log(
        `${getDateTimeAsString()} Querying trades data with cursor: ${cursor}!`
      );
    } else {
      console.log(`${getDateTimeAsString()} Querying trades data`);
    }
    // Fetch data from Kalshi
    const response = await restApi.fetchTradesFromKalshi(cursor);
    cursor = response.cursor;
    const foundRecords = response.results;
    // Add data to database
    dbFunctions.addTradesToDb(foundRecords);
    console.log(
      `${getDateTimeAsString()} Iteration records: ${foundRecords.length}`
    );
    allResults = allResults.concat(foundRecords);
    console.log(
      `${getDateTimeAsString()} Total records: ${allResults.length}`
    );
  } while (cursor);

  console.log(`Processed ${allResults.length} records`);
  db.close;
})();
