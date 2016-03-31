
var plotCandles = function (_a) {
    var svg = _a.svg, candles = _a.candles, valueScale = _a.valueScale, dateScale = _a.dateScale, candleWidth = _a.candleWidth;
    var candleStems = svg.selectAll('line.candle-stem').data(candles);
    candleStems.exit().remove();
    candleStems.enter().append('line').attr('class', 'candle-stem');
    candleStems
        .attr('x1', function (candle) { return dateScale(candle.date); })
        .attr('y1', function (candle) { return valueScale(candle.high); })
        .attr('x2', function (candle) { return dateScale(candle.date); })
        .attr('y2', function (candle) { return valueScale(candle.low); })
        .attr('stroke', 'black');
    var candleBodies = svg.selectAll('rect.candle-body').data(candles);
    candleBodies.exit().remove();
    candleBodies.enter().append('rect').attr('class', 'candle-body');
    candleBodies
        .attr('x', function (candle) { return dateScale(candle.date) - 0.5 * candleWidth; })
        .attr('y', function (candle) { return valueScale(d3.max([candle.open, candle.close])); })
        .attr('width', function (_) { return candleWidth; })
        .attr('height', function (candle) { return ((valueScale(d3.min([candle.open, candle.close])) - valueScale(d3.max([candle.open, candle.close]))) || 0.01); })
        .attr('stroke', 'black')
        .attr('fill', function (candle) { return candle.open > candle.close ? 'blue' : 'white'; });
};

var plotDateAxis = function (_a) {
    var svg = _a.svg, dateScale = _a.dateScale, translate = _a.translate;
    var dateAxis = d3.svg.axis()
        .scale(dateScale)
        .tickValues(dateScale.domain().filter(function (_, index, array) { return !(index % 5) || index == array.length - 1; }))
        .tickFormat(function (dateString) { return moment(dateString).format('M/D'); });
    svg.append('g')
        .attr('class', 'date-axis')
        .attr('transform', 'translate(0,'+translate+')')
        .call(dateAxis);
};

var plotValueAxis = function (_a) {
    var svg = _a.svg, valueScale = _a.valueScale, translate = _a.translate, ticks = _a.ticks;
    var valueAxis = d3.svg.axis()
        .scale(valueScale)
        .orient('right')
        .ticks(ticks);
    svg.append('g')
        .attr('class', 'price-axis')
        .attr('transform', 'translate(' + translate + ',0)')
        .call(valueAxis);
};
