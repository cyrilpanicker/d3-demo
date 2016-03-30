var request = require('request');
var moment = require('moment');

var CandleList_1 = require('../models/CandleList');
var uri = 'https://query.yahooapis.com/v1/public/yql';
var env = 'store://datatables.org/alltableswithkeys';
var format = 'json';
var query = 'select * from yahoo.finance.historicaldata' +
    ' where symbol = "<STOCK>.NS"' +
    ' and startDate = "<START-DATE>"' +
    ' and endDate = "<END-DATE>"';
var CANDLES_TO_DISPLAY = 180;
var MA1 = 8;
var MA2 = 21;
var MA3 = 55;
var CANDLES_TO_FETCH = CANDLES_TO_DISPLAY + MA3 - 1;
var START_DATE_OFFSET = CANDLES_TO_FETCH * 1.7;

var transformCandleData = function (_a) {
    var Symbol = _a.Symbol, Date = _a.Date, Open = _a.Open, High = _a.High, Low = _a.Low, Close = _a.Close, Volume = _a.Volume;
    return {
        symbol: Symbol.substring(0, Symbol.indexOf('.NS')),
        date: Date,
        open: parseFloat(Open),
        high: parseFloat(High),
        low: parseFloat(Low),
        close: parseFloat(Close),
        volume: parseFloat(Volume)
    };
};

exports.getCandleData = function (_a) {
    var stock = _a.stock, endDate = _a.endDate;
    var q = query
        .replace('<STOCK>', stock)
        .replace('<END-DATE>', moment(endDate).format('YYYY-MM-DD'))
        .replace('<START-DATE>', moment(endDate).subtract(START_DATE_OFFSET, 'days').format('YYYY-MM-DD'));
    return new Promise(function (resolve, reject) {
        request({ uri: uri, qs: { env: env, format: format, q: q }, json: true }, function (error, response, body) {
            if (error) {
                reject(error);
            }
            else if (!body.query || typeof body.query.count === 'undefined' || body.query.count === null) {
                reject('unexpected-error');
            }
            else if (body.query.count === 0) {
                resolve(new CandleList_1.CandleList([]));
            }
            else {
                var data = body.query.results.quote.filter(function (datum) { return !!parseFloat(datum.Volume); });
                if (data.length < CANDLES_TO_FETCH) {
                    reject('insufficient-data');
                }
                else {
                    resolve(new CandleList_1.CandleList(data.map(function (datum) { return transformCandleData(datum); }).reverse()));
                }
            }
        });
    });
};
