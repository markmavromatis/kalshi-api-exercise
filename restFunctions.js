const API_URL = "https://api.elections.kalshi.com";
const EVENTS_PATH = "/trade-api/v2/events";
const MARKETS_PATH = "/trade-api/v2/markets";
const SERIES_PATH = "/trade-api/v2/series";
const TRADES_PATH = "/trade-api/v2/markets/trades";

// Kalshi API Markets query, return data + cursor for subsequent query
async function fetchMarketsFromKalshi(cursor) {
  console.log("Inside fetchDataWithCursor()...");
  const urlWithoutCursor = API_URL + MARKETS_PATH + "?length=1000";
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

module.exports = { fetchMarketsFromKalshi };
