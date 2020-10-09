/*
*
*
*       Complete the API routing below
*
*
*/

'use strict';

const mongodb = require('mongodb');
const mongo = mongodb.MongoClient;
const { isArray } = require("ramda-adjunct")

const {
    normalizeStockTicker,
    getMultipleStockResponse,
    getSingleStockResponse,
    getStockLikes,
    updateStockLikes,
    STOCKS_COLLECTION,
    getIpFromReq
} = require('../controllers/stockHandler');

const CONNECTION_STRING = process.env.MONGO_URI; //MongoClient.connect(CONNECTION_STRING, function(err, db) {});


module.exports = function (app) {
    let db;
    mongo.connect(CONNECTION_STRING, (err, client) => {
            if (err) {
                console.log("Database error: " + err);
            } else {
                console.log("Successful database connection");
                db = client.db(process.env.MONGO_DB);
            }
        },
    );

    app.route('/api/stock-prices')
        .get(async function (req, res) {
            let stockResponse, likes;
            const { stock, like } = req.query;
            const ipAddress = getIpFromReq(req);

            if (!db) {
                res.send("Please wait, connecting to the database...")
                return;
            }

            if (isArray(stock)) {
                const stocks = stock.map(normalizeStockTicker);
                const [stock1, stock2] = stocks;
                likes = []
                if (like) {
                    likes[0] = await updateStockLikes(db, stock1, ipAddress);
                    likes[1] = await updateStockLikes(db, stock2, ipAddress);
                } else {
                    likes[0] = await getStockLikes(db, stock1);
                    likes[1] = await getStockLikes(db, stock2);
                }
                stockResponse = await getMultipleStockResponse(stock, likes);
            } else {
                const stockTicker = normalizeStockTicker(stock);
                if (like) {
                    likes = await updateStockLikes(db, stockTicker, ipAddress);
                } else {
                    likes = await getStockLikes(db, stockTicker);
                }
                stockResponse = await getSingleStockResponse(stock, likes);
            }

            res.send(stockResponse);
        });

    app.route('/api/clear-likes')
        .delete((_, res) => {
            db && db.collection(STOCKS_COLLECTION)
                .deleteMany({}).then(r => {
                        if (r.deletedCount > 0) {
                            res.send('complete delete successful')
                        } else {
                            res.send('no likes deleted')
                        }
                    },
                    () => {
                        res.status(400);
                        res.send('Failed to delete likes')
                    },
                )
        });
};
