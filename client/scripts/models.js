var getAverage = function (data) {
    return data.reduce(function (last, current) { return last + current; }) / data.length;
};

var getSMA = function (data, valueProperty, period) {
    var SMA = [];
    data.forEach(function (datum, index) {
        if (index >= period - 1) {
            var SMANode = {};
            SMANode.date = datum.date;
            SMANode.value = getAverage(data.slice(index + 1 - period, index + 1).map(function (datum) { return datum[valueProperty]; }));
            SMA.push(SMANode);
        }
    });
    return SMA;
};

var CandleList = (function () {
    function CandleList(data) {
        this.data = data;
    }
    CandleList.prototype.toArray = function () {
        return this.data;
    };
    CandleList.prototype.getSMA = function (period, valueProperty) {
        return getSMA(this.data, valueProperty, period);
    };
    return CandleList;
})();

var DateChart = (function () {
    function DateChart(_a) {
        var svg = _a.svg, width = _a.width, height = _a.height, padding = _a.padding, slabs = _a.slabs, dateArray = _a.dateArray;
        var slabBase = 0;
        this.svg = svg;
        this.width = width;
        this.height = height;
        this.svg.attr('width', width).attr('height', height);
        this.chartWidth = width - padding.left - padding.right;
        this.chartHeight = height - padding.top - padding.bottom;
        this.padding = padding;
        this.valueScales = [];
        this.slabs = slabs;
        for(var i=0;i<slabs.length;i++){
            slabBase += slabs[i].height;
            this.valueScales[i] = d3.scale.linear()
                .domain([slabs[i].minValue, slabs[i].maxValue])
                .range([slabBase - padding.bottom, slabBase - slabs[i].height + padding.top]);
        }
        this.dateScale = d3.scale.ordinal().domain(dateArray).rangePoints([DateChart.xBuffer + padding.left, width - DateChart.xBuffer - padding.right]);
        this.crossHairPlotted = false;
    }
    DateChart.prototype.onClick = function (handler) {
        var self = this;
        this.svg.on('click',function(){
            var clickedLocation = d3.mouse(this)[0];
            var clickedDate1 = self.dateScale.domain()[d3.bisect(self.dateScale.range(),clickedLocation)];
            var clickedDate2 = self.dateScale.domain()[d3.bisect(self.dateScale.range(),clickedLocation) - 1];
            var clickedDate = (self.dateScale(clickedDate1) - clickedLocation) < (clickedLocation - self.dateScale(clickedDate2)) ? clickedDate1 : clickedDate2;
            handler(clickedDate);
            d3.event.stopPropagation();
        });
    };
    
    DateChart.prototype.plotCrossHair = function(){
        this.crossHair = this.svg.append('g');
        this.crossHair.append('line').attr('class', 'cross-hair').attr('id', 'x-cross-hair');
        this.crossHair.append('line').attr('class', 'cross-hair').attr('id', 'y-cross-hair');
        this.onMouseMove();
        this.crossHairPlotted = true;
    };

    DateChart.prototype.onMouseMove = function(handler){
        var self = this;
        this.svg.on('mousemove', function () {
            var _a = d3.mouse(this), xFocus = _a[0], yFocus = _a[1];
            var focusedDate1 = self.dateScale.domain()[d3.bisect(self.dateScale.range(), xFocus)];
            var focusedDate2 = self.dateScale.domain()[d3.bisect(self.dateScale.range(), xFocus) - 1];
            var focusedDate = (self.dateScale(focusedDate1) - xFocus) < (xFocus - self.dateScale(focusedDate2)) ? focusedDate1 : focusedDate2;
            if(handler){
                handler(focusedDate);
            }
            if(self.crossHairPlotted){
                var focusedValue = self.valueScales[0].invert(yFocus);
                self.crossHair.select('#y-cross-hair')
                    .attr('x1', self.dateScale(focusedDate)).attr('x2', self.dateScale(focusedDate))
                    .attr('y1', 0).attr('y2', self.height);
                self.crossHair.select('#x-cross-hair')
                    .attr('x1', 0).attr('x2', self.width)
                    .attr('y1', yFocus).attr('y2', yFocus);
            }
        });
    };
    DateChart.prototype.plotLine = function (data, color, slab) {
        var _a = this, svg = _a.svg, dateScale = _a.dateScale, valueScale = _a.valueScales[slab];
        plotLine({ color: color, data: data, dateScale: dateScale, valueScale: valueScale, svg: svg });
    };
    DateChart.prototype.plotCandles = function (candles,slab) {
        var _a = this, svg = _a.svg, dateScale = _a.dateScale, valueScale = _a.valueScales[slab], chartWidth = _a.chartWidth;
        var candleWidth = 0.6 * chartWidth / candles.length;
        plotCandles({ svg: svg, candles: candles, dateScale: dateScale, valueScale: valueScale, candleWidth: candleWidth });
    };
    DateChart.prototype.plotBars = function(bars,slab){
        var slabBase = 0;
        for(var i=0;i<=slab;i++){
            slabBase += this.slabs[i].height;
        }
        var barWidth = 0.6 * this.chartWidth / bars.length;
        var barSet = this.svg.selectAll('.bar').data(bars);
        var dateScale = this.dateScale;
        var valueScale = this.valueScales[slab];
        var padding = this.padding;
        barSet.exit().remove();
        barSet.enter().append('rect').attr('class','bar')
        barSet
            .attr('x',function(datum){return dateScale(datum.date) - 0.5 * barWidth; })
            .attr('width',barWidth)
            .attr('y',function(datum){return valueScale(datum.value)})
            .attr('height',function(datum){return slabBase - padding.bottom - valueScale(datum.value)})
            .attr('stroke','black')
            .attr('fill','blue');
    };
    DateChart.prototype.plotDateAxis = function () {
        var _a = this, svg = _a.svg, dateScale = _a.dateScale;
        var translate = this.padding.top + this.chartHeight;
        plotDateAxis({ svg: svg, dateScale: dateScale, translate: translate });
    };
    DateChart.prototype.plotValueAxis = function (slab,ticks) {
        var _a = this, svg = _a.svg, valueScale = _a.valueScales[slab];
        var translate = this.padding.left + this.chartWidth;
        plotValueAxis({ svg: svg, valueScale: valueScale, translate: translate, ticks:ticks });
    };
    DateChart.prototype.destroy = function(){
        this.svg.selectAll('*').remove();
        this.svg.on('click',null);
        this.svg.on('mousemove',null);
    };
    DateChart.prototype.text = function(text){
        this.svg.selectAll('text.header').remove();
        this.svg.append('text')
            .attr('class','header')
            .attr('x',0)
            .attr('y',20)
            .text(text);
    };
    DateChart.xBuffer = 10;
    return DateChart;
})();



var BarChart = (function () {
    function BarChart(_a) {

        var svg = _a.svg, width = _a.width, height = _a.height, padding = _a.padding, data = _a.data, text = _a.text;
        this.svg = svg;
        this.width = width;
        this.height = height;
        this.svg.attr('width', width).attr('height', height);
        this.chartWidth = width - padding.left - padding.right;
        this.chartHeight = height - padding.top - padding.bottom;
        this.padding = padding;
        
        var maxValue = d3.max(data.map(function(datum){return datum.value}));
        
        var valueScale = d3.scale.linear()
            .domain([0,maxValue])
            .range([height-padding.bottom,padding.top]);

        var ordinalScale = d3.scale.ordinal()
            .domain(data.map(function(datum){return datum.name}))
            .rangeBands([padding.left,width-padding.right],0.5);    
            
        var ordinalAxis = d3.svg.axis().scale(ordinalScale)
        
        svg.append('g')
            .attr('class', 'ordinal-axis')
            .attr('transform', 'translate(0,'+(height-20)+')')
            .call(ordinalAxis);

        var valueAxis = d3.svg.axis()
            .scale(valueScale)
            .orient('right')
            .ticks(10);
        svg.append('g')
            .attr('class', 'price-axis')
            .attr('transform', 'translate(' + (width-50) + ',0)')
            .call(valueAxis);
                
        svg.append('text')
            .attr('x',10)
            .attr('y',80)
            .text(text);
            
        var barSet = svg.selectAll('.bar').data(data);
        barSet.exit().remove();
        barSet.enter().append('rect').attr('class','bar')
        barSet
            .attr('x',function(datum){return ordinalScale(datum.name)})
            .attr('width',ordinalScale.rangeBand())
            .attr('y',function(datum){return valueScale(datum.value)})
            .attr('height',function(datum){return height - padding.bottom - valueScale(datum.value)})
            .attr('fill','blue');

    }
    return BarChart;
})();