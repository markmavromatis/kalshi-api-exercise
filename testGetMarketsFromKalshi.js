const restApi = require("./restFunctions");
const dbFunctions = require("./dbFunctions");

// Setup database
const sqlite3 = require("sqlite3").verbose();
const db = new sqlite3.Database("kalshi.db");
dbFunctions.setupDatabase();

const beforeQueryTime = new Date();
console.log(`${beforeQueryTime.toISOString()} Querying Kalshi...`);

(async function () {
  let allResults = [];
  let response = await restApi.fetchMarketsFromKalshi();
  const foundRecords = response.results;
  allResults.concat(foundRecords);
  dbFunctions.addMarketsToDb(foundRecords);

  const afterQueryTime = new Date();
  console.log(`${afterQueryTime.toISOString()} Done!`);

  console.log(`Processed ${foundRecords.length} records`);
  db.close;
})();
