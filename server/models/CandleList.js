var CandleList = (function () {
    function CandleList(data) {
        this.data = data;
    }
    CandleList.prototype.toArray = function () {
        return this.data;
    };
    return CandleList;
})();
exports.CandleList = CandleList;