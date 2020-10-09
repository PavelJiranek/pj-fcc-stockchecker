const fetch = require("node-fetch");
const R = require('ramda');
const { pipe, isNil, toUpper, trim } = R;

const normalizeStockTicker = pipe(trim, toUpper);

const getStockUrl = (stock = "") => `https://Stock-Price-Checker-Proxy--freecodecamp.repl.co/v1/stock/${normalizeStockTicker(stock)}/quote`;

const fetchStockData = async (stock) => await (await fetch(getStockUrl(stock))).json();

const stringifyNumToFixed2 = num => num && num.toFixed(2).toString();

const UNKNOWN_TICKER_MSG = "Unknown stockticker, please check your input.";

const getSingleStockResponse = (stockData, likes = 0) => {
    const { latestPrice, symbol: stock } = stockData;

    return {
        stockData: isNil(stock)
            ? UNKNOWN_TICKER_MSG
            : {
                stock,
                price: stringifyNumToFixed2(latestPrice),
                likes,
            },
    };
}

module.exports = {
    fetchStockData,
    getSingleStockResponse,
}
