define('ossui/controller/Application',[
                'jquery',
                'underscore',
                'lightsaber'],
        function($, _, Lightsaber) {
    var Application = Lightsaber.Application.extend({
        
        /**
         * overrides the Lightsaber registerModule to set the url as a regular expression
         * Note: the _routeToRegExp is a backbone method here which is used by LS 
         * router also
         */
        registerModule : function(config, parent) {
            this._super(config, parent);
            if(config.url) {
                delete this.urlMap[config.url];
                var urlObject = {};
                urlObject.id = config.id;
                urlObject.pathId = config.url;
                urlObject.path = this.options.router._routeToRegExp(config.url);                
                this.urlMap[config.id] = urlObject;
            }
        },
        
        /**
         * Overriden to pass route to _loadPageModule
         */
        _loadDefaultModule : function() {           
            var route = this._getRouteByURL();
            var moduleConfig = this._getModuleConfig(route);
                this._augmentModuleDefaultTemplate(moduleConfig);
                this._loadPageModule(moduleConfig, this.pathId);
        },
        /**
         * Overriding the LS's private method _getRouteByURL to extend the functionality for 
         * query string params. Private method is overridden since currently LS does not 
         * handle the query string params as Backbone as well as there is no other
         * hook method provided by LS to do the same
         */
        _getRouteByURL : function() {
            this.queryStringParam = null;
            var pathName = window.location.href.replace(window.location.hash, ''); // TODO validate
            if (pathName.substr(-1) === '#') {
                pathName = pathName.substring(0, pathName.length - 1);
            }   
            var index = pathName.lastIndexOf('/') + 1;
            var id = index != pathName.length ? pathName.substring(index) : 'index.html';
            this.path = id;
            
            var result = this._checkRouteInUrlMap(id);            

            if(!result) {
                result = this._checkRoutesInRouter(id);
            }
                        
            return result;
        },
        
        _checkRouteInUrlMap : function(id){
            var result;
            for(var url in this.urlMap) {
                //the path is saved as a RegExp in the Ossui.Router and
                //is tested here with the id if the url match fails first
                try {
                    if(this.urlMap[url].path.test(id)) {
                        this.queryStringParam = this.urlMap[url].path;
                        this.pathId = this.urlMap[url].pathId;
                        result = this.urlMap[url].id;
                        break;
                    }
                } catch(err) {
                       return result;
                }
            }
            return result;
        },
        
        _checkRoutesInRouter : function(id){
            var result;
            for(var route in this.options.router.routes) {
                //the path is saved as a RegExp in the Ossui.Router and
                //is tested here with the id if the url match fails first
                if(this.options.router.routes[route].path.test(id)) {
                    this.queryStringParam = this.options.router.routes[route].path;
                    this.pathId = this.options.router.routes[route].pathId;
                    result = route;
                    break;
                }
            }
            return result;
        },
        
       
        /**
         * Overloaded to construct params from the querystring parameters 
         * and pass to the loading module which is currently a 
         * restriction in lightsaber Application
         */
                
        _loadPageModule : function(moduleConfig,route) {
            var args = this.options.router._extractParameters(this.queryStringParam, this.path);
            moduleConfig.params = this._extractParams(this.pathId, args);
            var loadingView = new Lightsaber.LoadingView({
                viewModel : new Lightsaber.Core.ViewModel({}),
                el : $("body"),
                config : {
                    handleAllAjaxRequests : true
                }
            });
            if(moduleConfig.module) {   
                // Instantiate existing module
                moduleConfig.hash = this._getHash();
                var config = new moduleConfig.module(moduleConfig); 
                
            }
            else if(moduleConfig.path) {
                // Load the module by its path using RequireJS
                /*global requirejs:false */
                requirejs([moduleConfig.path], _.bind(function(Module) { 
                    moduleConfig.hash = this._getHash();
                    var module = new Module(moduleConfig);
                }, this));
            }
            else { 
                // Instantiate default module
                moduleConfig.hash = this._getHash();
                var module = new Lightsaber.Module(moduleConfig); 
            }
        },
        
        _extractParams : function(id,args){
            //function to extract :id and convert into id=val
            var queryString = id.substring(id.indexOf('?') + 1, id.length);
            var params = queryString.split('&');
            var paramsObject = {};
            for(var i = 0, length = params.length; i < length; i++){
                var param = params[i].substring(0,params[i].indexOf('='));
                paramsObject[param] = args[i];
            }
            return paramsObject;         
        }
        
    });
    return Application;
});
