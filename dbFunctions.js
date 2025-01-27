// Setup database
const sqlite3 = require("sqlite3").verbose();
const db = new sqlite3.Database("kalshi.db");
const moment = require("moment");

function setupDatabase() {
  // Setup DB
  db.serialize(() => {
    db.run(
      "CREATE TABLE IF NOT EXISTS MARKETS (ticker TEXT PRIMARY KEY, event_ticker TEXT, market_type TEXT, title TEXT, status TEXT, yes_bid INTEGER, no_bid INTEGER, open_time TEXT, close_time TEXT, expected_expiration_time TEXT, expiration_time TEXT, volume INTEGER, liquidity INTEGER)"
    );
    db.run(
      "CREATE TABLE IF NOT EXISTS EVENTS (event_ticker TEXT PRIMARY KEY, series_ticker TEXT NULL, sub_title TEXT NULL, title TEXT NULL, mutually_exclusive TEXT NULL, category TEXT NULL)"
    );
    db.run(
      "CREATE TABLE IF NOT EXISTS TRADES (trade_id TEXT PRIMARY KEY, ticker TEXT NULL, count INT, yes_price REAL, no_price REAL, taker_side TEXT, created_time TEXT)"
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
            [
              eventTicker,
              seriesTicker,
              subTitle,
              title,
              mutuallyExclusive,
              category,
            ],
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
  noBid,
  openTime,
  closeTime,
  expectedExpirationTime,
  expirationTime,
  volume,
  liquidity
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
            "INSERT INTO MARKETS (ticker, event_ticker, market_type, title, status, yes_bid, no_bid, open_time, close_time, expected_expiration_time, expiration_time, volume, liquidity) VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?)"
          );
          stmt.run(
            [
              ticker,
              eventTicker,
              marketType,
              title,
              status,
              yesBid,
              noBid,
              openTime,
              closeTime,
              expectedExpirationTime,
              expirationTime,
              volume,
              liquidity,
            ],
            function (err) {
              if (err) {
                console.error("ERROR inserting record: " + ticker, err);
              }
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
    // console.log(JSON.stringify(result));
    // return 0;
    // Check for existing ticker
    const ticker = result.ticker;
    const eventTicker = result.event_ticker;
    const marketType = result.market_type;
    const title = result.title;
    const status = result.status;
    const yesBid = result.yes_bid;
    const noBid = result.no_bid;
    const openTime = moment(Date.parse(result.open_time)).format(
      "YYYY-MM-DD HH:MM:SS.SSS"
    );
    const closeTime = moment(Date.parse(result.close_time)).format(
      "YYYY-MM-DD HH:MM:SS.SSS"
    );
    const expectedExpirationTime = moment(
      Date.parse(result.expected_expiration_time)
    ).format("YYYY-MM-DD HH:MM:SS.SSS");
    const expirationTime = moment(Date.parse(result.expiration_time)).format(
      "YYYY-MM-DD HH:MM:SS.SSS"
    );
    const volume = result.volume;
    const liquidity = result.liquidity;
    console.log("Adding ticker: " + ticker);
    addUpdateMarket(
      ticker,
      eventTicker,
      marketType,
      title,
      status,
      yesBid,
      noBid,
      openTime,
      closeTime,
      expectedExpirationTime,
      expirationTime,
      volume,
      liquidity
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
    const createdTime = moment(Date.parse(result.created_time)).format(
      "YYYY-MM-DD HH:MM:SS.SSS"
    );
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
module.exports = {
  setupDatabase,
  addEventsToDb,
  addMarketsToDb,
  addTradesToDb,
};
