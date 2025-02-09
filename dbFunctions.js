// Setup database
const sqlite3 = require("sqlite3").verbose();
const db = new sqlite3.Database("kalshi.db");
const moment = require("moment");
const MOMENT_FORMAT = "YYYY-MM-DD HH:mm:ss.SSS";

// Format date as a date / time string in YYYY-MM-DD HH:mm:ss.SSS format
function getFormattedDateTime(dateToFormat) {
  return moment(dateToFormat).format(MOMENT_FORMAT);
}

function setupDatabase() {
  // Setup DB
  db.serialize(() => {
    db.run(
      "CREATE TABLE IF NOT EXISTS MARKETS (ticker TEXT PRIMARY KEY, event_ticker TEXT, market_type TEXT, title TEXT, subtitle TEXT, yes_subtitle TEXT, no_subtitle, TEXT, status TEXT, yes_bid INTEGER, no_bid INTEGER, open_time TEXT, close_time TEXT, expected_expiration_time TEXT, expiration_time TEXT, volume INTEGER, liquidity INTEGER)"
    );
    db.run(
      "CREATE TABLE IF NOT EXISTS EVENTS (event_ticker TEXT PRIMARY KEY, series_ticker TEXT NULL, sub_title TEXT NULL, title TEXT NULL, mutually_exclusive TEXT NULL, category TEXT NULL)"
    );
    db.run(
      "CREATE TABLE IF NOT EXISTS SERIES (ticker TEXT PRIMARY KEY, frequency TEXT, title TEXT, category TEXT)"
    );
    db.run(
      "CREATE TABLE IF NOT EXISTS TRADES (trade_id TEXT PRIMARY KEY, ticker TEXT NULL, count INT, yes_price REAL, no_price REAL, taker_side TEXT, created_time TEXT)"
    );
  });
}

function getLastDownloadedTrade() {
  console.log("Inside method getLastDownloadedTrade...");
  return new Promise((resolve, reject) => {
    const query = "SELECT TRADES.trade_id FROM TRADES ORDER BY created_time DESC LIMIT 1";
    let results = [];

    db.get(query, [], (err, row) => {
      if (err) {
        reject(err);
      } else {
        resolve(row.trade_id);  // Resolve the promise with the results array
      }
    });
  });

}

function getSeriesTickers() {
  console.log("Inside method getSeriesTickers");
  return new Promise((resolve, reject) => {
    // const db = new sqlite3.Database("kalshi.db");
    const query = "SELECT DISTINCT series_ticker FROM EVENTS";
    let results = [];

    db.all(query, [], (err, rows) => {
      if (err) {
        reject(err);
      } else {
        rows.forEach((row) => {
          const ticker = row.series_ticker;
          if (ticker != '') {
            // EVENT CASE-087 is missing a series ticker. Skipping for now.
            results.push(row.series_ticker);
          }
        });
        resolve(results);  // Resolve the promise with the results array
      }
    });

    // db.close();
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
  subtitle,
  yesSubtitle,
  noSubtitle,
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
            "INSERT INTO MARKETS (ticker, event_ticker, market_type, title, subtitle, yes_subtitle, no_subtitle, status, yes_bid, no_bid, open_time, close_time, expected_expiration_time, expiration_time, volume, liquidity) VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)"
          );
          stmt.run(
            [
              ticker,
              eventTicker,
              marketType,
              title,
              subtitle,
              yesSubtitle,
              noSubtitle,
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

// Does the series already exist in the database?
async function doesSeriesExist(ticker) {
  return new Promise((resolve, reject) => {
    const query = "SELECT COUNT(*) as count FROM SERIES WHERE ticker = ?";
    db.get(query, ticker, (err, row) => { 
      if (err) {
        reject(err);  // Reject the promise if there's an error
      } else {
        resolve( row.count > 0);
      }
    })
  })
}

function addUpdateSeries(
  ticker,
  frequency,
  title,
  category
) {
    const stmt = db.prepare(
      "INSERT INTO SERIES (ticker, frequency, title, category) VALUES (?,?,?,?)"
    );
    stmt.run(
      [
        ticker,
        frequency,
        title,
        category
      ],
      function (err) {
        if (err) {
          console.error("ERROR inserting record: " + ticker, err);
        }
      }
    );
    stmt.finalize();
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
  console.log("Inside method addUpdateTrade: " + tradeId);
  return new Promise((resolve, reject) => {
    console.log("Checking trades count for id: " + tradeId);
    db.get(
      "SELECT COUNT(*) as count FROM TRADES WHERE trade_id = ?",
      tradeId,
      (err, row) => {
        if (err) {
          reject(err);
        } else {
          if (row.count == 0) {
            console.log("Inserting trade: " + tradeId);
            const stmt = db.prepare(
              "INSERT INTO TRADES (trade_id, ticker, count, yes_price, no_price, taker_side, created_time) VALUES (?,?,?,?,?,?,?)"
            );
            stmt.run(
              [tradeId, ticker, count, yesPrice, noPrice, takerSide, createdTime], (err) => {
                if (err) {
                  console.log(`Error inserting trade ${tradeId}: ${err}`);
                  reject(err);
                } else {
                  stmt.finalize();
                  console.log("Resolving: " + tradeId);
                  resolve();
                }
              }
            );
          } else {
            console.log("Skipping trade: " + tradeId);
            resolve();
          }
        }
      }
    );
  })
  
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

    const ticker = result.ticker;
    const eventTicker = result.event_ticker;
    const marketType = result.market_type;
    const title = result.title;
    const subtitle = result.subtitle;
    const yesSubtitle = result.yes_sub_title;
    const noSubtitle = result.no_sub_title;
    const status = result.status;
    const yesBid = result.yes_bid;
    const noBid = result.no_bid;
    const openTime = getFormattedDateTime(Date.parse(result.open_time));
    const closeTime = getFormattedDateTime(Date.parse(result.close_time));
    const expectedExpirationTime = getFormattedDateTime(Date.parse(result.expected_expiration_time));
    const expirationTime = getFormattedDateTime(Date.parse(result.expiration_time));
    const volume = result.volume;
    const liquidity = result.liquidity;
    console.log("Adding ticker: " + ticker);
    addUpdateMarket(
      ticker,
      eventTicker,
      marketType,
      title,
      subtitle,
      yesSubtitle,
      noSubtitle,
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
  return new Promise((resolve, reject) => {
    const insertPromises = [];
    for (const result of results) {
      // Check for existing ticker
      const tradeId = result.trade_id;
      const ticker = result.ticker;
      const count = result.count;
      const yesPrice = result.yes_price;
      const noPrice = result.no_price;
      const takerSide = result.taker_side;
      const createdTime = getFormattedDateTime(Date.parse(result.created_time));
      console.log("Adding trade: " + tradeId);
      insertPromises.push(addUpdateTrade(
        tradeId,
        ticker,
        count,
        yesPrice,
        noPrice,
        takerSide,
        createdTime
      ));
      console.log(`ADDED trade ${tradeId}`);
    };
    Promise.all(insertPromises).then(() => {
      console.log("Resolving addTradesToDb...");
      resolve(true);
    });
  });
}

module.exports = {
  addUpdateSeries,
  setupDatabase,
  addEventsToDb,
  addMarketsToDb,
  addTradesToDb,
  doesSeriesExist,
  getLastDownloadedTrade,
  getSeriesTickers,
};
