define('ossui/controller/Router',[
                'jquery',
                'underscore',
                'lightsaber',
                'backbone'
                ],
                /*jshint maxcomplexity: 7 */
        function($, _, Lightsaber,Backbone) {
    var Router = Lightsaber.Core.Router.extend({

        registerRoutes : function(routes, options) {
            for (var route in routes) {
                if(route){
                    this._setRouteObject(routes, options, route);
                }
            }
        },

        _setRouteObject : function(routes, options, route){

            /*jshint maxcomplexity: 9 */

            var routeObject = routes[route];
            var pathId = routeObject;
            if(typeof routeObject === 'string') { // Function name or path
                if((options[routeObject] && typeof options[routeObject] === 'function') || this[routeObject]) {
                    routeObject = { handler : options[routeObject] || this[routeObject] };
                }
                else {
                    routeObject = { path : this._routeToRegExp(routeObject) };
                }
            }
            else if(typeof routeObject === 'function') { // Function
                routeObject = { handler : routeObject };
            }
            var handler = (typeof routeObject.handler === 'string') ? (options[routeObject.handler] || this[routeObject.handler]) : routeObject.handler;
           //  the below was default handler in LS router but
             if(!handler){
                handler = function(){};
            }
            routeObject.handler = handler ;
            routeObject.regex = this._routeToRegExp(route);
            routeObject.pathId = pathId;
            this.routes[route] = routeObject;

        },

        /**
         * Overridden to navigate to using the pathId since the path
         * was changed during the registration process to allow regexp
         * @param route: route to be navigated by router
         * @param config : config parameter
         */
        navigate : function(route, config) {

            /*jshint maxcomplexity: 9 */

            config = config || {};

            if($.mobile) {
                config = this._createRouteConfig(config);
            }
            else {
                config = this._createRouteConfig(config, true);
            }

            var routeObject = this._getRouteObject(route);
            var params;
            if(routeObject) {
                var external = config.external || routeObject.external;
                params = this._extractParameters(routeObject.regex, route);
                params.unshift(config);
                params.unshift(routeObject);
                params.unshift(route);
                var abort = routeObject.handler.apply(this, params);

                if(!abort && routeObject.pathId) {
                    if(external) {
                        window.open(routeObject.pathId, '_self');
                    }
                    else {
                        if(Backbone.history.fragment !== route) {
                            Backbone.Router.prototype.navigate(routeObject.path, config);
                        }
//                  else {
//                      Backbone.history.loadUrl(Backbone.history.fragment);
//                  }
                    }
                }
            }
            else {
                Backbone.Router.prototype.navigate(route, config);
            }
            if(config.valueObject) {
                this._setValueObject(config.key, config.valueObject);
            }
            this.trigger('route:' + route, params);
        }

    });
    return Router;
});
