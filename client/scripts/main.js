$(function () {

    $('body').append('<div id="chart"></div>');
    var chartArea = d3.select('#chart').append('svg');
    
    var _candles;
    var smaClose8;
    var smaClose21;
    var smaClose55;
    var smaVolume8;
    var chart;
    var barChart;
    var quoteModal = d3.select('#quote-modal');

    $.ajax({
        url: '/stockdata/BAJFINANCE',
        success: function (candles) {
            var candleList = new CandleList(candles);
            smaClose8 = candleList.getSMA(8,'close');
            smaClose21 = candleList.getSMA(21,'close');
            smaClose55 = candleList.getSMA(55,'close');
            smaVolume8 = candleList.getSMA(8,'volume');
            smaClose8 = smaClose8.slice(-180);
            smaClose21 = smaClose21.slice(-180);
            smaClose55 = smaClose55.slice(-180);
            smaVolume8 = smaVolume8.slice(-180);
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
        chart.plotLine(smaClose8,'red',0);
        chart.plotLine(smaClose21,'blue',0);
        chart.plotLine(smaClose55,'yellow',0);
        chart.plotLine(smaVolume8,'red',1);
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
        chart.onClick(function(date){
            quoteModal.select('*').remove();
            quoteModal.append('img').attr('src','images/spinner.gif');
            $('#quote-modal').modal();
            getStockQuotes(date).done(function(quotes){
                quoteModal.select('*').remove();
                var chartArea = quoteModal.append('svg');
                barChart = new BarChart({
                    svg: chartArea,
                    width: 400,
                    height: 300,
                    padding: { top: 0, right: 20, bottom: 30, left: 0 },
                    data:quotes,
                    text:date
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