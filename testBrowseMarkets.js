// Setup database
const sqlite3 = require("sqlite3").verbose();
const db = new sqlite3.Database("kalshi.db");
let counter = 0;
db.each("SELECT ticker, market_type, title FROM MARKETS", (err, row) => {
  counter += 1;
  console.log(
    counter + ": " + row.ticker + " " + row.market_type + " " + row.title
  );
});
db.close;
