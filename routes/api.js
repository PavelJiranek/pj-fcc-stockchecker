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
const fetch = require("node-fetch");
const { isArray } = require("ramda-adjunct")

const utils = require('./utils');
const { normalizeStockTicker, getMultipleStockResponse, getSingleStockResponse } = utils;

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
            let stockResponse;
            const { stock, like } = req.query;
            if (isArray(stock)) {
                stockResponse = await getMultipleStockResponse(stock);
            } else {
                stockResponse = await getSingleStockResponse(stock);
            }

            res.send(stockResponse);
        });

};
