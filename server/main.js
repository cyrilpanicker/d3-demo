var express = require('express');
var yahooService_1 = require('./services/yahooService');

var PORT = 8000;
var app = express();

app.use(express.static('./client'));

app.get('/stockdata/:stock', function (request, response) {
    yahooService_1.getCandleData({
        stock: request.params.stock,
        endDate: new Date()
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