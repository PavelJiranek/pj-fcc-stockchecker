/*
*
*
*       FILL IN EACH FUNCTIONAL TEST BELOW COMPLETELY
*       -----[Keep the tests in the same order!]-----
*       (if additional are added, keep them at the very end!)
*/

const chaiHttp = require('chai-http');
const chai = require('chai');
const assert = chai.assert;
const server = require('../server');

chai.use(chaiHttp);

suite('Functional Tests', function () {

    suite('GET /api/stock-prices => stockData object', function () {

        test('1 stock', function (done) {
            chai.request(server)
                .get('/api/stock-prices')
                .query({ stock: 'goog' })
                .end(function (err, res) {
                    assert.equal(res.status, 200);
                    assert.equal(res.body.stockData.stock, "GOOG");
                    assert.isNumber(res.body.stockData.likes)
                    assert.isString(res.body.stockData.price)
                    assert.match(res.body.stockData.price, /\d{2}\.\d{2}$/)

                    done();
                });
        });

        test('1 stock with like', function (done) {

        });

        test('1 stock with like again (ensure likes arent double counted)', function (done) {

        });

        test('2 stocks', function (done) {
            chai.request(server)
                .get('/api/stock-prices')
                .query({ stock: ['goog', 'xom'] })
                .end(function (err, res) {
                    const googData = res.body.stockData[0];
                    const xomData = res.body.stockData[1];
                    assert.equal(res.status, 200);
                    assert.isArray(res.body.stockData);
                    assert.equal(googData.stock, "GOOG");
                    assert.equal(xomData.stock, "XOM");
                    assert.isNumber(googData.rel_likes)
                    assert.isNumber(xomData.rel_likes)
                    assert.match(googData.price, /\d{2}\.\d{2}$/)
                    assert.match(xomData.price, /\d{2}\.\d{2}$/)

                    done();
                });
        });

        test('2 stocks with like', function (done) {

        });

    });

});
