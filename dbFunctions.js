// Setup database
const sqlite3 = require("sqlite3").verbose();
const db = new sqlite3.Database("kalshi.db");

function setupDatabase() {
  // Setup DB
  db.serialize(() => {
    db.run(
      "CREATE TABLE IF NOT EXISTS MARKETS (ticker TEXT PRIMARY KEY, event_ticker TEXT NULL, market_type TEXT NULL, title TEXT NULL, status TEXT NULL, yes_bid REAL NULL, no_bid REAL NULL)"
    );
  });
}

function insertIfNotExists(
  ticker,
  eventTicker,
  marketType,
  title,
  status,
  yesBid,
  noBid
) {
  const rows = db.get(
    "SELECT COUNT(*) as count FROM MARKETS WHERE ticker = ?",
    ticker,
    (err, row) => {
      if (err) {
        console.error(err);
      } else {
        if (row.count == 0) {
          const stmt = db.prepare(
            "INSERT INTO MARKETS (ticker, event_ticker, market_type, title, status, yes_bid, no_bid) VALUES (?,?,?,?,?,?,?)"
          );
          stmt.run(
            [ticker, eventTicker, marketType, title, status, yesBid, noBid],
            function (err) {
              console.log("Inserted record: " + ticker);
            }
          );
          stmt.finalize();
        }
      }
    }
  );
  return rows;
}
async function addMarketsToDb(results) {
  console.log("Adding " + results.length + " markets to database!");
  results.forEach((result) => {
    // Check for existing ticker
    const ticker = result.ticker;
    const eventTicker = result.event_ticker;
    const marketType = result.market_type;
    const title = result.title;
    const status = result.status;
    const yesBid = result.yes_Bid;
    const noBid = result.no_bid;
    console.log("Adding ticker: " + ticker);
    insertIfNotExists(
      ticker,
      eventTicker,
      marketType,
      title,
      status,
      yesBid,
      noBid
    );
    return Promise.resolve(true);
  });
}

module.exports = { setupDatabase, addMarketsToDb };
