-- Trades - Self explanatory
-- How many trades are there in the database?
SELECT COUNT(*) FROM TRADES;
-- Trade volumes by date
SELECT SUBSTRING(created_time,0,11) tradeDate, count(*) FROM TRADES t WHERE created_time >= '2025-01-20' GROUP BY tradeDate
-- Top 10 traded markets on a given day
SELECT t.ticker, m.title, count(*) count FROM TRADES t, MARKETS m WHERE created_time >= '2025-01-27' AND created_time < '2025-01-28' AND t.ticker = m.ticker GROUP BY t.ticker ORDER BY count DESC LIMIT 10
-- Commissions
CREATE TABLE FEES_0127
as
SELECT created_time,
count count,
case taker_side
when 'no' THEN no_price / 100
when 'yes' then yes_price / 100
END price,
0 fee
from TRADES 
WHERE created_time >= '2025-01-27' AND created_time < '2025-01-28'

UPDATE FEES_0127 SET fee = round(0.07 * count * price * (1 - price), 2)
SELECT SUM(fee) FROM FEES_0127


-- Markets - Event contracts are sold against these yes/no questions. E.g. "Will Guts win Album of the Year?"
-- 100 most popular markets by market volume
SELECT ticker, title, subtitle, volume FROM MARKETS M ORDER BY volume DESC LIMIT 100
-- 100 most popular markets by # trades
SELECT T.ticker, M.title, count(*) count FROM TRADES T, MARKETS M WHERE T.ticker = M.ticker GROUP BY T.ticker, M.title ORDER BY count DESC LIMIT 100

-- Events - Belongs to series, reflects 1 or more markets. E.g.  "2024 Grammy for Album of the Year"
-- Event categories and counts
SELECT E.category, count(*) count FROM TRADES T, MARKETS M, EVENTS E WHERE T.ticker = M.ticker AND M.event_ticker = E.event_ticker GROUP BY E.category ORDER BY count DESC


-- Series - Topics filed with the CFTC along with the resolution rules. e.g. "Grammy of the Year"
