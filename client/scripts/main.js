
$(function () {

    $('body').append('<div id="chart"></div>');
    var chartArea = d3.select('#chart').append('svg');
    
    var _candles;
    var candleChart;
    var barChart;

    $.ajax({
        url: '/stockdata/BAJFINANCE',
        success: function (candles) {
            var candleList = new CandleList(candles);
            _candles = candles.slice(-180);
            drawCandleChart();
        },
        error: function (error) {
            console.log(error);
        }
    });
    
    var drawCandleChart = function(){
        chart = new DateChart({
            svg: chartArea,
            width: 1350,
            height: 430,
            padding: { top: 20, right: 70, bottom: 20, left: 0 },
            dateArray: _candles.map(function (candle) { return candle.date; }),
            slabs:[{
                height: 300,
                minValue: d3.min(_candles.map(function (candle) { return candle.low; })),
                maxValue: d3.max(_candles.map(function (candle) { return candle.high; }))
            },{
                height: 120,
                minValue: d3.min(_candles.map(function (candle) { return candle.volume; })),
                maxValue: d3.max(_candles.map(function (candle) { return candle.volume; }))
            }]
        });
        chart.plotDateAxis();
        chart.plotValueAxis(0,10);
        chart.plotValueAxis(1,5);
        chart.plotCandles(_candles,0);
        chart.plotBars(_candles.map(function(candle){return {date:candle.date,value:candle.volume}}),1);
        chart.plotCrossHair();
        chart.onMouseMove(function(date){
            var candle = _candles.filter(function(candle){return candle.date == date})[0];
            if(candle){
                var text = 'DATE : '+date;
                text += ', OPEN : '+candle.open; 
                text += ', HIGH : '+candle.high;
                text += ', LOW : '+candle.low;
                text += ', CLOSE : '+candle.close;
                text += ', VOLUME : '+candle.volume;
                chart.text(text);
            }
        });
        chart.onCandleClick(function(date){
            getStockQuotes(date).done(function(quotes){
                chart.destroy();
                barChart = new BarChart({
                    svg: chartArea,
                    width: 400,
                    height: 300,
                    padding: { top: 0, right: 20, bottom: 30, left: 0 },
                    data:quotes,
                    text:date
                });
                barChart.onBackClick(function(){
                    barChart.destroy();
                    drawCandleChart();
                });
            });
        });
    };
    
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