
$(function () {
    $.ajax({
        url: '/stockdata/RELIANCE',
        success: function (candles) {
            var candleList = new CandleList(candles);
            candles = candles.slice(-180);
            console.log(candles);
            $('body').append('<div id="chart"></div>');
            var chart = new Chart({
                svg: d3.select('#chart').append('svg'),
                width: 1350,
                height: 300,
                padding: { top: 0, right: 70, bottom: 0, left: 0 },
                dateArray: candles.map(function (candle) { return candle.date; }),
                minValue: d3.min(candles.map(function (candle) { return candle.low; })),
                maxValue: d3.max(candles.map(function (candle) { return candle.high; }))
            });
            chart.plotAxes();
            chart.plotCandles(candles);
        },
        error: function (error) {
            console.log(error);
        }
    });
});
