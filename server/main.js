var express = require('express');
var quandlService = require('./services/quandlService');

var PORT = 8000;
var app = express();

app.use(express.static('./client'));

app.get('/stockdata/:stock', function (request, response) {
    quandlService.getCandleData({
        stock: request.params.stock,
        endDate: new Date()
    }).then(function (candleData) {
        response.send(candleData.toArray());
    }, function (error) {
        response.status(500).send(error);
    });
});

app.get('/quote/:stock', function (request, response) {
    quandlService.getQuote({
        stock: request.params.stock,
        date: request.query.date
    }).then(function (candleData) {
        response.send(candleData.toArray());
    }, function (error) {
        response.status(500).send(error);
    });
});

exports.start = function () {
    return new Promise(function (resolve, reject) {
        app.listen(PORT, function () {
            resolve(PORT);
        });
    });
};

app.listen(PORT,function(){
    console.log('server listening at ' + PORT + '.');
});