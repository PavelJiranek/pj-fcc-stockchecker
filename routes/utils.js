const fetch = require("node-fetch");
const { pipe, isNil, toUpper, trim, assoc, converge, subtract, head, last } = require('ramda');
const { isString } = require('ramda-adjunct');

const normalizeStockTicker = pipe(trim, toUpper);

const getStockUrl = (stock = "") => `https://Stock-Price-Checker-Proxy--freecodecamp.repl.co/v1/stock/${normalizeStockTicker(stock)}/quote`;

const fetchStockData = async (stock) => await (await fetch(getStockUrl(stock))).json();

const stringifyNumToFixed2 = num => num && num.toFixed(2).toString();

const UNKNOWN_TICKER_MSG = "Unknown stock ticker, please check your input.";

const getSingleStockData = (stockData) => {
    const { latestPrice, symbol: stock } = stockData;

    return isNil(stock)
        ? UNKNOWN_TICKER_MSG
        : { stock, price: stringifyNumToFixed2(latestPrice) };
}

const addLikesToStock = (stock, likes = 0) => isString(stock) ? stock : assoc('likes', likes, stock);

const getFirstStockRelLikes = converge(subtract, [head, last]);
const getSecondStockRelLikes = converge(subtract, [last, head]);

const getRelStockLikes = (stockIdx, likes = [2, 1]) =>
    stockIdx === 0
        ? getFirstStockRelLikes(likes)
        : getSecondStockRelLikes(likes);

const getMultipleStockResponse = async (stocks, likes) => {
    const rawStockData = await Promise.all(stocks.map(async (stock) => await fetchStockData(stock)));
    const stockData = rawStockData.map(getSingleStockData);

    const stockDataWithRelLikes = stockData.map((stock, idx) =>
        isString(stock)
            ? stock
            : ({ ...stock, rel_likes: getRelStockLikes(idx, likes) }));

    return { stockData: stockDataWithRelLikes }
}

const getSingleStockResponse = async (stock, likes) => {
    const rawStockData = await fetchStockData(stock);
    const stockData = getSingleStockData(rawStockData);

    return { stockData: addLikesToStock(stockData) };
}

module.exports = {
    fetchStockData,
    getSingleStockResponse,
    getMultipleStockResponse,
}
