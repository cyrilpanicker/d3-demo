
$(function () {

    $('body').append('<div id="chart"></div>');
    var chartArea = d3.select('#chart').append('svg');

    $.ajax({
        url: '/stockdata/BAJFINANCE',
        success: function (candles) {
            var candleList = new CandleList(candles);
            candles = candles.slice(-180);
            var candleChart = new CandleChart({
                svg: chartArea,
                width: 1350,
                height: 300,
                padding: { top: 0, right: 70, bottom: 0, left: 0 },
                dateArray: candles.map(function (candle) { return candle.date; }),
                minValue: d3.min(candles.map(function (candle) { return candle.low; })),
                maxValue: d3.max(candles.map(function (candle) { return candle.high; }))
            });
            candleChart.plotAxes();
            candleChart.plotCandles(candles);
            candleChart.onCandleClick(function(date){
                getStockQuotes(date).done(function(quotes){
                    new BarChart({
                        svg: chartArea,
                        width: 400,
                        height: 300,
                        padding: { top: 0, right: 20, bottom: 30, left: 0 },
                        data:quotes
                    });
                });
            });
        },
        error: function (error) {
            console.log(error);
        }
    });
    
    var getStockQuotes = function(date){
        var deferred = $.Deferred(); 
        var quotes = [];
        var stockPromise = $.ajax({
            url:'/quote/BAJFINANCE',
            data:{
                date:date
            },
            success:function(data){
                quotes[0] = {
                    name:'BAJFINANCE',
                    value:data[0].close
                };
            }
        });
        var sectorIndexPromise = $.ajax({
            url:'/quote/NIFTY_BANK',
            data:{
                date:date
            },
            success:function(data){
                quotes[1] = {
                    name:'BANKNIFTY',
                    value:data[0].close
                };
            }
        });
        var indexPromise = $.ajax({
            url:'/quote/NIFTY_50',
            data:{
                date:date
            },
            success:function(data){
                quotes[2] = {
                    name:'NIFTY50',
                    value:data[0].close
                };
            }
        });
        $.when(stockPromise,indexPromise,sectorIndexPromise).done(function(){
            deferred.resolve(quotes);
        });
        return deferred.promise();
    };

});
