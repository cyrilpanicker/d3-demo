
var CandleList = (function () {
    function CandleList(data) {
        this.data = data;
    }
    CandleList.prototype.toArray = function () {
        return this.data;
    };
    return CandleList;
})();

var Chart = (function () {
    function Chart(_a) {
        var svg = _a.svg, width = _a.width, height = _a.height, padding = _a.padding, minValue = _a.minValue, maxValue = _a.maxValue, dateArray = _a.dateArray;
        this.svg = svg;
        this.width = width;
        this.height = height;
        this.svg.attr('width', width).attr('height', height);
        this.chartWidth = width - padding.left - padding.right;
        this.chartHeight = height - padding.top - padding.bottom;
        this.padding = padding;
        this.valueScale = d3.scale.linear().domain([minValue, maxValue]).range([height - padding.bottom, padding.top]);
        this.dateScale = d3.scale.ordinal().domain(dateArray).rangePoints([Chart.xBuffer + padding.left, width - Chart.xBuffer - padding.right]);
        this.crossHair = svg.append('g');
        this.crossHair.append('line').attr('class', 'cross-hair').attr('id', 'x-cross-hair');
        this.crossHair.append('line').attr('class', 'cross-hair').attr('id', 'y-cross-hair');
        this.trackMouseMovement(svg);
    }
    Chart.prototype.trackMouseMovement = function (svg) {
        var self = this;
        svg.on('mousemove', function () {
            var _a = d3.mouse(this), xFocus = _a[0], yFocus = _a[1];
            var focusedValue = self.valueScale.invert(yFocus);
            var focusedDate = self.dateScale.domain()[d3.bisect(self.dateScale.range(), xFocus)];
            self.crossHair.select('#y-cross-hair')
                .attr('x1', self.dateScale(focusedDate)).attr('x2', self.dateScale(focusedDate))
                .attr('y1', 0).attr('y2', self.height);
            self.crossHair.select('#x-cross-hair')
                .attr('x1', 0).attr('x2', self.width)
                .attr('y1', yFocus).attr('y2', yFocus);
            console.log(focusedDate + ', ' + focusedValue);
        });
    };
    Chart.prototype.plotCandles = function (candles) {
        var _a = this, svg = _a.svg, dateScale = _a.dateScale, valueScale = _a.valueScale, chartWidth = _a.chartWidth;
        var candleWidth = 0.6 * chartWidth / candles.length;
        plotCandles({ svg: svg, candles: candles, dateScale: dateScale, valueScale: valueScale, candleWidth: candleWidth });
    };
    Chart.prototype.plotAxes = function () {
        var _a = this, svg = _a.svg, dateScale = _a.dateScale, valueScale = _a.valueScale;
        var translate = this.padding.left + this.chartWidth;
        plotDateAxis({ svg: svg, dateScale: dateScale });
        plotValueAxis({ svg: svg, valueScale: valueScale, translate: translate });
    };
    Chart.xBuffer = 10;
    return Chart;
})();
