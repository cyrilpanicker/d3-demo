var request = require('request');
var moment = require('moment');
var CandleList_1 = require('../models/CandleList');
var URI = 'https://www.quandl.com/api/v3/datasets/NSE/<STOCK>.json';
var API_KEY = 'kxeEoL4RejR54Ae4VPPg';
var CANDLES_TO_DISPLAY = 180;
var MA1 = 8;
var MA2 = 21;
var MA3 = 55;
var CANDLES_TO_FETCH = CANDLES_TO_DISPLAY + MA3 - 1;
var transformCandleData = function (symbol) {
    return function (datum) {
        return {
            symbol: symbol,
            date: datum[0],
            open: datum[1],
            high: datum[2],
            low: datum[3],
            close: datum[4],
            volume: datum[6],
            turnover: datum[7]
        };
    };
};
exports.getCandleData = function (_a) {
    var stock = _a.stock, endDate = _a.endDate;
    return new Promise(function (resolve, reject) {
        request({
            uri: URI.replace('<STOCK>', stock),
            qs: {
                'limit': CANDLES_TO_FETCH,
                'api_key': API_KEY,
                'end_date': moment(endDate).format('YYYY-MM-DD')
            },
            json: true
        }, function (error, response, body) {
            if (error) {
                reject(error);
            }
            else if (body.quandl_error) {
                reject('stock-invalid');
            }
            else if (!body.dataset || !body.dataset.data) {
                reject('unexpcted-error');
            }
            else if (body.dataset.data.length < CANDLES_TO_FETCH) {
                reject('insufficient-data');
            }
            else {
                if (body.dataset.data.some(function (datum) { return !datum[6]; })) {
                    reject('zero-volume-candle-found');
                }
                else {
                    resolve(new CandleList_1.CandleList(body.dataset.data
                        .map(transformCandleData(body.dataset.dataset_code))
                        .reverse()));
                }
            }
        });
    });
};
exports.getQuote = function(_a){
    var stock = _a.stock, date = _a.date;
    return new Promise(function (resolve, reject) {
        request({
            uri: URI.replace('<STOCK>', stock),
            qs: {
                'limit': 1,
                'api_key': API_KEY,
                'end_date': moment(date).format('YYYY-MM-DD')
            },
            json: true
        }, function (error, response, body) {
            if (error) {
                reject(error);
            }
            else if (body.quandl_error) {
                reject('stock-invalid');
            }
            else if (!body.dataset || !body.dataset.data) {
                reject('unexpcted-error');
            }
            else if (!body.dataset.data.length) {
                reject('insufficient-data');
            }
            else {
                if (body.dataset.data.some(function (datum) { return !datum[6]; })) {
                    reject('zero-volume-candle-found');
                }
                else {
                    resolve(new CandleList_1.CandleList(body.dataset.data
                        .map(transformCandleData(body.dataset.dataset_code))
                        .reverse()));
                }
            }
        });
    });
};
