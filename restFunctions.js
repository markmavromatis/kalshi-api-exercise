const API_URL = "https://api.elections.kalshi.com";
const EVENTS_PATH = "/trade-api/v2/events";
const MARKETS_PATH = "/trade-api/v2/markets";
const SERIES_PATH = "/trade-api/v2/series";
const TRADES_PATH = "/trade-api/v2/markets/trades";


// Kalshi API Events query, return data + cursor for subsequent query
async function fetchEventsFromKalshi(cursor) {
  console.log("Inside fetchEventsFromKalshi()...");
  const urlWithoutCursor = API_URL + EVENTS_PATH + "?limit=200";
  let fullUrl = urlWithoutCursor + (cursor ? `&cursor=${cursor}` : "");
  console.log("Calling fetch with URL: " + fullUrl);
  const response = await fetch(fullUrl)
    .then((response) => response.json())
    .then(async (body) => {
      const results = body.events;
      console.log(`- Retrieved ${body.events.length} records from Kalshi`);

      return Promise.resolve({ results, cursor: body.cursor });
    });
  return Promise.resolve(response);
}

// Kalshi API Markets query, return data + cursor for subsequent query
async function fetchMarketsFromKalshi(cursor) {
  console.log("Inside fetchMarketsFromKalshi()...");
  const urlWithoutCursor = API_URL + MARKETS_PATH + "?limit=1000";
  let fullUrl = urlWithoutCursor + (cursor ? `&cursor=${cursor}` : "");
  console.log("Calling fetch with URL: " + fullUrl);
  const response = await fetch(fullUrl)
    .then((response) => response.json())
    .then(async (body) => {
      console.log(`- Retrieved ${body.markets.length} records from Kalshi`);
      const results = body.markets;

      return Promise.resolve({ results, cursor: body.cursor });
    });
  return Promise.resolve(response);
}

// Kalshi API Trades query, return data + cursor for subsequent query
async function fetchTradesFromKalshi(cursor) {
  console.log("Inside fetchTradesFromKalshi()...");
  const urlWithoutCursor = API_URL + TRADES_PATH + "?limit=1000";
  let fullUrl = urlWithoutCursor + (cursor ? `&cursor=${cursor}` : "");
  console.log("Calling fetch with URL: " + fullUrl);
  const response = await fetch(fullUrl)
    .then((response) => response.json())
    .then(async (body) => {
      console.log(`- Retrieved ${body.trades.length} records from Kalshi`);
      const results = body.trades;

      return Promise.resolve({ results, cursor: body.cursor });
    });
  return Promise.resolve(response);
}

module.exports = { fetchEventsFromKalshi, fetchMarketsFromKalshi, fetchTradesFromKalshi };
