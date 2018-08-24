/*global $*/
/*jshint devel:true */

define(['jquery'], function ($) {
(function ($) {

    var _defaultOptions = {};

    var _methods = {
            init : function(options) {
                var plugin = this;
                plugin.options = $.extend({}, _defaultOptions, options);
            },
            add : function(args) {
                }
        };

    $.fn.preferences = function(methodOrOptions) {
        if (_methods[methodOrOptions]) {
            return _methods[methodOrOptions].apply(this, Array.prototype.slice.call(arguments, 1));
        } else if (typeof methodOrOptions === 'object' || !methodOrOptions) {
            return _methods.init.apply(this, arguments);
        } else {
            $.error('Method ' +  methodOrOptions + ' does not exist on jQuery.preferences' );
        }
    };

})(jQuery);

});
