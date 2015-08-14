/* --------------- FACTORY METHODS --------------- */
var _Factory = (function () {
    var count = 0;
    return {
        newId: function () { return count++; }
    };
}());


exports.factory = _Factory;
