// Setup database
const sqlite3 = require("sqlite3").verbose();
const db = new sqlite3.Database("kalshi.db");

function setupDatabase() {
  // Setup DB
  db.serialize(() => {
    db.run(
      "CREATE TABLE IF NOT EXISTS MARKETS (ticker TEXT PRIMARY KEY, event_ticker TEXT NULL, market_type TEXT NULL, title TEXT NULL, status TEXT NULL, yes_bid REAL NULL, no_bid REAL NULL)"
    );
    db.run(
      "CREATE TABLE IF NOT EXISTS EVENTS (event_ticker TEXT PRIMARY KEY, series_ticker TEXT NULL, sub_title TEXT NULL, title TEXT NULL, mutually_exclusive TEXT NULL, category TEXT NULL)"
    );
    db.run(
      "CREATE TABLE IF NOT EXISTS TRADES (trade_id TEXT PRIMARY KEY, ticker TEXT NULL, count INT, yes_price REAL, no_price REAL, taker_side TEXT NULL, created_time TEXT NULL)"
    );
  });
}

function addUpdateEvent(
  eventTicker,
  seriesTicker,
  subTitle,
  title,
  mutuallyExclusive,
  category
) {
  const rows = db.get(
    "SELECT COUNT(*) as count FROM EVENTS WHERE event_ticker = ?",
    eventTicker,
    (err, row) => {
      if (err) {
        console.error(err);
      } else {
        if (row.count == 0) {
          const stmt = db.prepare(
            "INSERT INTO EVENTS (event_ticker, series_ticker, sub_title, title, mutually_exclusive, category) VALUES (?,?,?,?,?,?)"
          );
          stmt.run(
            [eventTicker, seriesTicker, subTitle, title, mutuallyExclusive, category],
            function (err) {
              console.log("Inserted record: " + eventTicker);
            }
          );
          stmt.finalize();
        }
      }
    }
  );
  return rows;
}

function addUpdateMarket(
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

function addUpdateTrade(
  tradeId,
  ticker,
  count,
  yesPrice,
  noPrice,
  takerSide,
  createdTime
) {
  const rows = db.get(
    "SELECT COUNT(*) as count FROM TRADES WHERE trade_id = ?",
    ticker,
    (err, row) => {
      if (err) {
        console.error(err);
      } else {
        if (row.count == 0) {
          const stmt = db.prepare(
            "INSERT INTO TRADES (trade_id, ticker, count, yes_price, no_price, taker_side, created_time) VALUES (?,?,?,?,?,?,?)"
          );
          stmt.run(
            [tradeId, ticker, count, yesPrice, noPrice, takerSide, createdTime],
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
async function addEventsToDb(results) {
  console.log("Adding " + results.length + " events to database!");
  results.forEach((result) => {
    // Check for existing ticker
    const eventTicker = result.event_ticker;
    const seriesTicker = result.series_ticker;
    const subTitle = result.sub_title;
    const title = result.title;
    const mutually_exclusive = result.mutually_exclusive;
    const category = result.category;
    console.log("Adding event: " + eventTicker);
    addUpdateEvent(
      eventTicker,
      seriesTicker,
      subTitle,
      title,
      mutually_exclusive,
      category
    );
    return Promise.resolve(true);
  });
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
    addUpdateMarket(
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

async function addTradesToDb(results) {
  console.log("Adding " + results.length + " trades to database!");
  results.forEach((result) => {
    // Check for existing ticker
    const tradeId = result.trade_id;
    const ticker = result.ticker;
    const count = result.count;
    const yesPrice = result.yes_price;
    const noPrice = result.no_price;
    const takerSide = result.taker_side;
    const createdTime = result.created_time;
    console.log("Adding trade: " + tradeId);
    addUpdateTrade(
      tradeId,
      ticker,
      count,
      yesPrice,
      noPrice,
      takerSide,
      createdTime
    );
    return Promise.resolve(true);
  });
}
module.exports = { setupDatabase, addEventsToDb, addMarketsToDb, addTradesToDb };
