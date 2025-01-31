const API_URL = "https://api.elections.kalshi.com";
const EVENTS_PATH = "/trade-api/v2/events";
const MARKETS_PATH = "/trade-api/v2/markets";
const SERIES_PATH = "/trade-api/v2/series";
const TRADES_PATH = "/trade-api/v2/markets/trades";

async function fetchWithRetry(url, retries = 5, delay = 1000) {
  for (let i = 0; i < retries; i++) {
      const response = await fetch(url);
      if (response.status !== 429) { // 429 is the HTTP rate limit error code
          return response;
      }
      const waitTime = delay * Math.pow(2, i); // Exponential backoff
      await new Promise(res => setTimeout(res, waitTime));
  }
  throw new Error(`Max retries calling ${url} due to rate limiting.`);
}

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


// Kalshi API Series query, series can only be queried individually by ticker
async function fetchSeriesFromKalshi(ticker) {
  console.log("Inside fetchSeriesFromKalshi()...");
  const url = API_URL + SERIES_PATH + "/" + ticker;
  // let fullUrl = urlWithoutCursor + (cursor ? `&cursor=${cursor}` : "");
  console.log("Calling fetch with URL: " + url);
  let response = fetchWithRetry(url)
    .then((response) => {
        console.log("Processing response...");
        return response.json();
    }).then((body) => {
      console.log(`- Retrieved ${body.series.ticker} series from Kalshi`);
      console.log(body.series.title);
      const results = body.series;

      return Promise.resolve({ results });
    })
    .catch(error => {
      console.error(`Error detected! Reason: ${error.message}, Skipping ticker: ${ticker}`);
      return Promise.reject(ticker, error);
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

module.exports = { fetchEventsFromKalshi, fetchMarketsFromKalshi, fetchSeriesFromKalshi, fetchTradesFromKalshi };
