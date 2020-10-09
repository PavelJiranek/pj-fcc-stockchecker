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

    suiteSetup(function (done) {
        chai.request(server)
            .delete('/api/clear-likes')
            .end(() => done())
    })

    suite('GET /api/stock-prices => stockData object', function () {

        test('1 stock', function (done) {
            chai.request(server)
                .get('/api/stock-prices')
                .query({ stock: 'goog' })
                .end(function (err, res) {
                    assert.equal(res.status, 200);
                    assert.equal(res.body.stockData.stock, "GOOG");
                    assert.equal(res.body.stockData.likes, 0);
                    assert.isString(res.body.stockData.price)
                    assert.match(res.body.stockData.price, /\d{2}\.\d{2}$/)

                    done();
                });
        });

        test('1 stock with like', function (done) {
            chai.request(server)
                .get('/api/stock-prices')
                .query({ stock: 'goog', like: true })
                .end(function (err, res) {
                    assert.equal(res.status, 200);
                    assert.equal(res.body.stockData.stock, "GOOG");
                    assert.equal(res.body.stockData.likes, 1);

                    done();
                });
        });

        test('1 stock with like again (ensure likes arent double counted)', function (done) {
            chai.request(server)
                .get('/api/stock-prices')
                .query({ stock: 'ges', like: true })
                .end(function (err, res) {
                    const currentLikes = res.body.stockData.likes;

                    chai.request(server)
                        .get('/api/stock-prices')
                        .query({ stock: 'ges', like: true })
                        .end(function (err, res) {
                            assert.equal(res.body.stockData.likes, currentLikes);

                            done();
                        });
                });
        });

        test('2 stocks', function (done) {
            chai.request(server)
                .get('/api/stock-prices')
                .query({ stock: 'goog', like: true }) // ensure goog has like
                .end(function () {

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
                            assert.equal(googData.rel_likes, 1) // relative to xom likes
                            assert.equal(xomData.rel_likes, -1) // relative to goog likes
                            assert.match(googData.price, /\d{2}\.\d{2}$/)
                            assert.match(xomData.price, /\d{2}\.\d{2}$/)

                            done();
                        });
                });
        });

        test('2 stocks with like', function (done) {
            chai.request(server)
                .get('/api/stock-prices')
                .query({ stock: ['f', 'bac'], like: true })
                .end(function (err, res) {
                    const fData = res.body.stockData[0];
                    const bacData = res.body.stockData[1];
                    assert.equal(res.status, 200);
                    assert.equal(fData.rel_likes, 0)
                    assert.equal(bacData.rel_likes, 0)

                    chai.request(server)
                        .get('/api/stock-prices')
                        .query({ stock: 'f' })
                        .end(function (err, res) {
                            assert.equal(res.status, 200);
                            assert.equal(res.body.stockData.likes, 1); // ensure like has been added to both'

                            chai.request(server)
                                .get('/api/stock-prices')
                                .query({ stock: 'bac' })
                                .end(function (err, res) {
                                    assert.equal(res.status, 200);
                                    assert.equal(res.body.stockData.likes, 1); // ensure like has been added to both

                                    done();
                                });
                        });
                });
        });
    });

});
