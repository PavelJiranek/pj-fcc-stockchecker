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
} = require('./stockHandler');

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
            const ipAddress = req.headers['x-forwarded-for'] || req.connection.remoteAddress;

            if (!db) {
                res.send("Please wait, connecting to the database...")
                return;
            }

            if (isArray(stock)) {
                stockResponse = await getMultipleStockResponse(stock);
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

};
