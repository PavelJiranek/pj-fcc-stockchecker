const fetch = require("node-fetch");
const { pipe, isNil, toUpper, trim, assoc, converge, subtract, head, last, map, defaultTo } = require('ramda');
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

const addLikesToStock = (stock, likes = 0) =>
    isString(stock)
        ? stock
        : assoc('likes', likes, stock);

const getFirstStockRelLikes = converge(subtract, [head, last]);
const getSecondStockRelLikes = converge(subtract, [last, head]);

const getRelStockLikes = (stockIdx, likes) => {
    const normalizedLikes = map(defaultTo(0), likes)

    return stockIdx === 0
        ? getFirstStockRelLikes(normalizedLikes)
        : getSecondStockRelLikes(normalizedLikes);

}

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

    return { stockData: addLikesToStock(stockData, likes) };
}
const STOCKS_COLLECTION = "stockChecker.stocks";

const getStockData = (db, stockTicker) => db.collection(STOCKS_COLLECTION)
    .findOne({ _id: stockTicker })
    .then(data => data);

const getStockProp = async (db, stockTicker, prop) => {
    const stockData = await getStockData(db, stockTicker);
    return stockData ? stockData[prop] : undefined;
}

const getStockLikes = async (db, stockTicker) => {
    return await getStockProp(db, stockTicker, 'likes');
}

const getStockIps = async (db, stockTicker) => {
    return await getStockProp(db, stockTicker, 'ipAddresses');
}

const isNewIpToLike = (ip = '', ipsCollection = []) => !ipsCollection.includes(ip);

const incStockLikes = (db, stockTicker, ipAddress) => db.collection(STOCKS_COLLECTION)
    .updateOne({ _id: stockTicker },
        { $inc: { likes: 1 }, $push: { ipAddresses: ipAddress } },
        { upsert: true },
    )
    .then(async () => {
        return await getStockLikes(db, stockTicker);
    });

const updateStockLikes = async (db, stockTicker, ipAddress) => {
    const ips = await getStockIps(db, stockTicker, ipAddress);
    if (isNewIpToLike(ipAddress, ips)) {
        return await incStockLikes(db, stockTicker, ipAddress);
    }
    return await getStockLikes(db, stockTicker);
}

module.exports = {
    normalizeStockTicker,
    getSingleStockResponse,
    getMultipleStockResponse,
    getStockLikes,
    updateStockLikes,
    STOCKS_COLLECTION,
}
