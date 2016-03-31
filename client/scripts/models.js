
var CandleList = (function () {
    function CandleList(data) {
        this.data = data;
    }
    CandleList.prototype.toArray = function () {
        return this.data;
    };
    return CandleList;
})();

var CandleChart = (function () {
    function CandleChart(_a) {
        var svg = _a.svg, width = _a.width, height = _a.height, padding = _a.padding, minValue = _a.minValue, maxValue = _a.maxValue, dateArray = _a.dateArray;
        this.svg = svg;
        this.width = width;
        this.height = height;
        this.svg.attr('width', width).attr('height', height);
        this.chartWidth = width - padding.left - padding.right;
        this.chartHeight = height - padding.top - padding.bottom;
        this.padding = padding;
        this.valueScale = d3.scale.linear().domain([minValue, maxValue]).range([height - padding.bottom, padding.top]);
        this.dateScale = d3.scale.ordinal().domain(dateArray).rangePoints([CandleChart.xBuffer + padding.left, width - CandleChart.xBuffer - padding.right]);
        this.crossHair = svg.append('g');
        this.crossHair.append('line').attr('class', 'cross-hair').attr('id', 'x-cross-hair');
        this.crossHair.append('line').attr('class', 'cross-hair').attr('id', 'y-cross-hair');
        this.trackMouseMovement(svg);
    }
    CandleChart.prototype.onCandleClick = function (handler) {
        var self = this;
        this.svg.on('click',function(){
            var clickedLocation = d3.mouse(this);
            var clickedDate = self.dateScale.domain()[d3.bisect(self.dateScale.range(),clickedLocation[0])]; 
            handler(clickedDate);
            d3.event.stopPropagation();
        });
    }
    CandleChart.prototype.trackMouseMovement = function (svg) {
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
        });
    };
    CandleChart.prototype.plotCandles = function (candles) {
        var _a = this, svg = _a.svg, dateScale = _a.dateScale, valueScale = _a.valueScale, chartWidth = _a.chartWidth;
        var candleWidth = 0.6 * chartWidth / candles.length;
        plotCandles({ svg: svg, candles: candles, dateScale: dateScale, valueScale: valueScale, candleWidth: candleWidth });
    };
    CandleChart.prototype.plotAxes = function () {
        var _a = this, svg = _a.svg, dateScale = _a.dateScale, valueScale = _a.valueScale;
        var translate = this.padding.left + this.chartWidth;
        plotDateAxis({ svg: svg, dateScale: dateScale });
        plotValueAxis({ svg: svg, valueScale: valueScale, translate: translate });
    };
    CandleChart.prototype.destroy = function(){
        this.svg.selectAll('*').remove();
        this.svg.on('click',null);
        this.svg.on('mousemove',null);
    };
    CandleChart.xBuffer = 10;
    return CandleChart;
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
            
        this.button = svg.append('rect')
            .attr('class','button')
            .attr('x',0)
            .attr('y',20)
            .attr('width',60)
            .attr('height',30)
            .attr('stroke','black')
            .attr('fill','white')

        this.buttonText = svg.append('text')
                .attr('x',10)
                .attr('y',40)
                .text('Back');
                
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
    BarChart.prototype.onBackClick = function(handler){
        this.button.on('click',function(){
            handler();
            d3.event.stopPropagation();
        });
        this.buttonText.on('click',function(){
            handler();
            d3.event.stopPropagation();
        });
    };
    BarChart.prototype.destroy = function(){
        this.svg.selectAll('*').remove();
        this.button.on('click',null);
        this.buttonText.on('click',null);
    };
    return BarChart;
})();