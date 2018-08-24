define( [], 
function() {
    var ArrayFunctionsPolyfill = function (){
    };

    ArrayFunctionsPolyfill.prototype.addFindIndex = function() {

        if (!Array.prototype.findIndex) {
            Object.defineProperty(Array.prototype, "findIndex",{
                value : function(predicate) {
                    if (this === null) {
                      throw new TypeError('Array.prototype.findIndex called on null or undefined');
                    }
                    if (typeof predicate !== 'function') {
                      throw new TypeError('predicate must be a function');
                    }
                    var list = Object(this);
                    var length = list.length >>> 0;
                    var thisArg = arguments[1];
                    var value;

                    for (var i = 0; i < length; i++) {
                      value = list[i];
                      if (predicate.call(thisArg, value, i, list)) {
                        return i;
                      }
                    }
                    return -1;
              },
              enumerable: false
            });
        }
    };

    ArrayFunctionsPolyfill.prototype.addFind = function() {
        if (!Array.prototype.find) {
          Object.defineProperty(Array.prototype, "find",{
                value :  function(predicate) {
                    if (this === null) {
                      throw new TypeError('Array.prototype.find called on null or undefined');
                    }
                    if (typeof predicate !== 'function') {
                      throw new TypeError('predicate must be a function');
                    }
                    var list = Object(this);
                    var length = list.length >>> 0;
                    var thisArg = arguments[1];
                    var value;

                    for (var i = 0; i < length; i++) {
                      value = list[i];
                      if (predicate.call(thisArg, value, i, list)) {
                        return value;
                      }
                    }
                    return undefined;
                },
                enumerable: false
            });
        }
    };

    ArrayFunctionsPolyfill.prototype.addAll = function() {
        this.addFindIndex();
        this.addFind();
    };

    return ArrayFunctionsPolyfill;
});