
/*Dummy - for require.js optimizer*/ ;
define("lib/amdocs/ossui/ossui", function(){});

/**
* $Id: //depot/Applications/OSSUI/v10.1.0.0/components/ossui-client-zip/src/main/webapp/lib/amdocs/ossui/components/application/view/Module.js#1 $
* $DateTime: 2017/06/08 19:26:36 $
* $Revision: #1 $
* $Change: 1837971 $
*
* COPYRIGHT NOTICE:
* Copyright (c) 2013 Amdocs.
* The contents and intellectual property contained herein,
* remain the property of Amdocs.
* 
* */ 

define('ossui/application/view/Module',[
    'jquery',
    'underscore',
    'lightsaber' ],
    function($, _, Lightsaber) {

    var module = Lightsaber.Module.extend({
        
        /**
         * Overridden the empty 'preInit' in {@link Ligthsaber.Module}
         * 
         */
        preInit : function(options) {
            this.moduleInstances = {};
            this.registeredViews = {};
        },
        
        /**
         * Overridden the 'load()' implemented in {@link Ligthsaber.Module}
         * 
         * Registers an event listener method to listen 'module loaded' event
         * to keep track of the modules loaded by this module. 
         * 
         *  Note: This just uses the moduleConfig that's already been registered
         *        to load the module via {@link Ligthsaber.Module}'s load() method.
         */
        load : function(route, options) {
            // the route identifies the loaded child module for the handler.
            this.ossuiRoute = route;

            this.on('load:' + route, this.handleModuleLoadedEvent);
            this._super(route, options);
        },
        
        /**
         * Instantiates the module using the given module configuration.
         * 
         * For example, in some situation we dont want to use the moduleConfig that's
         * registered. Instead we take that registered moduleConfig and update it with
         * latest values (ex.: Dynamic DIV id for 'el') and use this updated moduleConfig
         * to load/instantiate the module.
         */
        instantiateModule : function(moduleConfig) {
            
            if (moduleConfig) {
                /*global requirejs:false */
                requirejs([moduleConfig.module], _.bind(function(Module) {
                    //Instantiate the module
                    moduleConfig.instance  = new Module(moduleConfig);
                    this.updateModuleInstancesList(moduleConfig);
                }, this));
                /*global requirejs:true */
            }
        },      
        
        /**
         * Loads a view using the provided viewConfig. 
         * To load a view use:
         * this.loadView({id: viewId, viewType: ViewType, 
         *       viewOptions: {el: $el, viewModel: VM, ....}
         * });
         * @Return: the loaded View instance.   
         */
        loadView: function(viewConfig) {
            viewConfig.instance = new viewConfig.viewType(viewConfig.viewOptions);             
            this.registeredViews[viewConfig.id] = viewConfig;
            return viewConfig.instance;
        },
        
        _clearViews: function(viewId, eventToTrigger) {
            var destroyEvent = eventToTrigger ? eventToTrigger : 'OSSUI:moduleDestroyed';
            var viewConfig = this.registeredViews[viewId];
            if (viewConfig.instance) {
                viewConfig.instance.trigger(destroyEvent);
                viewConfig.instance.destroy();
            }    
            delete this.registeredViews[viewId];
        },
        
        /**
         * Destroys this module - in-turn, removes/released all the resources
         * it used so far. 
         *
         * Also destroys all registered/loaded Modules and triggers OSSUI:moduleDestroyed event 
         * on the registered views
         */
        destroy : function(moduleConfig) {
            //Destroy all/any sub modules that this module has loaded
            this.removeChildren(this.options);
            this._unregisterChildren(this.options);

            for (var viewId in this.registeredViews) {
                this._clearViews(viewId);
            }    
           
            // This module instance is no longer needed. Hence removing the DOM it holds.
            this.remove();

            //Unbind any events that this module triggers directly using this.trigger(...).
            this.unbind();
        },               
        
        /**
         * Event handler method - handles 'module loaded' event.
         */
        handleModuleLoadedEvent : function (eventData) {
            // the eventData argument is the same as this, that is it's the parent module
            // of the module that has just been loaded. In earlier versions of lightsaber
            // the 'route' value indicated the loaded child module.
            var route = eventData.route;
            if (!_.isString(route) || route.length === 0) {
                route = eventData.ossuiRoute;
            }

            // the config for the loaded child module.
            var loadedModuleConfig = this.getModuleConfig(route);

            this.updateModuleInstancesList(loadedModuleConfig);
        },
        
        /**
         * Store the instance of the module just loaded/instantiated into the 
         * parameter.
         * 
         * This module instances will later be used during cleanup process and other
         * audit trail operations if required. 
         */
        updateModuleInstancesList : function (moduleConfig){
            
            if (this.moduleInstances && moduleConfig){
                this.moduleInstances[moduleConfig.el] = moduleConfig.instance;
            }
        },
        
        
        //LS overrides for backward compatibility
        
        /**
         * Override Lightsaber's Module.registerModules for backwards compatibility.
         * Register such modules as a local module and not in the application registry.
         */
        registerModulesWithHistoryFalse : function(moduleConfigs) {
            var moduleConfig;
            if(moduleConfigs) {
                for(var i = moduleConfigs.length - 1 ; i >= 0; i--) {
                    moduleConfig = moduleConfigs[i];
                    if(moduleConfig.browserHistory === false)
                    {
                        this.registerLocalModule(moduleConfig, this);
                    }
                }
            }
        },
        
        // Only return references of this modules direct children
        getAllChildrens : function() {
            return this.children;
        }        
    });

    return module;
 });

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

define('text!lib/amdocs/ossui/components/borderlayout/view/template/BLContainerTemplate.html',[],function () { return '<div id="container" style="height:100%;"></div>\n';});

define('text!lib/amdocs/ossui/components/borderlayout/view/template/BLPaneTemplate.html',[],function () { return '<div id="<%= id %>" class="<%= cssClass ? cssClass : \'\' %>"></div>\n';});

define('text!lib/amdocs/ossui/components/borderlayout/view/template/BLHeaderTemplate.html',[],function () { return '<div id="<%= id %>-header" ></div>\n';});

/**
* $Id: //depot/Applications/OSSUI/v10.1.0.0/components/ossui-client-zip/src/main/webapp/lib/amdocs/ossui/components/borderlayout/view/BorderLayoutView.js#1 $
* $DateTime: 2017/06/08 19:26:36 $
* $Revision: #1 $
* $Change: 1837971 $
*
* COPYRIGHT NOTICE:
* Copyright (c) 2013 Amdocs.
* The contents and intellectual property contained herein,
* remain the property of Amdocs.
* 
* */ 

/**
 * @class BorderLayoutView
 * @augments TBD
 * @custLevel OSSUI
 * @type Lightsaber.Core.View
 * @memberOf Ossui
 * @name BorderLayoutView
 * @property TBD
 * @version TBD
 *
 * @description
 *
 * This class provides visual representation of Border Layout using jQuery Layout API.
 * It creates 5 panes - called Center, North, South, East and West panes. Center pane is mandatory.
 * All other panes are options. Nested panes can also be created upto multiple levels of nesting.
 * This gives the freedom of splitting the whole display area into various desirable sections.
 *
 * Settings for various panes can be provided via Model (from backend service) (or) provided during
 * instantiation of layout view. Precedence is given to the settings available in the model. If nothing
 * is present in Model (ViewModel), then the settings provided during the instantiation of this view.
 * If both are not present then the default config settings comes part of this class definition will be
 * used to construct the panes.
 *
 * Details about the required panes are provided via 'layoutSettings' and it will be in the form shown below,
 *
 *      { 'id' : 'ossui-outer-center', 'position' : 'center', 'cssClass':'my2ndCSS',
 *         'childLayout': [
 *               { 'id' : 'ossui-middle-center', 'position' : 'center','header' : true,},
 *               { 'id' : 'ossui-middle-north', 'position' : 'north', 'header' : true, 'cssClass':'myOwn','center__minWidth' : 300,
 *                      'center__maxWidth' : 300, 'east__size' : 800, 'north__size' : 100,'south__size' : 100, 'spacing_open' : 8, 'spacing_closed' : 12,},
 *               { 'id' : 'ossui-middle-east', 'position' : 'east',
 *                   'childLayout': [
 *                       { 'id' : 'ossui-inner-center', 'position' : 'center',},
 *                       { 'id' : 'ossui-inner-west', 'position' : 'west', 'header' : true,},
 *                       { 'id' : 'ossui-inner-north', 'position' : 'north', 'header' : true,},
 *                        ]},
 *               { 'id' : 'ossui-middle-south', 'position' : 'south',},
 *         ]},
 *     { 'id' : 'ossui-outer-west', 'position' : 'west', 'cssClass':'my2ndCSS', 'west__size' : 125,},
 *
 * with the above settings, whole displayable area is divided into two outer panes - center and west.
 * The center pane is further divided into 4 child panes - center, north, south and east. And this east
 * (middle layer) pane is further divided into 3 inner panes - center, west and north.
 *
 * <strong>Important points to be noted:</strong>
 *
 *  - Center pane is mandatory in all layers - outer and nested layers.
 *  - Parameters - <strong>'id', 'position', 'header', 'cssClass' & 'childLayout'</strong> are 'OSSUI' framework defined.
 *  - Remaining parameters (except the above mentioned) are all <strong>jQuery Layout API</strong> defined.
 *
 * The above settings will generate a HTML template/skeleton as shown below, (please note how the id, cssClass and header
 * parameters are being used in creating the HTML structure.)
 *
 *      <div id="container">
 *           <div id="ossui-outer-center" class="my2ndCSS">
 *               <div id="ossui-middle-center"> <div id="ossui-middle-center-header" ></div> </div>
 *               <div id="ossui-middle-north"> <div id="ossui-middle-north-header" ></div> </div>
 *               <div id="ossui-middle-east">
 *                   <div id="ossui-inner-center"></div>
 *                   <div id="ossui-inner-west"> <div id="ossui-inner-west-header" ></div> </div>
 *                   <div id="ossui-inner-north"> <div id="ossui-inner-north-header" ></div> </div>
 *               </div>
 *               <div id="ossui-middle-south"></div>
 *           </div>
 *           <div id="ossui-outer-west" class="my2ndCSS"></div>
 *      </div>
 *
 * The above settings will formulate the object shown below, which will then passed to jQuery layout API.
 *
 * {
 *       center__paneSelector:   "#ossui-outer-center",
 *       west__paneSelector:     "#ossui-outer-west",
 *       west__size :   125,
 *       spacing_open:           8,  // for ALL panes
 *       spacing_closed:         12, // for ALL panes
 *
 *       // MIDDLE-LAYOUT (child of outer center pane)
 *       center__childOptions: {
 *           center__paneSelector:   "#ossui-middle-center",
 *           north__paneSelector:    "#ossui-middle-north",
 *           east__paneSelector:     "#ossui-middle-east",
 *           south__paneSelector:  "#ossui-middle-south",
 *           center__minWidth:  300,
 *           center__maxWidth:  300,
 *           east__size:    800,
 *           north__size:   100,
 *           south__size:  100,
 *           spacing_open:  8,  // for ALL panes
 *           spacing_closed:    12, // for ALL panes
 *
 *           east__childOptions: {
 *               center__paneSelector: "#ossui-inner-center",
 *               west__paneSelector: "#ossui-inner-west",
 *               north__paneSelector: "#ossui-inner-north",
 *           },
 *       }
 *   }
 *
 * @example
 *
 * <code>
 *      var settingsArr = [
 *          { 'id' : 'ossui-outer-center', 'position' : 'center', 'cssClass':'my2ndCSS',
 *               'childLayout': [
 *                    { 'id' : 'ossui-middle-center', 'position' : 'center','header' : true,},
 *                    { 'id' : 'ossui-middle-north', 'position' : 'north', 'header' : true, 'cssClass':'myOwn','center__minWidth' : 300,
 *                            'center__maxWidth' : 300, 'east__size' : 800, 'north__size' : 100,
 *                            'south__size' : 100, 'spacing_open' : 8, 'spacing_closed' : 12,},
 *                    { 'id' : 'ossui-middle-east', 'position' : 'east',
 *                         'childLayout': [
 *                              { 'id' : 'ossui-inner-center', 'position' : 'center',},
 *                              { 'id' : 'ossui-inner-west', 'position' : 'west', 'header' : true,},
 *                              { 'id' : 'ossui-inner-north', 'position' : 'north', 'header' : true,},
 *                          ]},
 *                    { 'id' : 'ossui-middle-south', 'position' : 'south',},
 *                ]},
 *          { 'id' : 'ossui-outer-west', 'position' : 'west', 'cssClass':'my2ndCSS', 'west__size' : 125,},
 *          ]];
 *
 *     var collection = new Lightsaber.Core.Collection(settingsArr);
 *
 *
 *     // Create CollectionViewModel to abstract over the data.
 *     var collectionViewModel = new Lightsaber.CollectionViewModel({
 *          models : { data : collection }
 *     });
 *
 *
 *     var borderLayoutView = new OSSUI.BorderLayoutView({
 *          viewModel: collectionViewModel,
 *          el: "#display-area",
 *
 *          config: {
 *              // Templates can be customized.
 *              template : '<div id="container" style="height:100%; ">\n</div>',
 *
 *              // This settings will be used 'iff' there is nothing fetched from backend.
 *              layoutSettings : [
 *                  { 'id' : 'ossui-outer-center', 'position' : 'center', 'cssClass':'my2ndCSS',
 *                      'childLayout': [
 *                          { 'id' : 'ossui-middle-center', 'position' : 'center','header' : true,},
 *                          { 'id' : 'ossui-middle-north', 'position' : 'north', 'header' : true, 'cssClass':'myOwn','center__minWidth' : 300,
 *                              'center__maxWidth' : 300, 'east__size' : 800, 'north__size' : 100,
 *                              'south__size' : 100, 'spacing_open' : 8, 'spacing_closed' : 12,},
 *                          { 'id' : 'ossui-middle-east', 'position' : 'east',
 *                              'childLayout': [
 *                                  { 'id' : 'ossui-inner-center', 'position' : 'center',},
 *                                  { 'id' : 'ossui-inner-west', 'position' : 'west', 'header' : true,},
 *                                  { 'id' : 'ossui-inner-north', 'position' : 'north', 'header' : true,},
 *                               ]},
 *                          { 'id' : 'ossui-middle-south', 'position' : 'south',},
 *                      ]},
 *                  { 'id' : 'ossui-outer-west', 'position' : 'west', 'cssClass':'my2ndCSS', 'west__size' : 125,},
 *                 ],
 *          },
 *        });
 *
 *       // Now I created the layout view and I can play with it.
 *      borderLayoutView.addToPane('ossui-outer-west', '<span> I can add any HTML content to a pane using pane ID</span>');
 *
 *      borderLayoutView.addToPaneHeader('ossui-outer-west', '<span> I can add any HTML content to a pane's header using pane ID</span>');
 *
 *      // Get any pane as jQuery object and use it during any of your view instantiation. <strong>Note: 'el' parameter</strong>.
 *
 *      var createSearchOIPaneButton = new Lightsaber.ButtonView({
 *                           el : borderLayoutView.getPane('ossui-inner-center'),
 *
 *                           config: { id : 'searchOIPaneButton' },
 *                           attributes: { href: '#', 'data-theme': 'b' },
 *                           viewModel : buttonViewModel
 *                       });
 *
 * </code>
 *
 */
define('ossui/widget/BorderLayoutView',
        [ 'lightsaber',
          'underscore',
          'jquery',
          'jquery.layout',
          'text!lib/amdocs/ossui/components/borderlayout/view/template/BLContainerTemplate.html',
          'text!lib/amdocs/ossui/components/borderlayout/view/template/BLPaneTemplate.html',
          'text!lib/amdocs/ossui/components/borderlayout/view/template/BLHeaderTemplate.html' ],
          function(Lightsaber, _, $, jQueryLayout, defaultContainerTmpl, defaultPaneTmpl, defaultHeaderTmpl) {

    var BorderLayoutView = Lightsaber.Core.View.extend({

        /**
         * Default values.
         */
        config: {
            layoutSettings : [
                              // TODO: What default layout that needs be shipped. To be decided by PDO.
                              ],
            
            /**
             * Flag represents whether to generate the HTML structure for the layout or not using templates.
             * If the HTML structure is pre-exist and want to apply the Border Layout on top of it, then this 
             * flag is set to flase and relevant borderlayout settings (compatible with jquery layout API) should 
             * be passed in 'layoutSettings' parameter. 
             */
            generateHTMLStructure : true
        },

        /**
         * Initialize the vmKeys
         */
        vmKeys: {
            "data.items" : "items"
        },

        idAttribute : 'id',

        // Default templates
        template : defaultContainerTmpl,
        paneTemplate : defaultPaneTmpl,
        headerTemplate : defaultHeaderTmpl,

        /**
         * Constructor callback
         */
        initialize: function(){
            
            this.idAttribute = this.getConfig('idAttribute') || this.idAttribute;

            this.template = this.getConfig('template') || this.template;
            this.paneTemplate = _.template(this.getConfig('paneTemplate')  || this.paneTemplate);
            this.headerTemplate = _.template(this.getConfig('headerTemplate')  || this.headerTemplate);

            // Bind the event listeners
            this.viewModel.on('items:loaded', this._constructLayout, this);
            //this.viewModel.on('items:added', this.addPane, this);
        },

        /**
         * Constructs the whole layout based on the details available in Model (or)
         * details provided when instantiating this layout view (or) some hard coded
         * default settings (not present right now) in this class.
         *
         * This method initiates construction- of various panes in the layout. Once the
         * HTML elements are constructed, it calls jQuery Layout API with the settings
         * fetched to construct the layout.
         *
         * Note:
         *  This will get called when the items are loaded in to the View Model.
         *
         * @name _constructLayout
         * @memberOf OSSUI.BorderLayoutView
         * @param layoutData
         *
         */
        _constructLayout: function(layoutData) {
            var settings = {};

            if (this.getConfig('generateHTMLStructure') === true) {
                var isHtmlBuilt = this._buildHtmlElements(layoutData, settings);
                
                // Check whether the required HTML skeleton has been created before proceeding with layouting...
                if (isHtmlBuilt){
                    //create unique root Id else jquery selection will return the first matching
                    //this needs to be done only if default root template used by border layout
                    //if application provides its own root then maintaining the uniqueness is the onus
                    //of the application 
                    if(this.root.id === 'container'){
                        this.root.id += ('-' + Lightsaber.Core.Utils.guid());
                    }
                    var containerSelector = "#" + this.root.id;
    
                    // create the layout by calling jQuery Layout API.
                    this.layoutObj = $(containerSelector).layout(settings);
                }    
            }else {
                this.layoutObj = this.$el.layout(this.getConfig('layoutSettings'));
            }
            
            this.trigger('layout:created', this);
        },

        /**
         * Constructs the layout based on details available in either
         * ViewModel (or) set when instantiating this class.
         */
        _postRender : function() {
            this._constructLayout();
        },

        /**
         * Build the HTML elements by looping thro' the settings provided.
         * @name _constructLayout
         * @memberOf OSSUI.BorderLayoutView
         * @param layoutData - Layout settings provided via Model (from backend)/when instantiating this view.
         * @param settings - Settings object that needs to be constructed for jQuery layout API
         */
        _buildHtmlElements: function(layoutData, settings) {

            var layoutSettingsArr = [];
            var isSuccessful = true;

            // Now, need to identify where the layout settings are available.
            if (! layoutData){
                var vmData = this.viewModel.getData() || this.viewModel.get();
                layoutSettingsArr = vmData.items;

                if (! layoutSettingsArr || layoutSettingsArr.length === 0) {
                    layoutSettingsArr = this.getConfig('layoutSettings');
                }
            }else if (layoutData.items && layoutData.items.length > 0){
                layoutSettingsArr = layoutData.items;
            }

            // Throw error if there isn't enough details to build the layout?
            if (! layoutSettingsArr || layoutSettingsArr.length === 0){
                // TODO: throw error.
                //console.log("That's bad. There isn't enough details to build the layout.");

                // Set the flag to indicate the error while constructing the layout.
                isSuccessful = false;
            }
            
            var noOfEntries = layoutSettingsArr.length;
            for (var count = 0; count < noOfEntries; count++) {
                var paneStr = $(this._createPaneStr(layoutSettingsArr[count], settings));
                this.$root.append(paneStr);               
            }

            return isSuccessful;
        },

        /**
         * It's a recursive method which creates pane for each section configured in settings
         * (provided via Model / during instantiation of layout view) and also constructs the
         * 'settings' object which will be passed to the jQuery Layout API.
         *
         * @param data - Layout settings provided via Model (from backend)/when instantiating this view.
         * @param settings - Settings object that needs to be constructed for jQuery layout API
         * @returns the constructed pane - HTML section (with sub sections)
         */
        _createPaneStr: function(data, settings) {

            var position = data.position;

            settings[position + '__paneSelector'] = '#' + data.id;
            var tempRoot = $(this.paneTemplate( data ));

            // Is 'header' asked for this pane?
            if (data.header === true) {
                tempRoot.append(this._createHeaderStr(data));
            }

            // Is this pane contains any child?
            if (data.childLayout){
                var childPaneSettings = data.childLayout;
                var childSettings = {};

                var noOfEntries = childPaneSettings.length;
                // Loop thro' all the children configured and construct panes for those.
                for (var count = 0; count < noOfEntries; count++) {
                    var childPaneStr = $(this._createPaneStr(childPaneSettings[count], childSettings));

                    // Append each child pane to its parent.
                    tempRoot.append(childPaneStr);
                }

                settings[position + '__childOptions'] = childSettings;
            }

            // Copy the remaining settings from Model.
            for (var key in data){
                if (key != 'id' && key != 'childLayout'){
                    settings[key] = data[key];
                }
            }

            return tempRoot;
        },
        
        /**
         * Creates the header section using the template and settings provided for a particualr
         * pane.
         *
         * @param data - Layout settings provided via Model (from backend)/when instantiating this view.
         * @returns the constructed header for a particular pane.
         */
        _createHeaderStr: function(data) {
            return  $(this.headerTemplate( data ));
        },

        /**
         * Gets pane (as jquery object) by ID (for population of content, for example)
         * @name getPane
         * @methodOf
         * @param {String} id - id of the pane interested in.
         * @returns the pane (as jquery object)
         */
        getPane : function(id) {
            var paneSelector = 'div[id="' + id + '"]';
            //var paneSelector = 'div:jqmData(pane-id="' + id + '")';
            return $(paneSelector);
        },
        
        /**
         * Adds HTML as content to a pane with the given ID
         * @name addToPane
         * @methodOf
         * @param {String} id id of the tab the pane belongs to
         * @param {String} HTML that represents the content to add to the pane
         */
        addToPane : function(id, html) {
            var pane = this.getPane(id);
            pane.append(html);
            pane.trigger('create');
        },

        /**
         * Get the header (as jquery object) of the pane using the pane's id.
         * @param id
         */
        getPaneHeader : function(id) {
            var headerSelector = 'div[id="' + id + '-header"]';
            return $(headerSelector);
        },

        /**
         * Adds HTML as content to the header of the pane using the pane's id.
         * @param id - Pane id whose header needs to be updated with HTML content.
         * @param html - HTML content that needs to updated to the header of a pane.
         */
        addToPaneHeader: function(id, html){
            var paneHeader = this.getPaneHeader(id);
            paneHeader.append(html);
            paneHeader.trigger('create');
        },
        
        /**
         * Get the layout object ( as constructed by jQuery layout API).
         * @returns the layout object ( as constructed by jQuery layout API).
         */
        getLayoutObj: function(){
            return this.layoutObj;
        }

    });

    return BorderLayoutView;
});

define('text!lib/amdocs/ossui/components/breadcrumbs/view/template/bctemplate.html',[],function () { return '<ul style="list-style: none;" class="uxf-breadcrumbs ossui-breadcrumbs"></ul>';});

define('text!lib/amdocs/ossui/components/breadcrumbs/view/template/bcitemtemplate.html',[],function () { return '<li style="float: left;" class="ossui-breadcrumbs-item"><div data-uxf-point="anchor_<%=route%>" class="ossui-breadcrumbs-wrapper"><span class="ossui-breadcrumb-icon"></span><span><%=name%></span></div><div class="ossui-breadcrumbs-divider">&gt;</div></li>';});

define('text!lib/amdocs/ossui/components/breadcrumbs/view/template/bclastitemtemplate.html',[],function () { return '<li style="float: left;" class="ossui-breadcrumbs-item ossui-breadcrumbs-selecteditem"><div data-uxf-point="anchor_<%=route%>" class="ossui-breadcrumbs-wrapper"><span class="ossui-breadcrumb-icon"></span><span><%=name%></span></div><div class="ossui-breadcrumbs-divider">&gt;</div></li>';});

/**
* $Id: //depot/Applications/OSSUI/v10.1.0.0/components/ossui-client-zip/src/main/webapp/lib/amdocs/ossui/components/breadcrumbs/view/BreadcrumbsOverflowHandler.js#1 $ 
* $DateTime: 2017/06/08 19:26:36 $ 
* $Revision: #1 $ 
* $Change: 1837971 $
*
* COPYRIGHT NOTICE:
* Copyright (c) 2013 Amdocs.
* The contents and intellectual property contained herein,
* remain the property of Amdocs.
* */

/**
 * This class is a helper class for BreadcrumbsView widget to handle the overflow of breadcrumbs.
 * When the width of the all the breadcrumbs overflow the breadcrumbs container then the
 * breadcrumbs pagination happens and overflow next and overflow previous buttons/links appear which 
 * can take the user to different pages of the breadcrumbs trail.
 */

define('ossui/helper/BreadcrumbsOverflowHandler',['underscore','jquery'],
    function(_, $) {

                var BreadcrumbsOverflowHandler = function(options) {  
                                     
                    this.breadcrumbsElement = options.breadcrumbsElement;
                    this.overflowNextPageBt = '&#187;' ;
                    this.overflowPrevPageBt = '&#171;' ;
                    
                    /**
                     * This method handles the click on the overflow next button
                     * On click of the button the next breadcrumbs page is shown
                     * and the first breadcrumb in the page is selected
                     */
                    this.handleOverflowNextPgBt = function(){
                        if(this.currentPage < this.pages.length){
                            this.currentPage ++;
                        }
                        this.showCurrentPage();
                        var bcIndex = this.pages[this.currentPage].start;
                        //trigger click on the anchor element for the breadcrumb element to show that breadcrumb
                        $(this.breadcrumbsElement.find('.ossui-breadcrumbs').find('.ossui-breadcrumbs-item')[bcIndex]).
                                find('[data-uxf-point^="anchor_"]').trigger('click');
                    };
                    
                    /**
                     * This method handles the click on the overflow previous button
                     * On click of the button the previous breadcrumbs page is shown
                     * and the last breadcrumb in the page is selected
                     */
                    this.handleOverflowPrevPgBt = function(){
                        if(this.currentPage > 0){
                            this.currentPage --;
                        }
                        this.showCurrentPage();
                        var bcIndex = this.pages[this.currentPage].end - 1;
                        $(this.breadcrumbsElement.find('.ossui-breadcrumbs').find('.ossui-breadcrumbs-item')[bcIndex]).
                                   find('[data-uxf-point^="anchor_"]').trigger('click');
                    };
                    
                    /**
                     * This is method is the start point for all breadcrumb overflow checks
                     * if the breadcrumbs width increases beyond the container width the
                     * breadcrumbs overflow buttons appear
                     */
                    this.checkOverflow = function(){
                        var outerContainer = this.breadcrumbsElement.find('.ossui-breadcrumbs');
                        var innerBCItems = outerContainer.find('.ossui-breadcrumbs-item');  
                        var allBreadcrumbsWidth = 0;
                        innerBCItems.each(function(index){
                            allBreadcrumbsWidth += $(this).outerWidth(true);
                        });
                      //the left padding for the breadcrumbs has to be explicitly
                        //added since that does not get accounted for otherwise
                        //but this should be done refactored later to handle
                        //generically by accepting an input param instead of assuming
                        //20 px by default
                        allBreadcrumbsWidth += 20;
                        if(allBreadcrumbsWidth > outerContainer.outerWidth(true)){
                            this.handleBreadcrumbsOverflow(outerContainer, innerBCItems);
                        }
                    };
                    
                    /**
                     * This method creates the overflow next button
                     */
                    this.enableOverflowNext = function(outerContainer){
                        var classIdForOverflowNxtPage = 'ossui-breadcrumbs-overflow ossui-breadcrumbs-nextpage';
                        var overflowNextEl = $('<li></li>')
                        .addClass(classIdForOverflowNxtPage).click(this.handleOverflowNextPgBt).append($('<span></span>')                            
                                .html(this.overflowNextPageBt));
                        outerContainer.append(overflowNextEl);
                        this.overflowNextBtWidth = overflowNextEl.outerWidth(true);
                    };
                    
                    /**
                     * This method creates the overflow previous button
                     */
                    this.enableOverflowPrev = function(outerContainer){
                        var classIdForOverflowPrevPage = 'ossui-breadcrumbs-overflow ossui-breadcrumbs-prevpage';
                        var overflowPrevEl = $('<li></li>')
                        .addClass(classIdForOverflowPrevPage).click(this.handleOverflowPrevPgBt).append($('<span></span>')                            
                                .html(this.overflowPrevPageBt));
                        outerContainer.prepend(overflowPrevEl);
                        this.overflowPrevBtWidth = overflowPrevEl.outerWidth(true);
                    };
                    
                    /**
                     * TODO:
                     */                    
                    this.handleBreadcrumbsOverflow = function(outerContainer, innerBCItems){ 
                        this.enableOverflowNext(outerContainer);
                        this.enableOverflowPrev(outerContainer);
                        this.calculatePageWidth(outerContainer, innerBCItems);
                    };
                    
                    /**
                     * This method paginates the breadcrumbs and decides the currentPage
                     * which should be visible
                     */
                    this.calculatePageWidth = function(outerContainer, innerBCItems){
                        var pageIndex = 0;
                        //set the start point for first page
                        this.pages = [];
                        this.pages[pageIndex] = { start: 0 , pageWidth:0};
                        this.currentPage = 0;
                        var minPadding = 20;
                        for (var i = 0; i < innerBCItems.length; i++) {
                            if((this.pages[pageIndex].pageWidth + $(innerBCItems[i]).outerWidth(true) + this.overflowNextBtWidth + minPadding)
                                    > outerContainer.outerWidth(true)){
                                pageIndex++;
                                this.pages[pageIndex] = { start: i , pageWidth:this.overflowPrevBtWidth};
                            }
                            this.pages[pageIndex].pageWidth +=  $(innerBCItems[i]).outerWidth(true);
                            this.pages[pageIndex].end = i+1;
                            if($(innerBCItems[i]).hasClass('ossui-breadcrumbs-selecteditem')){
                                this.currentPage = pageIndex;
                            }
                        }
                        this.showCurrentPage();
                    };
                    
                    /**
                     * This method shows the page in which the selected breadcrumb is present while
                     * hiding all other breadcrumbs
                     */
                    this.showCurrentPage = function(){                        
                        var outerContainer = this.breadcrumbsElement.find('.ossui-breadcrumbs');
                        var innerBCItems = outerContainer.find('.ossui-breadcrumbs-item');  
                        this.showOverflowBt(outerContainer, '.ossui-breadcrumbs-nextpage');
                        this.showOverflowBt(outerContainer, '.ossui-breadcrumbs-prevpage');
                        
                        innerBCItems.hide().slice(this.pages[this.currentPage].start, this.pages[this.currentPage].end).show(100);
                        
                        if(this.currentPage  == (this.pages.length - 1)){
                            this.hideOverflowBt(outerContainer, '.ossui-breadcrumbs-nextpage');
                        }
                        if(this.currentPage  === 0){
                            this.hideOverflowBt(outerContainer, '.ossui-breadcrumbs-prevpage');
                        }
                    };
                    
                    this.timer = 0;
                    /**
                     * Method to handle the breadcrumbs overflow on window resize
                     */
                    this.handleWindowResize = function(){
                        clearTimeout (this.timer);
                        this.timer = setTimeout(this.resetBCOnResize, 200);
                    };
                    
                    this.resetBCOnResize = function(){
                        var outerContainer = this.breadcrumbsElement.find('.ossui-breadcrumbs');
                        outerContainer.find('.ossui-breadcrumbs-overflow').remove();
                        outerContainer.find('.ossui-breadcrumbs-item').show(); 
                        this.checkOverflow();
                    };
                    
                    this.hideOverflowBt = function(container, selector){
                        container.find(selector).hide();
                    };
                    
                    this.showOverflowBt = function(container, selector){
                        container.find(selector).show();
                    };
                    _.bindAll(this, 'handleOverflowPrevPgBt', 'handleOverflowNextPgBt', 'handleWindowResize', 'checkOverflow', 'resetBCOnResize');
                    $(window).on('resize', this.handleWindowResize);
                };
            return BreadcrumbsOverflowHandler;
    });

/**
 * $Id:
 * //depot/Applications/OSSUI/main/components/ossui-container-war/src/main/webapp/lib/amdocs/ossui/components/breadcrumbs/view/BreadcrumbsView.js#8 $
 * $DateTime: 2017/06/08 19:26:36 $ $Revision: #1 $ $Change: 1837971 $
 * 
 * COPYRIGHT NOTICE: Copyright (c) 2013 Amdocs. The contents and intellectual
 * property contained herein, remain the property of Amdocs.
 * 
 * @memberOf OSSUI.widgets
 * @name BreadcrumbsView
 * @class BreadcrumbsView
 * @type View
 * @description This class extends from Lightsaber BreadcrumbsView to give
 *              additional functionality of allowing the applications to manage
 *              the lifecycle of the breadcrumbs If the application wants to
 *              preview an old breadcrumb item without deleting the
 *              new/proceeding breadcrumbs then the attribute
 *              applicationMangedBC : true should be set else it is a
 *              selfmanaged breadcrumb where in the proceeding breadcrumb items
 *              are automatically deleted when user clicks on any older
 *              breadcrumb item.
 * 
 * If applicationMangedBC is set it is the application's responsibility to
 * remove the old breadcrumbs if there is change in data/event by calling
 * removeAfterRoute.
 * 
 * If the application wants to add its own template to the breadcrumbs it can do
 * so by providing the template, itemTemplate and lastItemTemplate in the config
 * during the breadcrumb instantiation. The application should take care of
 * maintaining the data-uxf-point same as the BreadcrumbsView's templates to
 * prevent any adverse effect on the functionality of the breadcrumbs.
 * 
 * @example 1 --> create an application managed breadcrumb this.bc = new
 *          Ossui.BreadcrumbsView({ config : { el : '#breadcrumbs' }, viewModel :
 *          new Lightsaber.Core.ViewModel(), });
 *          this.bc.setApplicationManagedBC(true);
 * 
 * @example 2 --> create an application managed breadcrumb this.bc = new
 *          Ossui.BreadcrumbsView({ config : { el : '#breadcrumbs',
 *          applicationMangedBC : true, }, viewModel : new
 *          Lightsaber.Core.ViewModel(), });
 * @example 3 --> add breadcrumbs, load a new module to the current module and
 *          pass the breadcrumb object in the options which can be used by the
 *          new module being loaded this.load('content11/code3', {breadcrumb :
 *          this.bc}); this.bc.add({ route : 'content11/code3', name : 'code3',
 *          handler : _.bind(function() { this.load('content11/code3',
 *          {breadcrumb : this.bc}); }, this) });
 * 
 * @example 4 --> to remove all breadcrumb items after given route
 *          content11/code3 this.bc.removeAfterRoute(content11/code3)
 * 
 * @example 5 --> to add customised template during the breadcrumb instantiation
 *          this.bc = new Ossui.BreadcrumbsView({ config : { el :
 *          '#breadcrumbs', itemTemplate : '
 *          <li style="float: left;"><a data-uxf-point="anchor_<%=route%>"
 *          class="ossui-breadcrumbs-item"><%=name%></a><span
 *          class="ossui-breadcrumbs-divider"> *; </span></li>',
 *          lastItemTemplate : '
 *          <li style="float: left;"><a data-uxf-point="anchor_<%=route%>"
 *          class="ossui-breadcrumbs-selecteditem"><%=name%></a><span
 *          class="ossui-breadcrumbs-divider"> *; </span></li>' }, viewModel :
 *          new Lightsaber.Core.ViewModel(), });
 */
define(
        'ossui/widget/BreadcrumbsView',
        [
                'jquery',
                'underscore',
                'lightsaber',
                'text!lib/amdocs/ossui/components/breadcrumbs/view/template/bctemplate.html',
                'text!lib/amdocs/ossui/components/breadcrumbs/view/template/bcitemtemplate.html',
                'text!lib/amdocs/ossui/components/breadcrumbs/view/template/bclastitemtemplate.html',
                'ossui/helper/BreadcrumbsOverflowHandler' ],
        function($, _, Lightsaber, bcTemplate, bcItemTemplate,
                bcLastItemTemplate, BreadcrumbsOverflowHandler) {

            var breadcrumbsView = Lightsaber.BreadcrumbsView
                    .extend({

                        bctemplate : bcTemplate,
                        bcitemTemplate : bcItemTemplate,
                        bclastItemTemplate : bcLastItemTemplate,
                        applicationMangedBC : false,

                        initialize : function() {
                            this._super();
                            this.template = this.getConfig('template') ? _
                                    .template(this.getConfig('template')) : _
                                    .template(this.bctemplate);
                            this.itemTemplate = this.getConfig('itemTemplate') ? _
                                    .template(this.getConfig('itemTemplate'))
                                    : _.template(this.bcitemTemplate);
                            this.lastItemTemplate = this.getConfig('lastItemTemplate') ? _
                                    .template(this.getConfig('lastItemTemplate'))
                                    : _.template(this.bclastItemTemplate);
                            var applicationMangedBCVal = this
                                    .getConfig('applicationMangedBC');
                            if (true === applicationMangedBCVal) {
                                this.applicationMangedBC = applicationMangedBCVal;
                            }
                            this.bcOverflowHandler = new BreadcrumbsOverflowHandler(
                                    {
                                        breadcrumbsElement : this.$el
                                    });
                        },
                        /**
                         * Overriden If applicationMangedBC then the module
                         * creating the BC should be responsible to remove the
                         * BC on change of data in page by calling
                         * removeAfterRoute else the default UXF feature is
                         * maintained where on click of any previous BC the
                         * proceeding BCs are removed
                         * 
                         * @param config :
                         *            config parameter for handling load
                         */
                        _handleSelect : function(config) {
                            if (!this.applicationMangedBC) {
                                this._super(config);
                            } else {
                                this._update(config);
                                config.handler.apply(this, [ config ]);
                            }
                        },

                        /**
                         * Overriden to handle overflow of breadcrumbs
                         */
                        add : function(config) {
                            this._super(config);
                            this.bcOverflowHandler.checkOverflow();
                        },
                        /**
                         * Overriden to handle overflow of breadcrumbs
                         */
                        remove : function(route) {
                            this._super(route);
                            this.bcOverflowHandler.checkOverflow();
                        },
                        /**
                         * This method recalculates and updates the breadcrumb
                         * items based on the selected item
                         * 
                         * @param config
                         */
                        _update : function(config) {
                            if (config) {
                                this.$el
                                        .find(
                                                '.ossui-breadcrumbs-item.ossui-breadcrumbs-selecteditem')
                                        .removeClass(
                                                'ossui-breadcrumbs-selecteditem');
                                this.$el.find(
                                        '[data-uxf-point="anchor_'
                                                + config.route + '"]').closest(
                                        "li").addClass(
                                        'ossui-breadcrumbs-selecteditem');
                            } else {
                                // this._super();
                                // below lines are from duplicated from
                                // LS:breadcrumbs but with
                                // enhancement to add the breadcrumbIcon
                                var $root = this.$root.detach();
                                $root.empty();
                                $root.find('[data-uxf-point]').each(
                                        function(index, element) {
                                            $(element).off();
                                        });

                                for ( var i = 0, length = this.routes.length - 1; i <= length; i++) {
                                    if (i === length) {
                                        $root
                                                .append(this
                                                        .lastItemTemplate(this.routes[i]));
                                    } else {
                                        $root.append(this
                                                .itemTemplate(this.routes[i]));
                                    }
                                    this._attachSelectHandler($root,
                                            this.routes[i]);
                                    this._addTitleAttribute($root,
                                            this.routes[i]);
                                    this._addBreadcrumbIcon($root,
                                            this.routes[i]);
                                }
                                this.$el.append($root);
                            }
                            /*
                             * this.$el.find("div[data-uxf-point]").each(
                             * function(index) { $(this).attr('title',
                             * $(this).html()); });
                             */
                            // the last divider should be hidden
                            this.$el.find('.ossui-breadcrumbs-item').last()
                                    .find('.ossui-breadcrumbs-divider')
                                    .addClass(
                                            'ossui-breadcrumbs-divider-hidden');
                        },

                        _addBreadcrumbIcon : function($root, config) {
                            if (config.bcIconClass) {
                                $root.find(
                                        '[data-uxf-point="anchor_'
                                                + config.route + '"]').find(
                                        '.ossui-breadcrumb-icon').addClass(
                                        config.bcIconClass);
                            }
                        },

                        _addTitleAttribute : function($root, config) {
                            if (config.name) {
                                $root.find(
                                        '[data-uxf-point="anchor_'
                                                + config.route + '"]').attr(
                                       'title', $('<div/>').html(config.name).text());
                            }
                        },
                        /**
                         * Application can call this method to set the value of
                         * applicationMangedBC
                         * 
                         * @param bcManagement
                         *            applicationMangedBC: false --> click of
                         *            any previous BC the proceeding BCs are
                         *            removed applicationMangedBC : true -->
                         *            click of any previous BC the proceeding
                         *            BCs are not removed application removes
                         *            them specifically by calling
                         *            removeAfterRoute
                         */
                        setApplicationManagedBC : function(bcManagement) {
                            this.applicationMangedBC = bcManagement;
                        },

                        /**
                         * Method to remove all breadcrumbs after given
                         * route/moduleid this method does not do anything if it
                         * is applicationManged breadcrumb
                         * 
                         * @param route:
                         *            given route/moduleid after which all the
                         *            breadcrumb items should be removed
                         */
                        removeAfterRoute : function(route) {

                            if (this.applicationMangedBC) {
                                if (this.routePos[route] !== undefined) {
                                    var position = this.routePos[route] + 1;
                                    var routeLength = this.routes.length - 1;
                                    for ( var i = position; i <= routeLength; i++) {
                                        delete this.routePos[this.routes[i].route];
                                    }
                                    this.routes = this.routes
                                            .slice(0, position);
                                    this._update();
                                }
                            }
                            this.bcOverflowHandler.checkOverflow();
                        }

                    });
            return breadcrumbsView;

        });

/**
 * @class CollectionView
 * @augments TBD
 * @custLevel OSSUI
 * @type Lightsaber.Core.View
 * @memberOf Ossui
 * @name CollectionView
 * @property TBD
 * @version TBD
 *
 * @description TODO:
 *
 *
 * @example TODO:
 *
 * <code>
 * </code>
 *
 */
define('ossui/widget/CollectionView',
        [ 'jquery', 'underscore', 'lightsaber' ],
        function($, _, LS) {
            var collView = LS.Core.View.extend({
                        
                        /**
                         * 
                         * @param options
                         */
                        initialize : function(options) {
                            _.bindAll(this, '_added', '_removed', '_changed',
                                    '_subViewsRefresh', '_cleared',
                                    '_handlePage');
                            // binding to the viewmodel events
                            this.viewModel.on('items:loaded', this._subViewsRefresh);
                            this.viewModel.on('items:emptied', this._cleared);
                            this.viewModel.on('items:refreshed', this._subViewsRefresh);
                            this.viewModel.on('items:added', this._added);
                            this.viewModel.on('items:changed', this._changed);
                            this.viewModel.on('items:removed', this._removed);
                            this.viewModel.on('items:paginated', this._handlePage);
                        },
                        
                        /**
                         * TODO:
                         */
                        _handleSubViews : function() {
                            // create sub views based on collection view model
                            this._prepareSubViews();
                            this._super();
                        },

                        /**
                         * 
                         * @returns TODO:
                         */
                        _getCollectionViewData : function() {
                            var collection = this.viewModel.currentModel;
                            var sortFunction = this.viewModel._getSortFunction();
                            var filterFunction = this.viewModel.getConfig('filterFunction');

                            var pageNum = this.getConfig('pageNum');
                            var pageModels = collection.getPage(pageNum);

                            pageModels.data = _.isFunction(filterFunction) ? _.filter(pageModels.data, filterFunction)
                                    : pageModels.data;
                            pageModels.data = _.isFunction(sortFunction) ? _.sortBy(pageModels.data, sortFunction)
                                    : pageModels.data;

                            return pageModels.data;

                        },

                        /**
                         * TODO:
                         */
                        _prepareSubViews : function() {
                            var collection = this._getCollectionViewData();

                            this.subViews = [];
                            this.sortedViewList = [];

                            var noOfRecords = collection.length;
                            for (var count = 0; count < noOfRecords; ++count) {
                                var model = collection[count];
                                var viewModel = this._createViewModel(model, count);
                                var instanceDetails = this._createView(viewModel);
                                var view = instanceDetails.viewInstance;
                                this.subViews.push(instanceDetails);
                                this.sortedViewList.push(view);
                            }
                        },

                        /**
                         * 
                         * @param model
                         * @param i
                         * @returns {___viewModel0}
                         */
                        _createViewModel : function(model, i) {
                            var modelObj = model.toJSON();
                            var binding = [];
                            
                            for (var attr in modelObj) {
                                if (modelObj.hasOwnProperty(attr)) {
                                    var bindingObj = {};
                                    var modelAttr = 'models.model.' + attr;
                                    bindingObj[attr] = modelAttr;
                                    bindingObj.options = {
                                        setOnBind : true,
                                        twoWay : true
                                    };
                                    binding.push(bindingObj);    
                                }
                            }

                            var actions = {};
                            var parentActions = this.viewModel.getConfig('actions');
                            
                            for (var action in parentActions) {
                                if (parentActions.hasOwnProperty(action)) {
                                    /* 
                                     * Dont want to change this implementation to allow the easy merging 
                                     * when Lightsaber comes with their own CollectionView class.
                                     */
                                    
                                    /*jshint loopfunc: true */
                                    actions[action] = function() {
                                        var params = [].slice.call(arguments);
                                        params.splice(0, 0, action, this);
                                        // params.push(this.parentVMIndex);
                                        this.parentVM.handleAction.apply(this.parentVM, params);
                                    };
                                    /*jshint loopfunc: false */
                                }
                            }

                            var viewModel = new LS.Core.ViewModel({
                                models : {
                                    model : model
                                },
                                dataBindings : binding,
                                config : {
                                    actions : actions
                                }
                            });

                            viewModel.parentVM = this.viewModel;
                            viewModel.parentVMIndex = i;
                            
                            return viewModel;
                        },

                        /**
                         * 
                         * @param viewModel
                         * @returns {___anonymous6901_6991}
                         */
                        _createView : function(viewModel) {
                            var ViewType = this.getConfig('viewType') || LS.Core.View;

                            var viewOptions = this.getConfig('viewOptions') || {};
                            viewOptions = _.defaults({}, viewOptions, {
                                viewModel : viewModel
                            });
                            
                            var el;
                            if (viewOptions.el) {
                                // we don't allow setting el for each view
                                el = viewOptions.el;
                                delete viewOptions.el;
                            } else {
                                el = this.getConfig('viewEl');
                            }
                            
                            var viewInstance = new ViewType(viewOptions);
                            viewInstance.$root.attr('data-uxf-point', 'uxf-collection-item');

                            var instanceDetails = {
                                viewInstance : viewInstance
                            };
                            
                            if (el) {
                                instanceDetails.el = el;
                            }
                            
                            return instanceDetails;
                        },

                        /**
                         * TODO:
                         */
                        _changed : function() {},

                        /**
                         * TODO:
                         */
                        _cleared : function() {
                            // would like to use this._refresh(); but that
                            // doesn't cover the all render cycle
                            this._destroySubViews();
                        },

                        /**
                         * TODO:
                         */
                        _subViewsRefresh : function() {
                            this._destroySubViews();
                            this._handleSubViews(); // view render method
                        },

                        /**
                         * TODO:
                         */
                        _handlePage : function() {
                            this._subViewsRefresh();
                        },

                        /**
                         * 
                         * @param data
                         */
                        _added : function(data) {
                            var sortedIndex = _.isUndefined(data.sortedIndex) ? this.viewModel.currentModel.models.length - 1
                                    : data.sortedIndex;
                            var model = this.viewModel.currentModel.models[sortedIndex];
                            var viewModel = this._createViewModel(model, sortedIndex);
                            var viewDetails = this._createView(viewModel);
                            var view = viewDetails.viewInstance;
                            // add to subview
                            this.addSubView(viewDetails);

                            // fix indexes
                            for ( var i = sortedIndex; i < this.sortedViewList.length; ++i) {
                                this.sortedViewList[sortedIndex].viewModel.parentVMIndex += 1;
                            }
                            // add to sorted view list
                            this.sortedViewList.splice(sortedIndex, 0, view);

                            // move to proper location if needed
                            if (sortedIndex < this.sortedViewList.length - 1) {
                                this.sortedViewList[sortedIndex + 1].before(this.sortedViewList[sortedIndex]);
                            }
                        },

                        /**
                         * 
                         * @param data
                         */
                        _removed : function(data) {
                            var sortedIndex = data.sortedIndex || -1;
                            if (sortedIndex < 0) {
                                for ( var i = 0; i < this.sortedViewList.length; ++i) {
                                    var model = this.sortedViewList[i].viewModel.models.model;
                                    if (model.cid == data.modelData.cid) {
                                        sortedIndex = i;
                                        break;
                                    }
                                }
                            }
                            
                            if (sortedIndex >= 0 && sortedIndex < this.sortedViewList.length) {
                                var viewToRemove = this.sortedViewList[sortedIndex];
                                viewToRemove.destroy();
                                // remove from the sorted list
                                this.sortedViewList.splice(sortedIndex, 1);
                                // fix indexes
                                for ( var count = sortedIndex; count < this.sortedViewList.length; ++count) {
                                    this.sortedViewList[sortedIndex].viewModel.parentVMIndex -= 1;
                                }
                            }
                        },

                        /**
                         * TODO:
                         */
                        _destroySubViews : function() {
                            
                            for (var cid in this._subViews) {
                                if (this._subViews.hasOwnProperty(cid) && this._subViews[cid].instance){
                                    this._subViews[cid].instance.destroy();
                                }
                            }
                            
                            this._subViews = {};
                            this.subViews = [];
                            this.sortedViewList = [];
                        }

                    });
            return collView;
        });

/**
* $Id: //depot/Applications/OSSUI/v10.1.0.0/components/ossui-client-zip/src/main/webapp/lib/amdocs/ossui/components/utils/OssuiResourceBundle.js#1 $ 
* $DateTime: 2017/06/08 19:26:36 $ 
* $Revision: #1 $ 
* $Change: 1837971 $
*
* COPYRIGHT NOTICE:
* Copyright (c) 2013 Amdocs.
* The contents and intellectual property contained herein,
* remain the property of Amdocs.
* 
* */

define('ossui/utils/OSSUIResourceBundle',[
    'underscore',
    'lightsaber' 
], function(_, Lightsaber) {

    var OSSUIResourceBundle = function(){};
    
    /**
     * The resourceBundle is maintained as static so that it can be
     * accesssed anywhere in the application after populating it
     * without having to instantiate the  OSSUIResourceBundle
     */
    OSSUIResourceBundle.prototype.resourceBundle = {};
    
    OSSUIResourceBundle.prototype.getLabel = function(key){
        return this.resourceBundle[key];
    };
    
    OSSUIResourceBundle.prototype.getMessage = function(messageKey){
        return this.resourceBundle[messageKey];
    };
    
    return OSSUIResourceBundle;
    
});
define('text!lib/amdocs/ossui/components/configurabletabpanel/container/view/template/NavigationBarTemplate.html',[],function () { return '<div class="ossui-pagetabs-tabpanel ossui-configurable-tab-nav-bar"><ul data-uxf-point="ossui-configurable-tab-nav-bar" class="ossui-configurable-tabs-pagetabs-nav-bar ossui-configurable-tab-nav-bar-ul"></ul></div>\n';});

define('text!lib/amdocs/ossui/components/configurabletabpanel/container/view/template/TabTemplate.html',[],function () { return '<li data-uxf-point="ossui-configurable-tab-<%=tabId%>" class=\'ossui-configurable-tab-li\'>\n\t<div data-uxf-point="ossui-configurable-tab-href" class=\'ossui-configurable-tab-li\'>\n\t\t<a class=\'ossui-configurable-tab-anchor ossui-configurable-tab-li\' href=\'#<%=tabId%>\'><%=tabLabel%></a>\n\t</div>\n</li>';});

define('text!lib/amdocs/ossui/components/configurabletabpanel/container/view/template/TabPaneTemplate.html',[],function () { return '<div id=\'<%=tabId%>\' class=\'ui-tabs-panel ui-widget-content ui-corner-bottom\' aria-labelledby=\'ui-id-1\' role=\'tabpanel\' aria-expanded=\'true\'>\n\t<div data-uxf-point="ossui-configurable-tab-pane-spinner" class="ossui-configurable-tab-pane-spinner-icon"></div> \n\t<div data-uxf-point="ossui-configurable-tab-pane-<%=tabId%>"  class=\'ossui-configurable-tab-pane-data\'></div>\n\t<div data-uxf-point="ossui-configurable-tab-filter-<%=tabId%>" class=\'ossui-configurable-tab-pane-filter\'></div>\n</div>';});

define('text!lib/amdocs/ossui/components/configurabletabpanel/filter/view/template/ListFilterTemplate.html',[],function () { return '<div data-uxf-point="ossui-configurable-tab-filter-input" class="ossui-configurable-tab-filter-input">\n\t<input data-uxf-point="ossui-configurable-tab-filter-txt-bar" type="text" class="ossui-configurable-tab-filter-txt-bar"/>\n\t<a href="#" data-uxf-point="ossui-configurable-tab-filter-clear-btn-link" class="ossui-configurable-tab-filter-clear-btn-link"></a>\n</div>\n<div data-uxf-point="ossui-configurable-tab-filter-no-matches" class="ossui-configurable-tab-filter-no-matches"></div>';});

/**
 * ListFilterView is used by ConfigurableTabPanelView to provide  filter support.
 */
define('ossui/widget/ListFilterView', [
        'jquery',
        'lightsaber',
				'underscore',
        'ossui/utils/OSSUIResourceBundle',
        'text!lib/amdocs/ossui/components/configurabletabpanel/filter/view/template/ListFilterTemplate.html'
	], function ($, Lightsaber, _, OSSUIResourceBundle, FilterTemplate) {
	
	var FilterView = Lightsaber.Core.View.extend({

		template: FilterTemplate,
		
		_checkIfNoMatchesFound: function () {
			var filteredModelObj = this.viewModel.getData();
			var filteredModelLength = filteredModelObj.items.length;
			if (filteredModelLength === 0) {
				this.noMatchesMsg.show();
			} else {
				this.noMatchesMsg.hide();
			}
		},
		
		_addEventHandlers: function () {
			var self = this;
			this.clearButton.on('click', function () {
				self.putPlaceHolder();
				self.filterTxt.trigger('keyup');
			});
			this.filterTxt.on('keyup input', function (event) {
				if (self.filterTxt.val().length > 0) {
					self.filterTxt.attr('title', self.filterTxt.val());
				} else {
					self.filterTxt.attr('title', self.filterTxtPlaceholder);
				}
				var filterToApply = self.filterTxt.val();
				if (self.filterTxt.hasClass('ossui-configurable-tab-filter-txt-bar-placeholder')) {
					filterToApply = '';
				}
				
				if (!filterToApply || filterToApply === '') {
					self.noMatchesMsg.hide();
					self.viewModel.applyFilterCondition(filterToApply);
					self.viewModel.refresh();
				}else { 
					self.viewModel.applyFilterCondition(filterToApply);
					self.viewModel.refresh();
					self._checkIfNoMatchesFound();
				}

			});
			
			this.handlePlaceHolder();
		},
		
		postRender: function () {
			this._super();
			this.noMatchesMsg = this.$el.find('[data-uxf-point="ossui-configurable-tab-filter-no-matches"]');
			this.noMatchesMsg.append(OSSUIResourceBundle.prototype.getMessage('ossui.labels.filter.text.noMatchedFound') || 'Sorry, no matches found');
			this.noMatchesMsg.hide();
			
			this.filterTxt = this.$el.find('[data-uxf-point="ossui-configurable-tab-filter-txt-bar"]');
			this.clearButton = this.$el.find('[data-uxf-point="ossui-configurable-tab-filter-clear-btn-link"]');
			
			
			this.filterTxtPlaceholder = OSSUIResourceBundle.prototype.getMessage('ossui.labels.filter.text.placeholder') || 'Search';
			this.clearTxtLabel = OSSUIResourceBundle.prototype.getMessage('ossui.labels.filter.button.clearText') || 'Clear Text';
			
			this.filterTxt.attr('data-placeholder', this.filterTxtPlaceholder);
			this.putPlaceHolder();
			this.filterTxt.attr('title', this.filterTxtPlaceholder);
			this.clearButton.attr('title', this.clearTxtLabel);
			this._addEventHandlers();
			
		},
		
		handlePlaceHolder : function () {
			var self = this;
			this.filterTxt.focus(function () {
				if (self.filterTxt.hasClass('ossui-configurable-tab-filter-txt-bar-placeholder')) {
					self.clearPlaceHolder();
				}
			}).blur(function () {
				var value = self.filterTxt.val();
				if (value === '' || (value === self.filterTxt.attr('data-placeholder') && self.filterTxt.hasClass('ossui-configurable-tab-filter-txt-bar-placeholder'))) {
					self.putPlaceHolder();
				}
			});
		},
		
		putPlaceHolder: function () {
			this.filterTxt.addClass('ossui-configurable-tab-filter-txt-bar-placeholder');
			this.filterTxt.val(this.filterTxt.attr('data-placeholder'));
		},
		
		clearPlaceHolder: function () {
			this.filterTxt.val('');
			this.filterTxt.removeClass('ossui-configurable-tab-filter-txt-bar-placeholder');
		}
	});
	
	return FilterView;
});

/**
 * ConfigurableTabPanelView is a configurable tab pane structure which takes configuration like tabs, view to render in tab pane,  URL from
 * which data will be fetched, default tab to select etc.
 *
 * This view takes following parameters -
 *  navBarTemplate : Template of Navigation Bar,
 *  tabTemplate : Template of Tabs,
 *  tabPaneTemplate : Template of Tab Pane,
 *  defaultTabId : Id of Tab which needs to be selected by default,
 *
 * Sample to create this view is
 *
 * configurableTabPanelView = new ConfigurableTabPanelView({
 *		config : {
 *			el : $('[data-uxf-point="ossui-toolbox-tab-content"]'),
 *		},
 *		viewModel : tabCollectionViewModel
 *	});
 *
 *  viewModel should be of type ossui/widget/ConfigurableTabPanelViewModel
 *
 *
 * This view needs a configuration object as below-
 *
 * ({
 *	"ToolboxConfig" : {
 *		tabs: [
 *			{id: 'bookmarks', name: "Bookmarks", view: "app/amdocs/ann/toolbox/components/bookmark/view/BookmarksView", dataURL: "services/rest/toolbox/items/bookmarks", filterRequired : true}
 *		]
 *	}
 * })
 *
 * id : id of tab,
 * name : Name of the tab to be displayed. It is recommended to have a bundle key value for this name, if localization is to be supported.
 * view : View to load in this Tab's Pane. This view can provide a configuration 'donotFilterHiddenAttribtues' which specifies whether to include private
 * attributes(attributes starting with underscore) in filter criteria. donotFilterHiddenAttribtues : true won's consider private or hidden attributes for
 * filtering.
 * dataURL : URL from which data will be fetched.
 * filterRequired : If filter is required
 *
 * For each tab, a bundle key with ossui.configurable.tab.label.<<tabid>> is required.
 *
 * Events :
 * ossui:configurabletab:hideSpinner - Event to hide spinner. Event should be on pane view.
 * ossui:configurabletab:showSpinner - Event to show spinner. Event should be on pane view.
 * ossui:configurabletab:paneview:loaded - Event thrown when a pane view is loaded.
 */

define('ossui/widget/ConfigurableTabPanelView',
		[
	'jquery',
	'underscore',
	'lightsaber',
	'ossui/utils/OSSUIResourceBundle',
	'text!lib/amdocs/ossui/components/configurabletabpanel/container/view/template/NavigationBarTemplate.html',
	'text!lib/amdocs/ossui/components/configurabletabpanel/container/view/template/TabTemplate.html',
	'text!lib/amdocs/ossui/components/configurabletabpanel/container/view/template/TabPaneTemplate.html',
	'ossui/widget/ListFilterView'
],
		function ($, _, Lightsaber, OSSUIResourceBundle, NavigationBarTemplate,
				TabTemplate, TabPaneTemplate, ListFilterView) {


			var ConfigurableTabView = Lightsaber.TabPanelView.extend({

				template : NavigationBarTemplate,

				tabTemplate : TabTemplate,

				tabPaneTemplate : TabPaneTemplate,

				defaultTabId : undefined,

				tabIdPrefix : "tabs-",

				contextInfo : {},

				initialize : function () {
					this._super();
					this.paneViewDetails = {};

					this.template = this.getConfig('navBarTemplate') || this.template;

					this.tabTemplate = this.getConfig('tabTemplate') || this.tabTemplate;

					this.tabPaneTemplate = this.getConfig('tabPaneTemplate') || this.tabPaneTemplate;

					this.defaultTabId = this.getConfig('defaultTabId') || this.defaultTabId;

					this.contextInfo = this.getConfig('contextInfo') || this.contextInfo;

					this.viewModel.on('ossui:configurabletab:collectionFetch:success', this.handleCollectionFetch, this);
					this.on('tab:selected', this.handleTabSelectedEvent, this);
				},

				postRender : function () {
					this._super();
					this.refreshTabs();
					if (this.defaultTabId) {
						// TODO handle gracefully if id does not exist
						this.select(this.defaultTabId);
					} else {
						this.select(this.getAllTabs()[0].tabId);
					}
				},

				addTab : function (tabData) {
					this._addTab(tabData);
				},


				_addTab : function (tabData) {
					var tabLabel = OSSUIResourceBundle.prototype.getMessage('ossui.configurable.tab.label.' + tabData.id) || tabData.name;

					var tabId = this.tabIdPrefix + tabData.id;
					tabData.tabId = tabData.id;

					var li = null;
                    if (typeof this.tabTemplate === 'function'){
                        li = this.tabTemplate({ tabId : tabId,
                            tabLabel : tabLabel});
                    }else{
					    li = _.template(this.tabTemplate, {
						    tabId : tabId,
						    tabLabel : tabLabel
					    });
                    }

					this.$root.find("[data-uxf-point='ossui-configurable-tab-nav-bar']")
							.append(li);
					var tabPane = _.template(this.tabPaneTemplate, {
						tabId : tabId
					});
					var tabs = this.$root.tabs();
					$(tabPane).appendTo(tabs);
				},

				refreshTabs : function () {
					this.$root.tabs("refresh");
				},

				getAllTabs : function () {
					var tabItems = $(
							this.$root.find(
									"[data-uxf-point='ossui-configurable-tab-nav-bar']")
									.children()).find("a");
					var tabs = [];
					var self = this;
					tabItems.each(function (i) {
						var tabIdAttr = $(this).attr('href');
						var tabId = tabIdAttr.slice(self.tabIdPrefix.length + 1, tabIdAttr.length);
						var tabName = $(this).html();
						tabs[i] = {
							tabId : tabId,
							tabName : tabName
						};
					});
					return tabs;
				},

				handleCollectionFetch : function (ev) {
					var tabId = ev.data.tabId;
					this.renderSpecificPaneView(tabId);
				},

				renderSpecificPaneView : function (tabId) {
					if (this.paneViewDetails[tabId] === undefined || this.paneViewDetails[tabId] === null) {
						var paneEl =  this.$el.find("[data-uxf-point='ossui-configurable-tab-pane-tabs-" + tabId + "']");
						var filterEl = this.$el.find("[data-uxf-point='ossui-configurable-tab-filter-tabs-" + tabId + "']");
						this.paneViewDetails[tabId] = {id : tabId, paneEl : paneEl, filterEl : filterEl };
						var paneVMDetails = this.viewModel.getPaneVMDetails();
						var paneVMDetail = paneVMDetails[tabId];
						this._loadView(paneVMDetail, this.paneViewDetails[tabId], this);
						if (paneVMDetail.config.filterRequired) {
							filterEl.show();
							this.subViews.push(
								new ListFilterView({
									viewModel :  paneVMDetail.paneVM,
									el : this.paneViewDetails[tabId].filterEl
								}));
						}
						else {
							filterEl.remove();
						}
					}
				},

				_loadView : function (paneVMDetail, paneViewDetail, ConfigurableTabView) {
					require([ paneVMDetail.config.view], function (View) {
						paneViewDetail.paneView = new View({
							config : {
								el : paneViewDetail.paneEl,
								contextInfo : ConfigurableTabView.contextInfo
							},

							viewModel : paneVMDetail.paneVM
						});
						paneVMDetail.paneVM.donotFilterHiddenAttribtues = paneViewDetail.paneView.getConfig('donotFilterHiddenAttribtues');

						var spinner = paneViewDetail.paneView.$el.parent().find("[data-uxf-point='ossui-configurable-tab-pane-spinner']");
						spinner.hide();

						ConfigurableTabView.trigger("ossui:configurabletab:paneview:loaded", {paneView: paneViewDetail.paneView});

						paneViewDetail.paneView.on("ossui:configurabletab:showSpinner", function (eventData) {
							spinner.show();
						});

						paneViewDetail.paneView.on("ossui:configurabletab:hideSpinner", function (eventData) {
							spinner.hide();
						});
					});
				},

				handleTabSelectedEvent : function (evt) {
					this.viewModel.fetchCollectionForTabId(evt);
					//first remove selected from all other tabs
					this.$el.find('.ossui-configurable-tab-li a').removeClass('ossui-configurable-tab-li-selected');
					//then apply class to the tab text when it is selected
					this.$el.find("[data-uxf-point='ossui-configurable-tab-tabs-" + evt + "'] a").addClass("ossui-configurable-tab-li-selected");
				},

				destroy : function () {
					for (var paneViewDetailKey in this.paneViewDetails) {
						if (this.paneViewDetails.hasOwnProperty(paneViewDetailKey)) {
							if (this.paneViewDetails[paneViewDetailKey].paneView !== undefined) {
								this.paneViewDetails[paneViewDetailKey].paneView.destroy(true);
							}
						}
					}
					this.paneViewDetails = null;
					this._super(true);
				}
			});

			return ConfigurableTabView;
		});



/**
 * TabpaneViewModel is used by ConfigurableTabPanelViewModel to create view models of URL provided in configuration.
 */


define('ossui/widget/TabpaneViewModel', [ 'underscore', 'lightsaber'], function (_, Lightsaber) {
	
	function _makeRegularExpressionIfStar(s) {
	    s = s.replace(/[.]/g, '\\.');
	    return s.replace(/[*]/g, '.*');
	}

	function isAttributeToBeIgnored(key, ignoreListForFilter) {
			if (!ignoreListForFilter  || ignoreListForFilter === undefined) {
				return false;
			}
			
			var indexOfItem = _.indexOf(ignoreListForFilter, key);
			if(indexOfItem > -1) {
				return true;
			}
			
			return false;
	}
	
	function _prepareStringToFilter(objectValue, donotFilterHiddenAttribtues, ignoreListForFilter) {
		var valueString = '';
		for (var key in objectValue) {
			if (objectValue.hasOwnProperty(key)) {
				//check if attribute is to be ignored for filtering
				if (donotFilterHiddenAttribtues && isAttributeToBeIgnored(key, ignoreListForFilter)) {
					continue;
				}
				
				var value = objectValue[key];
				if (value instanceof Array) {
					for (var i = 0; i < value.length; i++) {
						var attributeValue = _prepareStringToFilter(value[i], donotFilterHiddenAttribtues, ignoreListForFilter);
						valueString = valueString + attributeValue;
					}
				} else {
					if(value) {
					valueString = valueString + value;
					}
				}
			}
		}
		return valueString;
		
	}
	
	function _objectSatisfiesFilter(objectValue, filterTerm, donotFilterHiddenAttribtues, ignoreListForFilter) {
		var regExp = new RegExp(_makeRegularExpressionIfStar(filterTerm.toLowerCase()));
		var objectInfoToFilter = _prepareStringToFilter(objectValue, donotFilterHiddenAttribtues, ignoreListForFilter);
		if (objectInfoToFilter.toLowerCase().match(regExp)) {
			return true;
		}
		return false;
	}
	
	var TabpaneViewModel = Lightsaber.ItemListViewModel.extend({
		
		initialize : function () {
			_.bindAll(this, 'applyFilterCondition', 'filter');
			Lightsaber.CollectionViewModel.prototype.initialize.apply(this, arguments);
			this.setConfig('filterFunction', this.filter);
		},
		
		applyFilterCondition : function (filterTerm) {
			this.set("filterTerm", filterTerm);
		},
		
		filter : function (element, index, list) {
			var filterTerm = this.get("filterTerm");
			if (!filterTerm  || filterTerm === undefined) {
				return true;
			}
			return _objectSatisfiesFilter(element.attributes, filterTerm, this.donotFilterHiddenAttribtues, this.getConfig('ignoreListForFilter'));
		}
		
	});
	return TabpaneViewModel;
	
});
/**
 * ConfigurableTabPanelViewModel is required by ConfigurableTabPanelView.
 * 
 * Sample - 
 * 
 * var configurableTabPanelViewModel = new ConfigurableTabPanelViewModel({
 *		models : {
 *			tabs : tabCollection
 *		},
 *	},
 *	{loadDataForAll : false});
 *
 *  loadDataForAll : specifies whether data for all tabs should be loaded upfront or on demand
 *  tabCollection : should be as follows -
 *  
 * ({
 *	"ToolboxConfig" : {
 *		tabs: [
 *			{id: 'bookmarks', name: "Bookmarks", view: "app/amdocs/ann/toolbox/components/bookmark/view/BookmarksView", dataURL: "services/rest/toolbox/items/bookmarks", filterRequired : true}
 *		]
 *	}
 * })
 * 
 * id : id of tab,
 * name : Name of the tab to be displayed. It is recommended to have a bundle key value for this name, if localization is to be supported.
 * view : View to load in this Tab's Pane.
 * dataURL : URL from which data will be fetched. In case dataURL is not provided, the view would be loaded assuming all the data required is handled in the view.
 * filterRequired : If filter is required
 * 
 * events: 
 * 
 * ossui:configurabletab:collectionFetch:success : on successful fetching data.
 * ossui:configurabletab:collectionFetch:error : on failure while fetching data.
 * ossui:configurabletab:panevm:loaded : event to indicate pane VM is created. Event data contains VM.
 * 
 */

define('ossui/widget/ConfigurableTabPanelViewModel', [ 'lightsaber',
'ossui/widget/TabpaneViewModel' ], function (Lightsaber, TabpaneViewModel) {

	var paneVMDetails = {};
	
	function _getPaneConfig(tabs, index) {

		var paneConfig = {};
		paneConfig.view = tabs[index].get('view');
		paneConfig.dataURL = tabs[index].get('dataURL');
		paneConfig.id = tabs[index].get('id');
		paneConfig.name = tabs[index].get('name');
		paneConfig.filterRequired = tabs[index].get('filterRequired');
		paneConfig.ignoreListForFilter = tabs[index].get('ignoreListForFilter');

		return paneConfig;
	}

	var ConfigurableTabViewModel = Lightsaber.CollectionViewModel.extend({

		initialize : function (models, options) {
			this._super();
			this.createVMForPanes();
			if (options.loadDataForAll) {
				this.fetchCollectionForAllTab();
			}
		},

		getPaneVMDetails : function () {
			return paneVMDetails;
		},
		
		fetchCollectionForAllTab : function () {
			for (var paneVMDetailKey in paneVMDetails) {
				if (paneVMDetails.hasOwnProperty(paneVMDetailKey)) {
					this.fetchCollectionForTabId(paneVMDetailKey);
				}
			}
		},
		
		fetchCollectionForTabId : function (tabId) {
			var self = this;
			if(paneVMDetails[tabId].config.dataURL !== null && !_.isUndefined(paneVMDetails[tabId].config.dataURL)){ 
				paneVMDetails[tabId].paneVM.models.items.fetch({
					success : this.success,
					error : this.error
				});
			} else {
				this.trigger('ossui:configurabletab:collectionFetch:success', {'data' : {'tabId' : tabId}});
			}
		},
		
		success : function (data, response) {
				this.trigger('ossui:configurabletab:collectionFetch:success', {'data' : data});
			},
		
		error : function (e) {
			this.trigger('ossui:configurabletab:collectionFetch:error', {'error' : e});
		},
			
		createVMForPanes : function () {
			var tabs = this.models.tabs.models;
			var tabpaneCollection= null; 
			for (var index = 0; index < tabs.length; index++) {
				
				var config = _getPaneConfig(tabs, index);
			
				if(config.dataURL !== null && !_.isUndefined(config.dataURL)){ 
					var restConfig = { 
	                defaults : {
	                    contentType: 'application/json',
	                    url: config.dataURL
	                }
	            };
				
					tabpaneCollection = new Lightsaber.Core.Collection(null, {
						rest: restConfig
					});
				}else {
					tabpaneCollection = new Lightsaber.Core.Collection(null, {});
				}
				
				tabpaneCollection.tabId = config.id;
				var tabpaneViewModel = new TabpaneViewModel({
					models : {
						items : tabpaneCollection
					}
					}
				);
				tabpaneViewModel.setConfig('ignoreListForFilter', config.ignoreListForFilter);
				paneVMDetails[config.id] = {
					id : config.id,
					config : config,
					paneVM : tabpaneViewModel
				};
				
				this.trigger("ossui:configurabletab:panevm:loaded", {paneVM : tabpaneViewModel});
			}
		}
	});

	return ConfigurableTabViewModel;

});

/**
* $Id: //depot/Applications/OSSUI/v10.1.0.0/components/ossui-client-zip/src/main/webapp/lib/amdocs/ossui/components/navigation/ModuleRegistry.js#1 $
* $DateTime: 2017/06/08 19:26:36 $
* $Revision: #1 $
* $Change: 1837971 $
*
* COPYRIGHT NOTICE:
* Copyright (c) 2013 Amdocs.
* The contents and intellectual property contained herein,
* remain the property of Amdocs.
* 
* */ 

define(
        'ossui/navigation/ModuleRegistry',
        [ 'jquery', 'underscore', 'lightsaber' ],
        function($, _, Lightsaber) {

            /**
             * ModuleRegistry contains the list of modules participate in an Application
             * and its dependencies (i.e., - dependent modules)
             * 
             * Each entry in this registry represents a module and contains configuration 
             * details (module config) required to manage (load/instantiate) a module in
             * Lightsaber environment.
             * 
             * Also it can contain any specific configuration parameters required by that module.
             * 
             * Eg.: 'breadcrumbsSelector' - parameter is only configured for 'Breadcrumb controller'
             * and it needs that parameter.
             */
            var ModuleRegistry = function() {

            };
            
            /**
             * This object should be (prototype) extended by the application(s) 
             * by providing the list of modules to load and manage within that application.
             * 
             * <code>
             * Format:
             * 
             *      {
             *          'module_id_1' : [ {
             *                                  id : 'module_id_2',
             *                                  el : 'jquery selector of the DOM element to which this module will be attached.',
                                                module : 'app/amdocs/ann/container/pages/ann-search-tab',
                                                browserHistory : false,
             *                             }      
             *                          ],
             *                       
             *          'module_id_2' : [ {
             *                                  id : 'module_id_3',
             *                             }      
             *                          ], 
             *          .......
             *          .......
             *          .......
             *      }
             *      
             * </code>
             */
            ModuleRegistry.prototype.registryObject = {};
            
            /**
             * Retrieve the module configuration entries configured for a given module 
             * represented by given 'moduleId'
             * 
             * @param moduleId - ID of the module
             * @returns entries configured for the given module using it's id - 'moduleId'
             */
            ModuleRegistry.prototype.getModulesToRegister = function(moduleId) {
               
                //Way to deep clone. UnderscoreJS's clone is just a shallow copy.
               return $.extend(true, [], this.registryObject[moduleId]);
              
            };
            
            return ModuleRegistry;
        });
/**
* $Id: //depot/Applications/OSSUI/v10.1.0.0/components/ossui-client-zip/src/main/webapp/lib/amdocs/ossui/components/navigation/ControllerModule.js#1 $
* $DateTime: 2017/06/08 19:26:36 $
* $Revision: #1 $
* $Change: 1837971 $
*
* COPYRIGHT NOTICE:
* Copyright (c) 2013 Amdocs.
* The contents and intellectual property contained herein,
* remain the property of Amdocs.
* 
* */ 
define('ossui/navigation/ControllerModule', [ 'underscore',
         'backbone',
         'lightsaber',
         'ossui/application/view/Module',
         'ossui/navigation/ModuleRegistry'], 
        function(_, Backbone, Lightsaber, Module, ModuleRegistry) {
    
    /**
     * 
     * This is a base module for all controller modules which are capable of performing some specialist operations. 
     * 
     * Like Breadcrumb controller module handles breadcrumb related events and manages its child modules using breadcrumbs. 
     * It can't manage the events triggered by its children directly because it never listens to them. When it's child 
     * modules ask it to listen to them, it just delegates that work to its nearest parent module of type EventManagerModule.
     * 
     */
    var controllerModule = Module.extend({
        // Do Nothing.
    
    });
    
    _.extend(controllerModule.prototype, Backbone.Events, {
    
        /**
         * Pre-initialization steps....
         * 
         * - Read the navigation config object to get the list of Modules (of type OSSUI.ObservableModule) required by this Module.
         * 
         * - Register these Modules (required by Backbone/UXF to load/instantiate those modules later).
         * 
         * - Trigger 'listenToMe' event (OSSUIEvent:module:listenToMe) on its parent module 
         *   (it should be of type OSSUI.EventManagerModule) so that its parent module can listen this module. 
         *   It allows this module to trigger OSSUIEvent(s) and the parent module can manage those events accordingly.
         * 
         * - Bind the event handler methods which are responsible for handling OSSUIEvent:module:listenToMe & 
         *   OSSUIEvent:module:stopListeningToMe events from it's child modules. And these event handler methods just delegates 
         *   the events to parent modules as mentioned below.
         */
        preInit : function(options) {
            _.bindAll(this, '_delegateListenToMeEvent', '_delegateNeglectMeEvent');
            
            this.moduleInstances = {};
            
            var navConfig = new ModuleRegistry();
            var modules = navConfig.getModulesToRegister(this.id);
            var noOfModules = (modules !== undefined) ? modules.length : 0;
            
            if (noOfModules > 0) {
                for (var count = 0; count < noOfModules; count++) {
                    if (! modules[count].el) {
                        modules[count].el = this.$el.find(modules[count].relativeElement);
                    }
                }                
            }
            
            this.registerModulesWithHistoryFalse(modules);
            
            this.options.parent.trigger("OSSUIEvent:module:listenToMe", this);
            
            this.on("OSSUIEvent:module:listenToMe", this._delegateListenToMeEvent);
            this.on("OSSUIEvent:module:stopListeningToMe", this._delegateNeglectMeEvent);
        },
        
        /**
         * Callback method for handling OSSUIEvent:module:listenToMe event from child modules.
         * 
         * Delegates the OSSUIEvent:module:listenToMe event to its parent module [of type {@link EventManagerModule}] 
         * It never listens (at least till now) to the child modules directly. It delegates that work to its parent module.
         * 
         * @param childModule - Child Module object. 
         */
        _delegateListenToMeEvent : function(childModule) {
            //console.log("===========> Register : " + childModule.id + " with '" + this.id + "'");
            
            /**
             * Sorry, I'm busy and can't listen to my children. May be my parent can, hence delegating to them.
             */
            this.options.parent.trigger("OSSUIEvent:module:listenToMe", childModule);            
        },
        
        /**
         * Callback method for handling OSSUIEvent:module:stopListeningToMe event from child modules.
         * 
         * Delegates the OSSUIEvent:module:listenToMe event to its parent module to stop them listening to the given child module.
         * 
         * @param childModule - Child Module object.
         */
        _delegateNeglectMeEvent : function(childModule) {
            //console.log("===========> Deregister : " + childModule);
            
            /**
             * Sorry, I'm busy and can't listen to my children. May be my parent can, hence delegating to them.
             */
            this.options.parent.trigger("OSSUIEvent:module:stopListeningToMe", childModule);
        },
        
        /**
         * Abstract method and should be overridden by the extending modules to provide the implementation for 
         * handling the events of its specific type. Currently eventData.eventAction parameter is used to denote 
         * the operation that needs to be performed by the controller. 
         * 
         * This can be improved on case-by-case basis for different controllers and that logic should be sync-ed 
         * with the child module(s) which are triggering the events.
         * 
         * @param eventData - Event Data object object with two mandatory parameters, 
         * eventType    - Possible values are, breadcrumb & tab. This is used to identify the relevant ControllerModule 
         *                to perform the eventAction.
         * eventAction  - Represents the action that needs to be done by the controller module. 
         *                Ex.: createBreadcrumb - creates a new breadcrumb and loads a module.
         */
        handleEvent : function(eventData) {
            // Should be overridden by extending Modules
        },
        
        /**
         * Destroy this module cleanly by removing all the event listeners and 
         * calling the module's destroy method.
         * 
         */
        destroy : function () {
            /**
             * Trigger 'stopListeningToMe' event on 'parent' in order to stop listened by 
             * nearest parent module of type 'EventManagerModule'.
             */ 
            this.options.parent.trigger("OSSUIEvent:module:stopListeningToMe", this);
            Module.prototype.destroy.call(this);
        }
    });
    return controllerModule;
});

define('text!lib/amdocs/ossui/components/hyperlink/view/template/hyperlink.html',[],function () { return '<a data-uxf-point="buttonElement" data-role="button">\n\t<span class=\'ossui-hyperlink-text\'> <%-text%>\n\t</span> <span\n\tclass=\'ossui-hyperlink-icon\'></span>\n</a>';});

define('ossui/widget/HyperlinkView', [ 'jquery', 'underscore', 'lightsaber', 'text!lib/amdocs/ossui/components/hyperlink/view/template/hyperlink.html'
                                      ], function($, _, Lightsaber,
        defaultlinktemplate, defaultImagePath) {

    var hyperlinkView = Lightsaber.ButtonView.extend({
        /**
         * Overriden to retrieve user template and pass it to template else
         * provide the default link template for OSSUI
         */
        _preRender : function() {
            var mytemplate = this.getConfig('template');

            if (!mytemplate) {
                this.template = defaultlinktemplate;
            }
        },
        
        /**
         * Overriden to give workaround for UXF bug where it changes 
         * the complete span content instead of just name when the name is changed
         * in view model
         */
        refresh : function(event){
            if(event && (this.tagName !== 'input')) {
                this.$root.find('.ossui-hyperlink-text').contents()[0].data = event.value ;
                this.$root.button('refresh');
            } else {
                this._super(event);
            }
        
        },
        
        _postRender : function(){
            this._super();
            this.$root.addClass('ossui-hyperlink-class');
            var iconClass = this.getConfig('hyperlinkIconClass');            
            if(iconClass){
                this.$root.find('.ossui-hyperlink-icon').addClass(iconClass);
            }
            var iconHoverClass = this.getConfig('hyperlinkHoverIconClass');
            if(iconHoverClass){
                this.$root.on('mouseover', _.bind(function() {
                    this.$root.find('.ossui-hyperlink-icon').addClass(iconHoverClass);
                }, this));
                this.$root.on('mouseout', _.bind(function() {
                    this.$root.find('.ossui-hyperlink-icon').removeClass(iconHoverClass);
                }, this));
            }else {
                this.$root.on('mouseover', _.bind(function() {
                    this.$root.find('.ossui-hyperlink-icon').addClass('ossui-hyperlink-icon-hover');
                }, this));
                this.$root.on('mouseout', _.bind(function() {
                    this.$root.find('.ossui-hyperlink-icon').removeClass('ossui-hyperlink-icon-hover');
                }, this));
            }           
        } 
    });
    return hyperlinkView;

});
/**
* $Id: //depot/Applications/OSSUI/v10.1.0.0/components/ossui-client-zip/src/main/webapp/lib/amdocs/ossui/components/utils/OssuiConfigData.js#1 $ 
* $DateTime: 2017/06/08 19:26:36 $ 
* $Revision: #1 $ 
* $Change: 1837971 $
*
* COPYRIGHT NOTICE:
* Copyright (c) 2013 Amdocs.
* The contents and intellectual property contained herein,
* remain the property of Amdocs.
* 
* */

define('ossui/utils/OSSUIConfigurationData',[
    'underscore',
    'lightsaber' 
], function(_, Lightsaber) {

    var OSSUIConfigurationData = function(){};
    
    /**
     * The resourceBundle is maintained as static so that it can be
     * accesssed anywhere in the application after populating it
     * without having to instantiate the  OSSUIResourceBundle
     */
    OSSUIConfigurationData.prototype.configMap = {};
    
    /**
     * Returns the config param based on the two level of info sent as key
     * e.g. if the 'maxNoOfTabs' config data for the OSSUI application is needed
     * the query should be OSSUIConfigurationData.prototype.getConfig('OSSUI','maxNoOfTabs')
     * The appName follows the name sent in the URL for the REST call to retrieve the 
     * configuration
     */
    OSSUIConfigurationData.prototype.getConfig = function(appName, key){
        if(this.configMap[appName]){
            return this.configMap[appName][key];
        }else{
            return "";
        }
    };    
    
    return OSSUIConfigurationData;
    
});
define('ossui/widget/ModalDialogCallback' ,[ 'jquery', 'underscore', 'lightsaber' ], function($, _, Lightsaber) {
    
 
        var ModalDialogCallback = new Lightsaber.Core.ViewModel();
        return ModalDialogCallback;

});
/**
* $Id: //depot/Applications/OSSUI/v10.1.0.0/components/ossui-client-zip/src/main/webapp/lib/amdocs/ossui/components/modaldialog/view/ModalDialogView.js#1 $ 
* $DateTime: 2017/06/08 19:26:36 $ 
* $Revision: #1 $ 
* $Change: 1837971 $
*
* COPYRIGHT NOTICE:
* Copyright (c) 2013 Amdocs.
* The contents and intellectual property contained herein,
* remain the property of Amdocs.
* 
* */
define('ossui/widget/ModalDialogView',['jquery',
         'underscore',
         'lightsaber','ossui/widget/ModalDialogCallback'],
        function($, _, Lightsaber,ModalDialogCallback) {
            
            var ModalDialogView = Lightsaber.PopupView.extend({
                callbackvm : null,
                defaultdialogtemplate : '<div id="ossui-modaldialogview"><span>Do you want to save the changes?<span></div> ', 
                config : {
                    position : 'center',
                    resizable : false,
                    show: 'fade',
                    hide: 'fade',
                    modal: true,
                    title: 'Confirm',
                    width : 440,
                    height: 200,
                    autoRender:false,
                    autoShow : true,
                    dialogClass : 'ossui-lightbox ossui-modaldialog',
                    buttons : [  {
                                        text : 'Ok',
                                        click : function(event) {
                                            ModalDialogCallback
                                                    .trigger('OkClicked');
                                            $(this).dialog("close");
                                        }
                                    },

                                    {
                                        text : 'Cancel',
                                        click : function(event) {
                                            ModalDialogCallback
                                                    .trigger('CancelClicked');
                                            $(this).dialog("close");
                                        }
                                    }  ],
                    createContent : function (self){ 
                        self.contentView = new Lightsaber.Core.View({
                            config: {
                                template : '<div id="ossui-modaldialog" class="ossui-modaldialog"></div>'
                               // template : self.dialogtemplate
                            },
                            viewModel : new Lightsaber.Core.ViewModel()
                        });
                        var modalDialogView = new Lightsaber.Core.View({
                            config: {
                                template :  self.dialogtemplate
                            },
                            viewModel : new Lightsaber.Core.ViewModel(),
                            el : self.contentView.$el
                        });
                        return self.contentView.$el;
                      }
                },
                initialize: function(options) {
                    _.bindAll(this,'okClicked','cancelClicked');
                    ModalDialogCallback.on('OkClicked',this.okClicked);
                    ModalDialogCallback.on('CancelClicked',this.cancelClicked);
                    this.dialogtemplate = this.getConfig('dialogtemplate') || this.defaultdialogtemplate;
                    this.callbackvm = this.getConfig('callbackvm') ;
                    //if the entire config is customized by user
                    if( this.getConfig('modalconfig') ){
                        this.config = this.getConfig('modalconfig');
                    }
                    if(options){
                        this.setCustomConfigParams(options);
                    }                    
                    this._super();
                }  ,
                
                /**
                 * if customization of individual items in the modal dialog is needed
                 * it can be set by setting them in options
                 */
                /*jshint maxcomplexity: 7 */
                setCustomConfigParams : function(options){
                    if(options.title){
                        this.setConfig('title', options.title);
                    }
                    if(options.width){
                        this.setConfig('width', options.width);
                    }
                    if(options.height){
                        this.setConfig('height', options.height);
                    }
                    if(options.buttons){
                        this.setConfig('buttons', options.buttons);
                    }
                    if(options.dialogClass){
                        this.setConfig('dialogClass', options.dialogClass);
                    }
                },
                                
                okClicked : function(){
                    //the viewModel should register to the 'OkClicked' event
                    this.viewModel.trigger('OkClicked');
                },
                cancelClicked : function(){
                  //the viewModel should register to the 'CancelClicked' event
                    this.viewModel.trigger('CancelClicked');
                }
                
            });

            return ModalDialogView;
        });
/**
* $Id: //depot/Applications/OSSUI/v10.1.0.0/components/ossui-client-zip/src/main/webapp/lib/amdocs/ossui/components/controllers/BreadcrumbController.js#2 $
* $DateTime: 2017/06/28 17:41:31 $
* $Revision: #2 $
* $Change: 1859035 $
*
* COPYRIGHT NOTICE:
* Copyright (c) 2013 Amdocs.
* The contents and intellectual property contained herein,
* remain the property of Amdocs.
*
* */

define( 'ossui/controllers/BreadcrumbController', [
         'underscore',
         'backbone',
         'lightsaber',
         'ossui/navigation/ControllerModule',
         'ossui/widget/BreadcrumbsView',
         'ossui/widget/HyperlinkView',
         'ossui/utils/OSSUIConfigurationData',
         'ossui/widget/ModalDialogView',
         'ossui/utils/OSSUIResourceBundle',
         'ossui.messaging'],
        function(_, Backbone, Lightsaber, ControllerModule, BreadcrumbsView, HyperlinkView, OSSUIConfigurationData, OSSUIModalDialog, OSSUIResourceBundle, Messaging) {

    /**
     * Breadcrumb Controller Module for managing breadcrumbs and their related modules.<br>
     *
     * <ol>
     * <li>Configuration:
     *   <ul>
     *     <li>
     *       The breadcrumb controller creates and manages modules that are registered in the {@link modules} array.<br>
     *       To allow the breadcrumb controller to create your module add a new module configuration object to the {@link modules} array.
     *     </li>
     *     <li>
     *       The {@link _createModule} function needs to be updated to make it aware of any new modules that have to be created.
     *     </li>
     *   </ul>
     * </li>
     *
     * <li>Creating new breadcrumbs:
     *   <ul>
     *     <li>Upon creation, new modules are passed a configuration object containing a callback property to create a breadcrumb: annAddBreadcrumbCallback.<br>
     *         This callback will invoke the function {@link createBreadcrumb}. Please refer to this function for a description of the parameters required by the callback.
     *     </li>
     *   </ul>
     * </li>
     *
     * <li>Activating a breadcrumb:
     *   <ul>
     *     <li>When a breadcrumb is clicked in the breadcrumbs view, the breadcrumb click handler is invoked ({@link breadcrumbClickHandler}).
     *         This will show the breadcrumb element in the DOM, which encapsulates the module contents, and will hide all others.
     *     </li>
     *   </ul>
     * </li>
     *
     * <li>Removing a breadcrumb:
     *   <ul>
     *     <li>Upon creation, new modules are passed a configuration object containing a callback property to remove breadcrumbs to the right of the current breadcrumb:
     *         annRemoveBreadcrumbsCallback.<br>
     *         This callback will invoke the function {@link removeBreadcrumbs}. Please refer to this function for a description of the parameters required by the callback.
     *     </li>
     *   </ul>
     * </li>
     * </ol>
     *
     * Breadcrumbs are identified by a unique <strong>route</strong> property. Each of the breadcrumb modules is mapped to a route in the {@link breadcrumbStateManager} and
     * the DOM element encapsulating the module is also identified by same route property. In summary, the route identifier binds breadcrumbs, modules and DOM elements.
     * If, for example, a breadcrumb needs to be shown, the corresponding DOM element that needs to be displayed can be found by using the identifier (route) of the breadcrumb.
     * Similarly, if a breadcrumb needs to be deleted, the corresponding module and DOM element that need to be destroyed can be found using the route property.
     *
     * @augments Lightsaber.Module
     */

    var BreadcrumbsControllerModule = ControllerModule.extend({
        /**
         * Object with properties and functions that allow the breadcrumb controller to manage the creation, deletion and display of breadcrumbs and modules.<br>
         *
         * It has the following responsibilities:
         * <ul>
         * <li>Add new breadcrumb routes to a route array.</li>
         * <li>Add new modules to a module object that maps modules to their corresponding breadcrumb route.</li>
         * <li>Record the current breadcrumb route. This is the active breadcrumb.</li>
         * <li>Activate the breadcrumb to display it and hide all others.</li>
         * </ul>
         *
         */
        stateMgr : {

            add : function(breadcrumbConfig,moduleConfig) {
                // Don't duplicate, add only if new
                if (!_.contains(this.routes, breadcrumbConfig.route)) {
                    this.routes.push(breadcrumbConfig.route);
                    //since the module instance is present inside breadcrumbConfig.instance
                    //the complete breadcrumbConfig is stored
                    //note the load of Module via requirejs is not a sync call
                    //hence the new Module() may be called
                    //TODO check requirejs for a synchronous call so that the instance
                    //object is available immediately
                    this.modules[breadcrumbConfig.route] = moduleConfig;
                }
                //this.setActive(breadcrumbConfig);
            },

            remove : function(route) {
                var moduleConfig = this.modules[route];
                if (_.isFunction(moduleConfig.instance.destroy)) {
                    moduleConfig.instance.destroy(moduleConfig);
                }

                // remove the DOM element
                $('div[data-uxf-point="' + route + '"]').off();
                $('div[data-uxf-point="' + route + '"]').remove();

                // remove module reference
                delete this.modules[route];

                // remove route from routes array
                this.routes.splice(_.indexOf(this.routes, route), 1);
            },

            setActive : function(breadcrumbConfig) {
                if (this.currentRoute !== breadcrumbConfig.route) {
                    this.currentRoute = breadcrumbConfig.route;
                    this.display(breadcrumbConfig);
                }
            },

            display : function(breadcrumbConfig) {
                // hide the content of all other breadcrumbs
                _.each(this.routes, function(route) {
                    if(route !== this.currentRoute) {
                        //$(breadcrumbConfig.breadcrumbRootSelector + ' div[data-uxf-point="' + route + '"]').hide('slide', {direction: 'left'}, 500);
                        $(breadcrumbConfig.breadcrumbRootSelector + ' div[data-uxf-point="' + route + '"]').hide();
                    }
                }, this);

                // show the content of the current breadcrumb
                //$(breadcrumbConfig.breadcrumbRootSelector + ' div[data-uxf-point="' + breadcrumbConfig.route + '"]').show('slide', {direction: 'right'}, 500);
                $(breadcrumbConfig.breadcrumbRootSelector + ' div[data-uxf-point="' + breadcrumbConfig.route + '"]').show();

            },

            getModule : function(route){
                return this.modules[route].instance;
            }
        },

        /*
         * template for the breadcrumbs controller. Currently it contains the div for remove breadcrumb only.
         */
        template : '<div id="remove-breadcrumb-button" class="remove-breadcrumb-button"></div>',
        /*
         * template for the remove breadcrumb button. Since it is a hyperlink the ossui hyperlink's default
         * template is overriden here
         */
        removeBCTemplate : '<a class="ossui-hyperlink-class" data-uxf-point="buttonElement" data-role="button"><span class="ossui-breadcrumbs-divider">&lt;</span><%=text%></a>',


        eventType : 'breadcrumb',

        /*
         * Default max breadcrumbs configuration
         */
        maxNumberOfBreadcrumbs : 20,

        /**
         * @see Lightsaber.Module#init
         *
         * Overrides the Lightsaber.Module init function. Entry point upon creation of the breadcrumb controller.
         * <ol>
         * <li>Creates an OSS UI Framework BreadcrumbsView. This is configured to be application managed,
         * which means the removal of breadcrumbs is managed by the breadcrumb controller.</li>
         * <li>Sets the initial state for the breadcrumb controller. This involves creating an initial {@link SearchModule},
         * without any breadcrumbs. This state is specific to the ANN Search application.</li>
         * </ol>
         *
         * @param options Module configuration options.
         */
        init : function(options) {
            _.bindAll(this, 'createBreadcrumb', 'removeBreadcrumbs', 'breadcrumbClickHandler','createBreadcrumbLoadModule',
                '_setInitialState', '_createModule', '_getBreadcrumbContentWrapper', '_getRoute', '_isNewRoute','_updateBreadcrumbConfig',
                '_isLastBreadcrumb','_removeLastBreadcrumb','_reset','_triggerToolboxEvents');

            this.setMaximumNumberOfBreadcrumbs();
            var breadcrumbsSelector = options.breadcrumbsSelector;
            this.idOfFirstModuleToLoad = options.registeredIdOfFirstModuleToLoad;

            // Deep clone(!) to avoid sharing of object literals between two instances of this module.
            this.breadcrumbStateManager = _.clone(this.stateMgr, true);

            // Reset the variables for this instance.
            this.breadcrumbStateManager.currentRoute = '';
            this.breadcrumbStateManager.routes = [];
            this.breadcrumbStateManager.modules = {};

            // Create breadcrumb view
            this.breadcrumbView = new BreadcrumbsView({
                config : {
                    el : this.$el.siblings(breadcrumbsSelector),
                    applicationMangedBC : true
                },
                viewModel : new Lightsaber.Core.ViewModel()
            });
            this.removeLastBCButtonName = options.removeBCButtonName;

            // Load the first registered module, hoping this is part of the initial
            //registration else it will fail
            this._setInitialState({registeredModuleId : this.idOfFirstModuleToLoad},this.removeLastBCButtonName);

            var parentWindow = window.parent,
                parentUrl = Messaging.messageUtils.getTargetUrl(document.referrer),
                messageOptions = {
                    targetUrl : parentUrl,
                    targetWindow : parentWindow
                };

            this.clientMessageService =  Messaging.messageServiceFactory.createMessageService(Messaging.constants.MODE_CLIENT, messageOptions);
            this.clientMessageService.subscribe(this._reset, 'OSSUI.resetbreadcrumbs');

        },

        /**
         * This function sets the max number of breadcrumbs into the maxNumberOfBreadcrumbs variable.
         *
         * Applications can override this method to set their own values of max number Breadcrumb
         */
        setMaximumNumberOfBreadcrumbs : function(){
           /* var maxNoOfBCConfig = OSSUIConfigurationData.prototype.getConfig('ossui', 'ossui_maximumNoOfBreadcrumbs');
            if(maxNoOfBCConfig){
                this.maxNumberOfBreadcrumbs = maxNoOfBCConfig;
            }*/
        },

        /**
         * Creates a breadcrumb and its related module.
         *
         * <ol>
         * <li>The new breadcrumb is given a unique route identifier. This route is stored in the {@link breadcrumbStateManager} object.</li>
         * <li>The type of module to be created is passed in the breadcrumbConfig parameter.</li>
         * <li>A reference to the new module is stored in the {@link breadcrumbStateManager} keyed on the breadcrumb route identifier.</li>
         * <li>The new module element in the DOM is encapsulated is a wrapper element that is uniquely identified with the breadcrumb route identifier.<br>
         * Consequently, the breadcrumb and its corresponding HTML content are bound by the same breadcrumb route identifier.</li>
         * <li>The breadcrumbConfig parameter may contain an optional payload object that is used to pass information to the new module.<br>
         * The content of the payload object is flexible and dependent on the requirements of the new module created.
         * </ol>
         *
         * @param breadcrumbConfig Required breadcrumb configuration.
         * @param {String} [breadcrumbConfig.name] The name of the breadcrumb to be displayed.
         * @param {String} [breadcrumbConfig.registeredModuleId] The identifier of a registered module in {@link this.modules}.
         *                  This will determine the type of module to be created.
         * @param {Object} [breadcrumbConfig.payload] Object used to pass data to the new module.
         */
        createBreadcrumbLoadModule : function(breadcrumbConfig) {
          if(this.maxNumberOfBreadcrumbs === undefined || this.maxNumberOfBreadcrumbs === null)
            return;  //something gone wrong in loading, such as unauthorised error; don't proceed.

            if(this.breadcrumbStateManager.routes.length < this.maxNumberOfBreadcrumbs) {
                this._updateBreadcrumbConfig(breadcrumbConfig);

                breadcrumbConfig.route = this._getRoute(breadcrumbConfig.registeredModuleId);
                //only if breadcrumbConfig contains a name for the breadcrumb add it to the breadcrumbsview

                if(breadcrumbConfig.name){
                    this._addBreadcrumb(breadcrumbConfig);
                }

            // Handle state and create the module if new
                if (this._isNewRoute(breadcrumbConfig)) {
                    var module = this._createModule(breadcrumbConfig);
                    this.breadcrumbStateManager.add(breadcrumbConfig, module);
                    }
                }else {
                    this.handleMaxNumberOfBreadcrumbsExceeded();
               }
        },

        /**
         * Updates the breadcrumbRootSelector in the breadcrumbsConfig
         * @param breadcrumbConfig
         * @returns breadcrumbConfig
         */
        _updateBreadcrumbConfig : function(breadcrumbConfig){
            var moduleConfig = this.getModuleConfig(breadcrumbConfig.registeredModuleId);
            breadcrumbConfig.breadcrumbRootSelector = moduleConfig.el;
            breadcrumbConfig.singletonModulePerTab = moduleConfig.singletonModulePerTab;
        },

        /**
         * This is called by applications if they want to just add the breadcrumbs
         * @param breadcrumbConfig : argument from caller
         */
        createBreadcrumb : function(breadcrumbConfig){
            this._updateBreadcrumbConfig(breadcrumbConfig);
            this._addBreadcrumb(breadcrumbConfig);

        },

        _addBreadcrumb : function(breadcrumbConfig){
            this.breadcrumbView.add({
                route : breadcrumbConfig.route,
                name : breadcrumbConfig.name,
                bcIconClass : breadcrumbConfig.bcIconClass,
                breadcrumbRootSelector : breadcrumbConfig.breadcrumbRootSelector,
                handler : this.breadcrumbClickHandler
                });
            $('div[data-uxf-point="' + breadcrumbConfig.route + '"]').trigger("OSSUIEvent:breadcrumbAdded");
        },

        /**
         * Removes all breadcrumbs to the right of the current breadcrumb which is identified by the provided currentRoute parameter.
         *
         * <ol>
         *   <li>Destroys the module related to the breadcrumb.</li>
         *   <li>Removes the DOM element holding the module content.</li>
         *   <li>Removes the breadcrumb from the breadcrumb view.</li>
         *   <li>Updates the {@link breadcrumbStateManager} to clear the routes and modules registers.</li>
         * </ol>
         *
         * @param currentRoute Breadcrumb route identifier for the current breadcrumb. Breadcrumbs will be removed to the right of this breadcrumb.
         * @param hideLastBreadcrumb Whether to remove the last breadcrumb view without removing it from the breadcrumb state manager.
         */
        removeBreadcrumbs : function(currentRoute, hideLastBreadcrumb) {
            // Find the position of the current breadcrumb
            var currentBreadcrumbIndex = _.indexOf(this.breadcrumbStateManager.routes, currentRoute);
            var bcIdx = this.breadcrumbStateManager.routes.length -1;

            // Delete breadcrumbs from right to left up to the current breadcrumb
            for (bcIdx; bcIdx > currentBreadcrumbIndex; bcIdx--) {
                var route = this.breadcrumbStateManager.routes[bcIdx];
                this._removeRoute(route);
            }

            // If there exists a last breadcrumb, remove the view but retain it in the breadcrumb state manager
            var lastBreadcrumbRoute = this.breadcrumbStateManager.routes[0];
            if (hideLastBreadcrumb && !_.isUndefined(lastBreadcrumbRoute)) {
                this.breadcrumbView.remove(lastBreadcrumbRoute);
            }
        },

        _removeRoute : function(route, options){
            options = options? options : {};
            // update the state manager
            this.breadcrumbStateManager.remove(route);
            // remove the breadcrumb in the view
            this.breadcrumbView.remove(route);
            if (!options.silent) {
                //reactivate the last breadcrumb
                this.breadcrumbView.$el.find('.ossui-breadcrumbs-selecteditem').find('[data-uxf-point^="anchor_"]').trigger('click');
            }
        },
        /**
         * Returns true if this is the final breadcrumb in the list
         */
        _isLastBreadcrumb : function(currentRoute){
            var currentBreadcrumbIndex = _.indexOf(this.breadcrumbStateManager.routes, currentRoute);

            var indexOfLastBreadcrumb = this.breadcrumbStateManager.routes.length -1;

            if (currentBreadcrumbIndex === indexOfLastBreadcrumb){
                return true;

            }
            else{
                return false;
            }

        },

        /**
         * When Maximum no of breadcrumbs is exceeded a warning is shown to the user
         * If application wants to customise the handling this method can be
         * overridden by the application
         */
        handleMaxNumberOfBreadcrumbsExceeded : function(){
            var modalWarningWindow = new OSSUIModalDialog({
                viewModel :  new Lightsaber.Core.ViewModel(),
                title : OSSUIResourceBundle.prototype.getMessage('ossui.labels.heading.breadcrumbs.maxBCExceededTitle'),
                height : 212,
                buttons :   [  {
                    text : OSSUIResourceBundle.prototype.getMessage('ossui.labels.button.okString'),
                    click : this._handleDialogClose

                } ],
                config  : {
                dialogtemplate : '<span class="ossui-error-messageicon"></span><span>' +
                OSSUIResourceBundle.prototype.getMessage('ossui.errorMessages.breadcrumbs.maxBCExceededError')+
                '</span>'
                }
            });
            modalWarningWindow.render();
        },

        /**
         * Default handling for the close of the warning message
         */
        _handleDialogClose : function(){
            //here this is the dialog's reference
            $(this).dialog("close");
        },

        /**
         * Handles the activation of a breadcrumb. It is invoked when a user clicks on a breadcrumb in the breadcrumb view.
         *
         * @param breadcrumbConfig Configuration information for the selected breadcrumb.
         */
        breadcrumbClickHandler : function(breadcrumbConfig) {
            this.breadcrumbStateManager.setActive(breadcrumbConfig);

            // Tell this module to reactivate itself (hence activating its padlock)
            var module = this.breadcrumbStateManager.getModule(breadcrumbConfig.route);
            var options = {};
            options.hasChild = !this._isLastBreadcrumb(breadcrumbConfig.route);

            if (_.isFunction(module.reactivate)){
                module.reactivate(options);
            }

            // Reposition the Toolbox in the active breadcrumb.
            this._triggerToolboxEvents('repositionToolbox');

            var data = {};
            var payload = {};
            payload = module.moduleState.moduleUniqueId;
            data.payload = payload;

            this.clientMessageService.publish(data, 'OSSUI.breadcrumbclicked');
        },


        /**
         * Sets the initial state of the breadcrumb controller module. Creates a new module and adds it to the state manager.<br>
         * However, in this particular ANN Search use case it does not create a breadcrumb.
         *
         * @param config Initial configuration
         */
        _setInitialState : function(breadcrumbConfig,removeLastBCButtonName) {
            if(removeLastBCButtonName){
                this._addRemoveLastBreadcrumbButton(removeLastBCButtonName);
            }
            this.createBreadcrumbLoadModule(breadcrumbConfig);
        },

        _addRemoveLastBreadcrumbButton : function (buttonName){
            this.removeBCButtonVM = new Lightsaber.Core.ViewModel({
                data : {
                    label : buttonName
                },
                config : {
                    actions : {
                        click : this._removeLastBreadcrumb
                    }
                }
            });
            this.removeBreadcrumbButton = new HyperlinkView({
                el : this.$(".remove-breadcrumb-button"),
                viewModel : this.removeBCButtonVM,
                config :{
                    template : this.removeBCTemplate
                }

            });

        },

        removeLastBreadcrumb : function(options) {
            options = options? options : {};
            var lastRoute = this.breadcrumbStateManager.routes[this.breadcrumbStateManager.routes.length - 1];
            //defect #17477 - Don't try to remove a breadcrumb when there isn't one visible.
            //defect 17681 - But do allow it through if its the tab controller closing down the entire tab
            if (this.breadcrumbView.routes.length > 0 || (!_.isUndefined(options) && options !== null && options.silent)){
                var loadInitialState = this.breadcrumbView.routes.length === 1 && !options.silent;
                this._removeRoute(lastRoute, options);
                if(loadInitialState) {
                    //if back button is clicked when only single breadcrumb is present
                    //the initial state should be restored
                    this._setInitialState({registeredModuleId : this.idOfFirstModuleToLoad});
                } else if(this.breadcrumbView.routes.length > 1){
                    var newLastRoute = this.breadcrumbStateManager.routes[this.breadcrumbStateManager.routes.length - 1];
                    var breadcrumbConfig = { registeredModuleId : this.breadcrumbStateManager.getModule(newLastRoute).id , route :newLastRoute};
                    this._updateBreadcrumbConfig(breadcrumbConfig);
                    this.breadcrumbStateManager.setActive(breadcrumbConfig);
                    $('div[data-uxf-point="' + breadcrumbConfig.route + '"]').trigger("OSSUIEvent:breadcrumbRemoved");
                }
            }
        },

        /**
         * action handler for remove last breadcrumb hyperlink
         */
        _removeLastBreadcrumb : function(event, options){
            // Cut and save the Toolbox somewhere safely.
            this._triggerToolboxEvents('cutToolbox');

            // Now remove the DOM elements represents the last breadcrumb
            var removeBCEventData = {
                    eventType : 'breadcrumb',
                    eventAction : 'removeLastBreadcrumb',
                    options: options,
                    payload : {}
            };
            this.trigger("OSSUIEvent", removeBCEventData);

            // Reposition the Toolbox in the active breadcrumb.
            this._triggerToolboxEvents('repositionToolbox');
        },

	    reset : function() {
		    while (this.breadcrumbStateManager.routes.length !== 0) {
			    this._removeLastBreadcrumb(null, {silent: true});
		    }

		    this._setInitialState({registeredModuleId : this.idOfFirstModuleToLoad});
	    },

	    /**
	     * action handler for remove last breadcrumb hyperlink
	     */
	    _reset : function(event){
		    // Cut and save the Toolbox somewhere safely.
		    this._triggerToolboxEvents('cutToolbox');

		    // Now remove the DOM elements represents the last breadcrumb
		    var resetBCEventData = {
			    eventType : 'breadcrumb',
			    eventAction : 'reset',
			    payload : {}
		    };
		    this.trigger("OSSUIEvent", resetBCEventData);

		    // Reposition the Toolbox in the active breadcrumb.
		    this._triggerToolboxEvents('repositionToolbox');
	    },

	    /**
         * Creates a new module according to the breadcrumb configuration provided.
         *
         * @param breadcrumbConfig Configuration for the breadcrumb.
         *
         * @returns {Lightsaber.Module} New module created.
         */
        _createModule : function(breadcrumbConfig) {
            // Get the configuration of the registered module and make a copy of it
            //TODO: need to check if getModuleConfig returns a value, else it should be thrown as
            //error or atleast logged. But there is no error logging mechanism
            var moduleConfig = _.clone(this.getModuleConfig(breadcrumbConfig.registeredModuleId));
            var newBreadcrumbsAreaDiv = this._createBreadcrumbContentWrapper(breadcrumbConfig.route,moduleConfig.el);
            // Augment the module configuration with breadcrumb related information
            moduleConfig.annBreadcrumbRoute = breadcrumbConfig.route;
            moduleConfig.annBreadcrumbPayload = breadcrumbConfig.payload;

            //the element is set here to the newlycreated div
            moduleConfig.el = newBreadcrumbsAreaDiv;

            this.breadcrumbStateManager.setActive(breadcrumbConfig);
            moduleConfig.annBreadcrumbModules = this.breadcrumbStateManager.modules;

            /*global requirejs:false */
            requirejs([moduleConfig.module], _.bind(function(Module) {
                //instantiate the module
                moduleConfig.instance = new Module(moduleConfig);
            }, this));
            /*global requirejs:true */

            return moduleConfig;
        },

        /**
         *
         * @param eventData
         */
        handleEvent : function (eventData) {

            if (eventData.eventAction === 'createBreadcrumbLoadModule') {
                this.createBreadcrumbLoadModule(eventData);

            } else if (eventData.eventAction === 'createBreadcrumb') {
                this.createBreadcrumb(eventData);

            } else if (eventData.eventAction === 'removeBreadcrumbs') {
                this.removeBreadcrumbs(eventData.breadcrumbRoute);

            } else if (eventData.eventAction === 'removeAllBreadcrumbs') {
                this.removeBreadcrumbs(eventData.breadcrumbRoute, true);

            } else if (eventData.eventAction === 'removeLastBreadcrumb') {
                this.removeLastBreadcrumb(eventData.options);

            } else if (eventData.eventAction === 'reset') {
                this.reset();
            }
        },

        /**
         * This method calculates the new div to which the breadcrumbsContent should be attached to
         * and returns it
         * @param route
         */
        _createBreadcrumbContentWrapper : function(route,element){
            var $breadcrumbContentAreaWrapper = this._getBreadcrumbContentWrapper(route);
            //Note :it is assumed that breadcrumbs-content-area is
            //sibling to the breadcrumbs-controller(this.$el) div element
            //if in future the content-area is changed the jquery to select the proper content area
            //will need a change

            //append the new div for breadcrumbs to the original breadcrumbs div to get a hierarchy
            //<div id=breadcrubsArea><div id=breadcrumbContentAreaWrapper></div></div>
            this.$el.siblings(element).append($breadcrumbContentAreaWrapper);
            //return the new div area
            return this.$el.siblings(element).find(this._getBreadcrumbContentWrappedElement(route));
        },

        /**
         * This method returns the new div element selector for breadcrumb content area
         * @param route : the route which distinctly identifies each div
         * @returns : jquery selector for new breadcrumb content area
         */
        _getBreadcrumbContentWrappedElement : function(route){
            return 'div[data-uxf-point="' + route +'"]';
        },

        /**
         * Wraps the module template in a breadcrumb managed DOM element that is identified by the breadcrumb route.
         *
         * @param route Breadcrumb route identifier that is used to uniquely identify the DOM element holding the module content.
         * @param moduleTemplate Template content for the module. This is wrapped by a breadcrumb managed DOM element.
         * @returns Breadcrumb wrapper template containing the module template.
         */
        _getBreadcrumbContentWrapper : function(route) {
            var breadcrumbContentTemplate = '<div data-uxf-point="<%=route%>" class="ann-breadcrumb-content"></div>';
            var compiledBreadcrumbContentTemplate = _.template(breadcrumbContentTemplate, {route : route});
            return compiledBreadcrumbContentTemplate;
        },

        /**
         * Used to return the route.
         * Only if the module is registered as singleton module the route is
         * is hardcoded as module-id-bc-managed-container
         * else a dynamically generated guid is attached to the route
         * @param registeredModuleId Identifier for the module configured in the modules array.
         * @returns {String} Unique breadcrumb route identifier.
         */
        _getRoute : function(registeredModuleId) {
                var guid = Lightsaber.Core.Utils.guid();
                return registeredModuleId + '-' + guid;
        },

        /**
         * Determines if the route passed in the breadcrumbConfig parameter exists in the {@link breadcrumbStateManager} object.
         *
         * @param breadcrumbConfig Breadcrumb configuration object containing a property with the breadcrumb route identifier.
         * @returns boolean
         */
        _isNewRoute : function(breadcrumbConfig) {
            return !_.contains(this.breadcrumbStateManager.routes, breadcrumbConfig.route);
        },

        /**
         * Trigger Toolbox events if necessary.
         *
         * @eventAction - action that needs to be performed on toolbox
         */
        _triggerToolboxEvents : function(eventAction) {

            var isToolboxEnabled = OSSUIConfigurationData.prototype.getConfig('ossui', 'ossui_enableToolbox');

            if (isToolboxEnabled === true) {
                var toolboxEventData = {
                        eventType : 'toolbox',
                        eventAction : eventAction,
                        payload : {}
                };
                this.trigger("OSSUIEvent", toolboxEventData);
            }
        },

        destroy: function() {
            //Delete all breadcrumbs loaded by this controller.
            while (this.breadcrumbStateManager.routes.length !== 0) {
                this._removeLastBreadcrumb(null, {silent: true});
            }
            this.removeBreadcrumbButton.destroy(true);
            this.removeBCButtonVM.destroy();
            this.clientMessageService.unsubscribe(this._reset,"OSSUI.resetbreadcrumbs");
            this._super();
        }
    });

    return BreadcrumbsControllerModule;

});

define('text!lib/amdocs/ossui/components/tabs/view/template/OSSUIPageTabsTemplate.html',[],function () { return '<div class="ossui-pagetabs-tabpanel"><ul class="ossui-pagetabs-nav-bar"></ul></div>\n';});

define('text!lib/amdocs/ossui/components/menu/template/MenuItemTemplate.html',[],function () { return '<li oss-ui-menu-item-id="<%=menuItemId%>">\n\t<div\n\t<% if(typeof(icon)!=\'undefined\'){ %>\n\t\tclass="ui-item-icon <%=icon%> <%=iconalign%>"\n\t<%} else{%>\n\t\tclass="ui-item-icon <%=iconalign%>" style=\'background-image:none;\'\n\t<%} %>\n\t></div>\n\t<a href=\n\t<% if(typeof(url)!=\'undefined\'){ %>\n\t\t"<%=url%>" \n\t<%} else{%>\n\t\t\'#\'\n\t<%} %>\n\tclass=\'<%=itemtextalign%>\'><%=name%></a>\n\n</li>';});

define('text!lib/amdocs/ossui/components/menu/template/UpStemTemplate.html',[],function () { return '<div class="ossui-arrow-up" style="width:25px; height:20px;/* border:1px; border-style:solid; border-color:green;*/">\n\t<div class="ossui-arrow-up-shadowcaster">\n\t\t<div class="line10"><!-- --></div>\n\t\t<div class="line9"><!-- --></div>\n\t\t<div class="line8"><!-- --></div>\n\t\t<div class="line7"><!-- --></div>\n\t\t<div class="line6"><!-- --></div>\n\t\t<div class="line5"><!-- --></div>\n\t\t<div class="line4"><!-- --></div>\n\t\t<div class="line3"><!-- --></div>\n\t\t<div class="line2"><!-- --></div>\n\t\t<div class="line1"><!-- --></div>\n\t</div>\n\t<div class="ossui-arrow-up-solid"></div>\n</div>';});

define('text!lib/amdocs/ossui/components/menu/template/DownStemTemplate.html',[],function () { return '<div class="ossui-arrow-down" style="width:25px; height:20px;/* border:1px; border-style:solid; border-color:green;*/">\n\t<div class="ossui-arrow-down-shadowcaster">\n\t\t<div class="line10"><!-- --></div>\n\t\t<div class="line9"><!-- --></div>\n\t\t<div class="line8"><!-- --></div>\n\t\t<div class="line7"><!-- --></div>\n\t\t<div class="line6"><!-- --></div>\n\t\t<div class="line5"><!-- --></div>\n\t\t<div class="line4"><!-- --></div>\n\t\t<div class="line3"><!-- --></div>\n\t\t<div class="line2"><!-- --></div>\n\t\t<div class="line1"><!-- --></div>\n\t</div>\n\t<div class="ossui-arrow-down-solid"></div>\n</div>';});

/**
* $Id: //depot/Applications/OSSUI/v10.1.0.0/components/ossui-client-zip/src/main/webapp/lib/amdocs/ossui/components/scrollbar/widget/ScrollbarWidget.js#1 $
* $DateTime: 2017/06/08 19:26:36 $
* $Revision: #1 $
* $Change: 1837971 $
*
* COPYRIGHT NOTICE:
* Copyright (c) 2013 Amdocs.
* The contents and intellectual property contained herein,
* remain the property of Amdocs.
*
* */

/**
  * parameters passed in options
  *                      options = {
  *                            scrollbarScrollPane  = <div> //represents the inner div which will be scrollable
  *                            scrollbarViewPort    = <div> //represents the outter div which has hidden overflow
  *                            scrollbarOrientation = 'vertical'/'horizontal'/'both' //default is 'both'
  *                            scrollbarType        = 'ossui-page-scrollbar'/'ossui-popup-scrollbar'/'ossui-custom-scrollbar'
  *                                                    //if the type is page-scrollbar/popup-scrollbar the width and color
  *                                                   //of the scrollbar is as per the OSSUI Style guide automatically
  *                                                   //however if a custom width/color is needed then the type should be
  *                                                   //set as ossui-custom-scrollbar
  *                                                   //If scrollbarType not specified then the default scrollbar is
  *                                                   // 'ossui-page-scrollbar'
  *                            scrollbarWidth       = '<number>px' this option is read only if the scrollbarType is custom
  *                            scrollbarColor       = '#<colorcode>'this option is read only if the scrollbarType is custom
  *                            scrollbarViewPortHeight = '<number>px' //The viewport should have fixed max height/width dimensions
  *                                                      //If this option is not specified then it is assumed the application
  *                                                      //takes care of setting this itself
  *                            scrollbarViewPortWidth = '<number>px' //The viewport should have fixed max height/width dimensions
  *                                                      //If this option is not specified then it is assumed the application
  *                                                      //takes care of setting this itself
  *                            scrollingWithArrowKeys = 'true'/'false' //True by default but should be switched off by setting the
  *                                                     //param to false if the widget already supports scrolling with arrows
  *                                                     //jQuery widgets might throw exceptions if this is already supported by
  *                                                     //the widget
  *                            sliderRange = <number> this is the max slider range value. Which is defaulted to 300 if not provided
  *                            donotAutoHandleDOMModifiedEvent = <boolean> if set to true the auto handling of refresh on DOMSubtreeModified
  *                                                          //event is not done, if this attribute is false or not present
  *                                                      //scrollbar listen's to the DOMSubtreeModified and auto refresh
  *                                                   (Note: This has been introduced to workaround the IE9 bug which
  *                                                    triggers the DOMSubtreeModified infinitely)
  *                            insertScrollYAfter    = in default the scroll is locate after the scrollContentElement, use this option to place the Y scroll near other element
  *                            insertScrollXAfter    = in default the scroll is locate after the scrollContentElement, use this option to place the X scroll near other element
  *                            topOffset             = <number> start the top of Y scroll with offset from the top.
  *                        }
  **/
define('ossui/widget/ScrollbarWidget',['underscore','jquery','jquery.ui','mousewheel','backbone'],

    function(_, $, $$, mousewheel, Backbone) {

                var ScrollbarWidget = function(options) {

                    /*jshint maxcomplexity: 14 */
                    
                    this.scrollContentElement = options.scrollbarScrollPane;
                    this.outerContainerElement = options.scrollbarViewPort;
                    this.insertScrollYAfter = options.insertScrollYAfter || this.scrollContentElement;
                    this.insertScrollXAfter = options.insertScrollXAfter || this.scrollContentElement;
                    this.topOffset = options.topOffset || 0;
                    //default orientation
                    this.scrollbarOrientation = 'both';

                    var webkitCalcVar = '-webkit-calc(';
                    var mozCalcVar = '-moz-calc(' ;
                    var ieCalcVar = 'calc(' ;
                    var scrollbarWidth = '- 12px)';
                    if(options.scrollbarViewPortHeight){
                        //needed for vertical scrolling. If the height is not set then it is assumed
                        //the application is setting the property itself
                        this.outerContainerElement.css('height', options.scrollbarViewPortHeight);
                        this.scrollContentElement.css('height',webkitCalcVar + options.scrollbarViewPortHeight  + scrollbarWidth);
                        this.scrollContentElement.css('height',mozCalcVar + options.scrollbarViewPortHeight  + scrollbarWidth);
                        this.scrollContentElement.css('height',ieCalcVar + options.scrollbarViewPortHeight  + scrollbarWidth);
                    }
                    if(options.scrollbarViewPortWidth){
                        //needed for horizontal scrolling. If the height is not set then it is assumed
                        //the application is setting the property itself
                        this.outerContainerElement.css('width', options.scrollbarViewPortWidth);
                        this.scrollContentElement.css('width',webkitCalcVar + options.scrollbarViewPortHeight  + scrollbarWidth);
                        this.scrollContentElement.css('width',mozCalcVar + options.scrollbarViewPortHeight  + scrollbarWidth);
                        this.scrollContentElement.css('width',ieCalcVar + options.scrollbarViewPortHeight  + scrollbarWidth);
                    }
                    if(options.scrollbarOrientation){
                        // options.scrollbarOrientation = "horizontal"/ "vertical"/"both"
                        this.scrollbarOrientation = options.scrollbarOrientation;
                    }

                    this.scrollContentElement.addClass('ossui-scrollable-pane');

                    this.outerContainerElement.addClass('ossui-scrollbar-viewport');

                    this.donotAutoHandleDOMModifiedEvent = false;
                    if (options && options.donotAutoHandleDOMModifiedEvent
                            && (options.donotAutoHandleDOMModifiedEvent === true)) {
                        this.donotAutoHandleDOMModifiedEvent = options.donotAutoHandleDOMModifiedEvent;
                        }
                    switch (this.scrollbarOrientation) {

                        case 'horizontal' : this.xScroll = true;
                                            this.yScroll = false;
                                            break;
                        case 'vertical' : this.yScroll = true;
                                          this.xScroll = false;
                                           break;
                        default  :       this.xScroll = true;
                                         this.yScroll = true;
                                           break;

                        }

                    this.ySlider = $('<div class="ossui-slider" ></div>');
                    this.xSlider = $('<div class="ossui-slider" ></div>');

                    this.sliderRange = options.sliderRange || 300;

                    this.removeScrollbar = function() {
                        this.ySlider.remove();
                        this.xSlider.remove();
                        this.outerContainerElement.off();
                        this.outerContainerElement.unbind();
                        this.scrollContentElement.off();
                    };

                    /**
                     * API can be used to scroll the scrollbar programatically
                     * but the value here should fall between 0-sliderRange and be an integer
                     */
                    this.setYScrollbarPosition = function(position){
                        this.ySlider.slider('value',position);
                    };
                    /**
                     * API can be used to scroll the scrollbar programatically
                     * but the value here should fall between 0-sliderRange and be an integer
                     */
                    this.setXScrollbarPosition = function(position){
                        this.xSlider.slider('value',position);
                    };

                    this.getYScrollbarPosition = function(){
                        return this.ySlider.slider('option','value');
                    };

                    this.getXScrollbarPosition = function(){
                        return this.xSlider.slider('option','value');
                    };

                    this.resetYScrollbar = function() {
                        this.ySlider.slider({
                            value : this.sliderRange
                        });
                    };

                    this.resetXScrollbar = function() {
                        var remainder = this.outerContainerElement.width() - this.scrollContentElement.width();
                        var leftVal = this.scrollContentElement.css( "margin-left" ) === "auto" ? 0 :
                        parseInt( this.scrollContentElement.css( "margin-left" ) , 10);
                        var percentage = Math.round( leftVal / remainder * 100 );
                        this.xSlider.slider( {value : percentage });
                    };

                    this.reset = function(argument){
                        //function to be removed once menuview is aligned
                    };

                    this.getYOverflow = function() {
                        // ratio of contentElement height to actual content
                        return (this.outerContainerElement.height() - this.topOffset) / this.scrollContentElement.height();

                    };
                    this.getXOverflow = function() {
                        // ratio of contentElement height to actual content
                        return this.outerContainerElement.width() / this.scrollContentElement.width();

                    };
                    this._setScrollbarType = function(scrollbarType,sliderType){
                        switch (scrollbarType) {

                        case 'ossui-page-scrollbar'  : break;
                        case 'ossui-popup-scrollbar' : if (this.yScroll){
                                                         this.ySlider.css({width : '6px'});
                                                         this.ySlider.find('.ui-slider-handle').css({background : '#d7cebf', width : '6px'});
                                                       }
                                                      if (this.xScroll){
                                                         this.xSlider.css({height : '6px'});
                                                         this.xSlider.find('.ui-slider-handle').css({background : '#d7cebf', height : '6px'});
                                                       }
                                                       break;
                        case 'ossui-custom-scrollbar' : if(options.scrollbarWidth){
                                                          this.ySlider.css('width' , options.scrollbarWidth);
                                                          this.ySlider.find('.ui-slider-handle').css('width', options.scrollbarWidth);
                                                          this.xSlider.css('height' , options.scrollbarWidth);
                                                          this.xSlider.find('.ui-slider-handle').css('height', options.scrollbarWidth);
                                                        }
                                                        if(options.scrollbarColor){
                                                            this.ySlider.find('.ui-slider-handle').css('background', options.scrollbarColor);
                                                            this.xSlider.find('.ui-slider-handle').css('background', options.scrollbarColor);
                                                        }
                                                        break;

                        }
                    };

                    this.addScrollbars = function(){
                        //add scrollbar
                         var outerContainerElement = this.outerContainerElement;
                         var scrollContentElement = this.scrollContentElement;
                         var sliderRange = this.sliderRange;
                         var topOffset = this.topOffset;
                         if(this.xScroll){
                             this.xSlider.insertAfter(this.insertScrollXAfter);
                             this.xSlider.slider({
                                 max : this.sliderRange,
                                 min : 0,
                                 orientation : 'horizontal',
                                 value : options.value || this.sliderRange,
                                 change : function(event, ui) {
                                     var diff = outerContainerElement.width()
                                         - scrollContentElement.width();
                                 var left =    Math.round(ui.value / sliderRange * diff);
                                 scrollContentElement.css('margin-left', left +'px' );
                                 },
                                 slide : function(event, ui) {
                                     var diff =  outerContainerElement.width() - scrollContentElement.width();
                                     var left =  Math.round( ui.value / sliderRange * diff);
                                     scrollContentElement.css( "margin-left",  left + "px" );
                                     }
                                 });
                             if(options.scrollbarType){
                                 this._setScrollbarType(options.scrollbarType,this.xSlider);
                                 }
                         }
                         if(this.yScroll){
                         this.ySlider.insertAfter(this.insertScrollYAfter);
                         this.ySlider.hide();
                         this.ySlider.slider({
                             max : this.sliderRange,
                             min : 0,
                             orientation : 'vertical',
                             value : options.value || this.sliderRange,
                             change : function(event, ui) {
                                 var diff = scrollContentElement.height()
                                                 - outerContainerElement.height();
                                 var topValue = -((1 - (ui.value / sliderRange)) * diff);
                                  if (topValue < 0 )
                                  {
                                    topValue = topValue - topOffset;
                                  }
                                 scrollContentElement.css({top : topValue });
                                 },
                                 slide : function(event, ui) {
                                     var diff = scrollContentElement.height()
                                                 - outerContainerElement.height();
                                         var topValue = -((1 - (ui.value / sliderRange)) * diff);
                                         if (topValue !== 0)
                                         {
                                           topValue = topValue - topOffset;
                                         }
                                         scrollContentElement.css({top : topValue});
                                     }
                                 });
                         if(options.scrollbarType){
                             this._setScrollbarType(options.scrollbarType,this.ySlider);
                             }
                         }


                     };

this.refreshScrollbars = _.bind(function() {
  //handle refresh only if the scroll pane overflows
  //else the scrollbar is hidden
  //The minimum height if not set in options set at 20px
  var minScrollbarHeight = options.minScrollbarHeight || 20;
  if(this.xScroll){
    if (this.getXOverflow() > 0 && this.getXOverflow() < 1) {
      this.xSlider.show();
      var xscrollbarWidth = this.outerContainerElement.width() * this.getXOverflow();

      this.xSlider.find(".ui-slider-handle").css({
        width : xscrollbarWidth,
        'margin-left' : -0.5 * xscrollbarWidth
      });
      var sliderWidth = this.outerContainerElement.height() - xscrollbarWidth;
      var xsliderMargin = xscrollbarWidth * 0.5;
      this.xSlider.css({
        width : sliderWidth,
        "margin-left" : xsliderMargin
      });
    }else{
      this.resetXScrollbar();
      this.xSlider.hide();                             }
    }

    if(this.yScroll){
       if (this.getYOverflow() > 0 && this.getYOverflow() < 1) {
        // handle height: same proportion from
        // contentElement height as contentElement height to
        // actual content.
        var yscrollbarHeight = minScrollbarHeight;
        var approxScrollbarHeight = this.outerContainerElement.height() * this.getYOverflow();
        if(approxScrollbarHeight > yscrollbarHeight){
          yscrollbarHeight = approxScrollbarHeight;
        }
        this.ySlider.find(".ui-slider-handle").css({
          height : yscrollbarHeight ,
          'margin-bottom' : -0.5 * yscrollbarHeight
        });
        var sliderHeight = this.outerContainerElement.height() - yscrollbarHeight;
        var sliderMargin = yscrollbarHeight * 0.5;
        this.ySlider.css({
          height : sliderHeight - this.topOffset,
          'margin-top' : sliderMargin + this.topOffset
        });
        this.ySlider.show();
        this._fixYSliderPosition();
      } else {
        this.resetYScrollbar();
        this.ySlider.hide();
      }
    }
    this.trigger('scrollbarsRefreshed');  
},this);

this._fixYSliderPosition = function(){
  var scrollbarLocatedInTheMostDown = this.getYScrollbarPosition() === 0;
  if (scrollbarLocatedInTheMostDown) {
    var expectedTop = this.outerContainerElement.height() - this.scrollContentElement.height() - this.topOffset;
    var currentTop = this.scrollContentElement.position().top;
    var delta = currentTop - expectedTop - this.ySlider.find('.ui-slider-handle').height();
    var position = delta * this.sliderRange / this.outerContainerElement.height();
    if(position >= 0){
      this.setYScrollbarPosition(position);
    }else{
      this.setYScrollbarPosition(0);
    }
  }
};

                    this.handleMouseWheel = function(event, delta) {
                        event.preventDefault();
                        if(this.isVisible()){
                            var speed = this.sliderRange * this.getYOverflow() / 3;
                            var sliderPosition = this.ySlider.slider("value");
                            sliderPosition = (delta * speed) + sliderPosition;
                            this.ySlider.slider("value", sliderPosition);
                        }
                    };

                    this.timer = 0;
                    /**
                     * the below method method delays refresh scrollbar call by 200milliSec
                     * this will handle in IE window resize multiple events and DOMSubtreeModified
                     * infinte events which can cause IE browser to hang
                     */
                    this.delayedRefreshOfScrollbars = function(){
                        clearTimeout (this.timer);
                        this.timer = setTimeout(this.refreshScrollbars, 200);
                    };

                    this.handleArrowUpDown = function(delta){
                        if(this.isVisible()){
                            var speed = this.sliderRange * this.getYOverflow() / 3; //(1/overflow)*7;
                            var sliderPosition = this.ySlider.slider("value");
                            sliderPosition = (delta * speed) + sliderPosition;
                            this.ySlider.slider("value", sliderPosition);
                        }
                    };

                    this.handleArrowRightLeft = function(delta){
                        if(this.isVisible()){
                            var speed = this.sliderRange * this.getXOverflow() / 3; //(1/overflow)*7;
                            var sliderPosition = this.xSlider.slider("value");
                            sliderPosition = (delta * speed) + sliderPosition;
                            this.xSlider.slider("value", sliderPosition);
                        }
                    };

this.isVisible = function(){
  if(this.ySlider.css('display') == 'none'){
    return false;
  }
  return true;
};


                    _.bindAll(this, 'refreshScrollbars', 'handleMouseWheel', 'delayedRefreshOfScrollbars');
                    if(!this.donotAutoHandleDOMModifiedEvent){
                        //unless instructed auto bind the DOMSubtreeModified event
                        this.scrollContentElement.on('DOMSubtreeModified', this.delayedRefreshOfScrollbars);
                    }
                    //handle mousewheel scrolling
                    this.outerContainerElement.on('mousewheel',this.handleMouseWheel);
                    //handle query resizable event
                    this.outerContainerElement.on('resizestop',this.refreshScrollbars);
                    //handle window resize
                    $(window).on('resize', this.delayedRefreshOfScrollbars);

                    //For responding to keyboard arrows
                    //this is set by default but if options.scrollingWithArrowKeys == false
                    //this is disabled
                    this._scrollWithArrowKeys = true;
                    if(!(options.scrollingWithArrowKeys && options.scrollingWithArrowKeys === 'false')) {
                        this.outerContainerElement.on('mouseover', _.bind(function() {
                            this.outerContainerElement.focus();
                            }, this));
                        this.outerContainerElement.on('mouseout', _.bind(function() {
                            this.outerContainerElement.blur();
                            }, this));
                    }

                    if(!this.outerContainerElement.attr('tabindex')){
                        this.outerContainerElement.attr('tabindex','-1');
                    }
                   /* this.outerContainerElement.focus(function(event){
                        event.preventDefault();
                    });*/
                    this.outerContainerElement.bind('keydown', _.bind(function (e) {
                        var keyCode = e.keyCode || e.which,
                            arrow = {left: 37, up: 38, right: 39, down: 40 };

                        switch (keyCode) {
                          case arrow.left : this.handleArrowRightLeft(-1);
                                           break;
                          case arrow.up : this.handleArrowUpDown(1);
                                         break;
                          case arrow.right : this.handleArrowRightLeft(1);
                                           break;
                          case arrow.down: this.handleArrowUpDown(-1);
                                          break;
                        }
                    },this));
        
                    _.extend(this, Backbone.Events);
                    this.addScrollbars();
                    this.refreshScrollbars();
                };
            return ScrollbarWidget;
    });

/*jshint devel:true, maxcomplexity: 11 */
define('ossui/widget/MenuView',['underscore','jquery','backbone',
    'text!lib/amdocs/ossui/components/menu/template/MenuItemTemplate.html',
    'text!lib/amdocs/ossui/components/menu/template/UpStemTemplate.html',
    'text!lib/amdocs/ossui/components/menu/template/DownStemTemplate.html',
    'ossui/widget/ScrollbarWidget','lightsaber','jquery.ui'],
    function(_, $, Backbone, MenuItemTemplate, UpStemTemplate, DownStemTemplate, OssuiScrollbar, Lightsaber) {

        var MenuView =  Lightsaber.Core.View.extend({

            menuIdAttribute : 'oss-ui-menu-id',
            subMenuIdAttribute : 'oss-ui-submenu-of-item',
            itemIdAttribute : 'oss-ui-menu-item-id',
            template : '<ul></ul>',
            vmKeys: {
                "data.menuitems" : "items"
            },

            initialize: function(options){
                _.bindAll(this, '_handleHideForStickyMenus', '_hideMenu', '_showMenu', 'repositionMenu');
                //to be moved to config params
                this.defaultMenuMaxHeight = '120';
                this.menuOptions = options.menuOptions;
                this.options = options;
                this.template = this.getConfig('template') || this.template;
                this.menuItemTemplate =
                    _.template(this.menuOptions.menuItemTemplate || MenuItemTemplate);
                this.titleTemplate = this.menuOptions.titleTemplate;
                this.menuIdAttribute = this.getConfig('menuIdAttribute') || this.menuIdAttribute;
                this.itemIdAttribute = this.getConfig('itemIdAttribute') || this.itemIdAttribute;
                this.scrollbar = null;

                this.viewModel.on('items:reset',this._loadMenuItems , this);
                this.viewModel.on('items:reset',this._decorate , this);
                this.viewModel.on('items:loaded',this._loadMenuItems , this);
                this.viewModel.on('items:loaded',this._decorate , this);
                this.viewModel.on('items:added',this._refresh , this);
                //this is the state for the menu which can have values visible/hidden
                this.menuState = 'visible';
            },

            _postRender:function(){
                if(this.options.menuItems){
                    var items = this.options.menuItems;
                    var itemModels = [];
                    for(var i=0;i<items.length;i++){
                        itemModels[i] = new Lightsaber.Core.Model(items[i]);
                    }
                    if(items && items.length >0){
                        this.options.viewModel.models.data.reset(itemModels);
                    }
                }
            },

            _refresh:function(){
                //console.log('refreshing!');

            },

            _decorate: function(data){

                var $menuElement = $('#'+this.root.id);
                var $stemElement = null;
                if(this.menuOptions.stem){
                    $stemElement = this._addStem();
                }else{
                    var submenuOptions = this.menuOptions.submenuOptions;
                    $menuElement.menu(submenuOptions);
                }

                this.$stemElement = $stemElement;
                this.$menuElement = $menuElement;
                this._applyScrollability();

                if((this.menuOptions.stem &&this.menuOptions.hidden && this.menuOptions.hidden=='true')){
                    this._hideMenu();
                }
                //var scrollbar = this.scrollbar;
                this.menuClickAnchor = this.menuOptions.menuClickAnchor || this.$el;
                if(this.menuOptions.sticky){
                    this.menuClickAnchor.on('click',this._showMenu);
                }else{
                    this.menuClickAnchor.on('mouseenter',this._showMenu);
                }
                //var $menuModule = this.$el;
                //var selectorForClosingStickyMenu = 'body :not(' + this.menuClickAnchor.selector + ',' + this.menuClickAnchor.selector + ' *)';
                if(this.menuOptions.sticky){
                    $('body').on('click',this._handleHideForStickyMenus);
                } else{
                    this.menuClickAnchor.on('mouseleave',this._hideMenu);
                }
                this.$menuElement.trigger('menu:created',this);
            },

            _applyScrollability:function(){
                var menus = $(this.el).find('.'+this.menuOptions.menuClassName);
                var self = this;
                $.each(menus,function(index, value){
                    if(self.menuOptions.ossuiScrollbar){
                    self._makeElementScrollable(value);
                    }
                });
            },

            _handleHideForStickyMenus : function(event){
                if(this.menuClickAnchor.find($(event.target)).length === 0 && !(this.menuClickAnchor.is($(event.target)))) {
                    
                    if ( !this.menuOptions.sticky || !this._isClickedParentMenuItem() ){
                        this._hideMenu(event);
                    }
                    
                }
            },

            _hideMenu : function(event){
                if(this.menuState === 'visible'){
                    this.menuState = 'hidden';
                    //close submenus
                    if(this.$menuElement.data('ui-menu')) {
                        this.$menuElement.menu("collapseAll",null,true);
                    }
                    if(this.$stemElement){
                        this.$stemElement.hide();
                        }
                    this.$menuElement.hide();
                    if(event){
                        event.stopPropagation();
                    }
                }

            },

            _showMenu : function(event){
                if(this.menuState === 'hidden' ){
                    this.menuState = 'visible';
                    if(this.$stemElement){
                        this.$stemElement.show();
                        }
                    this.$menuElement.show();
                    if(event){
                        event.stopPropagation();
                    }
                    this.repositionMenu();
                    if(this.scrollbar){
                        this.scrollbar.refreshScrollbars();
                    }
                } else if(this.menuState === 'visible' ){
                    
                    if ( !this.menuOptions.sticky || !this._isClickedParentMenuItem() ){
                        this._hideMenu(event);
                    }
                    
                }
            },
            
            _isClickedParentMenuItem : function() {
                var menuItem = $(this._getMenuElement()).find("li:hover");                
                return this._hasSubMenuItems(menuItem);
            },
            
            _hasSubMenuItems : function(menuItem) {
                return menuItem !== null && typeof menuItem !== 'undefined' && menuItem.length == 1 && menuItem.children("ul").length > 0;
            },

            _makeElementScrollable: function(element){
                var $element = element;
                if(!($element instanceof jQuery)){
                    $element = $(element);
                }
                $element.contents().wrapAll('<div class="ossui-scrollable-items"/>');
                if(this.menuOptions.ossuiScrollbar && $element.hasClass($element.attr('ossui-scrollable-class-name'))){
                    var menuHeight = this.defaultMenuMaxHeight ;
                    if(this.menuOptions.menuMaxHeight){
                        menuHeight =    $element.outerHeight() < this.menuOptions.menuMaxHeight ? $element.outerHeight() : this.menuOptions.menuMaxHeight;
                      }
                    //$element.css('height', menuHeight+'px');
                    this.scrollbar = new OssuiScrollbar({scrollbarScrollPane:this.$('.ossui-scrollable-items'), scrollbarViewPort : $element,
                        scrollbarType : 'ossui-popup-scrollbar', scrollbarOrientation : 'vertical', scrollingWithArrowKeys : 'false',
                        scrollbarViewPortHeight:  menuHeight+'px', donotAutoHandleDOMModifiedEvent : true });
                }  //else HTML default scrollbar will be used
            },

            _addStem: function(){

                var stemTemplate = null;

                if(this.menuOptions.stem.stemTemplate){
                    stemTemplate = this.menuOptions.stem.stemTemplate;
                }else if(this.menuOptions.direction){

                    if(this.menuOptions.direction === 'down'){
                        stemTemplate = UpStemTemplate;
                    }
                    if(this.menuOptions.direction === 'up'){
                        stemTemplate = DownStemTemplate;
                    }

                }

                var $stemElement = $(stemTemplate);
                $stemElement.addClass('ossui-popup-pointer-arrow');

                var stemOptions = this.menuOptions.stem;
                var $menuElement = $('#'+this.root.id);
                if(!(stemOptions.popupMenuAnchorElement || stemOptions.popupMenuAnchorTemplate))    {
                    //no anchor element/template specified so giving a default template
                    this.popupMenuAnchorTemplate = '<a href="blank" class="ossui-menu-top-link">Ossui fall down Menu</a>';
                }else {
                    this.popupMenuAnchorTemplate = stemOptions.popupMenuAnchorTemplate;
                }
                var $popupMenuAnchorElement = stemOptions.popupMenuAnchorElement || $(this.popupMenuAnchorTemplate);
                var submenuOptions = this.menuOptions.submenuOptions;
                $menuElement.menu(submenuOptions);   //create menu


                this._addHorizontalStems($menuElement);
                $('.ossui-popup-submenu-pointer-arrow').hide();

                this._applyDirection($stemElement,$menuElement,$popupMenuAnchorElement);

                if(this.menuOptions.state == 'disable'){
                    $menuElement.menu("disable");
                }

                this.popupMenuAnchor = $popupMenuAnchorElement;


                return $stemElement;
            },

            _applyDirection: function($stemElement,$menuElement,$popupMenuAnchorElement){

                var stemOptions = this.menuOptions.stem;
                var menuAnchorPosition = null;
                var pointerPosition = null;
                var menuPosition = null;
                if(this.menuOptions.direction=='down'){
                    if(this.popupMenuAnchorTemplate){
                        //append the anchor only if this element is present
                        //do not attempt to append element which is already
                        //present
                        this.$el.append(this.popupMenuAnchorTemplate);
                    }
                    this.$el.append($stemElement);
                    this.$el.append($menuElement);
                    menuAnchorPosition = stemOptions.popupMenuAnchorPosition || {of: this.$el, my: 'center top', at: 'center top'};
                    pointerPosition = stemOptions.stemPosition || { of: $popupMenuAnchorElement, my: 'center center', at: 'center bottom'};
                    menuPosition = stemOptions.rootMenuPosition || { of: $stemElement, my: 'center+12px top', at: 'center bottom'};

                } else if(this.menuOptions.direction=='up'){
                    if(this.popupMenuAnchorTemplate){
                        this.$el.append(this.popupMenuAnchorTemplate);
                    }
                    this.$el.append($menuElement);
                    this.$el.append($stemElement);
                    menuAnchorPosition = stemOptions.popupMenuAnchorPosition || {of: this.$el,  my: 'center top', at: 'center top'};
                    pointerPosition = stemOptions.stemPosition || { of: $popupMenuAnchorElement,  my: 'center center', at: 'center top'};
                    menuPosition = stemOptions.rootMenuPosition || { of: $stemElement, my: 'center+12px bottom', at: 'center top'};

                    /*$menuElement.position(stemOptions.rootMenuPosition);
                     $stemElement.position(stemOptions.stemPosition);
                     $popupMenuAnchorElement.position(stemOptions.popupMenuAnchorPosition);*/
                }
                //$popupMenuAnchorElement.position(menuAnchorPosition);
                $stemElement.position(pointerPosition);
                $menuElement.position(menuPosition);
            },
            _addHorizontalStems: function(topMenu){
                var subMenus = topMenu.find('[oss-ui-submenu-of-item]');
                var i = 0;
                while(i < subMenus.length){
                    var $subMenu = $(subMenus[i]);
                    var expandableItemId = $subMenu.attr('oss-ui-submenu-of-item');
                    var $expandableItem = topMenu.find("[oss-ui-menu-item-id='"+expandableItemId+"']");
                    this._addSubmenuArrowPointer(topMenu,$subMenu,$expandableItem);
                    i++;
                }
            },

            _addSubmenuArrowPointer: function(topMenu,subMenu,item){
                var $sideStem = this._createSubmenuArrowPointer();
                var expandDirection = this.menuOptions.expandDirection;
                var popDirection = this.menuOptions.direction;

                if(expandDirection=='right' && popDirection=='up' || expandDirection=='left' && popDirection=='down'){
                    $sideStem.addClass('ossui-arrow-rotate-90deg');
                }else if(expandDirection=='left' && popDirection=='up' || expandDirection=='right' && popDirection=='down'){
                    $sideStem.addClass('ossui-arrow-rotate-240deg');
                }

                var stemPositioning = {of:item, my:'left+6px center', at:expandDirection+' center'};
                $sideStem.insertBefore(subMenu);
                $sideStem.position(stemPositioning);


                subMenu.on('onmenufocus',null,subMenu,function(data){
                    console.log('subMenu:onmenufocus!');
                }  );
                subMenu.on('menufocus',null,subMenu,function(data){
                    console.log('subMenu:menufocus!');
                } );
                /*subMenu.on('menublur',null,subMenu,function(data){
                 console.log('subMenu:menublur!');
                 } );


                 topMenu.on('onmenufocus',null,topMenu,function(data){
                 console.log('topMenu:onmenufocus!');
                 }  );*/

                /*function _hideArrow(item,menu){
                 console.log('topMenu:menublur');
                 var linkInFocus = item.children('.ui-state-focus');
                 var arrow2hide = linkInFocus.sibling('.ossui-popup-submenu-pointer-arrow');
                 arrow2hide.hide();
                 };

                 function _showArrow(item,menu){
                 console.log('topMenu:menufocus');
                 var linkInFocus = item.children('.ui-state-focus');
                 var arrow2show = linkInFocus.sibling('.ossui-popup-submenu-pointer-arrow');
                 arrow2show.show();
                 };*/

                item.mouseenter(function(){
                    if(item.children('.ui-menu').attr('aria-hidden')==='true'){ //if item's submenu is active
                        $('.ossui-popup-submenu-pointer-arrow').hide();
                        item.children('.ossui-popup-submenu-pointer-arrow').delay(300).show(0);
                    }

                });
                item.mouseleave(function(){
                    if(item.children('.ui-menu').attr('aria-hidden') ||  item.children('.ui-menu').attr('aria-hidden')=='true'){  //if item's submenu is hidden
                        item.children('.ossui-popup-submenu-pointer-arrow').hide();
                    }

                });
            },

            _createSubmenuArrowPointer: function(){
                var $arrow = $(this.menuOptions.submenuStemTemplate);
                $arrow.addClass('ossui-popup-submenu-pointer-arrow');
                return $arrow;
            },

            _loadMenuItems : function(data) {
                this.$root.empty();
                this._addMenuItems(data);
            },

            _addMenuItems : function(data) {
                var menuItems = data.items || [data.item];
                var i = menuItems.length;

                while(i--) {
                    this._addMenuItem(menuItems[menuItems.length - i - 1], menuItems.length-i,(i===0));
                }

            },

            _getMenuElement: function(){
                var $menuEl = $(this.$root);
                if(!$menuEl.attr(this.menuIdAttribute) || $menuEl.attr(this.menuIdAttribute) ===''){ // => top level menu
                    $menuEl.attr(this.menuIdAttribute,'top-level-menu'+'-'+this._config.id);
                    $menuEl.addClass(this.menuOptions.menuClassName);
                    if(this.titleTemplate){
                        $menuEl.append($(this.titleTemplate));
                    }
                }
                return $menuEl;
            },

            _addMenuItem: function(data,index,isLastItem){
                var $menuEl = this._getMenuElement();

                data.menuItemId = index;


                if(data.scrollable){
                    this._addScrollabilityIndicators($menuEl,data);
                    return 'scrollable';
                }

                var $menuItem = this._createMenuItemElement(data);
                if(data.disabled == 'true'){
                    $menuItem.addClass('ui-state-disabled');
                    $menuItem.attr("aria-disabled", "true");
                }else if(data.submenu){
                    this._addSubMenuItems(data,$menuItem);
                    this._removeScrollabilityIndicators($menuEl);
                }
                $menuEl.append($menuItem);
                if(!isLastItem ){
                    $menuEl.append('<div></div>');
                }
                if(data.eventArgs){
                    for(var eventIndex = 0;  eventIndex < data.eventArgs.length ; eventIndex++){
                        var eventArg = data.eventArgs[eventIndex];
                        $menuItem.on(eventArg.event,null,$menuItem,$.proxy(eval(eventArg.func),$menuItem));
                    }
                }

                if( !this.menuOptions.sticky || !this._hasSubMenuItems($menuItem) ){
                    $menuItem.on('click', this._hideMenu);
                }
                
                return $menuItem;
            },

            _addSubMenuItems : function(item,context) {

                var items = item.submenu;
                var i = items.length;
                var subMenuElement = $(this.template).attr(this.subMenuIdAttribute,item.menuItemId);
                $(context).append(subMenuElement);  //add sub list tag

                while(i--) {
                    this._addSubMenuItem(subMenuElement,items[items.length - i - 1], items.length-i,(i===0));
                }
                return context;

            },

            _addSubMenuItem: function($menu,item,index,isLastItem){
                item.menuItemId = $menu.attr(this.subMenuIdAttribute)+'.'+index;
                $menu.addClass(this.menuOptions.menuClassName);
                if(item.scrollable){
                    this._addScrollabilityIndicators($menu, item);
                    return 'scrollable';
                }
                var $newSubmenuItem;
                var $subMenuItem = this._createMenuItemElement(item);
                if(item.disabled == 'true'){
                    $subMenuItem.addClass('ui-state-disabled');
                    $subMenuItem.attr("aria-disabled", "true");
                } else if(item.submenu){
                    $newSubmenuItem = this._addSubMenuItems(item, $subMenuItem);
                    this._removeScrollabilityIndicators($menu);
                }else{
                    $newSubmenuItem = $subMenuItem;
                }
                if(item.eventArgs){
                    //var eventIndex, eventArg;
                    for(var eventIndex = 0;  eventIndex < item.eventArgs.length ; eventIndex++){
                        var eventArg = item.eventArgs[eventIndex];
                        $newSubmenuItem.on(eventArg.event,null,$newSubmenuItem,$.proxy(eval(eventArg.func),$newSubmenuItem));
                    }
                    /*var eventName = item.eventArgs.event;
                    $newSubmenuItem.on(eventName,null,$newSubmenuItem,$.proxy(eval(item.eventArgs.func),$newSubmenuItem));*/
                }
                $newSubmenuItem.on('click', this._hideMenu);
                $menu.append($newSubmenuItem);
                if(!isLastItem ){
                    $menu.append('<div></div>');
                }
            } ,

            _createMenuItemElement: function(item){

                if(this.menuOptions.expandDirection == 'left'){
                    item.iconalign = 'ossui-menu-item-icon-right';
                    item.itemtextalign = 'ui-menu-item-text-align-right';
                } else if(this.menuOptions.expandDirection == 'right'){
                    item.iconalign = 'ossui-menu-item-icon-left';
                    item.itemtextalign = 'ui-menu-item-text-align-left';

                }
                var itemTemplate = this.menuItemTemplate;
                if(item.template){
                    itemTemplate = item.template;
                }
                return $(itemTemplate(item));
            },


            _addScrollabilityIndicators: function ($menu, item) {

                if(item.scrollable.classname){
                    $menu.addClass(item.scrollable.classname);
                    $menu.attr('ossui-scrollable-class-name',item.scrollable.classname);
                }
            },

            _removeScrollabilityIndicators: function ($menu){
                var scrollabilityClassName = $menu.attr('ossui-scrollable-class-name');
                if(scrollabilityClassName){
                    $menu.removeClass(scrollabilityClassName);
                    $menu.removeAttr('ossui-scrollable-class-name');
                }
            },

            repositionMenu : function(){
                var menuStateBeforePosition = this.menuState;
                //jQuery position does not work for hidden elements
                //hence showMenu is called before reposition
                /*if(menuStateBeforePosition === 'hidden'){
                    this.showMenu();
                }  */
                var stemOptions = this.menuOptions.stem;
                var menuAnchorPosition = null;
                var pointerPosition = null;
                var menuPosition = null;
                if(this.menuOptions.direction=='down'){
                    menuAnchorPosition = stemOptions.popupMenuAnchorPosition || {of: this.$el, my: 'center top', at: 'center top'};
                    pointerPosition = stemOptions.stemPosition || { of: this.popupMenuAnchor, my: 'center center', at: 'center bottom'};
                    menuPosition = stemOptions.rootMenuPosition || { of: this.$stemElement, my: 'center+12px top', at: 'center bottom'};

                } else if(this.menuOptions.direction=='up'){
                    menuAnchorPosition = stemOptions.popupMenuAnchorPosition || {of: this.$el,  my: 'center top', at: 'center top'};
                    pointerPosition = stemOptions.stemPosition || { of: this.popupMenuAnchor,  my: 'center center', at: 'center top'};
                    menuPosition = stemOptions.rootMenuPosition || { of: this.$stemElement, my: 'center+12px bottom', at: 'center top'};
                }
                this.$stemElement.position(pointerPosition);
                this.$menuElement.position(menuPosition);
               /* if(menuStateBeforePosition === 'hidden'){
                    this.hideMenu();
                }  */
            },

            getWidget: function(){
                return $('#'+this.root.id).menu("widget");
            },

            showMenu : function(){
                //showMenu is called externally so need to bind the
                //hide of the menu also
                this._showMenu();
            },

            hideMenu : function(){
                this._hideMenu();
            },

            destroy: function() {
                this.viewModel.off();
                this.options.menuItems.length = 0;
                this.menuClickAnchor.off();
                $('body').off('click',this._handleHideForStickyMenus);
            }
        });
        return MenuView;
    });

define('text!lib/amdocs/ossui/components/tabs/view/template/dynamicTabPaneTemplate.html',[],function () { return '<div id=\'<%=tabId%>\' class=\'ui-tabs-panel ui-widget-content ui-corner-bottom\' aria-labelledby=\'ui-id-1\' role=\'tabpanel\' aria-expanded=\'true\'> </div>';});

define('text!lib/amdocs/ossui/components/tabs/view/template/tabPanelIconTemplate.html',[],function () { return '<li class=\'ossui-tab-icon\'><span class=\'ossui-addtab-icon\' role=\'presentation\'></span></li>';});

define('text!lib/amdocs/ossui/components/tabs/view/template/dynamicTabTemplate.html',[],function () { return '<li><a href=\'#<%=tabId%>\'><%=tabLabel%></a><span class=\'ui-icon ui-icon-close\' role=\'presentation\' ></span></li>';});

define('text!lib/amdocs/ossui/components/tabs/view/template/tabMenuIconTemplate.html',[],function () { return '<li class =\'ossui-tab-icon\'><span class=\'ossui_dropdown_icon\' role=\'presentation\'></span></li>';});

define('ossui/widget/DynamicTabPanelView',
        [       'jquery',
                'underscore',
                'lightsaber',
                'tabpagination',
                'ossui/widget/MenuView',
                'text!lib/amdocs/ossui/components/tabs/view/template/OSSUIPageTabsTemplate.html',
                'text!lib/amdocs/ossui/components/tabs/view/template/dynamicTabPaneTemplate.html',
                'text!lib/amdocs/ossui/components/tabs/view/template/tabPanelIconTemplate.html',
                'text!lib/amdocs/ossui/components/tabs/view/template/dynamicTabTemplate.html',
                'text!lib/amdocs/ossui/components/tabs/view/template/tabMenuIconTemplate.html'],
function($, _, Lightsaber,tabPagination, MenuView, defaultPaneltemplate,tabPaneTemplate,
        tabPanelIconTemplate,tabTemplate, menuIconTemplate) {
            var DynamicTabPanelView = Lightsaber.TabPanelView
                    .extend({
                        template : defaultPaneltemplate,
                        /**
                         * tabTemplate is to add the li elemnt to the tab with
                         * close icon
                        */
                        tabTemplate : tabTemplate,

                        addTabIconTemplate : tabPanelIconTemplate,

                        menuIconTemplate : menuIconTemplate,
                        /**
                         * tabPaneTemplate is to add pane template for the tabs
                         */
                        tabPaneTemplate : tabPaneTemplate,

                        initialize : function() {
                            _.bindAll(this, '_addDynamicTab', 'refreshTabs',
                                    '_triggerCloseTabEvent',
                                    '_createDropdownMenuOnOverflow',
                                    '_menuClickHandle',
                                    '_addIconForDropDownMenu');
                            this._super();
                            this.tabIdCounter = 0;
                            this.tabGenericName = this
                                    .getConfig('tabGenericName');
                            this.tabPaneTemplate = this
                                    .getConfig('tabPaneTemplate')
                                    || this.tabPaneTemplate;
                            this.addTabIconTemplate = this
                                    .getConfig('tabPanelIconTemplate')
                                    || this.addTabIconTemplate;
                            this.tabTemplate = this.getConfig('tabTemplate')
                                    || this.tabTemplate;
                            this.template = this.getConfig('template')
                                    || this.template;
                            this.menuIconTemplate = this
                                    .getConfig('menuIconTemplate')
                                    || this.menuIconTemplate;
                            //used to hold a list of current tabs
                            this.tabNames = [];
                            this.tabIdToNameMap = {};
                        },

                        _postRender : function() {
                            this._super();
                            this._addExtraIconsForDynamicTab();
                            this.refreshTabs();
                        },

                        _addIconForDynamicTab : function() {
                            // remove and add of the + icon is done in order to
                            // always have this icon
                            // at the end of the tab ul
                            $(this.$root.find('span.ossui-addtab-icon'))
                                    .closest("li").remove();
                            this.$root.find(".ossui-pagetabs-nav-bar").append(
                                    this.addTabIconTemplate);
                            this.$root.tabs().find("span.ossui-addtab-icon")
                                    .on("click", this._addDynamicTab);
                        },

                        /**
                         * Add a new tab unless the application instantiating the DynamicTabPanelView
                         * wants to restrict the number of tabs by providing a handler in the 
                         * configuration parameter maxTabConfigCheck which returns true if 
                         * max number of tabs is reached and handles it itself. If max number
                         * of tabs is not reached then the handler returns false in which case
                         * the a new tab gets added.
                         */
                        _addDynamicTab : function() {
                            var maxTabConfig = this.getConfig('maxTabConfigCheck');
                            if(maxTabConfig !== undefined && _.isFunction(maxTabConfig) && (maxTabConfig() === false)){
                                this.addTab({});
                            }else if(maxTabConfig === undefined){
                                this.addTab({});
                            }                          

                        },

                        /**
                         * Overriding the parent's method for additional
                         * functionality of show/hide of ui-icon-close
                         */
                        _handleSelect : function(event, ui) {
                            // show the x icon of selected tab, hide all others
                            this.$(ui.newTab).siblings().find(
                                    'span.ui-icon-close').css('visibility',
                                    'hidden');
                            this.$(ui.newTab).find(
                                    'span.ui-icon-close').css('visibility',
                                    'visible');
                            this._super(event, ui);
                        },

                        /**
                         * Overriding the addTab from Lightsaber to add the
                         * close icon for tabs This addTab will work in jquery
                         * 1.9 and 1.10 where as the Lightsaber's addTab uses
                         * the 'add' API which is deprecated in jquery 1.9 and
                         * removed in 1.10
                         */
                        addTab : function(tabData) {
                            this._addTab(tabData);
                        },
                        closeTab : function(tabData){
                            var tabId = tabData.tabId;
                            if(!_.isUndefined(tabId) && tabId.indexOf('tabs-') !== 0){
                                tabId = 'tabs-' + tabId;
                            }
                            var tabName = tabData.tabName;
                            //if tabId is given check if it belongs to this tabpanelview
                            if(!_.isUndefined(tabId) && tabId !== null && !_.isUndefined(this.tabIdToNameMap[tabId])){
                                tabName = this.tabIdToNameMap[tabId];
                                this._closeTab(tabName, tabId.slice(5, tabId.length));
                            }else if(!_.isUndefined(tabName) && this.fetchTabIdGivenName(tabName) !== null){
                                tabId = this.fetchTabIdGivenName(tabName);
                                this._closeTab(tabName, tabId.slice(5, tabId.length));
                            }
                            
                           
                        },
                        fetchTabIdGivenName : function(tabName){
                            var tabId = null;
                            for(var key in this.tabIdToNameMap){
                                if(this.tabIdToNameMap[key] === tabName){
                                    tabId = key;
                                    break;
                                }
                            }
                            return tabId;
                        },
                        /**
                         * checks to see if a tab of the same name already exists
                         * 
                         * @param tabName the name of the tab to check
                         * @returns the ID of the tab
                         */
                        checkDuplicate : function(tabName){
                          if (this.tabNames.indexOf(tabName) === -1){
                            //it does not exist in the list, add it
                            this.tabNames.push(tabName);
                            //return name as is
                            return tabName;
                          }else{
                            //tab name exists in list, check which is the next number we can postfix it with
                            var foundNext = false;
                            var count = 1;
                            while (!foundNext){
                              count++;
                              if (this.tabNames.indexOf(tabName+count) === -1){
                                foundNext = true;
                              }
                              
                            }
                            this.tabNames.push(tabName+count);
                            return tabName+count;
                            
                          }
                        },

                        _addTab : function(tabData) {
                            ++this.tabIdCounter;
                            var tabLabel = tabData.name
                                    || (this.tabGenericName + " " + this.tabIdCounter);
                            //update tab name if this is a duplicate
                            tabLabel = this.checkDuplicate(tabLabel);
                            var tabIdSubfix = (tabData.id || tabData.code || ("tab" + this.tabIdCounter));
                            var tabId = "tabs-" + tabIdSubfix;
                            tabData.tabId = tabIdSubfix;
                            
                            //lightsaber is taking care of templating this template for us, so check if its already been done
                            var li = null;
                            if (typeof this.tabTemplate === 'function'){
                                li = this.tabTemplate({ tabId : tabId,
                                    tabLabel : tabLabel});
                            }else{
	                            li = _.template(this.tabTemplate, {
	                                tabId : tabId,
	                                tabLabel : tabLabel
	                            });
                            }
                            //group the tab next to the active tab, if required
                            if (!_.isUndefined(tabData.groupTab) && tabData.groupTab !== null && tabData.groupTab){
                                //insert the tab after the active tab
                              this.$root.find(".ossui-pagetabs-nav-bar").find('.ui-state-active').after(li);
                            }else{
                              //just append to end of tabs
                                this.$root.find(".ossui-pagetabs-nav-bar").append(
                                    li);
                            }
                            var tabPane = _.template(this.tabPaneTemplate, {
                                tabId : tabId
                            });
                            var tabs = this.$root.tabs();
                            this._addExtraIconsForDynamicTab();
                            if (this.getConfig('overflowHandle')) {
                                this._overflowHandling(this
                                        .getConfig('overflowHandle'));
                            }
                            $(tabPane).appendTo(tabs);
                            tabs.tabs("refresh");  
                            this.tabIdToNameMap[tabId] = tabLabel;
                            $('div[id ^=ui-tabs]').css('display','none');
                            this._addCloseIconFunctionality(tabId);
                            this._triggerTabEvent(tabData);
                        },

                        /**
                         * This method will add the + icon to enable addition of
                         * new dynamic tabs and a 'V' icon for dropdown menu if
                         * it is configured
                         * 
                         */
                        _addExtraIconsForDynamicTab : function() {
                            this._addIconForDynamicTab();
                            this._addIconForDropDownMenu();
                        },

                        _addIconForDropDownMenu : function() {
                            if (this.getConfig('tabDropdownMenu')) {
                                $(this.$root.find('span.ossui_dropdown_icon'))
                                        .closest("li").remove();
                                $(this.menuIconTemplate)
                                        .insertAfter(
                                                this.$root
                                                        .find(
                                                                ".ossui-pagetabs-nav-bar .ossui-addtab-icon")
                                                        .closest('li'));
                                this._createDropdownMenuOnOverflow();
                            }
                        },

                        _overflowHandling : function(overflowHandle) {
                            switch (overflowHandle) {
                            case 'GetNextTabPage':
                                this.$root
                                        .tabs(
                                                'paging',
                                                {
                                                    cycle : false,
                                                    follow : true,
                                                    classNameForOverflowBt : 'ossui-tab-overflowbt',
                                                    bufferWidthPerPage : this
                                                            ._getBufferWidth(),
                                                    handlePagination : this._addIconForDropDownMenu
                                                });
                                break;
                            case 'CustomHandle':
                                this.$root
                                        .tabs(
                                                'paging',
                                                {
                                                    cycle : false,
                                                    follow : true,
                                                    nextBtClickHandle : this
                                                            .getConfig('nextBtOverflowHandle'),
                                                    prevBtClickHandle : this
                                                            .getConfig('prevBtOverflowHandle'),
                                                    classNameForOverflowBt : 'ossui-tab-overflowbt',
                                                    bufferWidthPerPage : this
                                                            ._getBufferWidth()
                                                });
                                break;
                            default:
                                break;
                            }
                        },

                        /**
                         * Returns the width of the + icon and 'V' icon for
                         * dropdown if present. This is considered during the
                         * calulation of the maximum page per tab by the tab
                         * pagination class
                         */
                        _getBufferWidth : function() {
                            var li = $(
                                    this.$root.find('span.ossui-addtab-icon'))
                                    .closest("li");
                            var bufferWidth = li.outerWidth(true);
                            if (this.getConfig('tabDropdownMenu')) {
                                bufferWidth += ($(this.$root
                                        .find('span.ossui_dropdown_icon'))
                                        .closest("li")).outerWidth(true);
                            }
                            return bufferWidth;
                        },
                        _addCloseIconFunctionality : function(tabId) {
                            this.$root.find("span.ui-icon-close").css(
                                    "visibility", "hidden");
                            //find the tab by id - this improvement is required because we can no longer guarantee
                            //that the tab is always created simply at the end of the div
                            var allTabs = this.$root.find('[role="tab"]');
                            var indexCount = 0;
                            for (var i=0; i<allTabs.length; i++){
                                var tab=allTabs[i];
                                var id = $(tab).find('a').attr('href');
                                id = id.substring(1, id.length);
                                if (tabId === id){
                                  //this is the tab
                                  indexCount = i;
                                  break;
                                }
                            }
                            var closeIcon = this.$root.find(
                                    "span.ui-icon-close").slice(indexCount);
                            closeIcon.css("visibility", "visible");
                            closeIcon.on("click", {
                                parent : this
                            }, this._handleCloseTabBtClicked);
                        },

                        _triggerTabEvent : function(tabData) {
                            this.trigger('tab:added', tabData);
                            
                            this.select(tabData.tabId);
                            this.refreshTabs();
                        },

                        /**
                         * Handler for the click on the close icon of the tab
                         */
                        _handleCloseTabBtClicked : function(event) {
                            // here 'this' is the jquery object for the close
                            // icon which was clicked
                            var tabIdToBeClosed = $(this).closest("li").attr(
                                    'aria-controls');
                            
                            var tabName = $(this).closest("li").find('a').text();
                            var parent = event.data.parent;
                            // tabId is the string after removing the 'tabs-'
                            // string from the complete id hence slicing the 
                            parent._closeTab(tabName, tabIdToBeClosed.slice(5, tabIdToBeClosed.length));
                            
                        },
                        _closeTab : function(tabName, tabId){
                          
                            //if tabId is tabs2 then remove the li which has attr aria-controls="tabs-tab2"
                            this.$root.find(".ossui-pagetabs-nav-bar").find('li[aria-controls="tabs-' + tabId +'"]').remove();
                            //firt remove the div with'id=ui-tabs-*' which was created
                            //by jquery-ui-tabs and then remove the actual panel
                            //this div 'id=ui-tabs-*' is added by jquery to identify
                            //a remote tab jquery snippet if ( isLocal( anchor ) )...
                            //if future jquery version modifies the syntax of the id
                            //below query should change
                            //jquery search string format =>$('div#<panelId> + div[id ^=ui-tabs]');
                            var jqueryRemoteTabIdentifier = $('div#' + tabId + '+div[id ^=ui-tabs]');
                            //remove tab panel
                            $("#" + tabId).remove();
                            // after the close of tab the menu should be
                            // refreshed
                            //removetab from map
                            if(this.tabNames.indexOf(tabName) > -1){
                                this.tabNames.splice(this.tabNames.indexOf(tabName),1);
                            }
                            delete this.tabIdToNameMap['tabs-'+tabId];
                            this.refreshTabs();
                            jqueryRemoteTabIdentifier.remove();
                            $('div[id ^=ui-tabs]').css('display','none');
                           
                           /* this._triggerCloseTabEvent(tabIdToBeClosed.slice(
                                    5, tabIdToBeClosed.length));*/
                            this._triggerCloseTabEvent(tabId);
                           
                            this._addIconForDropDownMenu();
                        },

                        _createDropdownMenuOnOverflow : function() {
                            this.allTabs = this.getAllTabs();
                            var menuItems = [ {
                                scrollable : {
                                    classname : 'ossui-scrollable'
                                }
                            } ];
                            var menuClickHandle = this._menuClickHandle;
                            $(this.allTabs).each(function(i) {
                                menuItems.push({
                                    eventArgs : [{
                                        event : 'click',
                                        func : menuClickHandle
                                    }],
                                    'name' : this.tabName,
                                    'tabid' : this.tabId
                                });
                            });

                            var tabMenuCollection = new Lightsaber.Core.Collection(
                                    null, {
                                        url : 'tab/menu/data'
                                    });
                            var tabMenuVM = new Lightsaber.CollectionViewModel(
                                    {
                                        models : {
                                            data : tabMenuCollection
                                        }
                                    });

                            var menuDiv = this.$el.find('.ossui-pagetabs-nav-bar .ossui_dropdown_icon');
                            var bottomMenuView = new MenuView(
                                    {
                                        config : {
                                            el : menuDiv,
                                            id : 'tabOverFlowMenu'
                                        },
                                        viewModel : tabMenuVM,
                                        menuItems : menuItems,
                                        menuOptions : {
                                            direction : 'down',
                                            expandDirection : 'right',
                                            ossuiScrollbar:true,
                                            /*jshint maxlen:1000*/
                                            menuItemTemplate : '<li oss-ui-menu-item-id="<%=menuItemId%>" class="ossui-tab-menuItem"><span tabId="<%=tabid%>" class="<%=itemtextalign%> "><%=name%></span></li>',
                                            menuClassName : 'ossui-brand-popup',
                                            hidden : 'true',
                                            sticky: true,
                                            menuMaxHeight : 350,
                                            stem : {
                                                popupMenuAnchorElement : menuDiv

                                            }
                                        }
                                    });
                        },

                        _menuClickHandle : function(event) {
                            var selectedTabId = event.data.contents().attr(
                                    'tabid');
                            this.select(selectedTabId);
                            this.refreshTabs();
                            event.stopPropagation();
                            this._addIconForDropDownMenu();
                        },

                        _triggerCloseTabEvent : function(tabId) {
                            this.trigger('tab:closed', {
                                tabId : tabId
                            });
                        },

                        /**
                         * This method can be called to refresh the tabs
                         */
                        refreshTabs : function() {
                            this.$root.tabs("refresh");
                        },

                        /**
                         * Method to return an array containing tabId and
                         * tabName pairs in the format [{tabId:'tab-1',
                         * tabName:'T1'},{}..]
                         */
                        getAllTabs : function() {
                            var tabItems = $(
                                    this.$root.find(".ossui-pagetabs-nav-bar")
                                            .children()).find("a");
                            var tabs = [];
                            tabItems.each(function(i) {
                                var tabIdAttr = $(this).attr('href');
                                var tabId = tabIdAttr
                                        .slice(6, tabIdAttr.length);
                                var tabName = $(this).html();
                                tabs[i] = {
                                    tabId : tabId,
                                    tabName : tabName
                                };
                            });
                            return tabs;
                        },
                        /**
                         * This method can be called to update the tab name
                         * 
                         * @param: tabId : unique tabId for the tab
                         * @param tabName:
                         *            tabName
                         */

                        updateTabName : function(tabId, tabName) {
                            $(
                                    this.$root.find(".ossui-pagetabs-nav-bar")
                                            .children()).find(
                                    "a[href='#tabs-" + tabId + "']").html(
                                    tabName);
                            //update name in menu
                            var menuDiv = this.$el.find('.ossui-pagetabs-nav-bar .ossui_dropdown_icon');
                            menuDiv.find('span[tabid=' + tabId + ']').html(tabName);
                            //update the old name with new name
                            var oldTabName = this.tabIdToNameMap["tabs-" + tabId];
                            this.tabNames.pop(oldTabName);
                            this.tabNames.push(tabName);
                            this.tabIdToNameMap["tabs-" + tabId] = tabName;                            
                        },
                        
                        /*
                         * Overriding this function from LS 9.0.1.6.
                         * This selects the tab correctly and also displays it on the UI
                         */
                        select : function(id) {                            
                            if (this.selected == id) {
                                return;
                            }
                            
                            /*
                             * This is the part that is overridden.
                             * Find only 'li' that have role as tab. 
                             * On the second tab page, the page button is also added as an 'li' element 
                             * and thus the tab index is not calculated correctly in LS.
                             * Overriding the selector below to include 'role=tab' so that only 'li' elements whose
                             * role is a tab are selected
                             */
                            var tabindex = this.$root.find('li[role="tab"]').index(this.$root.find('[aria-controls="tabs-'+id+'"]'));
                            this.$root.tabs('option','active',tabindex); 
                        }
                    });
            return DynamicTabPanelView;
        });

/**
* $Id: //depot/Applications/OSSUI/v10.1.0.0/components/ossui-client-zip/src/main/webapp/lib/amdocs/ossui/components/controllers/TabController.js#1 $
* $DateTime: 2017/06/08 19:26:36 $
* $Revision: #1 $
* $Change: 1837971 $
*
* COPYRIGHT NOTICE:
* Copyright (c) 2013 Amdocs.
* The contents and intellectual property contained herein,
* remain the property of Amdocs.
* 
* */ 

define( 'ossui/controllers/TabController', [
    'underscore',
    'backbone',
    'lightsaber',
    'text!lib/amdocs/ossui/components/tabs/view/template/OSSUIPageTabsTemplate.html',
    'ossui/navigation/ControllerModule',
    'ossui/widget/DynamicTabPanelView',
    'ossui/utils/OSSUIConfigurationData',
    'ossui/utils/OSSUIResourceBundle',
    'ossui/widget/ModalDialogView',
    'ossui.messaging'
], function(_, Backbone, Lightsaber, ossuiTabsTemplate, ControllerModule, DynamicTabPanelView,
            OSSUIConfigurationData, OSSUIResourceBundle, OSSUIModalDialog, Messaging) {
    
    var tabController = ControllerModule.extend({

        /**
         *  Represents the type of event(s) it can handle.
         */
        eventType : 'tab',
        
        maxNumberOfTabs : 20,
        
        currentNumberOfTabs : 0,
        
        /**
         * 
         * @param options
         */
        init : function(options) {
            
            _.bindAll(this, 'instantiateNewModule', '_handleTabAddedEvent', '_handleTabClosedEvent', '_handleTabSelectedEvent',
                '_triggerToolboxEvents', 'checkMaxNumberOfTabsReachedHandler', 'handleMaxNumberOfTabsReached', '_handleDialogClose',
                '_setupMessaging');
            this._setupMessaging();
            this.setMaximumNumberOfTabs();
            this.tabsModel = new Lightsaber.Core.Collection();
            
            this.tabCounter = 0;
            this.tabNamePrefix = OSSUIResourceBundle.prototype.getMessage('ossui.labels.pageTabs.mainTitle');
            
            var collModel = new Lightsaber.CollectionViewModel({
                models : {
                    tabs : this.tabsModel
                }
            });
            
            // create the View
            this.tabsView = new DynamicTabPanelView({
                config : {
                    el : this.$el,
                    autoRender : true,
                    template : ossuiTabsTemplate,
                    overflowHandle : 'GetNextTabPage',
                    tabDropdownMenu : true,
                    maxTabConfigCheck : this.checkMaxNumberOfTabsReachedHandler
                },
                viewModel : collModel
            });
            
            // Tab event listeners
            this.tabsView.on('tab:added', this._handleTabAddedEvent);
            this.tabsView.on('tab:closed', this._handleTabClosedEvent);
            this.tabsView.on('tab:selected', this._handleTabSelectedEvent);
            
            
            //this.tabsModel.add({id : 'searchhome', name : 'Search Dashboard' }, { silent : true });
            this.tabsModel.add({id : 'search1'}, { silent : true });

            this.tabsModel.reset(this.tabsModel.models);
            
            // TODO: Do I need to do it here?
            this.tabsView.refreshTabs();
            this.tabsView.select('search1');

            /*
             * Fix for defect 17146 - To ensure we do not show a close icon for the first tab. Ideal fix
             * would have been to not show a close tab if its the last one. But that will require quite a number 
             * of changes.
             */
            var closeFirstTabSpan = $("a[href='#tabs-search1']").next();
            $(closeFirstTabSpan).css('display', 'none');
        },

        /**
         * Initialises the OSSUI Messaging framework to allow communication with modules contained within the tabs.
         * Sets a ClientMessageService in the TabController.
         *
         * @private
         */
        _setupMessaging : function (){
            var parentUrl = Messaging.messageUtils.getTargetUrl(document.referrer);
            var parentWindow = window.parent;
            var options = {
                targetUrl : parentUrl,
                targetWindow : parentWindow
            };

            this.clientMessageService =  Messaging.messageServiceFactory.createMessageService(Messaging.constants.MODE_CLIENT, options);
        },

        /**
         * This function is just a place holder to allow applications to set their own configuration value
         * 
         * Applications can override this method to set their own values for maxNumberOfTabs
         */
        setMaximumNumberOfTabs : function(){
            //this.maxNumberOfTabs = <value>
        },
        
        _handleTabAddedEvent : function (eventData) {
            this.currentNumberOfTabs++;
            if (eventData.tabId !== 'searchhome') {
                this.tabsView.select(eventData.tabId);
                this.tabCounter++;
                // Don't update the tab name if the flag is set
                if (_.isUndefined(eventData.useThisName) || eventData.useThisName === null || !eventData.useThisName)
                {
					var listOfTabs = this.$el.find('.ossui-pagetabs-nav-bar .ui-tabs-anchor');
					var numberOfMatchingTabs = 0;
					for (var i in listOfTabs){
						var tab = listOfTabs[i];
						if (!_.isUndefined(tab.innerHTML) && tab.innerHTML !== null && tab.innerHTML !== ''){
							var tabTextContainsName = tab.innerHTML.indexOf(this.tabNamePrefix);
							if(tabTextContainsName !== -1){
								numberOfMatchingTabs++;
							}
						}
					}
                    //TODO: Get it confirmed from PdO about naming of the tabs and update the following.
                    this.tabsView.updateTabName(eventData.tabId, this.tabNamePrefix + (numberOfMatchingTabs+1));
                }
                
                this.instantiateNewModule('#tabs-' + eventData.tabId, eventData);
            }
            
            this._triggerToolboxEvents('repositionToolbox');           
        },
        
        _handleTabSelectedEvent : function (eventData) {
            this._triggerToolboxEvents('repositionToolbox');
            this.clientMessageService.publish(eventData, 'tabSelected');
        },
        
        _handleTabClosedEvent : function (eventData) {
            //this.tabCounter--;
            //TODO : If anything need be
            var keyStr = '#tabs-' + eventData.tabId;
            
            var moduleInstance = this.moduleInstances[keyStr];
            if(this.currentNumberOfTabs > 0) {
                this.currentNumberOfTabs--;                
            }
            if (moduleInstance){
                moduleInstance.destroy();
            }
        },
        
        /**
         * This handler is called from the DynamicTabPaneView to check 
         */
        checkMaxNumberOfTabsReachedHandler : function(){
            
            if(this.currentNumberOfTabs < this.maxNumberOfTabs){
                return false;
            }else{
                this.handleMaxNumberOfTabsReached();
                return true;
            }
            
        },
        
        handleMaxNumberOfTabsReached : function(){
            var errorMsg = OSSUIResourceBundle.prototype.getMessage('ossui.errorMessages.tabs.maxTabsExceededError') ||
            'Maximum number of tabs reached.';
            this.modalWarningWindow = new OSSUIModalDialog({
                viewModel :  new Lightsaber.Core.ViewModel(),
                title : OSSUIResourceBundle.prototype.getMessage('ossui.labels.heading.tabs.maxTabsExceededTitle'),
                height : 212,
                buttons :   [  {
                    text : OSSUIResourceBundle.prototype.getMessage('ossui.labels.button.okString') || 'Ok',
                    click : this._handleDialogClose
                        
                } ],
                config  : {
                dialogtemplate : '<span class="ossui-error-messageicon"></span><span>' + 
                errorMsg +
                '</span>' 
                }
            });
            this.modalWarningWindow.render();
        },
        
        /**
         * Default handling for the close of the warning message
         */
        _handleDialogClose : function(){
            //here this is the dialog's reference
            if(this.modalWarningWindow){
                this.modalWarningWindow.close();
                this.modalWarningWindow = null;
            }
        },
        
        instantiateNewModule : function(moduleElement, moduleParams) {
            
            var moduleConfig;
            
            if (moduleParams.registeredModuleId) {
                moduleConfig = _.clone(this.getModuleConfig(moduleParams.registeredModuleId));
                moduleConfig.params = moduleParams.payload;
                this.on('load:' + moduleParams.registeredModuleId, this.handleModuleLoadedEvent);
            }else {
                moduleConfig = _.clone(this.getModuleConfig('ann-tab-module'));
                moduleConfig.params = moduleParams;
                this.on('load:' + 'ann-tab-module', this.handleModuleLoadedEvent);
            }
            
            moduleConfig.el = moduleElement;
            
            this.instantiateModule(moduleConfig);
            
            return moduleConfig;
        },
        
        /**
         * Handle the 'tab' related events received.
         * @param eventData - event data object. Contains information required to perform the event.
         * This event is triggered only when a OSSUI event comes for tab addition
         * that is from the application and not when tab is added dynamically
         * 
         */
        handleEvent : function(eventData) {
            if (eventData.eventAction === 'addTab') {
                if(this.currentNumberOfTabs < this.maxNumberOfTabs) {
                    this.tabsView.addTab(eventData);
                    //BT - removed this line as this is getting added to also by _handleTabAddedEvent
                    //causing +2 to the tab count for every tab created
                    //As far as I can tell nothing else within the application currently calls this method
                    //since nothing else creates new tabs via this event
                    //this.currentNumberOfTabs++;
                }else{
                    this.handleMaxNumberOfTabsReached();
                }
            }
            else if (eventData.eventAction === 'closeTab') {
                this.tabsView.closeTab(eventData);
            }
            
            //TODO: Handling of remaining events.
        },
        
        /**
         * Trigger Toolbox events if necessary.
         * 
         * @eventAction - action that needs to be performed on toolbox
         */
        _triggerToolboxEvents : function(eventAction) {
         
            var isToolboxEnabled = OSSUIConfigurationData.prototype.getConfig('ossui', 'ossui_enableToolbox');
            
            if (isToolboxEnabled === true) {
                var toolboxEventData = {
                        eventType : 'toolbox',
                        eventAction : eventAction,
                        payload : {}
                };                
                this.trigger("OSSUIEvent", toolboxEventData);
            }
        }
    });

    return tabController;
});

define('ossui/widget/DatepickerView',
[	'jquery',
	'jquery.ui',
	'underscore', 
	'lightsaber'

], function($, $$, _, Lightsaber) {

	var Datepicker = Lightsaber.Core.View.extend({
		_element : null,
		_locale  : null,
		
		initialize : function(options) {
			_.bindAll(this,'extendDatepicker');
			this._element = this.getConfig('element') || this.element || options.element;
			this._locale  = this.getConfig('locale') || this.locale|| options.locale;			
			this.target = this.getConfig('target') || this.target || options.target;
			this.dateFormat = this.getConfig('dateFormat') || this.dateFormat || options.dateFormat;
			this.extendDatepicker();			
		},
		
		extendDatepicker : function(){		
			$.datepicker.setDefaults(_.extend({
				showOn : "button",
				buttonImage : "res/amdocs/ossui/images/DatePicker_Icon.png",
				changeYear: true,
				buttonImageOnly : true,
				showButtonPanel : true,
				dateFormat : this.dateFormat,
				beforeShow : function(input) {
					setTimeout(function() {
						var buttonPane = $(input).datepicker("widget").find(".ui-datepicker-buttonpane");
						$("<button>", {
							text : "Clear",
							click : function() {
								$.datepicker._clearDate(input);
							}
						}).addClass("ui-state-default ui-priority-primary ui-corner-all").appendTo(buttonPane);
						//Mark this as OSSUI datepicker instance for further custom styling
						$(input).datepicker("widget").addClass("ossui-datepicker");						
					}, 1);
				},
				
				onChangeMonthYear : function(input) {
					var targetinput=this;
					setTimeout(function() {
						var buttonPane = $(input).datepicker("widget").find(".ui-datepicker-buttonpane");
						$("<button>", {
							text : "Clear",
							click : function() {
								$.datepicker._clearDate(targetinput);
							}
						}).addClass("ui-state-default ui-priority-primary ui-corner-all").appendTo(buttonPane);
					}, 1);
				}
			}, $.datepicker.regional[this._locale]));

		},
		
		
		_postRender : function() {
			if(this.target === undefined)
			{
				$(this._element).datepicker();
			}else{
				this.target.find(this._element).datepicker();
			}		
		}
		
		
	}); 

	return Datepicker;
});


define('text!lib/amdocs/ossui/components/duallist/collectionviews/template/CollectionListItem.html',[],function () { return '<div class="attributerow" style="text-align: left;">\n\n\t<div data-uxf-point="textView" class="ossui-duallist-draggable" style="display: inline-block; margin-left: 17px;">\n\t\t<img src=\'res/amdocs/ossui/images/draghandle.png\' />\n\t</div>\n\t<div data-uxf-point="ossui-duallist-labelView-wrapper" style="display: inline-block;">\n\t\t<div data-uxf-point="ossui-duallist-labelView" class="ossui-duallist-collectionview-label"\n\t\t\tstyle="display: inline-block;"></div>\n\t\t<div data-uxf-point="ossui-duallist-id-hidden" style="visibility: hidden; display: none;"></div>\n\t</div>\n\t<div data-uxf-point="ossui-duallist-buttonView" class="ossui-duallist-buttonView"></div>\n</div>';});

define(
        'ossui/widget/CheckboxTextView',
        [ 'underscore', 'lightsaber', 'jquery.ui',
          'text!lib/amdocs/ossui/components/duallist/collectionviews/template/CollectionListItem.html'
                 ],
        function(_, Lightsaber, jqUI, DefaultCollectionListItemTemplate
                ) {

            var CheckboxTextView = Lightsaber.Core.View
                    .extend({

                        vmKeys : {
                            'action.click' : 'updateModel'
                        },

                        initialize : function() {
                            // this._super();
                            this._initialize();

                            if ($.isEmptyObject(this.template) === true) {
                                // default template
                                this.template = DefaultCollectionListItemTemplate;
                            }
                        },


                        _initialize : function(option) {                            
                        },

                        _postRender : function() {                        
                            if ($.isEmptyObject(this.viewModel.models.model) === false) {
                                this._createContent();
                            }
                        },
                        
                        destroy: function() {
                            for (var key in this.subViews) {
                                this.subViews[key].viewInstance.viewModel.off();
                                this.subViews[key].viewInstance.viewModel.destroy();
                            }
                            this._super(true);
                            this.viewModel.destroy();
                        },

                        _createContent : function() {
                            var checkboxViewBtn = new Lightsaber.CheckboxView(
                                    {
                                        viewModel : new Lightsaber.Core.ViewModel(
                                                {
                                                    models : {
                                                        myModel : new Lightsaber.Core.Model()
                                                    },
                                                    data : {
                                                        text : '',
                                                        label : ' ',
                                                        value : this.viewModel.models.model.attributes.value
                                                    },
                                                    dataBindings : [ {
                                                        'fieldValue' : 'models.myModel.state',
                                                        options : {
                                                            setOnBind : true,
                                                            twoWay : true
                                                        }
                                                    } ]

                                                }),
                                        config : {
                                            inputAttributes : {
                                                checked : this.viewModel.parentVM.getConfig('initialState')
                                            }
                                        },
                                        vmKeys : this.vmKeys
                                    });
                            this.subViews.push({viewInstance: checkboxViewBtn});

                            checkboxViewBtn.bind("changed:value",
                                            function(data) {
                                                this.viewModel.handleAction(this.vmKeys['action.click'],
                                                                this.viewModel.models.model.attributes.name);
                                            }, this);

                            this.$("[data-uxf-point='ossui-duallist-id-hidden']")
                                  .append(this.viewModel.models.model.attributes.id);
                            
                            this.$("[data-uxf-point='ossui-duallist-labelView']")
                                    .append(this.viewModel.models.model.attributes.displayValue);
                            this.$("[data-uxf-point='ossui-duallist-buttonView']")
                                    .append(checkboxViewBtn.$el);

                            var currentImage = this.$root
                                    .find("[class='ossui-duallist-draggable'] img");
                            if ($.isEmptyObject(currentImage) ===  false)
                            {
                                if(this.config.draggableImageVisibility === "hide")
                                    {
                                        this.$("[class='ossui-duallist-draggable'] img").hide(); 
                                    }
                                else
                                    {
                                        this.$("[class='ossui-duallist-draggable'] img").show(); 
                                    }
                                
                            }
                        }
                    });

            return CheckboxTextView;
        });

define('text!lib/amdocs/ossui/components/duallist/collectionviews/template/CollectionList.html',[],function () { return '<div id="listItem">\n\t<div data-uxf-point=\'ListLabel\'></div>\n\t<div data-uxf-point=\'List\' class="ossui-duallist-ListView ossui-duallist-ListViewMargin-Left"></div>\n</div>';});

define('text!lib/amdocs/ossui/components/buttons/view/templates/OSSUIDefaultButtonTemplate.html',[],function () { return '<button class="uxf-button ossui-button" data-uxf-point="buttonElement"><%=text%></button>';});

define(
        'ossui/widget/SortableCollectionView',
        [ 'underscore', 'lightsaber', 'jquery.ui',
          'ossui/widget/CollectionView'
          ],
        function(_, Lightsaber, jqUI, OSSUICollectionView) {

            var SortableCollectionView = Lightsaber.Core.View
                    .extend({

                        sortable : true,

                        vmKeys : {
                            "action.postSort" : "postSort"
                        },

                        initialize : function() {
                            this._initialize();
                        },

                        _initialize : function(option) {                            
                            var self = this;
                            this.sortable = this.getConfig('sortable')
                                    && this.sortable;
                            this.options.sortConfig.stop = function(event, ui) {
                                self.viewModel.handleAction(
                                        self.vmKeys['action.postSort'], event,
                                        ui);
                            };
                        },
                        
                        destroy: function() {
                            this.viewModel.destroy();
                            this._super();                    
                        },

                        _postRender : function() {
                            this._createSortableCollectionView();
                        },

                        _createSortableCollectionView : function() {
                            var collView = new OSSUICollectionView({
                                el : this.$el,
                                viewModel : this.viewModel,
                                config : this.options.viewConfig
                            });
                            if (this.sortable) {
                                this.$(this.options.viewConfig.viewEl)
                                        .sortable(this.options.sortConfig);
                            }
                            
                            this.subViews.push({viewInstance: collView});
                        }

                    });

            return SortableCollectionView;
        });


define(
        'ossui/widget/CollectionListView',
        [
                'underscore',
                'jquery',
                'lightsaber',
                'text!lib/amdocs/ossui/components/duallist/collectionviews/template/CollectionList.html',
                 'text!lib/amdocs/ossui/components/buttons/view/templates/OSSUIDefaultButtonTemplate.html',
                'ossui/widget/SortableCollectionView',
                'ossui/widget/ScrollbarWidget'],
        function(_, $, Lightsaber, DefaultCollectionListTemplate,ossuidefaultbuttontempl,
                 SortableCollectionView, OssuiScrollbar) {

             var CollectionListView = Lightsaber.Core.View
                    .extend({

                        //template : DefaultCollectionListTemplate,

                        emptyCurrentSection : function() {
                            this.$el.off();
                            this.$el.empty();
                        },

                         initialize : function() {
                            _.bindAll(this, 'onAddRemoveAll');
                            if (this.options.config.useCaseCollectionListTemplate && this.options.config.useCaseCollectionListTemplate !== '') {
                                this.template = this.options.config.useCaseCollectionListTemplate;
                            } else {
                                // default template
                                this.template = DefaultCollectionListTemplate;
                            }
                            
                            this.emptyCurrentSection();

                            Lightsaber.Core.View.prototype.initialize.call(
                                    this, arguments);

                        },

                        _postRender : function() {
                            this._createView();
                        },
                        
                        onAddRemoveAll : function() {
                           this.trigger('addRemoveAll', this.getConfig('addRemveOpration'));
                        },
                        
                        addButtons :  function(view) {
                            // ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
                            // ~~~~~~~~ Buttons View Model ~~~~~~~~~~
                            // ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
                            var buttonModel = new Lightsaber.Core.Model();
                            var buttonViewModel = new Lightsaber.FormElementViewModel(
                                    {
                                        data : {
                                            labelAddAllData : this.options.config.addRemveButtonTitle
                                        },
                                        models : {
                                            myModel : buttonModel
                                        },

                                        config : {
                                            actions : {

                                                addRemoveAllData: this.onAddRemoveAll

                                            }
                                        }

                                    });
                                    
                                     var addAllButtonView = new Lightsaber.ButtonView({
                                viewModel : buttonViewModel,
                                config : {
                                    el : '#addRemoveAllbutton',
                                    template : ossuidefaultbuttontempl
                                },
                                vmKeys : {
                                    "data.text" : "labelAddAllData",
                                    "action.click" : "addRemoveAllData"
                                }
                            });
                            
                            view.subViews.push({viewInstance: addAllButtonView});
                        },

                        _createView : function() {

                            var labelViewModel = new Lightsaber.Core.ViewModel(
                                    {
                                        data : {
                                            label : this.viewModel.data.attributes.label
                                        }
                                    });

                            var LabelView = Lightsaber.Core.View.extend({
                                template : this.getConfig('labelTemplate')

                            });

                            var view = new LabelView({

                                viewModel : labelViewModel,
                                el : this.$("[data-uxf-point='ListLabel']"),
                                vmKeys : {
                                    "data.label" : "label"
                                }
                            });
                            if (this.getConfig('showAddRemoveAll'))
                            {
                               this.addButtons(view);
                               this.on('addRemoveAll',this.getConfig('addRemoveAllProxy')); 
                            }
                            
                            this.subViews.push({viewInstance: view});

                            var viewTypeClass = this.getConfig('viewType');
                            var sortable = this.getConfig('sortable') && true;
                            var listElement = this.$("[data-uxf-point='List']");
                            this._createCollectionView(listElement, this.viewModel, viewTypeClass, sortable);
                            var scrollPane = this.$("[data-uxf-point='ossui-content']");
                            var viewPort = this.$("[data-uxf-point='List']");
                            this.scrollbar = new OssuiScrollbar({scrollbarScrollPane:scrollPane, scrollbarViewPort : viewPort,
                                scrollbarType : 'ossui-custom-scrollbar', scrollbarWidth : '6px'});
                        },

                        _createCollectionView : function(element,
                                collectionViewModel, viewTypeClass, sortable) {

                            var collView = new SortableCollectionView(
                                    {
                                        el : element,
                                        viewModel : collectionViewModel,
                                        config : {
                                            sortable : sortable
                                        },
                                        viewConfig : {
                                            template : '<div data-uxf-point="ossui-content"></div>',
                                            viewType : viewTypeClass,
                                            viewEl : 'div[data-uxf-point="ossui-content"]'
                                        },
                                        sortConfig : {
                                            handle : ".ossui-duallist-draggable",
                                            cursor : "move"
                                        }
                                    });
                            this.subViews.push({viewInstance: collView});
                        },
                        
                        destroy: function() {
                            this.off('addRemoveAll',this.getConfig('addRemoveAllProxy')); 
                            this.scrollbar.removeScrollbar();
                            delete this.scrollbar;
                            this._super(true);                            
                        }
                    });

            return CollectionListView;
        });


define('text!lib/amdocs/ossui/components/duallist/collectionviews/template/CollectionDualListView.html',[],function () { return '<div>\n\t<div id="dual_list_loading" style="visibility: hidden">\n\t\t<div class="dual_list_loading_icon">\n\t\t\t<img src="res/amdocs/ossui/images/loading_icon.gif" />\n\t\t</div>\n\t</div>\n\t<div data-uxf-point=\'firstCollectionListView\' class="ossui-duallist-attributeList"></div>\n\t<div data-uxf-point=\'secondCollectionListView\'\n\t\tclass="ossui-duallist-attributeList ossui-duallist-additionalAtrrListViewMargin-Left"></div>\n</div>';});

define('text!lib/amdocs/ossui/components/duallist/collectionviews/template/CollectionListLabel.html',[],function () { return '<div>\n\t<span class="ossui-duallist-attributeLabel"><%=label%></span>\n\t<span id="addRemoveAllbutton" class="ossui-duallist-attributeAllButton" ></span>\n</div>';});

define(
        'ossui/widget/CollectionDualListView',
        [
                'underscore',
                'jquery',
                'jquery.ui',
                'lightsaber',
                'ossui/widget/CollectionListView',
                'text!lib/amdocs/ossui/components/duallist/collectionviews/template/CollectionDualListView.html',
                'text!lib/amdocs/ossui/components/duallist/collectionviews/template/CollectionListLabel.html'
                 ],
        function(_, $, ui, Lightsaber, CollectionListView,
                DefaultCollectionDualListViewTemplate, DefaultCollectionListLabelTemplate) {
            

            /**
             * This view is used to create dual collection list. It expect the
             * below parameters el : element, viewModel : viewModel,
             * config.firstListVM : viewModel for first side collection view,
             * config.secondListVM : viewModel for second side collection view,
             * config.viewType : view type for items attached inside.
             * 
             */
            var CollectionDualListView = Lightsaber.Core.View
                    .extend({

                        initialize : function() {
                            if (arguments[0].config.useCaseCollectionDualListViewTemplate && arguments[0].config.useCaseCollectionDualListViewTemplate !== '') {
                                this.template = arguments[0].config.useCaseCollectionDualListViewTemplate;
                            } else {
                                this.template = DefaultCollectionDualListViewTemplate;
                            }
                            if (arguments[0].config.useCaseCollectionListLabelTemplate && arguments[0].config.useCaseCollectionListLabelTemplate !== '') {
                                this.options.config.labelTemplate = arguments[0].config.useCaseCollectionListLabelTemplate;
                            } else {
                                this.options.config.labelTemplate = DefaultCollectionListLabelTemplate;
                            }

                            if ($.isEmptyObject(arguments[0].config.useCaseCollectionListTemplate) === false) {
                                this.options.config.collectionListTemplate = arguments[0].config.useCaseCollectionListTemplate;
                            } 

                            Lightsaber.Core.View.prototype.initialize.call(this, arguments);
                        },

                        _postRender : function() {

                            this.firstListVM = this.getConfig('firstListVM');
                            this.secondListVM = this.getConfig('secondListVM');
                            var configTemplate  = this.options.config.labelTemplate;
                            var configCollectionListTemplate  = this.options.config.collectionListTemplate;
                            var viewTypeClassFirst = this.getConfig('viewTypeFirst');
                            var viewTypeClassSecond = this.getConfig('viewTypeSecond');

                            var firstListCollectionEl = this.$("[data-uxf-point='firstCollectionListView']");
                            var secondListCollectionEl = this.$("[data-uxf-point='secondCollectionListView']");
                            var showAddRemoveAll = this.getConfig('showAddRemoveAll');
                            var addRemoveAllProxy = this.getConfig('addRemoveAllProxy');

                            // create first collection view list                            
                            this.firstListVM.on('items:loaded',
                                function() {
                                    // Create first collection list view
                                    this.createList(this.firstListVM, firstListCollectionEl,
                                        {
                                            labelTemplate : configTemplate,
                                            useCaseCollectionListTemplate: configCollectionListTemplate,
                                            viewType : viewTypeClassFirst,
                                            sortable : true,
                                            viewId : "firstView",
                                            addRemveButtonTitle: "Remove All",
                                            showAddRemoveAll: showAddRemoveAll,
                                            addRemoveAllProxy:addRemoveAllProxy, 
                                            addRemveOpration:"remove"
                                            
                                        });                                                                          
                                }, this);
                            //create second collection view list
                            this.secondListVM.on('items:loaded',
                                function() {
                                    //Create right collection list view
                                    this.createList(this.secondListVM, secondListCollectionEl,
                                        {
                                            labelTemplate : configTemplate,
                                            useCaseCollectionListTemplate: configCollectionListTemplate,
                                            viewType : viewTypeClassSecond,
                                            sortable : false,
                                            viewId : "secondView",
                                            addRemveButtonTitle:"Add All",
                                            showAddRemoveAll: showAddRemoveAll,
                                             addRemoveAllProxy:addRemoveAllProxy, 
                                            addRemveOpration:"add"
                                        });                                                                          
                                }, this);  
                                                                 
                        },
                        
                        createList: function(viewModel, el, config) {
                            var collectionListView = new CollectionListView({
                                el: el,
                                viewModel: viewModel,
                                config: config
                            });
                            this.subViews.push({viewInstance: collectionListView});
                            return collectionListView;
                        },
                        
                        destroy: function() {
                            this._super();
                            this.addRemoveAllProxy = null;
                            this.subViews.length = 0;
                            this.firstListVM.destroy();                            
                            this.secondListVM.destroy();
                        }
                        
                    });

            return CollectionDualListView;

        });
	
define(
        'ossui/widget/DualListModel',
        [ 'underscore', 'lightsaber' ], function(_, Lightsaber) {

    /**
     * Represents a record in the dual list  model,
     * The discriminator is the "status" field
     * "1" for the "current" (left) panel
     * "2" for the "available" (right) panel
     * 
     * The displayable value is "displayValue" 
     */
    var DualListModel = Lightsaber.Core.RESTModel.extend({

        defaults : {
            name : "default",
            
            // "1" for the "current" (left) panel
            // "2" for the "available" (right) panel
            status : "1 or 2",  
            
            displayValue : {
                value : -1
            }
        }

    });

    return DualListModel;
});

/*
 * $Id$ 
 * $DateTime$ 
 * $Revision$ 
 * $Change$
 * 
 * COPYRIGHT NOTICE:
 * Copyright (c) 2012 Amdocs.
 * The contents and intellectual property contained herein,
 * remain the property of Amdocs.
 */
define('ossui/utils/OSSUIBasicUtils',[
	'jquery',
	'underscore',
	'lightsaber'
], function($, _, Lightsaber) {

	/**
	 * Utility functions that don't have any 'complex' dependencies. This keeps the
	 * dependency graph simple, and helps to avoid problems with different jQuery
	 * versions (esp. for models).
	 */
	function OSSUIBasicUtils() {

		/**
		 * Encodes a string so that special characters are HTML encoded.
		 *   For example, it will convert "town/city" to "town&#x2F;city".
		 */
		this.htmlEscape = function(value) {
			if (!_.isString(value) || value.length === 0) return value;
			return _.escape(value);
		};

		/**
		 * Unencodes a string that may contain HTML encoded characters.
		 *   For example, it will convert "town&#x2F;city" to "town/city".
		 */
		this.htmlUnescape = function(value) {
			if (!_.isString(value) || value.length === 0) return value;
			return this._unescape(value);
		};

		this._invert = function(obj) {
			var result = {};
			var keys = _.keys(obj);
			for (var i = 0, length = keys.length; i < length; i++) {
				result[obj[keys[i]]] = keys[i];
			}
			return result;
		};

		this._entityMap = {
			escape: {
				'&': '&amp;',
				'<': '&lt;',
				'>': '&gt;',
				'"': '&quot;'
			},

			REGEXP_HEX : "&#x([0-9A-F])+;"
		};
		this._entityMap.unescape = this._invert(this._entityMap.escape);
		this._entityMap.unescape[this._entityMap.REGEXP_HEX] = "REGEXP_HEX";


		this._entityRegexes = {
			escape:   new RegExp('[' + _.keys(this._entityMap.escape).join('') + ']', 'g'),
			unescape: new RegExp('(' + _.keys(this._entityMap.unescape).join('|') + ')', 'g')
		};

		this._unescape = function(string) {
			if (string.indexOf('&') === -1) return string;
			var self = this;
			return string.replace(this._entityRegexes.unescape, function(match) {
				var result = self._entityMap.unescape[match];

				// hex encoded character, e.g., "&#x2F;" --> "/".
				if (!_.isString(result) && (match.match(self._entityMap.REGEXP_HEX) !== null)) {
					var hex = match.substring(3, match.length-1);
					var num = parseInt(hex, 16);
					result = (num >= 32 && num <= 255) ? String.fromCharCode(num) : "";
				}
				
				return result;
			});
		};
	}

	return new OSSUIBasicUtils();
});

// console.log('* ossui/utils/OSSUIBasicUtils loaded');



define('ossui/widget/DualListCollection',
        [ 'underscore', 'jquery', 'jquery.ui', 'lightsaber','backbone',
        'ossui/widget/DualListModel' ,     'ossui/widget/ModalDialogCallback',
        'ossui/utils/OSSUIBasicUtils'],
        function(
        _, $, ui, Lightsaber, Backbone, DualListModel , ModalDialogCallback, OSSUIBasicUtils) {

    var DualListCollection = Lightsaber.Core.Collection
            .extend({

                model : DualListModel,

                options : {
                    error : this.errorHandler,
                    success : this.successHandler
                },
                data : {
                },
                initialize : function(request) {
                    // do not need the URL as we are using the Lightsaber REST Data Source (which has the the url  in it) 
                    //  this.url = request.url;
                      
                    this.parentData = ($.isEmptyObject(request.parentData) === false)?request.parentData:"n/a";
                    this.parentObject = ($.isEmptyObject(request.parentObject) === false)?request.parentObject:"";
                    this.data.errorEventNumber = 0;

                    // fix: pass method names to 'bindAll', otherwise the 'model' property will be trashed.
                    _.bindAll(this, 'successHandler', 'errorHandler', 'parse', 'fetch', 'getAllAttributes');

                    //                            console
                    //                                    .log('DLElements Collection init');
                    Lightsaber.Core.Collection.prototype.initialize.call(this);
                },

                // This is the function that gets called
                // on a successful load.
                successHandler : function(data, response) {
                    // this.reset(this.model);
                    // preserve the original collection in the "data" area of the calling VM
                    if (typeof (this.parentData.originalCollection) != 'undefined') {
                        if (this.parentData.originalCollection.length <= 0) {
                            for ( var i = 0; i < data.models.length; i++) {
                                this.parentData.originalCollection
                                        .add(new Backbone.Model(
                                                data.models[i].toJSON()));
                            }
                        }
                    }

                    // sling back another event to the calling View
                    ModalDialogCallback.trigger('listLoadedSuccessHandler',this);
                },

                errorHandler : function(data, response) {
                    //console.trace();
                    
                    // multiple Backbone event bindings happen here ; ignoring all bar the first one,
                    if (this.data.errorEventNumber  <= 0 )
                        {
                            ModalDialogCallback.trigger('listLoadedErrorHandler',response);
                            this.data.errorEventNumber = this.data.errorEventNumber + 1;
//                            console.log("DualList Collection  INNER :Error # :" +this.data.errorEventNumber);
                            
                        }
                    // preventing repetitive events
                    if (!$.isEmptyObject(this.parentObject)) {
                        this.parentObject.undelegateEvents();
                    }
                    this.unbind();

                     // preventing remnant loadingScreen
                    if (!$.isEmptyObject(this.parentObject)) 
                    {
                     this.parentObject.hideLoadingScreen();
                    }
                     return false;
                },

                parse : function(response) {
                            // console.log('DualList Collection PARSE called ');

                    // html decode the response, e.g., "town&#x2F;city" to "town/city"
                    if (_.isArray(response)) {
                        _.each(response, function(responseObj) {

                            responseObj.id = OSSUIBasicUtils.htmlUnescape(responseObj.id);
                            responseObj.name = OSSUIBasicUtils.htmlUnescape(responseObj.name);
                            responseObj.displayValue = OSSUIBasicUtils.htmlUnescape(responseObj.displayValue);
                        });
                    }
                    return response;

                },

                fetch : function(objectId, objectClass) {
                    //                            console
                    //                                    .log('DualList Collection FETCH called ');
                    /* implement a specific query  if needed
                     * data = key="id" value = "id001 " ????
                    this.options.data = QueryParamsUtil
                            .makeQueryString({
                                objectID : objectId,
                                objectClass : objectClass,
                                display : 'more'
                            });
                     */
                    this.options.success = this.successHandler;
                    Lightsaber.Core.Collection.prototype.fetch.call(this,
                            this.options);
                },

                getAllAttributes : function(objectId, objectClass) {
                    if (!$.isEmptyObject(this.parentObject)) {
                        this.parentObject.showLoadingScreen();
                    }
                    try {
                        this.fetch(objectId, objectClass);
                    } catch (error) {
                        if (!$.isEmptyObject(this.parentObject)) {
                            this.parentObject.handleGlobalError(error);
                        }
                    }
                },
                
                clean: function() {                    
                    delete this.parentObject;
                    delete this.parentData;
                    delete this.data;
                }
            });
    return DualListCollection;
});

define('text!lib/amdocs/ossui/components/duallist/view/template/DualListView.html',[],function () { return '<div data-uxf-point=\'dualAttrListView\'></div>\n<div id="buttons" style="margin-left: 600px;">\n\t<table>\n\t\t<tr>\n\t\t\t<td><div id="cancelbutton"></div></td>\n\t\t\t<td><div id="savebutton"></div></td>\n\t\t</tr>\n\t</table>\n</div>';});

define('ossui/widget/FormInputViewModel',[
      'underscore',
      'lightsaber',
      'ossui/utils/OSSUIResourceBundle'
      ], function(_, Lightsaber, OSSUIResourceBundle) {

	var formInputViewModel = Lightsaber.Core.ViewModel.extend({

		defaults:
		{            
			inputErrorMessageId :'inputerrormessageid',
			cancelButtonName    :'Cancel',
			okButtonName    :'OK'
		},

		initialize : function(options) {
			_.bindAll( this ,'overrideDefaults');
			this.overrideDefaults();
		},

		overrideDefaults: function(){

			var okButtonlabel = OSSUIResourceBundle.prototype.getMessage('ossui.labels.button.okString');
			if(okButtonlabel){
				this.set('okButtonName',okButtonlabel);
			}

			var cancelButtonLabel = OSSUIResourceBundle.prototype.getMessage('ossui.labels.button.cancelString');
			if(cancelButtonLabel){
				this.set('cancelButtonName',cancelButtonLabel);
			}

			for(var i=0; i<this.models.data.attributes.inputfields.length; i++) {			
				this.set('inputLabel'+i,this.models.data.attributes.inputfields[i].label);	
			}
			
			this.trigger('viewModelLoaded');
		},
		
		save : function(dialogObj){            
			var inputError = false;	
			var errorFields = [];	
			for(var i=0; i<this.models.data.attributes.inputfields.length; i++) {
				var inputField = this.models.data.attributes.inputfields[i];		 
				inputField.value = this.models.data.get(inputField.name);	 
				// do validation here if 'validate' is true
				if(this._validateInput(inputField) === true) {
					inputError = true;
					errorFields.push(inputField);
				} else {
					var inputId = inputField.name;
					var errorInputDiv = $(dialogObj).find('#'+ inputId);
					$(errorInputDiv[0]).css('color','#2f3538');
				}
			}	

			if(inputError === true) {
				this.trigger('inputError',errorFields);		
			} else {
				$(dialogObj).dialog("close");
				$(dialogObj).remove();
				this.trigger('inputSuccess');
				this.clear();
			}
		},
		
		clear : function() {
			for(var i=0; i<this.models.data.attributes.inputfields.length; i++) {
				var inputField = this.models.data.attributes.inputfields[i];	
				this.models.data.set(inputField.name,'');
			}
		},

		_validateInput: function(inputObject){
			if(!_.isUndefined(inputObject)) {
				if(inputObject.type === 'text' || inputObject.type === 'string') {
					return _.isEmpty(inputObject.value);
				} else if(inputObject.type === 'number' ) {
					if(!_.isEmpty(inputObject.value))
						return !isFinite(Number(inputObject.value));
					return true;					
				}
			}
		}

	});
	return formInputViewModel;
});
define('text!lib/amdocs/ossui/components/form/view/templates/forminputviewtemplate.html',[],function () { return '<div>\n\t<div class=\'ossui-forminput-error\'>\n\t\t<span class="ossui-warning-messageicon"></span> <span\n\t\t\tid=\'inputerrormessageid\' class=\'ossui-forminput-errorMessage\'></span>\n\t</div>\n\t<div class=\'ossui-user-field\'></div>\n</div>\n';});

/**
* $Id: //depot/Applications/Cramer/Dev/Task-Branches/ossui-portal-stage/main/components/ossui-container-war/src/main/webapp/lib/amdocs/ossui/components/form/view/FormInputView.js#1 $ 
* $DateTime: 2013/10/16 13:43:14 $ 
* $Revision: #1 $ 
* $Change: 850842 $
*
* COPYRIGHT NOTICE:
* Copyright (c) 2013 Amdocs.
* The contents and intellectual property contained herein,
* remain the property of Amdocs.
* 
* */
define('ossui/widget/FormInputView',[
    'jquery',
    'underscore',
    'lightsaber',
    'ossui/utils/OSSUIResourceBundle',
    'text!lib/amdocs/ossui/components/form/view/templates/forminputviewtemplate.html'
], function($, _, Lightsaber, OSSUIResourceBundle, formInputViewTemplate) {


    var formInputView = Lightsaber.Core.View.extend({

        template : formInputViewTemplate,

        initialize : function(options) {
            _.bindAll(this,'_processInputError');	     
            _.template((this.getConfig('template') || this.template),this.viewModel.get('data'));            
            this.viewModel.on('inputError',this._processInputError );
        },
        
        enhanceMarkup : function(options){

            var header = this.$el.find('.ossui-user-field');
            // creating div element for inputfields
            for(var i=0; i<this.viewModel.models.data.attributes.inputfields.length; i++){
                var inputLabel = this.viewModel.models.data.attributes.inputfields[i].label;
                var inputFieldId = this.viewModel.models.data.attributes.inputfields[i].name;
                var inputFieldInput = 'inputFieldInput'+i;                
                $(header).append("<div id ='"+inputFieldId+"' class='ossui-forminput-text ossui-forminput-userLabel'>"+inputLabel+"</div>");
                $(header).append("<div id='"+inputFieldId+"' class='ossui-forminput-inputField ossui-forminput-userInput' data-uxf-point='"+inputFieldInput+"'></div>");
            }

            for(i=0; i<this.viewModel.models.data.attributes.inputfields.length; i++) {
                var inputFieldName = this.viewModel.models.data.attributes.inputfields[i].name;
                var inputField = 'inputFieldInput'+i;
                var inputNameText = 'inputNameText'+i;
                var inputText = new Lightsaber.InputTextView({
                    viewModel : this.viewModel,
                    id : inputNameText,
                    vmKeys : {
                        "data.fieldValue" : inputFieldName
                    },
                    config : {
                        el : this.$( '[data-uxf-point="'+inputField+'"]')
                    }
                });
            }
        },

        _processInputError : function(errorInputs){
            this.$el.parent().parent().find('.ui-button').attr('disabled',false);
            this.$('.ossui-forminput-error').css('display','block');
            var errorMessageId = this.viewModel.get('inputErrorMessageId');
            var errorDiv = this.$('#'+ errorMessageId);
            var message = OSSUIResourceBundle.prototype.getMessage('ossui.errorMessages.invalid.forminput');            
            errorDiv.empty().append(message);		 
            var errorInputDiv = [];	
            for(var i=0; i<errorInputs.length; i++) {
                var inputId = errorInputs[i].name;
                errorInputDiv = this.$('#'+ inputId);
                $(errorInputDiv[0]).css('color','red');
            }
        }
      
    });
    return formInputView;
});
/**
 * $Id: //depot/Applications/Cramer/Dev/Task-Branches/ossui-portal-stage/main/components/ossui-container-war/src/main/webapp/lib/amdocs/ossui/components/form/view/FormInputDialog.js#1 $ 
 * $DateTime: 2013/10/16 13:43:14 $ 
 * $Revision: #1 $ 
 * $Change: 850842 $
 *
 * COPYRIGHT NOTICE:
 * Copyright (c) 2013 Amdocs.
 * The contents and intellectual property contained herein,
 * remain the property of Amdocs.
 * 
 * */

define('ossui/widget/FormInputDialog',[
   'jquery',
   'underscore',
   'lightsaber',
   'ossui/widget/ModalDialogCallback',
   'ossui/widget/FormInputView',
   'ossui/utils/OSSUIResourceBundle'
   ], function($, _, Lightsaber, ModalDialogCallback, FormInputView,
		   OSSUIResourceBundle) {

	var formInputDialog = Lightsaber.PopupView.extend({
		config : {
			position : 'center',
			resizable : false,
			show: 'fade',
			hide: 'fade',
			modal: true,
			title: 'Form Input',
			width : 386,
			height: 230,
			autoRender:false,
			autoShow : true,
			dialogClass : 'ossui-lightbox ossui-forminput',
			draggable : false,
			buttons : [  {
				text : 'OK',
				click : function(event) {
					$(this).parent().find('.ui-button').attr('disabled',true);
					ModalDialogCallback.trigger('Ok',this);	
				}
			},
			{
				text : 'Cancel',
				click : function(event) {
					$(this).dialog('close');
					$(this).remove();
				}
			}],
			
			createContent : function (self){ 
				self.contentView = new Lightsaber.Core.View({
					config: {
						template : '<div id="ossui-forminputdialog" class="ossui-forminput"></div>'
					},
					viewModel : new Lightsaber.Core.ViewModel()
				});
				self.modalDialogView = new FormInputView({
					viewModel : self.viewModel,
					el : self.contentView.$el
				});
				return self.contentView.$el;
			}
		},
		
		initialize: function(options) {
			_.bindAll(this,'okClicked');
			ModalDialogCallback.on('Ok',this.okClicked);			
			this.config.buttons[0].text = this.viewModel.get('okButtonName');
			this.config.buttons[1].text = this.viewModel.get('cancelButtonName');
			this._super();
		},

		okClicked : function(dialogObj){            
			this.viewModel.save(dialogObj);
		},
		
		_prepareHeader : function(sd) {
            this._super(sd);
        }

	});
	return formInputDialog;
});

/*
 * 
 * COPYRIGHT NOTICE:
 * Copyright (c) 2013 Amdocs.
 * The contents and intellectual property contained herein,
 * remain the property of Amdocs.
 */
define('ossui/utils/OSSUIUtils',[
                                 'jquery',
                                 'underscore',
                                 'lightsaber',
                                 'ossui/widget/ModalDialogView',
                                 'ossui/widget/FormInputViewModel',
                                 'ossui/widget/FormInputDialog',	
                                 'ossui/utils/OSSUIResourceBundle',
                                 'ossui/widget/ModalDialogCallback',
                                 'ossui.messaging'
                                 ], 
                                 /*global console */
                                 function($, _, Lightsaber, ModalDialogView, FormInputViewModel, FormInputDialog, OSSUIResourceBundle, ModalDialogCallback, Messaging) {

	function OSSUIUtils() {

		this.ERROR_ID_ZERO = "0";
		// special handling  for certain HTTP codes
		this.ERROR_ID_BAD_REQUEST = "400";
		this.ERROR_ID_UNAUTHORIZED = "401";
		this.ERROR_ID_FORBIDDEN = "403";
		this.ERROR_ID_NOT_FOUND = "404";
		this.ERROR_ID_TIMEOUT = "408";
		this.ERROR_ID_INTERNAL_SERVER = "500";
		this.ERROR_ID_SERVICE_UNAVAILABLE = "503";


		this.errorEventNumber  = 0; 
		/* jshint maxcomplexity: 12 */    
		this.isBlank = function(obj) {

			// cater for numeric  cases (eg: 0)
			if (!_.isUndefined(obj) &&   obj !== null  && (typeof obj === 'number' &&  !isNaN(obj) )) {
				return false;
			}
			// cater for Date  cases 
			if (!_.isUndefined(obj) &&   obj !== null  && (obj instanceof Date && !isNaN(Number(obj)))) {
				return false;
			}

			// if (!obj || !/\S/.test(obj)) return true;
			if (!obj || $.trim(obj) === "") {
				return true;
			}

			if (obj.length && obj.length > 0) {
				return false;
			}
			for ( var prop in obj) {
				if (obj[prop]) {
					return false;
				}
			}
			return true;
		};

		/**
		 * Action to be taken at logout phase.
		 * It needs to do the following:
		 * - call the Logout REST service
		 * - execute security token cleanup
		 * - expire the UXF security cookie
		 * - execute a reload, ensuring the cache is cleared
		 */
		this.logout = function(callingModule, custLogoutService, custLogoutPage, custErrorPage, redirectToModuleId) {

			var LogoutRestNotifier = Lightsaber.Core.RESTModel.extend({
				url : OSSUIResourceBundle.prototype.getLabel('ossui.rest.logout.url') || "services/PortalLogout"
			});

			var logoutModel = new LogoutRestNotifier({
				rest : {
					read : {
						method : "GET"
					}
				}
			});

			var appConfig = callingModule.appConfig;

			logoutModel.fetch({
				async: false,
				success : function(resp) {
					if (appConfig){
						for(var i = 0 ; i<appConfig.length; i++) { 
							var options1 = {
								responseTimeout: 5000
							};
							var portalMessageService = Messaging.messageServiceFactory.createMessageService(Messaging.constants.MODE_PORTAL, options1);
							portalMessageService.publish('true', 'sessionLogout-' + appConfig[i].appId);		
						}
					}
					
					Lightsaber.Core.StorageUtil.getStorage().deleteKey(OSSUIResourceBundle.prototype.getLabel('ossui.session.storage.username.key') || "defaultuserloginname");

					var cookieName = OSSUIResourceBundle.prototype.getLabel("ossui.cookie.security.token.name") || 'LS_SECURITY_TOKEN';
					document.cookie = cookieName + '=; expires=Thu, 1 Jan 1970 00:00:00 UTC; path=/';

					//HF Rollup OSSUI_9.1.0.11-9450.  This needs to be re-factored into 
					//smaller methods when we have some test cases to support it.
					if (custLogoutService){
						//customized logout service
						
						$.ajax({
							url: custLogoutService,
							success: function(result,status,xhr){
								console.log("ajax success");
								if (custLogoutPage){
									location.replace(custLogoutPage);
								}
								else{
									location.reload(true);	
								}
							},
							error : function(xhr,status,error){
								console.log("ajax error");
								if (custErrorPage){
									location.replace(custErrorPage);
								}
								else{
									location.reload(true);	
								}
							},
							async: false						
						});
					}
					else{
						//default logout success flow, goes to login page.
						location.reload(true);						
					}
				},
				error : function(originalModel, resp, options) {
					console.log("error: " + resp.status + ": " + resp.statusText);

					if (appConfig){
						for(var i = 0 ; i<appConfig.length; i++) { 
							var options2 = {
								responseTimeout: 5000
							};
							var portalMessageService = Messaging.messageServiceFactory.createMessageService(Messaging.constants.MODE_PORTAL, options2);
							portalMessageService.publish('true', 'sessionLogout-' + appConfig[i].appId);		
						}
					}
					
					Lightsaber.Core.StorageUtil.getStorage().deleteKey(OSSUIResourceBundle.prototype.getLabel('ossui.session.storage.username.key') || "defaultuserloginname");

					var cookieName = OSSUIResourceBundle.prototype.getLabel("ossui.cookie.security.token.name") || 'LS_SECURITY_TOKEN';
					document.cookie = cookieName + '=; expires=Thu, 1 Jan 1970 00:00:00 UTC; path=/';
					location.reload(true);
				}
			});
		};

		/**
		 * Action to be taken when the browser window is closed. Either via a tab closure or a closure of the browser.
		 * It needs to do the following:
		 * - call the Logout REST service
		 * - execute security token cleanup
		 * - expire the UXF security cookie
		 */
		this.terminateSession = function(restUrl){
			var TerminateSessionRestNotifier = Lightsaber.Core.RESTModel.extend({
				url : restUrl || OSSUIResourceBundle.prototype.getLabel('ossui.rest.logout.url') || "services/PortalLogout"
			});

			var terminateSessionModel = new TerminateSessionRestNotifier({
				rest : {
					read : {
						method : "GET"
					}
				}
			});

			terminateSessionModel.fetch({
				async: false,
				success : function(resp) {
					Lightsaber.Core.StorageUtil.getStorage().deleteKey(OSSUIResourceBundle.prototype.getLabel('ossui.session.storage.security.token.key') || "defaultLightsaberSessionToken");
					Lightsaber.Core.StorageUtil.getStorage().deleteKey(OSSUIResourceBundle.prototype.getLabel('ossui.session.storage.username.key') || "defaultuserloginname");

					var cookieName = OSSUIResourceBundle.prototype.getLabel("ossui.cookie.security.token.name") || 'LS_SECURITY_TOKEN';
					document.cookie = cookieName + '=; expires=Thu, 1 Jan 1970 00:00:00 UTC; path=/';
				},
				error : function(originalModel, resp, options) {
					console.log("error: " + resp.status + ": " + resp.statusText);

					Lightsaber.Core.StorageUtil.getStorage().deleteKey(OSSUIResourceBundle.prototype.getLabel('ossui.session.storage.security.token.key') || "defaultLightsaberSessionToken");
					Lightsaber.Core.StorageUtil.getStorage().deleteKey(OSSUIResourceBundle.prototype.getLabel('ossui.session.storage.username.key') || "defaultuserloginname");

					var cookieName = OSSUIResourceBundle.prototype.getLabel("ossui.cookie.security.token.name") || 'LS_SECURITY_TOKEN';
					document.cookie = cookieName + '=; expires=Thu, 1 Jan 1970 00:00:00 UTC; path=/';
				}
			});
		};

		// add the error code suffix at the end of the message
		this.getCodeSuffix = function(code, ifBrackets)
		{   var begin = ifBrackets?" (":" ";
		var end = ifBrackets?")":"";

		var suffix = '';
		if (!_.isUndefined(code) && ("" + code).length > 0) {
			suffix = begin + code + end;
		}
		return suffix;
		};

		/**
		 * extract the code-based message based on a double try:
		 * - firstly try to fetch the message placed underneath its code value(".errorcode.[codeValue]")
		 * - else try to fetch the message placed underneath its parent area (".errorcode")
		 * */

		this.extractCodeMessage = function (baseKeyForMessages,
				codeType, codeValue, ifBrackets)
				{
			// firstly check the branch denoted by the code value
			var localisedCodeMsg = '';
			localisedCodeMsg = OSSUIResourceBundle.prototype.getMessage(
					baseKeyForMessages
					+ '.' + codeType + '.' + codeValue);

			// else do rely on the branch situated one-level-up ( aka - no code value) 
			if (this.isBlank(localisedCodeMsg)) {
				localisedCodeMsg = 
					OSSUIResourceBundle.prototype.getMessage(
							baseKeyForMessages
							+ '.' + codeType);
			}

			if (!this.isBlank(localisedCodeMsg)) {
				return localisedCodeMsg + this.getCodeSuffix(codeValue,ifBrackets);

			} else {
				return localisedCodeMsg;
			}

				};

				/**
				 * Raises the actual popup dialog
				 */
				this.raisePopupDialog = function(message, windowTitle, windowButtonText,windowHeight,code){
					var self = this;
					if (_.isUndefined(windowTitle) || windowTitle === null){
						//english language backup if we get a message before we actually have any localisation data!
						windowTitle = "Service failure";
						windowButtonText = "OK";
					}
					if (_.isUndefined(windowHeight) || windowHeight === null){
						windowHeight = "220";
					}
					// if still blank at this stage - although unlikely.
					if (_.isUndefined(message) || message === null){
						message = windowTitle;
					}

					var okClicked = false;
					
					var modalWarningWindow = new ModalDialogView({
						viewModel :  new Lightsaber.Core.ViewModel(),
						title : windowTitle,
						height : windowHeight,
						buttons :   [  {
							text : windowButtonText ,
							click : function(event){
								okClicked = true;
								$(this).dialog("close");
								self.postErrorActions(code);
							}

						} ],
						config  : {
							dialogtemplate : '<div class="ossui-error-messageicon" style="float:left;"></div>' + 
							'<div style="overflow-y:auto;">' + 
							message+
							'</div>' 
						}
					});
					modalWarningWindow.render();
					modalWarningWindow.$el.on('dialogclose', function(){
						if (!okClicked){
							self.postErrorActions(code);
						}
					});
				};

				this.getInputModel = function(inputObjects) {
					var inputFields = [];
					for(var i=0; i<inputObjects.length; i++) {
						inputFields[i] = inputObjects[i];
					}

					var inputModel = new Lightsaber.Core.RESTModel();
					inputModel.set('inputfields', inputFields);

					return inputModel;
				};

				this.getInputViewModel = function(inputModel, inputDataBindings) {
					var inputViewModel = new FormInputViewModel({
						models : {
							data : inputModel
						},

						dataBindings : inputDataBindings				
					});

					return inputViewModel;
				};

				this.getDataBindings = function(inputModel) {
					var dataBindings = [];
					var inputFields = inputModel.get('inputfields');
					for(var i=0; i<inputFields.length; i++) {
						var bindingObj = {};
						var field = inputFields[i].name;	
						var modelAttr = 'models.data.'+field;

						bindingObj[field] = modelAttr;
						bindingObj.options = { 
								setOnBind : true,
								twoWay : true
						};					
						dataBindings.push(bindingObj);
					}

					return dataBindings;

				};

				this.raiseInputDialog = function(inputObjects, windowTitle, callback, windowHeight) {
					_.bindAll(this, 'inputDialogCallback');

					this.responseCallback = callback;
					if (_.isUndefined(windowTitle) || windowTitle === null){
						//english language backup if we get a message before we actually have any localisation data!
						windowTitle = "Form Input";			
					}
					if (_.isUndefined(windowHeight) || windowHeight === null){
						windowHeight = "220";
					}

					var inputModel = this.getInputModel(inputObjects);	
					var inputDataBindings = this.getDataBindings(inputModel);
					var inputViewModel = this.getInputViewModel(inputModel, inputDataBindings);

					this.modalInputWindow = new FormInputDialog({                              
						viewModel :  inputViewModel,

						config  : {                                  
							height : windowHeight,	
							title : windowTitle					
						}

					});
					this.modalInputWindow.render();

					inputViewModel.on('inputSuccess', this.inputDialogCallback);

				};

				this.inputDialogCallback = function() {
					this.responseCallback(this.modalInputWindow.viewModel.models.data.attributes);
				};


				/**
				 * extract error code
				 */
				this.extractStatusCode =  function(response)
				{   var code = "";
				// use the default exception status code
				if (!_.isUndefined(response) && !_.isUndefined(response.status))
				{
					code =  response.status ;
				}
				return code;
				};
				var self = this;

				this.sendTokenTimeoutMessage = function() {
					var parentWindow = window.parent,
					parentUrl = Messaging.messageUtils.getTargetUrl(document.referrer),
					options = {
						targetUrl : parentUrl,
						targetWindow : parentWindow
					};

					var clientMessageService =  Messaging.messageServiceFactory.createMessageService(Messaging.constants.MODE_CLIENT, options);

					clientMessageService.publish('true', 'tokenTimeout');
				};



				/**
				 * execute post error actions
				 */
				this.postErrorActions = function(code) {
					// special case for timeouts - trigger a "timeoutEventHandler" (after showing the popup window).
					switch ('' + code) {
					case self.ERROR_ID_TIMEOUT:
						//cater for arcane issue with doubly generated events
						if (this.errorEventNumber  <= 0 ){
							ModalDialogCallback.trigger('timeoutEventHandler',this);
							this.errorEventNumber = this.errorEventNumber + 1;
						}
						this.unbind();
						break;
					case self.ERROR_ID_UNAUTHORIZED:
						//let the portal know the authentication token has timed out
						self.sendTokenTimeoutMessage();
						break;
					}
				};
				/**
				 * A basic error handler for that shows the back-end triggered errors - as an alert box.
				 * The basic MO had been tailored on the "Search" app way of showing the pop-ups .
				 */
				/* jshint maxcomplexity: 24 */
				this.launchErrorWindow = function(response, windowTitle,
						windowButtonText, windowHeight, localisedMessage,baseKeyForStatusBasedMessages, baseKeyForCodeBasedMessages
				) {
					var message = '';
					var responseTextString ='';
					
					//defect 16930 - We need to have the error code/id displayed at all times, not just when these parameters are populated.  
					//Rather than change all code using this function adding the default values here.
					if (_.isUndefined(baseKeyForStatusBasedMessages)){
						baseKeyForStatusBasedMessages =  "ossui.errorMessages";
						baseKeyForCodeBasedMessages = "ann.search.ui.error.popup.servicefailure";
					}

					// we'd need the [code] whichever way we construct the message.
					var status = this.extractStatusCode(response); 

					// firstly try to use the message sent by the client - if extant
					if (!this.isBlank(localisedMessage)) {
						message = this.htmlEncode(localisedMessage);
					} else {
						// else use the middle tier message
						if (!_.isUndefined(response)) {

							// "responseText" object is specific to the "search" app 
							var responseTextObj = null;
							if ( !this.isBlank(response.responseText)) {
								try {
									responseTextObj = JSON
									.parse(response.responseText);
								} catch (error) {
									responseTextString = response.responseText;
								}
							}
							if (!$.isEmptyObject(responseTextObj)) {

								// first option is for the userMessage
								if ( !this.isBlank(responseTextObj.userMessage)) {
									message = this.htmlEncode(responseTextObj.userMessage);
								}
								// else - do use the status text  
								else 
								{
									message = this.htmlEncode(response.statusText);
								}
								//defect 1056 aqueels Commented the code below to remove the plsql Exception message from pop up window
								
								// add the "error code" msg regardlessly 
								/*if (!this.isBlank(responseTextObj.errorCode)) {
									var errCodeMessage = this.extractCodeMessage(baseKeyForCodeBasedMessages, 'errorcode', responseTextObj.errorCode,false);
									if (!this.isBlank(errCodeMessage)) {
										message += '<br>' + this.htmlEncode(errCodeMessage);
									}
									// add the "error id"  msg regardlessly
									if (!this.isBlank(responseTextObj.errorId)) {
										var errIdMessage = this.extractCodeMessage(baseKeyForCodeBasedMessages , 'errorid' , responseTextObj.errorId,false);
										if (!this.isBlank(errIdMessage)) {
											message += '<br>' + this.htmlEncode(errIdMessage);
										}
									}

								}*/
							}// end of "responseTextObj" rules

							/*
							 * if nothing inside the response.responseText ,
							 * we're going to concentrate on the response object
							 * itself
							 */
							else {
								//cater for the most relevant HTTP codes firstly.
								switch (''+status) {
								case  this.ERROR_ID_BAD_REQUEST:
								case  this.ERROR_ID_UNAUTHORIZED:
								case  this.ERROR_ID_FORBIDDEN:
								case  this.ERROR_ID_NOT_FOUND :
								case  this.ERROR_ID_TIMEOUT :
								case  this.ERROR_ID_INTERNAL_SERVER :
								case  this.ERROR_ID_SERVICE_UNAVAILABLE :
									message = this.htmlEncode(this.extractCodeMessage(baseKeyForStatusBasedMessages , 'errorCode',status,true));
									break;
								}
								// if message is still blank at this stage , then the priority goes to the "statusText" 
								if (this.isBlank(message) && !this.isBlank(response.statusText)) {
									message = this.htmlEncode(response.statusText +this.getCodeSuffix(status,true));

								} 
								// check for all *other* error statuss that might be in the DB (not necessarily HTTP codes)  
								if (this.isBlank(message) && !this.isBlank(''+status)) {
									message += this.htmlEncode(this.extractCodeMessage(baseKeyForStatusBasedMessages, 'errorCode', status,true));
								}
								// this [response.message] is for garden variety LS errors (throw new Error ..etc)
								if (this.isBlank(message)
										&& !this.isBlank(response.message)) {
									message = this.htmlEncode(response.message);
								}
								// last resort: [responseTextString] is the string that was not parseable as JSON object
								if (this.isBlank(message)
										&& !this.isBlank(responseTextString)) {
									message = this.htmlEncode(responseTextString);
								}
							}                    

						}// end if response not null
					}

					self.raisePopupDialog(message, windowTitle,
							windowButtonText, windowHeight,status);

				};

				/**
				 * HTML encodes a string.
				 * @param value The string to be HTML encoded.
				 * @returns {String} The HTML encoded string.
				 */
				this.htmlEncode = function(value) {
					return $('<div/>').text(value).html();
				};

				/**
				 * Decodes an HTML encoded string.
				 * @param value The string to be decoded.
				 * @returns {String} The decoded string.
				 */
				this.htmlDecode = function(value) {
					return $('<div/>').html(value).text();
				};

				/**
				 * Returns cookie value for a cookie name
				 */
				this.getCookie = function(key) {
					if (!key) { 
						return null; 
					}
					return decodeURIComponent(document.cookie.replace(new RegExp("(?:(?:^|.*;)\\s*" + encodeURIComponent(key).replace(/[\-\.\+\*]/g, "\\$&") + "\\s*\\=\\s*([^;]*).*$)|^.*$"), "$1")) || null;
				};	
	}

	return new OSSUIUtils();
});
//console.log('* OSSUIUtils.js loaded');

/*jshint maxcomplexity:15  */
define(
        'ossui/widget/DualListView',
        [       'underscore',
                'jquery',
                'lightsaber',
                'backbone',
                'ossui/widget/DualListCollection',
                'ossui/widget/CollectionDualListView',
                'ossui/widget/CheckboxTextView',
                'ossui/widget/DualListModel',
                'text!lib/amdocs/ossui/components/duallist/view/template/DualListView.html',
                'text!lib/amdocs/ossui/components/buttons/view/templates/OSSUIDefaultButtonTemplate.html',
                'ossui/widget/ModalDialogView', 'ossui/widget/ModalDialogCallback',
                'ossui/utils/OSSUIResourceBundle','ossui/utils/OSSUIUtils',
                'fixture.object', 'fixture.string', 'fixture.dom' ],
                /*jshint maxparams: 22 */
                /*jshint maxcomplexity: 12 */
                /*global alert */
        function(_, $, Lightsaber, Backbone, DualListCollection,
                CollectionDualListView, CheckboxTextView,DualListModel,
                DefaultDualListViewTemplate,
                ossuidefaultbuttontempl,ModalDialogView ,ModalDialogCallback,OSSUIResourceBundle,OSSUIUtils) {

            var DualListShellCollection = Lightsaber.Core.Collection
            .extend({

                model : DualListModel
            });

            
            var DualListView = Lightsaber.Core.View
                    .extend({
                        template : '',
                        config : {
                            toResetCollFirst : "n/a",
                            toResetCollSecond : "n/a",
                            toResetVMFirst : "n/a",
                            toResetVMSecond : "n/a",
                            firstListVM : "n/a",
                            secondListVM : "n/a",
                            useCaseModelURL : "n/a",
                            directDataMode : false,
                            collectionListItemViewType: CheckboxTextView,
                            showAddRemoveAll : false
                        },
                        initialize : function() {
                            /*jshint maxcomplexity:15 */
                            _.bindAll(this, 'saveData', 'cancelData' , 'listLoadedSuccessHandler', 'listLoadedErrorHandler', 
                                    'listSavedSuccessHandler', 'listSavedErrorHandler','setDirectData','getSaveData','onAddRemoveAll');
                            ModalDialogCallback.on('listLoadedSuccessHandler',this.listLoadedSuccessHandler);
                            ModalDialogCallback.on('listLoadedErrorHandler',this.listLoadedErrorHandler);
                            // url used by the [DualListCollection] (passed
                            // further down at construction time)
                            this.dualListModelURL = this.getConfig('useCaseModelURL') || this.config.useCaseModelURL; 

                            // template used by this JS file [dual list view]
                            this.template = this.getConfig('useCaseDualListViewTemplate') || DefaultDualListViewTemplate; 

                            // template used by the [COLLECTION dual list view
                            // JS] (passed further down at construction time)
                            this.useCaseCollectionDualListViewTemplate = this.getConfig('useCaseCollectionDualListViewTemplate');

                            // template used by the [collection list view JS]
                            // (called by CollectionDualListView) (passed
                            // further down at construction time)
                            this.useCaseCollectionListLabelTemplate = this.getConfig('useCaseCollectionListLabelTemplate');
                            
                            // template used by the [collection list view JS]
                            // (called by CollectionDualListView) (passed
                            // further down at construction time)
                            this.useCaseCollectionListTemplate = this.getConfig('useCaseCollectionListTemplate');

                            // template used by the [checkbox text view JS]
                            // (passed further down at construction time)
                            this.useCaseCollectionListItemTemplate = this.getConfig('useCaseCollectionListItemTemplate');
                            
                            this.collectionListItemViewType = this.getConfig('collectionListItemViewType');

                            
                            this.showAddRemoveAll = this.getConfig('showAddRemoveAll');
                            this.ifCreateButtons = this.getConfig('ifCreateButtons');

                            this.useCaseFirstListTitle = this.getConfig('useCaseFirstListTitle') ||  
                             OSSUIResourceBundle.prototype.getMessage('ossui.labels.duallist.firstListTitle');
                            
                            this.useCaseSecondListTitle = this.getConfig('useCaseSecondListTitle') ||  
                            OSSUIResourceBundle.prototype.getMessage('ossui.labels.duallist.secondListTitle');
                            
                            this.maxSaveableNumber= this.getConfig('maxSaveableNumber') || 
                            OSSUIResourceBundle.prototype.getMessage('ossui.labels.duallist.maxSaveableNumber');
                            
                            this.maxSaveableMessage= this.getConfig('maxSaveableMessage') || 
                            OSSUIResourceBundle.prototype.getMessage('ossui.errorMessages.duallist.maxSaveableMessage');
                            
                            this.maxSaveableWindowTitle= this.getConfig('maxSaveableWindowTitle') || 
                            OSSUIResourceBundle.prototype.getMessage('ossui.labels.duallist.maxSaveableWindowTitle');
                            
                            this.maxSaveableWindowHeight= this.getConfig('maxSaveableWindowHeight') || 
                            OSSUIResourceBundle.prototype.getMessage('ossui.labels.duallist.maxSaveableWindowHeight');
                            
                            this.maxSaveableWindowButtonText= this.getConfig('maxSaveableWindowButtonText') ||
                            OSSUIResourceBundle.prototype.getMessage('ossui.labels.duallist.maxSaveableWindowButtonText');
                            
                            this.showSaveAlert = this.getConfig('showSaveAlert');
                            
                            //indicate if to get data directly without use REST
                            this.directDataMode = this.getConfig('directDataMode');
                            
                            // providing a timer for the case when the server stops responding in mid-action; default of 10 seconds
                            this.loadingScreenTimer = this.getConfig('loadingScreenTimer') || 10000;

                            // lookups for error messages will start off from areas designated as "baseKeyFor.."
                            this.baseKeyForStatusBasedMessages =  this.getConfig('baseKeyForStatusBasedMessages') || "ossui.errorMessages";
                            this.baseKeyForCodeBasedMessages =  this.getConfig('baseKeyForCodeBasedMessages') || "ann.search.ui.error.popup.servicefailure";
                            
                            this.viewModel.data.savedCollection = new DualListShellCollection({parentObject : this}); 
                            this.viewModel.data.originalCollection = new DualListShellCollection({parentObject : this});


                        },

                        _postRender : function() {
                            this.cleanSavedCollections();
                            this.createDualListViews();
                            if (this.directDataMode === false)
                            {
                                  this.showLoadingScreen();
                            }
                           
                        },

                        cleanSavedCollections: function() {
                            this.viewModel.data.savedCollection.reset();
                        }, 
                        /**
                         * gets the saved Dual List Collection ( i.e.  the left panel content after the "SAVE" action)
                         */
                        getSavedCollection : function() {
                            return this.viewModel.data.savedCollection;
                        },

                        /**
                         * gets the original Dual List Collection 
                         */
                        getOriginalCollection : function() {
                            return this.viewModel.data.originalCollection;
                        },

                        /**
                         * create Dual List Views
                         */
                        createDualListViews : function() {
                            this.createAttrListView();
                            if (this.ifCreateButtons === 'true') {
                                this.createButtons(this);
                            }
                        },
                        /**
                         * set the lists data directly without use REST, config need to set to directDataMode: true
                         */
                        setDirectData: function(rowsData) {
                            var firstList = this.subViews[0].viewInstance.firstListVM.models.items;
                            var secondList = this.subViews[0].viewInstance.secondListVM.models.items;
                            var options =  {reset: true, parse: true};
                            firstList.reset(rowsData,options);
                            firstList.successHandler(firstList,rowsData);
                            secondList.reset(rowsData,options);
                            firstList.trigger('sync', firstList, rowsData);
                            secondList.trigger('sync', secondList, rowsData);
                           // this.subViews[0].viewInstance.subViews[0].viewInstance.off('addRemoveAll',this.removeAll);
                           // this.subViews[0].viewInstance.subViews[0].viewInstance.on('addRemoveAll',this.removeAll);
                           // this.subViews[0].viewInstance.subViews[1].viewInstance.off('addRemoveAll',this.addAll);
                           // this.subViews[0].viewInstance.subViews[1].viewInstance.on('addRemoveAll',this.addAll);
                            //fix bug that the secend list is not getting scrollbars even if needed.
                            if (this.subViews[0].viewInstance.subViews[1])
                            {
                              this.subViews[0].viewInstance.subViews[1].viewInstance.scrollbar.delayedRefreshOfScrollbars();
                            }
                        },
                        
                        onAddRemoveAll: function(addRemoveIndicator){
                          var vm = null;
                          if (addRemoveIndicator === "remove")
                          {
                             vm = this.subViews[0].viewInstance.firstListVM;
                             this._addOrRemoveAll(vm, 1);
                          }
                          else{
                             vm = this.subViews[0].viewInstance.secondListVM;
                             this._addOrRemoveAll(vm,2);
                          }
                        },
                         
                         
                       _addOrRemoveAll: function(vm, status)
                       {
                          this.MaxNumberOfElementsExceeded = false;
                          var itemsModels =  _.clone(vm.models.items.models);
                          for (var i in itemsModels)
                          {
                             if (this.MaxNumberOfElementsExceeded)
                             {
                               break;
                             }
                             var item = itemsModels[i].attributes;
                             if(item.status == status)
                             {
                               var itemId =  item.id;
                               var params = ["updateModel",vm,itemId];
                               vm.handleAction.apply(vm, params);
                             }
                          }
                       },
                        
                        destroy: function() {
                            this._super();     
                            this.cleanSavedCollections();
                            this.viewModel.destroy();
                            this.viewModel.data.originalCollection.reset();
                            delete this.config.toResetCollFirst;
                            delete this.config.toResetCollSecond;
                             ModalDialogCallback.off('listLoadedSuccessHandler');
                             ModalDialogCallback.off('listLoadedErrorHandler');
                        },

                        /**
                         * create save & clear buttons
                         */
                        createButtons : function(localDualListView) {

                            // ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
                            // ~~~~~~~~ Buttons View Model ~~~~~~~~~~
                            // ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
                            var buttonModel = new Lightsaber.Core.Model();
                            var buttonViewModel = new Lightsaber.FormElementViewModel(
                                    {
                                        data : {
                                            labelSaveData : "Save",
                                            labelCancelData : "Cancel"
                                        },
                                        models : {
                                            myModel : buttonModel
                                        },

                                        config : {
                                            // view2reset : localDualListView,
                                            actions : {

                                                cancelData : this.cancelData,
                                                saveData : this.saveData

                                            }
                                        }

                                    });

                            // ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
                            // ~~~~~~~~~~~~~~ Buttons ~~~~~~~~~~~~~~~
                            // ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
                            var cancelButtonView = new Lightsaber.ButtonView({
                                viewModel : buttonViewModel,
                                config : {
                                    el : '#cancelbutton',
                                    template : ossuidefaultbuttontempl
                                },
                                vmKeys : {
                                    "data.text" : "labelCancelData",
                                    "action.click" : "cancelData"
                                }
                            });
                            
                            this.subViews.push({viewInstance:cancelButtonView});

                            var saveButtonView = new Lightsaber.ButtonView({
                                viewModel : buttonViewModel,
                                config : {
                                    el : '#savebutton',
                                    template : ossuidefaultbuttontempl
                                },
                                vmKeys : {
                                    "data.text" : "labelSaveData",
                                    "action.click" : "saveData"
                                }
                            });
                            
                            this.subViews.push({viewInstance: saveButtonView});

                        },

                        dualListModelURL : '',

                        useCaseCollectionDualListViewTemplate : '',
                        useCaseCollectionListLabelTemplate : '',
                        useCaseCollectionListTemplate : '',
                        useCaseCollectionListItemTemplate : '',

                       

                        /**
                         * create the basic and additional item list view to
                         * show attribute information.
                         */
                        createAttrListView : function() {

                            var objectID = ""; 

                            var objectClass = ""; 

                            // ~~~~~~~~~~~~~~~~~~~
                            // preparatory steps for the REST Data source load
                            var DLRESTDataSource = new Lightsaber.Core.LSRESTDataSource({ 
                                defaults:{
                                    contentType: 'application/json',
                                    fullURL:this.dualListModelURL
                                },
                                update: {
                                    method: 'PUT'      
                                },
                                read: {
                                    method: 'GET'
                                }
                            });
                            
                            
                            this.viewModel.data.savedCollection.setDataSource(DLRESTDataSource);

                            /*
                             * var originalAttributesModel = new
                             * DualListCollection( {url:this.dualListModelURL});
                             * originalAttributesModel.fetch();
                             */
                            // create model for basic attribute list
                            var basicAttributesModel = new DualListCollection({
                                parentData : this.viewModel.data,
                                parentObject : this
                            });
                            basicAttributesModel.setDataSource(DLRESTDataSource);

                            // create model for additional attribute jquery list
                            var additionalAttributesModel = new DualListCollection(
                                    {
                                        parentData : this.viewModel.data,
                                        parentObject : this
                                    });

                            additionalAttributesModel.setDataSource(DLRESTDataSource);
                            
                            var basicAttributeCollVM = this.createViewModel(
                                    "first", basicAttributesModel,
                                    additionalAttributesModel,
                                    this.useCaseFirstListTitle, true, 2, this);

                            basicAttributeCollVM.setConfig('filterFunction',
                                    function(model) {
                                        return model.attributes.status <= 1;
                                    });
                              if (this.directDataMode === false)
                              {
                                 basicAttributesModel.getAllAttributes(objectID,
                                    objectClass);
                              }

                            var additionalAttributeCollVM = this
                                    .createViewModel("second",
                                            additionalAttributesModel,
                                            basicAttributesModel,
                                            this.useCaseSecondListTitle, false,
                                            1, this);

                            additionalAttributeCollVM.setConfig(
                                    'filterFunction', function(model) {
                                        return model.attributes.status > 1;
                                    });

                            if (this.directDataMode === false)
                            {
                                additionalAttributesModel.getAllAttributes(
                                    objectID, objectClass);
                            }

                            var MyCheckboxTextView = this.collectionListItemViewType.extend({
                                        template : this.useCaseCollectionListItemTemplate
                                    });
                            
                            var MyCheckboxTextViewNoSort = this.collectionListItemViewType.extend({
                                        template : this.useCaseCollectionListItemTemplate,
                                        config : {
                                            draggableImageVisibility : "hide"
                                        }

                                    });

                            var newCollDL = new CollectionDualListView(
                                    {
                                        el : this
                                                .$("[data-uxf-point='dualAttrListView']"),
                                        viewModel : new Lightsaber.Core.ViewModel(),

                                        config : {
                                            useCaseCollectionDualListViewTemplate : this.useCaseCollectionDualListViewTemplate,
                                            useCaseCollectionListLabelTemplate : this.useCaseCollectionListLabelTemplate,
                                            useCaseCollectionListTemplate : this.useCaseCollectionListTemplate,
                                            firstListVM : basicAttributeCollVM,
                                            secondListVM : additionalAttributeCollVM,
                                            viewTypeFirst : MyCheckboxTextView, // CheckboxTextView,
                                            viewTypeSecond : MyCheckboxTextViewNoSort,
                                            showAddRemoveAll: this.showAddRemoveAll,
                                            addRemoveAllProxy: this.onAddRemoveAll
                                        // CheckboxTextView hide icon

                                        // TODO : wire up a different view here
                                        // (a non sortable one)
                                        }
                                    });
                            
                            this.subViews.push({viewInstance: newCollDL});
                            this.config.toResetCollFirst = basicAttributesModel;
                            this.config.toResetCollSecond = additionalAttributesModel;

                            return newCollDL;
                        },
                        
                        /**
                         * return the ViewModel
                         */
                        createViewModel : function(modelId, attributesModel,
                                attributesModeltoUpdate, displayLabel, state,
                                value, parentView) {
                            var newCollVM = new Lightsaber.CollectionViewModel({
                                models : {
                                    items : attributesModel
                                },
                                data : {
                                    label : displayLabel,
                                    parentView: parentView
                                },
                                config : {
                                    maxSaveable : this.maxSaveableNumber,
                                    maxSaveableMsg : this.maxSaveableMessage,
                                    modelId : modelId,
                                    initialState : state,
                                    actions : {
                                        updateModel : function() {
                                            var itemname = arguments[1];

                                            var model = _
                                                    .find(
                                                            this.models.items.models,
                                                            function(
                                                                    item) {
                                                                return item
                                                                        .get('name') === itemname;
                                                            });

                                            var othermodel = _
                                                    .find(
                                                            attributesModeltoUpdate.models,
                                                            function(
                                                                    item) {
                                                                return item
                                                                        .get('name') === itemname;
                                                            });


                                            var toBeSavedList = window.$("[data-uxf-point='firstCollectionListView'] [data-uxf-point='ossui-duallist-labelView-wrapper']");
                                            var numberToBeSaved = typeof(toBeSavedList) != 'undefined' ?toBeSavedList.length:0;
        

                                               if (this.config.attributes.modelId === 'second'
                                                  && (this.config.attributes.maxSaveable > 0 && 
                                                      numberToBeSaved >= this.config.attributes.maxSaveable)) {
                                                this.data.attributes.parentView
                                                        .handleMaxNumberOfElementsExceeded();
                                                // this following is a workaround for an issue whereby the state of the
                                                // checkbox had changed to "true" but the item had not been moved to the other panel;
                                                // so , we need to revert the status of the checkbox programmatically - w/o triggering an event
                                                var addableList = window.$("[data-uxf-point='secondCollectionListView'] [data-uxf-point='uxf-collection-item']");
                                                var modelIDThatCouldNotBeAdded = -1;
                                                var modelThatCouldNotBeAdded = '';
                                                for ( var k = 0; k < addableList.length; k++) {
                                                    modelIDThatCouldNotBeAdded = $(
                                                            addableList[k])
                                                            .find(
                                                                    "[data-uxf-point='ossui-duallist-id-hidden']")
                                                            .text();
                                                    if (''
                                                            + modelIDThatCouldNotBeAdded === ''
                                                            + model.attributes.id) {

                                                        modelThatCouldNotBeAdded = addableList[k];
                                                        break;
                                                    }
                                                }
                                                if ($
                                                        .isEmptyObject(modelThatCouldNotBeAdded) === false) {

                                                    $(
                                                            modelThatCouldNotBeAdded)
                                                            .find(
                                                                    "[data-uxf-point='myElement']")
                                                            .removeAttr(
                                                                    'checked');
                                                }
                                                // end of workaround ;
                                            } else {

                                                this.models.items
                                                        .remove(model);
                                                attributesModeltoUpdate
                                                        .remove(othermodel);
                                                model.attributes.status = value;
                                                attributesModeltoUpdate
                                                        .add(model);
                                            }
                                        }
                                    }
                                }
                            });
                            newCollVM.clean = function() {
                                if (this.currentModel) {
                                    this.currentModel.clean();
                                    this.currentModel.off();
                                    this.currentModel.reset();
                                }
                                delete this.parentData;
                                delete this.parentObj;
                                this.off();                 
                            };                            
                            return newCollVM;
                        },
                        
                        /**
                         * Default handling for the close of the warning message
                         */
                        _handleDialogClose : function(){
                            //this is the dialog's reference
                            $(this).dialog("close");                                                    
                        },
                        /**
                         * When Maximum no of elements  is exceeded a warning is shown to the user

                         *                             this.maxSaveableNumber= this.getConfig('maxSaveableNumber') || -1;
                            this.maxSaveableMessage= this.getConfig('maxSaveableMessage') || "Maximum Number of Saveable Items Exceeded: "+this.maxSaveableNumber;
                            this.maxSaveableWindowTitle= this.getConfig('maxSaveableWindowTitle') || "Warning";
                            this.maxSaveableWindowHeight= this.getConfig('maxSaveableWindowHeigh') || 220;

                         */
                        handleMaxNumberOfElementsExceeded : function(){
                            this.MaxNumberOfElementsExceeded = true;
                            var modalWarningWindow = new ModalDialogView({
                                viewModel :  new Lightsaber.Core.ViewModel(),
                                title : this.maxSaveableWindowTitle,
                                height : this.maxSaveableWindowHeight,
                                buttons :   [  {
                                    text : $('<div/>').html(this.maxSaveableWindowButtonText).text(),
                                    click : this._handleDialogClose
                                        
                                } ],
                                config  : {
                                dialogtemplate : '<span class="ossui-error-messageicon"></span><span>' + 
                                this.maxSaveableMessage+
                                '</span>' 
                                }
                                
                            });
                            this.subViews.push({viewInstance: modalWarningWindow});
                            modalWarningWindow.render();
                        },

                        showLoadingScreen : function() {
                            // check to see if the [div] had been rendered (yet)
                            if ($.isEmptyObject($('#dual_list_loading')) === false
                                    && $('#dual_list_loading').length > 0) {

                                $('#dual_list_loading').attr("style",
                                        "visibility:none");
                                $('#dual_list_loading').show();

                                var timeoutCallback = this.hideLoadingScreen;
                                var runtime = this.loadingScreenTimer; // in
                                // milliseconds
                                setTimeout(function() {
                                    // these lines will be called after 'runtime' interval;
                                    // making the spinner hide by either the timer or the callback (whichever
                                    // happens first)
                                    timeoutCallback();
                                }, runtime);
                            }// end "if div rendered"
                        }, 

                        hideLoadingScreen : function() {
                            $('#dual_list_loading').hide();
                            $('#dual_list_loading').hide();
                        }, 
                        //  ~~~ list loaded callbacks ~~~~~
                        listLoadedSuccessHandler : function() {
                            this.hideLoadingScreen();
                            this.listLoadedSuccessCallback();
                        },
                        
                        listLoadedSuccessCallback: function(){
                            //console.log(" overide the [listLoadedSuccessCallback] in order to implement your own callback ");
                        },
                        
                        listLoadedErrorHandler : function(serviceResponse) {
                            this.hideLoadingScreen();
                            this.listLoadedErrorCallback(serviceResponse);
                        }, 
                        listLoadedErrorCallback : function(serviceResponse) {
                            //console.log(" overide the [listLoadedErrorCallback] in order to implement your own callback ");
                            var windowTitle = OSSUIResourceBundle.prototype.getMessage('ossui.labels.heading.errorString');
                            var buttonText =  OSSUIResourceBundle.prototype.getMessage('ossui.labels.button.okString');
//                            var localisedMessage = OSSUIResourceBundle.prototype.getMessage('ossui.errorMessages.errorCode');
                            // signature looks like this :
                            // function(response, windowTitle,
                            //        windowButtonText, windowHeight, localisedMessage,this.baseKeyForStatusBasedMessages, baseKeyForCodeBasedMessages 
                            OSSUIUtils.launchErrorWindow(serviceResponse,windowTitle, buttonText,220,null,
                                    this.baseKeyForStatusBasedMessages , this.baseKeyForCodeBasedMessages);
                        },
                        //  ~~~ list saved callbacks ~~~~~
                        listSavedSuccessHandler : function() {
                            this.hideLoadingScreen();
                            this.listSavedSuccessCallback();
                        },
                        listSavedErrorHandler : function() {
                            this.hideLoadingScreen();
                            this.listSavedErrorCallback();
                        },
                        listSavedSuccessCallback : function() {
                            //console.log(" overide the [listSavedSuccessCallback] in order to implement your own callback ");
                        },
                        listSavedErrorCallback : function(serviceResponse) {
                            //console.log(" overide the [listSavedSuccessCallback] in order to implement your own callback ");
                            var windowTitle = OSSUIResourceBundle.prototype.getMessage('ossui.labels.heading.errorString');
                            var buttonText =  OSSUIResourceBundle.prototype.getMessage('ossui.labels.button.okString');
                            //var localisedMessage = OSSUIResourceBundle.prototype.getMessage('ossui.errorMessages.restservice.failedSave');
                            // signature looks like this :
                            // function(response, windowTitle,
                            //        windowButtonText, windowHeight, localisedMessage,baseKeyForStatusBasedMessages , baseKeyForCodeBasedMessages
                            OSSUIUtils.launchErrorWindow(serviceResponse,windowTitle, buttonText,220,null,this.baseKeyForStatusBasedMessages , this.baseKeyForCodeBasedMessages);
                            
                        },
                        handleGlobalError : function(response) {
                            // signature looks like this :
                            // function(response, windowTitle,
                            //        windowButtonText, windowHeight, localisedMessage,baseKeyForStatusBasedMessages , baseKeyForCodeBasedMessages
                            OSSUIUtils.launchErrorWindow(response, null, null, 212,null,this.baseKeyForStatusBasedMessages , this.baseKeyForCodeBasedMessages);
                        },
                        
                        cancelData : function() {
                            // getAllAttributes will trigger a "show Loading Screen" action (hourglass)
                            //this.config.toResetCollFirst.getAllAttributes();
                            //this.config.toResetCollSecond.getAllAttributes();
                        },
                         getSaveData :  function() { 
                         // saving the first subset - aka the LEFT panel
                            // entries ONLY
                            var selectedElements = this.$("[data-uxf-point='firstCollectionListView'] [data-uxf-point='ossui-duallist-labelView-wrapper']");

                            if (selectedElements.length > 0) {

                                // empty the previously saved collection
                                this.viewModel.data.savedCollection.reset();
                                
                                for ( var j = 0; j < selectedElements.length; j++) {
                                    // saving the "ID" for the REST update
                                    // operation(s)
                                    var modelIDToBeSaved = this.$(selectedElements[j]).find("[data-uxf-point='ossui-duallist-id-hidden']").text();

                                    if (modelIDToBeSaved) {
                                        for ( var k = 0; k < this.config.toResetCollFirst.models.length; k++) {
                                            var originalModelID = this.config.toResetCollFirst.models[k].attributes.id;

                                            // trying to match the HTML model-id
                                            // with the Id present in the model
                                            // (list)
                                            // and then trying to set a new status
                                            if (originalModelID.toString() ===  modelIDToBeSaved.toString()) {
                                                this.config.toResetCollFirst.models[k].attributes.status = "1";// meaning
                                                                                                                // that
                                                                                                                // when
                                                                                                                // next
                                                                                                                // fetched
                                                                                                                // back
                                                                                                                // , it
                                                                                                                // should
                                                                                                                // be
                                                                                                                // on
                                                                                                                // the
                                                                                                                // left
                                                                                                                // panel

                                                // exposing the saved model(s) to an external app.
                                                this.viewModel.data.savedCollection.add(this.config.toResetCollFirst.models[k]);                                               
                                                break;
                                            }
                                        }
                                    }

                                }

                            }
                            return this.viewModel.data.savedCollection;
                        },
                        /* jshint maxcomplexity: 12 */
                        saveData : function() {                            
                            
                            this.getSaveData();
//                            console.log(" REST Data source  LIST UPDATE:");
                            this.showLoadingScreen();
                            // the following syntax is required because there is no LS implementation 
                            // for a direct Lightsaber list update.

                            try {// catching network errors and the like
                                var restDS = this.viewModel.data.savedCollection
                                        .getDataSource();
                                restDS
                                        .sync(
                                                'update',
                                                this.viewModel.data.savedCollection,
                                                {
                                                    method : 'PUT',
                                                    contentType : 'application/json',
                                                    success : this.listSavedSuccessHandler,
                                                    error : this.listSavedErrorHandler
                                                });
                            }

                            catch (error) {
                                this.handleGlobalError(error);

                            }
                            // Note : an alternative way of updating a list is through Backbone - but it lacks a secure transport 
                            // Backbone.sync('update', this.viewModel.data.savedCollection, {url: this.dualListModelURL});
                            if (this.showSaveAlert == 'true') {
                                alert(msg);
                            }

                        }
                    });
            return DualListView;
        });

/**
 * Strings used by the localization process.
 * Parameters inside the message to be set by the usual
 * {0}..{1}...{n} placeholders
 */
define('messages',
        {
/* If the require js i18n plug is to be used , then some Locale indicators are to be used
See the Lightsaber documentation for that            
        "root": true,
        "fr": true,
        "en": true,
*/
    /*********************************
     * Common strings 
     *********************************/
    "common_backButton": "Back",
    "common_confirm": "Confirm",
    
    "common_nextButton": "Next",
    "common_previousButton": "Previous",
    
    "common_cancel": "Cancel",
    "common_yes":"Yes",
    "common_no":"No",
    
    "common_save" : "Save",

    /*********************************
     * Messages for the Validation Use Case   
     *********************************/
    "validate_numeric": "Non numeric input for {0}",
    "validate_required": "Input required for {0}",
    
    "validate_max_length": "Input string longer than {0} ; it was {1} in length",
    "validate_min_length": "Input string shorter than  {0} ; it was {1} in length",

    "validate_max_value": "Input value greater than {0} ",
    "validate_min_value": "Input value less than {0} ",

    "validate_date": "Input not in Date format for {0}",
    "validate_date_past": "Date should be less than threshold of: {0}",
    "validate_date_future": "Date should exceed threshold of: {0}",
    

    "validate_pattern": "Unrecognized pattern for {0}",
    
    "validate_failed": "Validation Failed!",
    "validate_ok": "Validation Succeeded!"
    
    /*********************************
     * Use Case XYZ 
     *********************************/


});
define('lib/amdocs/ossui/core/util/i18n/ossui-resource-bundle',[
    'underscore',
    'backbone',
    'lightsaber',
    'messages'
],
    function(_, Backbone,Lightsaber, localMessages) {

       var ossui_i18n = function(options){

          //defaults:
           this.basedir ='nls';
           this.filename ='messages.json';
           this.localeConfigs = {
                 en_US : {
                     dateFormat : "mm/dd/yyyy",
                     type : "en_US",
                     currency : {
                         symbol : "$",
                         position : "start"
                     },
                     number : {
                         decimalSeparator : ".",
                         thousandSeparator : ","
                     }

                 },
                 en_UK : {
                     dateFormat : "dd/mm/yyyy",
                     type : "en_UK",
                     currency : {
                         symbol : "Â£",
                         position : "start"
                     },
                     number : {
                         decimalSeparator : ".",
                         thousandSeparator : ","
                     }
                 },
                 fr_FR : {
                     dateFormat : "dd/mm/yyyy",
                     type : "fr_FR",
                     currency : {
                         symbol : "â¬",
                         position : "end"
                     },
                     number : {
                         decimalSeparator : ",",
                         thousandSeparator : " "
                     }
                 }
           };
           this.getCurrentLocale = function() {
               return this.localeConfigs["en_UK"];
           };
           this.currentLocaleType =  this.getCurrentLocale().type;

           this.messagesURL = this.basedir +  '/' +this.currentLocaleType+ '/' +this.filename;

           // this.getResourceContentviaREST  = function(messagesURL) {
           // 
           // rest ds
           // 
           
           this.getResourceContent = function(messagesURL) {

                var ajaxResponseForRemoteMessages = $
                    .ajax({

                        beforeSend : function(x) {
                            if (x && x.overrideMimeType) {
                                x
                                    .overrideMimeType("application/j-son;charset=UTF-8");
                            }
                        },
                        dataType : "json",
                        type : "GET",
                        async : false, // calling AJAX *synchronously*
                        url : messagesURL, // Note : this can be any
                        // file (local or remote).
                        complete : function(ajaxData) {
                            return ajaxData;
                        },
                        success : function(data) {
                            return data;
                        },
                        error : function(ajaxData, textStatus,
                                         errorThrown) {
                            alert('Error when fetching localization data:'
                                + textStatus);
                        }
                    });// ajax call

                var remoteFileContent = $
                    .parseJSON(ajaxResponseForRemoteMessages.responseText);

                // if the file is empty , then use the globally declared
                // "messages" file
                var parsedMessages = ($.isEmptyObject(remoteFileContent) === true) ?
                    localMessages
                    :
                    // the actual strings are underneath a root called "messages"
                    $.parseJSON(ajaxResponseForRemoteMessages.responseText).messages;

                return parsedMessages;
            };

            this.getResourceContentFromREST = function(messagesURL){
                var LoginModel = Lightsaber.Core.RESTModel.extend({
                    url: "messages"
                });
            };

              /* this.currentLocale = function() {
               return this.getCurrentLocale();
           };*/

           /**
            * Get a translated string keyed by 'key'
            */

           if(options){

               this.localeConfigs = options.localeConfigs || this.localeConfigs;
               //should there be a default url ?
               this.messagesURL = options.messagesURL ;
            }

           //this.parsedMessages =  this.getResourceContent(this.messagesURL);
           this.parsedMessages = this.getResourceContentFromREST(this.messagesURL);
           
           this.resourceBundle = new Lightsaber.Core.ResourceBundle({
               defaultBundle : this.parsedMessages
           }, 'defaultBundle');

           this.getString = function(key, params) {
               return this.resourceBundle.getString(key, params);
           };

           this.getMessage = function(key, args) {
               return this.getString(key, args);
           };

    };
      return ossui_i18n;
});
define('text!lib/amdocs/ossui/components/login/view/templates/loginviewtemplate.html',[],function () { return '<div>\n\t<div class=\'ossui-login-error\'>\n\t\t<span class="ossui-warning-messageicon"></span><span id=\'loginerrormessageid\' class=\'ossui-login-errorMessage\'></span>\n\t</div>\n\t<div class=\'ossui-user-field\'>\n\t\t<div id=\'<%=userNameFieldId%>\' class=\'ossui-login-text ossui-login-userLabel\'><%=usernameLabel%></div>\n\t\t<div id=\'<%=userNameFieldId%>\' class=\'ossui-login-inputField ossui-login-userInput\' data-uxf-point="userNameFieldInput"></div>\n\t</div>\n\t<div class=\'ossui-password-field\'>\n\t\t<div id=\'<%=passwordFieldId%>\' class=\'ossui-login-text ossui-login-passwordLabel\'><%=passwordLabel%></div>\n\t\t<div id="<%=passwordFieldId%>" class=\'ossui-login-inputField ossui-login-passwordInput\' data-uxf-point="passwordFieldInput"></div>\n\t</div>\n</div>\n';});

/**
* $Id: //depot/Applications/OSSUI/v10.1.0.0/components/ossui-client-zip/src/main/webapp/lib/amdocs/ossui/components/login/view/LoginView.js#1 $ 
* $DateTime: 2017/06/08 19:26:36 $ 
* $Revision: #1 $ 
* $Change: 1837971 $
*
* COPYRIGHT NOTICE:
* Copyright (c) 2013 Amdocs.
* The contents and intellectual property contained herein,
* remain the property of Amdocs.
* 
* */
define('ossui/widget/LoginView',[
    'jquery',
    'underscore',
    'lightsaber',
    'lib/amdocs/ossui/core/util/i18n/ossui-resource-bundle',
    'text!lib/amdocs/ossui/components/login/view/templates/loginviewtemplate.html'
], function($, _, Lightsaber, OssuiResourceBundle, loginViewTemplate) {


    var loginView = Lightsaber.Core.View.extend({

        template : loginViewTemplate,

        initialize : function(options) {
            _.bindAll(this,'_processErrorPasswd');
            _.template((this.getConfig('template') || this.template),this.viewModel.get('data'));            
            this.viewModel.on('loginError',this._processErrorPasswd);
        },
        
        enhanceMarkup : function(){
            var inputText1 = new Lightsaber.InputTextView({
                viewModel : this.viewModel,
                id : 'userNameText',
                vmKeys : {
                    "data.fieldValue" : "username"
                },
                config : {
                    el : this.$( '[data-uxf-point="userNameFieldInput"]')
                }
            });
            var inputText2 = new Lightsaber.InputTextView({
                viewModel : this.viewModel,
                id : 'passwordText',
                vmKeys : {
                    "data.fieldValue" : "password"
                },
                config : {
                    el : this.$( '[data-uxf-point="passwordFieldInput"]'),
                    inputAttributes : {
                        type : "password"
                    }
                }
            });           
            
        },
        _processErrorPasswd : function(){
           this.$el.parent().parent().find('.ui-button').attr('disabled',false);
           this.$('.ossui-login-error').css('display','block');
        }
      
    });
    return loginView;
});
/**
* $Id: //depot/Applications/OSSUI/v10.1.0.0/components/ossui-client-zip/src/main/webapp/lib/amdocs/ossui/components/login/view/LoginDialog.js#1 $ 
* $DateTime: 2017/06/08 19:26:36 $ 
* $Revision: #1 $ 
* $Change: 1837971 $
*
* COPYRIGHT NOTICE:
* Copyright (c) 2013 Amdocs.
* The contents and intellectual property contained herein,
* remain the property of Amdocs.
* 
* */

define('ossui/widget/LoginDialog',[
    'jquery',
    'underscore',
    'lightsaber',
    'ossui/widget/ModalDialogCallback',
    'ossui/widget/LoginView',
    'ossui/utils/OSSUIResourceBundle'
], function($, _, Lightsaber, ModalDialogCallback, LoginView,
        OSSUIResourceBundle) {

    var loginView = Lightsaber.PopupView.extend({
        config : {
            position : 'center',
            resizable : false,
            show: 'fade',
            hide: 'fade',
            modal: true,
            title: 'Login',
            width : 386,
            height: 230,
            autoRender:false,
            autoShow : true,
            dialogClass : 'ossui-lightbox ossui-login',
            draggable : false,
            buttons : [  {
                                text : 'login',
                                click : function(event) {
								$(this).parent().find('.ui-button').attr('disabled',true);
                                    ModalDialogCallback
                                            .trigger('OkClicked',this);
                                }
                            }/*,

                            {
                                text : 'cancel',
                                click : function(event) {
                                    ModalDialogCallback
                                            .trigger('CancelClicked',this);
                                }
                            } */ ],
            createContent : function (self){ 
                self.contentView = new Lightsaber.Core.View({
                    config: {
                        template : '<div id="ossui-logindialog" class="ossui-logindialog"></div>'
                    },
                    viewModel : new Lightsaber.Core.ViewModel()
                });
                self.modalDialogView = new LoginView({
                    viewModel : self.viewModel,
                    el : self.contentView.$el
                });
                return self.contentView.$el;
              }
        },
        initialize: function(options) {
            _.bindAll(this,'okClicked');
            ModalDialogCallback.on('OkClicked',this.okClicked);
            this.productInfo = options.productInfo || 'AMDOCS OSS';
           // ModalDialogCallback.on('CancelClicked',this.cancelClicked);
            //change the buttons names to the ones in resource bundle
            var tempButt = this.getConfig('buttons');
            tempButt[0].text = this.viewModel.get('submitButtonName');
            this.setConfig('buttons', tempButt);
            //this.config.buttons[1].text = this.viewModel.get('cancelButtonName');
            this.setConfig('title', OSSUIResourceBundle.prototype.getLabel('ossui.labels.heading.login') || 'Login');
            this._super();
        }  ,
        
        okClicked : function(dialogObj){
            this.viewModel.save(dialogObj);
        },
        
        /**
         * Overwritten this class from Lightsaber.PopupView to add extra product header to the login
         * @param sd : element
         */
        _prepareHeader : function(sd) {
            this._super(sd);
            var header = $(sd).parent().children().first();
            $(header).prepend("<div class='ossui-product-info'></div>");
            $(header).find('.ui-dialog-title').addClass('ossui-login-title');
            if(this.options.productInfoClass){
                $(header).find('.ossui-product-info').addClass(this.options.productInfoClass);
            }
            //add the product info
            $(header).find('.ossui-product-info').html(this.productInfo);
        }
        
    
    });
    return loginView;
});

/*jshint devel:true */
define('ossui/widget/LoginViewModel',[
        'underscore',
        'lightsaber',
        'ossui/utils/OSSUIResourceBundle'
    ], function(_, Lightsaber, OSSUIResourceBundle) {

        var loginViewModel = Lightsaber.Core.ViewModel.extend({

            defaults:
            {
                userNameFieldId     :'usernamefieldid',
                passwordFieldId     :'passwordfieldid',
                loginErrorMessageId :'loginerrormessageid',
                cancelButtonName    :'Cancel',
                submitButtonName    :'Submit',
                passwordLabel       :'Password',
                usernameLabel       :'User Name'
            },

            initialize : function(options) {
                _.bindAll( this ,'overrideDefaults');
                this.overrideDefaults();
            },

            overrideDefaults: function(){

                var submitButtonlabel = OSSUIResourceBundle.prototype.getMessage('ossui.labels.button.submitString');
                if(submitButtonlabel){
                    this.set('submitButtonName',submitButtonlabel);
                }

               /* var cancelButtonLabel = OSSUIResourceBundle.prototype.getMessage('ossui.labels.button.cancelString');
                if(cancelButtonLabel){
                    this.set('cancelButtonName',cancelButtonLabel);
                }*/

                var passwordFieldLabel = OSSUIResourceBundle.prototype.getLabel('ossui.labels.login.password');
                if(passwordFieldLabel){
                    this.set('passwordLabel',passwordFieldLabel);
                }

                var usernameFieldLabel = OSSUIResourceBundle.prototype.getLabel('ossui.labels.login.username');
                if(usernameFieldLabel){
                    this.set('usernameLabel',usernameFieldLabel);
                }
                this.trigger('viewModelLoaded');

            } ,

            save : function(dialogObj){
                var self = this;
                self.dialogObj = dialogObj;
                self.models.myModel.save(null,{
                    success : function(){
                       self.trigger('loginSuccess');
                       $(self.dialogObj).dialog("close");
                    },
                    error :  function(originalModel, resp, options){
                       self.trigger('loginError',resp);
                    }
                });
            },
           cancel : function(dialogObj){
               this.models.myModel.set('username','');
               this.models.myModel.set('password','');
               $(dialogObj).find('[data-uxf-point="userNameFieldInput"] [data-uxf-point="LS-error"]').empty();
               $(dialogObj).find('[data-uxf-point="passwordFieldInput"] [data-uxf-point="LS-error"]').empty();
           } 
           
           });
    return loginViewModel;
    });
define('ossui/widget/LoginModule',[
    'jquery',
    'underscore',
    'lightsaber',
    'ossui/widget/LoginDialog',
    'ossui/widget/LoginViewModel'
    ],
    function($, _, Lightsaber, LoginDialog, LoginViewModel, loginModuleTemplate) {

  var loginModule = Lightsaber.Module.extend({

            template :  '<div id="loginView" class ="loginView ossui-splash-screen"></div>',

            // Behaviour Detection: Device features are sent as Query Parameters to the Rest service
            makeQueryString : function(params) {
                return _.map(params, function(value, key) {
                    return key + '=' + value;
                }).join('&');
            },

            init : function(options) {
                _.bindAll(this, 'triggerLoginSuccess', 'triggerLoginFailure');

                // Behaviour Detection: Requires device feature detection which is stored as a temporary object
                var deviceFeatures = {
                    isTouchSupported : !!(("ontouchstart" in window) || window.DocumentTouch
                            && document instanceof window.DocumentTouch),
                    isOrientationSupported : ("orientation" in window),
                    deviceWidth : screen.width,
                    deviceHeight : screen.height,
                    usrAgent : (navigator.userAgent),
                    operatingSys : (navigator.platform)
                };
                var behaviourDetectionQueryParams = '?' + this.makeQueryString(deviceFeatures);
                if(typeof options.noBehaviourDetectionNeeded !== 'undefined' && options.noBehaviourDetectionNeeded === true) {
                    behaviourDetectionQueryParams = '';
                }
                    
                var LoginModel = Lightsaber.Core.RESTModel.extend({
                    // Behaviour Detection: Device features are sent as Query Parameters to the Rest service
                    url: (options.resturl || "lightsaber/secure/Login") + behaviourDetectionQueryParams,
                    defaults : {
                        user:'',
                        password:''
                    }
                });

                var loginModel =  new LoginModel(null,{rest:{
                    read:{
                        contentType: "application/json",
                        method: "POST"
                    }
                }
                });

                var loginViewModel = new LoginViewModel({

                    models : {
                        myModel : loginModel
                    },

                    dataBindings : [
                        { 'username' : 'models.myModel.user' ,
                            options : {
                                setOnBind : true,
                                twoWay : true
                            }
                        },
                        { 'password' : 'models.myModel.password' ,
                            options : {
                                setOnBind : true,
                                twoWay : true
                            }
                        }
                    ]
                });
                
                var productInfo, productInfoClass ;
                if( options.loadParams && options.loadParams.productInfo){
                    productInfo = options.loadParams.productInfo;
                    }
                if( options.loadParams && options.loadParams.productInfoClass){
                    productInfoClass = options.loadParams.productInfoClass;
                    }

                this.loginDialog = new LoginDialog({
                    productInfo : productInfo,
                    productInfoClass : productInfoClass,
                    viewModel : loginViewModel
                });
                loginViewModel.on('loginSuccess', this.triggerLoginSuccess);
                loginViewModel.on('loginError', this.triggerLoginFailure);
            },

            postInit : function(options){
                //render the loginDialog
                this.loginDialog.render();
                var thisLoginModule = this;
                $('.'+this.loginDialog.getConfig('dialogClass').replace(/\s+/g, '.')).on('keypress',function(e){
                    if(e && e.keyCode === 13 && thisLoginModule.loginDialog.$el.parent().find('.ui-button').attr('disabled') === undefined)
                    {
                        thisLoginModule.loginDialog.$el.parent().find('[type="button"].ui-button').focus().trigger('click');
                    }
                });
            },

            triggerLoginSuccess : function(){
                this.$el.empty();
                // Behaviour Detection : Response from server contains, 'loginResponse' which in turn contains an attribute 'user'
                var loginResponse = this.loginDialog.viewModel.models.myModel.get("loginResponse");
                if (_.isUndefined(loginResponse)) {
                    // BWC for version 9.0 for which the login response only contained the attribute user
                    loginResponse = this.loginDialog.viewModel.models.myModel.get("user");
                }
                this.trigger('LoginSuccess',loginResponse);
            },

            triggerLoginFailure : function(resp){
                this.trigger('LoginFailure',resp);
            }
        });
        return loginModule;
 });

/**
* $Id$
* $DateTime$
* $Revision$
* $Change$
*
* COPYRIGHT NOTICE:
* Copyright (c) 2013 Amdocs.
* The contents and intellectual property contained herein,
* remain the property of Amdocs.
* 
* */ 
define( 'ossui/navigation/EventManagerModule', [ 'underscore',
         'backbone',
         'lightsaber',
         'ossui/application/view/Module',
         'ossui/navigation/ModuleRegistry'], 
        function(_, Backbone, Lightsaber, Module, ModuleRegistry) {
    
    /**
     * Extend it from {@link Lightsaber.Module} to leverage the functionalities of it.
     * 
     * This module acts as a mediator between the ObservableModule and the ControllerModule. 
     * Sometimes it acts as mediator between its child the EventManagerModule and the ControllerModule as well.
     * 
     * An EventManagerModule will listen to all of its children and grandchildren modules and manages the OSSUIEvent(s) from them.
     * If it can't handle an event triggered by its children module using ControllerModule instances it created, 
     * then it will delegate that event to its next nearest parent EventManagerModule.
     * 
     */
    var eventManager = Module.extend({
        // Do Nothing.    
    });
    
    /**
     * Now mixing it with {@link Backbone.Events} - to give this module the ability to 
     * bind and trigger custom named events - in our case 'OSSUIEvent'.
     */
    _.extend(eventManager.prototype, Backbone.Events, {
    
        /**
         * List of controllers who are specialist in handling certain type of events.
         * 
         *  Ex.: Breadcrumb Controller can handle breadcrumb events like, Add/Remove Breadcrumb (with/without loading a module). 
         */
        controllers : [],

        /**
         * Pre-Initialization steps...
         * 
         * - Reads module registry to get the list of modules it needs to manage and 
         *   registers them so that it can instantiate/load them.
         *   
         * - Initializes the 'controllers' list - controllers modules it manages will be 
         *   added into this list whenever a new instance of any 'controller' module is created.
         *   
         * - Triggers 'listenToMe' event on it's parent module so that it will be propagated to 
         *   next nearest parent of type {@link EventManagerModule} so that it can delegate the 
         *   'OSSUIEvent' to it if this module cannot handle that event.
         * 
         * - Registers the callback methods to handle 'listenToMe' and 'stopListeningToMe' events from its
         *   children module.
         *    
         */
        preInit : function(options) {
            _.bindAll(this, '_registerChildModulesToListenFor', '_deregisterChildModulesToListenFor',
                    'manageEventsFromChildModules');
            
            this.moduleInstances = {};
            this.controllers = [];
            
            var moduleReg = new ModuleRegistry();
            
            // Get the list of modules configured for this module.
            var modules = moduleReg.getModulesToRegister(this.id);
            
            var noOfModules = (modules !== undefined) ? modules.length : 0;
            
            if (noOfModules > 0) {
                for (var count = 0; count < noOfModules; count++) {
                    
                    /**
                     *  If the specific 'el' element is not configured, then 'relativeElement' 
                     *  should be configured.
                     */
                    
                    if (! modules[count].el) {
                        modules[count].el = this.$el.find(modules[count].relativeElement);
                    }
                }
                
                /**
                 * Register all the modules configured for this module so that it can manage them.
                 */
                this.registerModulesWithHistoryFalse(modules);
            }
            
            /**
             * Initialize the list of controllers this module manages.
             */
            this.controllers = [];
            
            /**
             * Trigger 'listenToMe' event on 'parent' in order to get listened by 
             * nearest parent module of type 'EventManagerModule'.
             */
            this.options.parent.trigger("OSSUIEvent:module:listenToMe", this);
            
            /**
             * Register the callback methods to handle 'listenToMe' & 'ignoreMe' events from child modules.
             */
            this.on("OSSUIEvent:module:listenToMe", this._registerChildModulesToListenFor);
            this.on("OSSUIEvent:module:stopListeningToMe", this._deregisterChildModulesToListenFor);
        },

        /**
         * Callback method for handling OSSUIEvent:module:listenToMe event from child modules.
         * Starts listening on child module represented by given object childModule. From now on, 
         * if there is any OSSUIEvent triggered on that childModule object will be handled by this 
         * module using <code>this.manageEventsFromChildModules()</code> described below.
         * 
         *  @param childModule - Child Module object.
         */
        _registerChildModulesToListenFor : function(childModule) {
            //console.log("===========> Register : " + childModule.id + " with '" + this.id + "'");
            
            if (childModule){
                childModule.on("OSSUIEvent", this.manageEventsFromChildModules);
            }            
        },
        
        /**
         * Callback method for handling OSSUIEvent:module:stopListeningToMe event from child modules.
         * Stops listening on child module represented by given object childModule.
         * 
         * @param childModule - Child Module object.
         */
        _deregisterChildModulesToListenFor : function(childModule) {
            //console.log("===========> Deregister : " + childModule);
            
            if (childModule){
                childModule.off("OSSUIEvent");
            }
        },
        
        /**
         * It's a callback method for handling OSSUIEvent(s) from the child modules this module 
         * (type of EventManagerModule) listens for.
         * 
         * For the given event (represented by eventData object), it looks for eventType property 
         * to identify which controller module can handle this event. 
         * 
         * It loops through all the controller(s) it instantiated so far and if finds relevant controller 
         * (by matching the 'eventType') it calls that controller's handleEvent(eventData) to handle that event.
         * 
         * @param eventData - Event Data object object with two mandatory parameters, 
         * eventType    - Possible values are, breadcrumb & tab. This is used to identify the relevant ControllerModule 
         *                to perform the eventAction.
         * eventAction  - Represents the action that needs to be done by the controller module. 
         *                Ex.: createBreadcrumb - creates a new breadcrumb and loads a module.
         */
        manageEventsFromChildModules : function(eventData) {
            //console.log("************** Handling event from : "+ eventData.id + " with '" + this.id + "'");
            
            
            var eventType = eventData.eventType;
            var noOfControllers = this.controllers.length;
            
            var eventTypeArray = eventType.split(',');
            
            for (var i = 0; i < eventTypeArray.length; i++) {
                
                var isEventHandled = false;
                
                /**
                 * loop thro' all controllers to find relevant controller module who can handle 
                 * this event. 
                 */
                for (var count = 0; count < noOfControllers; count++) {
                    
                    if (this.controllers[count] && eventTypeArray[i] === this.controllers[count].eventType) {
                        this.controllers[count].handleEvent(eventData);
                        isEventHandled = true;
                    }
                }
                
                if (isEventHandled === false) {
                    eventData.eventType = eventTypeArray[i];
                    this.trigger("OSSUIEvent", eventData);
                }
            }            
        },
        
        /**
         * TODO:
         */
        updateModuleInstancesList : function (moduleConfig){
            
            if (this.moduleInstances && moduleConfig){
                this.moduleInstances[moduleConfig.el] = moduleConfig.instance;
                this.controllers.push(moduleConfig.instance);
            }
        },
        
        /**
         * Destroy this module cleanly by removing all the event listeners and
         * calling the module's destroy method.
         */
        destroy : function () {
            /**
             * Trigger 'stopListeningToMe' event on 'parent' in order to stop listened by 
             * nearest parent module of type 'EventManagerModule'.
             */ 
            this.options.parent.trigger("OSSUIEvent:module:stopListeningToMe", this);
            Module.prototype.destroy.call(this);
        }
        
    });
    
    return eventManager;
});

/**
* $Id: //depot/Applications/OSSUI/v10.1.0.0/components/ossui-client-zip/src/main/webapp/lib/amdocs/ossui/components/navigation/ObservableModule.js#1 $
* $DateTime: 2017/06/08 19:26:36 $
* $Revision: #1 $
* $Change: 1837971 $
*
* COPYRIGHT NOTICE:
* Copyright (c) 2013 Amdocs.
* The contents and intellectual property contained herein,
* remain the property of Amdocs.
* 
* */ 
define('ossui/navigation/ObservableModule', [ 'underscore',
         'backbone',
         'lightsaber',
         'ossui/application/view/Module',
         'ossui/navigation/ModuleRegistry'], 
        function(_, Backbone, Lightsaber, Module, ModuleRegistry) {
    
    /**
     * Extend it from {@link Lightsaber.Module} to leverage the functionalities of it.
     * 
     */
    var observableModule = Module.extend({
        // Do Nothing.
    
    });
    
    /**
     * Now mixing it with {@link Backbone.Events} - to give this module the ability to 
     * bind and trigger custom named events - in our case 'OSSUIEvent'.
     */
    _.extend(observableModule.prototype, Backbone.Events, {
    
        /**
         * Pre-initialization steps....
         * 
         * - Trigger 'listenToMe' event (OSSUIEvent:module:listenToMe) on its parent module 
         *   so that its parent module can listen this module. 
         *   It allows this module to trigger OSSUIEvent(s) and the parent module can manage those events accordingly.
         * 
         * - Bind the event handler methods which are responsible for handling OSSUIEvent:module:listenToMe & 
         *   OSSUIEvent:module:stopListeningToMe events from it's child modules. And these event handler methods just delegates 
         *   the events to parent modules as mentioned below.
         *   
         */
        preInit : function(options) {
            _.bindAll(this, '_delegateListenToMeEvent', '_delegateNeglectMeEvent');
            
            this.moduleInstances = {};
            
            /**
             * Trigger 'listenToMe' event on 'parent' in order to get listened by 
             * nearest parent module of type 'EventManagerModule'.
             */ 
            this.options.parent.trigger("OSSUIEvent:module:listenToMe", this);
            
            /**
             * Register the callback methods to handle 'listenToMe' & 'ignoreMe' events from child modules.
             */
            this.on("OSSUIEvent:module:listenToMe", this._delegateListenToMeEvent);
            this.on("OSSUIEvent:module:stopListeningToMe", this._delegateNeglectMeEvent);
        },
        
        
        /**
         * Callback method for handling OSSUIEvent:module:listenToMe event from child modules.
         * 
         * Delegates the OSSUIEvent:module:listenToMe event to its parent module [of type {@link EventManagerModule}] 
         * It never listens (at least till now) to the child modules directly. It delegates that work to its parent module.
         * 
         * @param childModule - Child Module object. 
         */
        _delegateListenToMeEvent : function(childModule) {
            //console.log("===========> Register : " + childModule.id + " with '" + this.id + "'");
            
            /**
             * Sorry, I'm busy and can't listen to my children. May be my parent can, hence delegating to them.
             */
            this.options.parent.trigger("OSSUIEvent:module:listenToMe", childModule);            
        },
        
        /**
         * Callback method for handling OSSUIEvent:module:stopListeningToMe event from child modules.
         * 
         * Delegates the OSSUIEvent:module:listenToMe event to its parent module to stop them listening to the given child module.
         * 
         * @param childModule - Child Module object.
         */
        _delegateNeglectMeEvent : function(childModule) {
            //console.log("===========> Deregister : " + childModule);
            
            /**
             * Sorry, I'm busy and can't listen to my children. May be my parent can, hence delegating to them.
             */
            this.options.parent.trigger("OSSUIEvent:module:stopListeningToMe", childModule);
        },
        
        /**
         * Destroy this module cleanly by removing all the event listeners and 
         * calling the module's destroy method.
         */
        destroy : function (moduleConfig) {
            /**
             * Trigger 'stopListeningToMe' event on 'parent' in order to stop listened by 
             * nearest parent module of type 'EventManagerModule'.
             */ 
            this.options.parent.trigger("OSSUIEvent:module:stopListeningToMe", this);
            Module.prototype.destroy.call(this);
        }
    });
    return observableModule;
});

/*
 * 
 * COPYRIGHT NOTICE:
 * Copyright (c) 2013 Amdocs.
 * The contents and intellectual property contained herein,
 * remain the property of Amdocs.
 */
define('ossui/portalregistrar/PortalRegistrar',[
                                                'jquery',
                                                'underscore',
                                                'lightsaber',
                                                'ossui.messaging',
                                                'ossui/utils/OSSUIUtils'
                                                ], 
                                                /*global console */
                                                function($, _, Lightsaber, Messaging, OSSUIUtils) {

	function PortalRegistrar() {
       this.portalRegistrationDone = false;
		/**
		 * Default implementation, should be overridden by the parent application.
		 */
		this.openSettings = function(){
			//TODO - config for message and button text
			OSSUIUtils.raisePopupDialog($('<div/>').text("No settings for application").html(), "",
					"Ok", null,null);
		};

		/**
		 * Default implementation, should be overridden by the parent application.
		 */
		this.openHelp = function(){
			//TODO - config for message and button text
			OSSUIUtils.raisePopupDialog($('<div/>').text("No help for application").html(), "",
					"Ok", null,null);
		};

		/**
		 * Default implementation, should be overridden by the parent application.
		 */
		this.receiveDisplayNotification = function(data){
			window.console.log("receiveDisplayNotification: "+JSON.stringify(data));
		};
		
		/**
		 * Default implementation, should be overridden by the parent application.
		 */
		this.sessionLogout = function(){
			//config for session logout cleanup.
			Lightsaber.Core.StorageUtil.getStorage().deleteKey(OSSUIResourceBundle.prototype.getLabel('ossui.session.storage.security.token.key') || "defaultLightsaberSessionToken");
		};

		/**
		 * Default implementation, this has been created so that every time the portal is clicked (e.g. switching to a new application)
		 * this application is left in a specific state.  In this default case we want to tell select2 to close any open search box
		 * as select2 does not like 2 open at once, so if the user opens another in the second app it will cause problems.
		 */
		this.portalClickedNotification = function(data){
			if (require.defined('select2')){
				$('#select2-drop').select2('close');
			}
		};

		this.setupMessaging = function(documentReferrer){
			var parentWindow = window.parent,
			parentUrl = Messaging.messageUtils.getTargetUrl(documentReferrer),
			options = {
				targetUrl : parentUrl,
				targetWindow : parentWindow
			};

			this.clientMessageService =  Messaging.messageServiceFactory.createMessageService(Messaging.constants.MODE_CLIENT, options);
		};

		this.initialise = function(documentReferrer){
			this.setupMessaging(documentReferrer);
			var self = this;
			this.handshakeId = new Date().getTime();
			self.clientMessageService.publish(this.handshakeId, 'portal.initialHandshake');
		};

		this.publishAppSessionTokenName = function(appSessionTokenName) {
			if (!_.isUndefined(appSessionTokenName) && !_.isNull(appSessionTokenName)) {			
				this.clientMessageService.publish(appSessionTokenName, 'portal.storeAppSessionTokenNames');				
			}
		};

		/**
		 * Called by an app that wants to be called by the portal.  Here the initial handshake back to the portal is initiated, with the app (this)
		 * giving the portal its display name, and in return the portal will supply the app with a unique identifier.
		 */
		this.processLoginHandshake = function(documentReferrer, appDisplayName, appSessionTokenName) {
          if(!this.portalRegistrationDone){
			this.appDisplayName = appDisplayName;
			this.publishAppSessionTokenName(appSessionTokenName);

			if (!this.clientMessageService){
				this.setupMessaging(documentReferrer);
			}

			var self = this;

			var requestHandlers = {
					success : function(data) {
						var messageObj = $.parseJSON(data);
						//subscribe to messages from portal to this application
						self.clientMessageService.subscribe(self.openSettings, "openSettingsDialog-"+messageObj.appId);
						self.clientMessageService.subscribe(self.openHelp, "openHelpDialog-"+messageObj.appId);
						self.clientMessageService.subscribe(self.sessionLogout, "sessionLogout-"+messageObj.appId);
						self.clientMessageService.subscribe(self.receiveDisplayNotification, "portal.displayNotification-"+messageObj.appId);
						self.clientMessageService.subscribe(self.portalClickedNotification, 'portal.portalClickedNotification');
                        self.portalRegistrationDone = true;
					},
					error : function(payload) {
						throw new Error('Error handler: ' + payload);
					}
			};

			this.clientMessageService.request(requestHandlers, 'portalApplicationLoaded', '{"displayName":"'+appDisplayName+'", "handshakeId":"'+this.handshakeId+'"}');
          }
		};
	}

	return new PortalRegistrar();
});

/*global $*/
/*jshint devel:true */

define('lib/amdocs/ossui/components/sidebar/sidebar',['jquery'], function ($) {

    var OSSUISidebar = {

        _menuItems : {},
        _menuActions : {},

        register : function(args, fn) {

            var item = args.menuItem;
            if (item !== undefined) {
                this._menuItems[item] = args;
                var menuClass = args.menuClass;
                this._menuActions[item] = function(event) {
                    $('li.ossui-sidebar-menuitem').removeClass('active');
                    $('li.ossui-sidebar-menuitem').addClass('inactive');
                    $('li.' + menuClass).removeClass('inactive');
                    $('li.' + menuClass).addClass('active');

					// 'currentTarget' is the object that's listening for the event, whereas 'target'
					// is the actual element that received the event (possibly a child of current).
					var targetId = event.target.id;
					if (!_.isString(targetId) || targetId.length === 0) {
						targetId = event.currentTarget.id;
					}

                    fn.apply(this, [targetId]);
                };
            }

            return this;
        },

        activate : function() {

            for (var n in this._menuItems) {
                if (this._menuItems.hasOwnProperty(n)) {

                    var args = this._menuItems[n];
                    var fn = this._menuActions[n];

                    var menuClass = args.menuClass;
                    var menuLabel = args.menuLabel;
                    var menuId = args.menuId;

                    console.log('n=' + n + ',menuClass=' + menuClass + ",menuLabel=" + menuLabel);

                    $('#ossui-sidebar-menu').append(
                        '<li class="ossui-sidebar-menuitem ' + menuClass + ' inactive" id="'+menuId+'"><div class="ossui-sidebar-menuitem-text" id="'+menuId+'">' +
                            menuLabel + '</div></li>');

                    $('li.' + menuClass).click(fn);
                }
             }
        }
    };

    return function() {
        return OSSUISidebar;
    };

});

/*global $*/
/*jshint devel:true */

define('lib/amdocs/ossui/core/frame/frame',['jquery','jquery.layout'], function ($) {

    var OSSUIFrame = {

        activate : function(layoutSelector) {
                _framelayout =
                    $(layoutSelector).layout({
                        initHidden: false,
                        fxName:"fadeIn",
                        resizable: false,
                        spacing_open : 0,
                        spacing_closed : 0,
                        speed:1000,
                        animatePaneSizing: true,
                        north: {size: 33, slidable: false, spacing_open: 0},
                        west: {
                            size: 115, 
                            slidable: false,
                            onopen : function() {
                                $(layoutSelector).find('#ossui-mainframe-sidebar-toggle').css('background-image', "url('/ossui-framework/res/amdocs/ossui/sidebar/I_teeth_grey_left_white.png')");
                            },
                            onclose : function() {
                                $(layoutSelector).find('#ossui-mainframe-sidebar-toggle').css('background-image', "url('/ossui-framework/res/amdocs/ossui/sidebar/I_teeth_grey_right_white.png')");
                            }
                        }
                    });
        },
        
        decorateFrame : function(frameDecorator){
            $(frameDecorator.titleSelector).html(frameDecorator.titleText);
            $("#ossui-mainframe-header-center-text").html(frameDecorator.frameCenterText);
            $("#ossui-mainframe-header-application").html(frameDecorator.headerText);
            $("#ossui-mainframe-header-user").html(frameDecorator.userName);
            $("#ossui-mainframe-header-logout").html(frameDecorator.loginInfo);
            _framelayout.addToggleBtn("#ossui-mainframe-sidebar-toggle", "west");
        },

        toggleAll : function() {
            $.each(["north","west"], function(i, pane) {
                $('body').toggle(pane);
            });
        }
    };

    return function() {
        return OSSUIFrame;
    };

});

/*
 * $Id: //depot/Applications/OSSUI/v10.1.0.0/components/ossui-client-zip/src/main/webapp/lib/amdocs/ossui/ossui-frame.js#1 $
 * $DateTime: 2017/06/08 19:26:36 $
 * $Revision: #1 $
 * $Change: 1837971 $
 *
 * COPYRIGHT NOTICE:
 * Copyright (c) 2013 Amdocs.
 * The contents and intellectual property contained herein,
 * remain the property of Amdocs.
 */

define('ossui_frame', [ 'lib/amdocs/ossui/components/sidebar/sidebar', 'lib/amdocs/ossui/core/frame/frame' ],

function(sidebar, frame) {

    var ossui = {
        Sidebar : sidebar,
        Frame : frame
    };

    return ossui;
}

);

/**
* $Id: //depot/Applications/OSSUI/v10.1.0.0/components/ossui-client-zip/src/main/webapp/lib/amdocs/ossui/components/profile/model/ProfileModel.js#1 $
* $DateTime: 2017/06/08 19:26:36 $
* $Revision: #1 $
* $Change: 1837971 $
*
* COPYRIGHT NOTICE:
* Copyright (c) 2013 Amdocs.
* The contents and intellectual property contained herein,
* remain the property of Amdocs.
* 
* */ 
define('ossui/widget/ProfileModel',[ 'underscore', 'lightsaber' ], function(_, Lightsaber) {

    /**
     * Represents a record in the profiles model,
     * 
     * 
     * The displayable value is "displayValue"
     */
    var ProfileModel = Lightsaber.Core.RESTModel.extend({

        defaults : {
            id : "n/a",

            displayValue : {
                value : "n/a"
            }
        }

    });

    return ProfileModel;
});


/**
 * $Id: //depot/Applications/OSSUI/v10.1.0.0/components/ossui-client-zip/src/main/webapp/lib/amdocs/ossui/components/profile/model/ProfileCollection.js#1 $
 * $DateTime: 2017/06/08 19:26:36 $
 * $Revision: #1 $
 * $Change: 1837971 $
 *
 * COPYRIGHT NOTICE:
 * Copyright (c) 2013 Amdocs.
 * The contents and intellectual property contained herein,
 * remain the property of Amdocs.
 * 
 * */ 
define('ossui/widget/ProfileCollection',[
	'underscore', 
	'jquery',
	'lightsaber',
	'ossui/widget/ProfileModel' 
], function(_, $, Lightsaber, ProfileModel) {

	var ProfileCollection = Lightsaber.Core.Collection
	.extend({

		model : ProfileModel,

		options : {
			error : this.errorHandler,
			success : this.successHandler
		},

		initialize : function(request) {
			this.url = (($.isEmptyObject(request) === false) ? request.url : "");
			this.parentObject = ($.isEmptyObject(request.parentObject) === false)?request.parentObject:"";
			_.bindAll(this, 'successHandler', 'errorHandler', 'parse', 'fetch', 'getAllAttributes');

			// console
			// .log('DLElements Collection init');
			Lightsaber.Core.Collection.prototype.initialize
			.call(this);
		},

		// This is the function that gets called
		// on a successful load.
		successHandler : function(data, response) {
			for(var i=0; i< response.length;i++){
				if(response[i].active){
					this.trigger('SetSelectedProfile', response[i]);
					break;
				}
			}
			this.trigger('ProfilesFetchSuccess');
		},

		errorHandler : function(data, response) {
//			this.set(response);
			//                            console
			//                                    .error("DualList Collection  INNER :Error");

		},

		parse : function(response) {
			for(var i=0; i< response.length;i++){
				if(response[i].customized){
					response[i].displayValue = response[i].displayValue.concat(' *');
				}
			}
			return response;

		},

		fetch : function(objectId, objectClass) {
			this.options.success = this.successHandler;

			try { // catching network errors and the like
				Lightsaber.Core.Collection.prototype.fetch
				.call(this, this.options);
			} catch (error) {
				if ($.isEmptyObject(this.parentObject) === false) {
					this.parentObject.handleGlobalError(error);
				}
			}
		},

		getAllAttributes : function(objectId, objectClass) {
			this.fetch(objectId, objectClass);
		}

	});
	return ProfileCollection;
});

 
define('ossui/widget/profile/InputTextViewValidated',
        [ 'lightsaber', 'underscore', 'jquery' ], 
        function(Lightsaber, _, $) {

    var InputTextViewValidated = Lightsaber.InputTextView.extend({

      events : {     // highjacking the change event because we need its validation to happen conditionally
                     "change" : "_changed"
                },
        initialize : function(options) {
            this._super(options);
            this.viewModel.on('bindingWarning:Profile',
                    this._processValidationProfile);
            //this.viewModel.on("change:Profile", function(evt) {this._toggleInputBoxBorder('inputTextView'); },this);
            
        },

        _processValidationProfile : function(viewModel, error, bindingObj) {
//            console.log('processing validation profile WARNING');
//             var inputPosition =  $('#profileListViewSave input ').eq(0).position();
//             var newtop = -65;
//             var newleft = +120; // inputPosition.left ;
             // Position the error messProfile overlaid above the input box
             $('#profileListViewSave div[data-uxf-point="LS-error"] ').eq(0).css({
                 'color': 'red'
//             'top': newtop ,
//             'left': newleft
             });
        },
        _changed: function(evt, val)  {
            val = this._getValue(evt);
            var validateOnlyModel = this.viewModel.models.myModel.validateOnly;
         //   console.log('changed to '+val +' when validateOnlyModel was '+validateOnlyModel);

            // the 'validateOnlyModel' flag helps us to avoid the "on blur" validation trigger.
            // We are trying to validate only when pressing the 'validation' button.
            if (validateOnlyModel === 'true')
                {
                this.viewModel.models.myModel.validateOnly = 'false';  
                this._super(evt, val);
                  
                }
            
            if ( _.isUndefined(validateOnlyModel) || validateOnlyModel === 'false')
            {
                return false ;
            }

        }
        

    });

    return InputTextViewValidated;
});

define('text!lib/amdocs/ossui/components/profile/view/template/ProfileAdminView.html',[],function () { return '<div id=\'profileListViewSave\'  style=\'display:table; margin-left:-4%; width:400px;\'>\n<div data-uxf-point=\'profileListViewSelect\' style=\'display:table-row;\' ></div>\n<div data-uxf-point=\'profileListViewFill\' style=\'display:table-row;\' >Or</div>\n<div data-uxf-point=\'profileListViewText\' style=\'display:table-row;\' ></div>\n</div>';});

define('text!lib/amdocs/ossui/components/profile/view/template/AdminProfileInputTemplate.html',[],function () { return '<span class="uxf-selectinput">\n\t<div class="mlabel" style="float: left; margin-left: 0px; margin-right: 0%;">\n\t\t<label for="<%=id%>"><%=display%></label>\n\t</div>\n\t<select id="<%=id%>" name="<%=name%>" data-uxf-point="myElement"></select>\n</span>';});

/**
* $Id: //depot/Applications/OSSUI/v10.1.0.0/components/ossui-client-zip/src/main/webapp/lib/amdocs/ossui/components/profile/view/ProfileAdminView.js#1 $
* $DateTime: 2017/06/08 19:26:36 $
* $Revision: #1 $
* $Change: 1837971 $
*
* COPYRIGHT NOTICE:
* Copyright (c) 2013 Amdocs.
* The contents and intellectual property contained herein,
* remain the property of Amdocs.
* 
* */ 
define(
        'ossui/widget/ProfileAdminView',
        [       'underscore',
                'jquery',
                'lightsaber',
                'backbone',
                'ossui/widget/ProfileCollection',
                'ossui/widget/ProfileModel',
                'ossui/widget/ModalDialogView',
                'ossui/utils/OSSUIResourceBundle',
                'text!lib/amdocs/ossui/components/profile/view/template/ProfileAdminView.html',
                'text!lib/amdocs/ossui/components/profile/view/template/AdminProfileInputTemplate.html',
                'ossui/utils/OSSUIUtils',
                'ossui/widget/profile/InputTextViewValidated',
                'fixture.object', 'fixture.string', 'fixture.dom' ],
                /*jshint maxparams: 22 */
        function(_, $, Lightsaber, Backbone, ProfileCollection, ProfileModel, OSSUIModalDialog, OSSUIResourceBundle,
                DefaultProfileListViewTemplate, DefaultAdminProfileInputTemplate,OSSUIUtils ,InputTextViewValidated 
                ) {

            var ProfileShellCollection = ProfileCollection
            .extend({

                model : ProfileModel
            });
            
            var profileRegex = /^[a-zA-Z0-9 ]{0,100}$/;  // letters and spaces only 
            var ValidatedProfileModel = Lightsaber.Core.Model
            .extend({
                defaults : {
                    Profile : ''
                },
                url : '/aaa',
                validateOnly : 'false', // a flag helping us to avoid the "on blur" validation trigger
                validations : [ {
                    check : 'regExp',
                    pattern : profileRegex,
                    fieldName : 'Profile',
                    error : {
                        all : true
                    }
                } ]
            });
          var localValidatedProfileModel = new ValidatedProfileModel();
            
            var ProfileAdminView = Lightsaber.Core.View
                    .extend({
                        template : '',
                        config : {
                            useCaseModelURL : "n/a",
                            savedCollection : new ProfileShellCollection({parentObject : this})
                        },
                        initialize : function() {
                            _.bindAll(this, 'saveData', 'cancelData', 'handleRESTSyncSuccess', 'handleRESTSyncError', '_setSelectedProfile', 
                                    '_profilesFetchSuccesful', 'inputValidationError');
                            // url used by the [ProfileCollection] (passed
                            // further down at construction time)
                            this.profileModelURL = this.getConfig('useCaseModelURL') || this.config.useCaseModelURL; 

                            // templates used by this JS file 
                            this.template = this.getConfig('profileViewTemplate') || DefaultProfileListViewTemplate; 
                            this.config.selectProfileInputTemplate = this.getConfig('selectProfileInputTemplate') || DefaultAdminProfileInputTemplate;

                            this.config.labelDropdown = this.getConfig('labelDropdown') || 
                            OSSUIResourceBundle.prototype.getMessage('ossui.labels.profiles.labelDropdown');
                            
                            this.config.labelInputText = this.getConfig('labelInputText') || 
                            OSSUIResourceBundle.prototype.getMessage('ossui.labels.profiles.labelInputText');
                            
                            // lookups for error messages will start off from areas designated as "baseKeyFor.."
                            this.baseKeyForStatusBasedMessages =  this.getConfig('baseKeyForStatusBasedMessages') || "ossui.errorMessages";
                            this.baseKeyForCodeBasedMessages =  this.getConfig('baseKeyForCodeBasedMessages')  || "ann.search.ui.error.popup.servicefailure";

                            this.config.profileValidationErrorMessage = this.getConfig('profileValidationErrorMessage') ||
                            OSSUIResourceBundle.prototype.getMessage('ossui.errorMessages.validation.profile.name') ||
                            OSSUIResourceBundle.prototype.getMessage('ossui.errorMessages.validation.validate_pattern') ||
                            "Invalid {0} name or too many characters";

                        },
                        _postRender : function() {
                            this.cleanSavedCollections();
                            this.createProfileViews();
                            
                        },
                        cleanSavedCollections: function() {
                            this.config.savedCollection.reset();
                        }, 
                        /**
                         * gets the saved Collection 
                         */
                        getSavedCollection : function() {
                            return this.config.savedCollection;
                        },

                        /**
                         * gets the original  Collection 
                         */
                        getOriginalCollection : function() {
                            return this.config.originalCollection;
                        },

                        /**
                         * create  Views
                         */
                        createProfileViews : function() {
                            this.createAdminProfileView();
                        },

                        /**
                         * create save & clear buttons
                         */
                        profileModelURL : '',

                        
                        /**
                         * create the basic and additional item list view to
                         * show attribute information.
                         */
                        createAdminProfileView : function() {

                            
                            var self = this;
                            localValidatedProfileModel.set('Profile','');
                            var inputTextViewModelProfile = new Lightsaber.Core.ViewModel(
                                    {
                                        data : {
                                            labelProfile : self.config.labelInputText
                                        },
                                        models : {
                                            myModel : localValidatedProfileModel
                                        },
                                        dataBindings : [ {
                                            'Profile' : 'models.myModel.Profile',
                                            options : {
                                                setOnBind : true,
                                                twoWay : true
                                            }
                                        } ],
                                        config : {
                                            actions : {
                                                clearData : function() {
                                                    this.set("Profile", "");
                                                }
                                            }

                                        }
                                    });                            
                            
                            var validationErrorMessage = self.config.profileValidationErrorMessage.replace("{0}","Profile");
                            
                            var inputTextNewProfileName = new InputTextViewValidated({
                                viewModel : inputTextViewModelProfile,
                                id : 'inputTextView',
                                vmKeys : {
                                    "data.fieldValue" : "Profile",
                                    "data.label" : "labelProfile"
                                },
                                config : {
                                    el : this.$("[data-uxf-point='profileListViewText']"),
                                // Note: you can insert your own message by
                                // supplying an 'errorTextHandler' attribute
                                // errorTextHandler : function(model, error)
                                // {return "Profile has the wrong value"}
                                    errorTextHandler : this.inputValidationError
                                }
                            });
                            
                            // ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
                            // preparatory steps for the REST Data source load
                            var ProfileRESTDataSource = new Lightsaber.Core.LSRESTDataSource({ 
                                defaults:{
                                    contentType: 'application/json',
                                    url: this.profileModelURL
                                },
                                update: {
                                    method: 'PUT'      
                                },
                                read: {
                                    method: 'GET'
                                },
                                create: {
                                    method: 'POST'
                                }
                            });
                                                        
                            this.config.savedCollection.setDataSource(ProfileRESTDataSource);
                            // create model for basic attribute list
                            var profileCollection = new ProfileCollection({
//                                url : this.profileModelURL
                                parentObject : this
                            });
                            var profileModel  = new ProfileModel();
                            profileModel.set({
                                 selectprofile : profileCollection
                            });
                            var adminProfileVM = new Lightsaber.Core.ViewModel({
                                data : {
                                    label : this.config.labelDropdown,
                                    fieldValue : 'models.myModel.id'
                                },
                                models : {
                                    // the options here is mandatory for select view, else UXF
                                    // throws
                                    // exception at runtime
                                    // the collection here is also the data displayed in
                                    // the view
                                    options : profileCollection,
                                    myModel : profileModel
                                },
                                dataBindings : [ {
                                    'fieldValue' : 'models.myModel.id',
                                    options : {
                                        setOnBind : true,
                                        twoWay : true
                                    }
                                } ],
                                config : {
                                    optionsModelName : "options",
                                    optionsValueFieldName : "id",
                                    optionsDisplayFieldName : "displayValue"
                                }
                            });
                            
                            var StylizedSelectViewAdmin = Lightsaber.SelectView.extend({

                                initialize : function(options) {

                                    this._super(options);

                                    this.viewModel.on('change:fieldValue', function(evt) {this._toggleStyle('popupclass2'); },this);
                                },
                                
                                enhanceMarkup : function(){
                                    /*this.$('select').css('margin', '0px');
                                    this.$('select').css('min-width', '120px');*/
                                },
                                /*
                                 * Helper function that toggles the style of the selected option
                                 */
                               _toggleStyle : function(elementName) {

                                   $('#' + elementName + ' select ').change(function () {
                                       $(this).find('option').css('background-color', 'transparent');
                                       $(this).find('option').css('color', 'black');
                                       $(this).find('option:selected').css('background-color', '#fe7550');  // background in reddish-orange
                                       $(this).find('option:selected').css('color', 'white');  // text in white 
                                       
                                   }).trigger('change');            

                            }
                                
                            });                            
                            
                            var adminProfileView = new  StylizedSelectViewAdmin ({
                                viewModel : adminProfileVM,
                                template: this.config.selectProfileInputTemplate,
                                id : 'selectView',
                                config : {
                                    el : this.$("[data-uxf-point='profileListViewSelect']"),
                                    template: this.config.selectProfileInputTemplate
                                },
                                attributes : {
                                    'data-theme' : 'a'
                                }
                            });

                            this.config.profileCollection = profileCollection;

                            // storing for later access
                            this.config.adminProfileView = adminProfileView;
                            this.config.adminProfileVM = adminProfileVM;
                            this.config.inputTextNewProfileName = inputTextNewProfileName; 

                            profileCollection.setDataSource(ProfileRESTDataSource);
                            profileCollection.on('SetSelectedProfile', this._setSelectedProfile);
                            profileCollection.on('ProfilesFetchSuccess', this._profilesFetchSuccesful);
                            profileCollection.fetch();

                            return adminProfileView;
                        },
                        inputValidationError : function(model,error) {
                            $(this.dialogInstance.$el.parent().find('.ui-button')[1]).removeAttr('disabled');
                            var validationErrorMessage = this.config.profileValidationErrorMessage.replace("{0}","Profile");
                            return validationErrorMessage;
                        },

                        cancelData : function(dialogInstance) {
                            if(!this.dialogInstance){
                                this.dialogInstance = dialogInstance;
                            }
                            this.dialogInstance.close();
                        },
                        
                        /* jshint maxcomplexity: 12 */
                        saveData : function(dialogInstance) {
                            if(!this.dialogInstance){
                                this.dialogInstance = dialogInstance;
                            }
                            this.cleanSavedCollections();
                            var restDS = this.config.savedCollection
                            .getDataSource();
                            
                            localValidatedProfileModel.validateOnly = "true";
                                                
                           var  typedInProfileName = $(
                                    "#inputTextView input")
                                    .val();
                            localValidatedProfileModel.attributes.Profile= typedInProfileName;

                            // elicit a change of "Profile"
                            $(
                                    "#inputTextView input")
                                    .trigger("change");
                            
                            // now validate 
                            var validationResultAge = localValidatedProfileModel
                                    .validate(
                                            localValidatedProfileModel.attributes,
                                            {
                                                api : 'isValid'
                                            });
                            
                            var errorsForValidatedProfileName = "";

                            if (!_
                                    .isUndefined(validationResultAge)) {
                                errorsForValidatedProfileName = validationResultAge.errors;

                            }
                            
                            if ($.isEmptyObject(typedInProfileName) === false && $.isEmptyObject(errorsForValidatedProfileName)) {
                                //Backbone encodes the URL automatically 
                                //var encodedTypedInValue = encodeURIComponent(typedInProfileName); 
                                restDS.setQueryParams({name : typedInProfileName});
                                //'create' --> corresponds to POST for the LSDataSource
                                try {// catching network errors and the like
                                    restDS
                                            .sync(
                                                    'create',
                                                    this.config.savedCollection,
                                                    {
                                                        contentType : 'application/json',
                                                        success : this.handleRESTSyncSuccess,
                                                        error : this.handleRESTSyncError
                                                    });
                                } catch (error) {
                                    this.handleGlobalError(error);
                                }

                            } 
                            if ($.isEmptyObject(typedInProfileName)) { 
                                // else if no new field had been typed in , 
                                //then send the selected entry from the dropdown list 

                                var selectedProfileId = this.config.adminProfileView
                                        .getData().fieldValue;
                                var selectedProfileValue = this
                                        .getDisplayValue(selectedProfileId);

                                // if value not found , then execute the reverse
                                // lookup
                                if ($.isEmptyObject(selectedProfileValue) === true) {
                                    selectedProfileValue = selectedProfileId;
                                    selectedProfileId = this
                                            .getIdValue(selectedProfileValue);

                                }
                                //use jquery to get selected data from the html element
                                if (!selectedProfileId) {                                    
                                    selectedProfileId = this.config.adminProfileView.$el.find('option:selected').val();
                                }
                                // if everything else failed , do select the
                                // first entry in the drop down list
                                if (!selectedProfileId) {
                                    selectedProfileValue = this.config.adminProfileView
                                            .getData().optionsData.items[0].displayValue;
                                    selectedProfileId = this.config.adminProfileView
                                            .getData().optionsData.items[0].id;
                                }
                                if(!restDS.defaults.url.match(':index')){
                                    restDS.defaults.url += '/:index';                                                    
                                 }
                                try { // catching network errors and the like
                                    restDS
                                            .sync(
                                                    'create',
                                                    this.config.savedCollection,
                                                    {
                                                        contentType : 'application/json',
                                                        params : {
                                                            index : selectedProfileId
                                                        },
                                                        success : this.handleRESTSyncSuccess,
                                                        error : this.handleRESTSyncError
                                                    });
                                }// end try  
                                catch (error) {
                                    this.handleGlobalError(error);
                                }

                            }

                        },
                        handleRESTSyncSuccess: function(){
                            //nothing more to be done so close dialog
                            if(this.dialogInstance){
                                this.dialogInstance.close();
                            }
                        },
                        handleRESTSyncError : function(serviceResponse){
                            // launch generic error popup window.
                            var windowTitle = OSSUIResourceBundle.prototype.getMessage('ossui.labels.heading.errorString');
                            var buttonText =  OSSUIResourceBundle.prototype.getMessage('ossui.labels.button.okString');
                            //var localisedMessage = OSSUIResourceBundle.prototype.getMessage('ossui.errorMessages.genericBEError');
                            // signature looks like this :
                            // function(response, windowTitle,
                            //        windowButtonText, windowHeight, localisedMessage,this.baseKeyForStatusBasedMessages , this.baseKeyForCodeBasedMessages
                            OSSUIUtils.launchErrorWindow(serviceResponse,windowTitle, buttonText,212,null,this.baseKeyForStatusBasedMessages , this.baseKeyForCodeBasedMessages);
                            if(this.dialogInstance){
                                this.dialogInstance.close();
                            }
                        },
                        handleGlobalError : function(error) {
                            // signature looks like this :
                            // function(response, windowTitle,
                            //        windowButtonText, windowHeight, localisedMessage,this.baseKeyForStatusBasedMessages , this.baseKeyForCodeBasedMessages
                            OSSUIUtils.launchErrorWindow(error, null, null, 212,null,this.baseKeyForStatusBasedMessages , this.baseKeyForCodeBasedMessages);
                        },

                        getDisplayValue : function(selectedItemId) {
                            var itemValue = '';

                            var itemsArray = this.config.adminProfileView
                                    .getData().optionsData.items;
                            for ( var k = 0; k < itemsArray.length; k++) {
                                if ((''+selectedItemId) === (''+itemsArray[k].id)) {
                                    itemValue = itemsArray[k].displayValue;
                                    break;
                                }
                            }
                            return itemValue;
                        },
                        _setSelectedProfile : function(eventData){
                            this.config.adminProfileView._setVMData('data.fieldValue',eventData.id);
                            if(eventData.id != this.config.adminProfileView.$el.find('select').find('option:selected').val()){
                                this.config.adminProfileView.$el.find('select').val(eventData.id) ;
                            }
                        },
                        
                        _profilesFetchSuccesful : function(){
                            //The select view has issues in IE if this inline attribute is present
                            //hence removeing it at the end
                            this.$('select').removeAttr('style');
                        },
                        
                        getIdValue : function(selectedValue) {
                            var itemId = '';

                            var itemsArray = this.config.adminProfileView
                                    .getData().optionsData.items;
                            for ( var k = 0; k < itemsArray.length; k++) {
                                if (selectedValue === itemsArray[k].displayValue) {
                                    itemId = ''+itemsArray[k].id;
                                    break;
                                }
                            }
                            return itemId;
                        }
                        
                        
                    });
            return ProfileAdminView;
        });

/**
 * $Id: //depot/Applications/OSSUI/v10.1.0.0/components/ossui-client-zip/src/main/webapp/lib/amdocs/ossui/components/profile/view/ProfileAdminViewDialog.js#1 $
 * $DateTime: 2017/06/08 19:26:36 $
 * $Revision: #1 $
 * $Change: 1837971 $
 *
 * COPYRIGHT NOTICE:
 * Copyright (c) 2013 Amdocs.
 * The contents and intellectual property contained herein,
 * remain the property of Amdocs.
 *
 * */
define('ossui/widget/ProfileAdminViewDialog',[
	'jquery',
	'underscore',
	'lightsaber' ,
	'ossui/widget/ProfileAdminView',
	'ossui/widget/ModalDialogCallback',
	'ossui/utils/OSSUIResourceBundle'
], function($, _, Lightsaber, ProfileAdminView, ModalDialogCallback, OSSUIResourceBundle) {

	var ProfileAdminViewDialog = Lightsaber.PopupView.extend({
		config : {
			position : 'center',
			resizable : false,
			show: 'fade',
			hide: 'fade',
			modal: true,
			title: 'Save Profile',
			width : 435,
			height : 270,
			autoShow : true,
			autoRender:false,
			dialogClass : 'ossui-lightbox ossui-profiles ossui-admin-profile',
			buttons : [{
				text : 'Cancel',
				parentViewModel : this.viewModel,
				click : function(event) {
					ModalDialogCallback.trigger('CancelProfileClicked', event.timeStamp);
					//$( this ).dialog( "close" );
				}
			},
			{
				text : 'Save',
				parentViewModel : this.viewModel,
				click : function(event) {
					$($(this).parent().find('.ui-button')[1]).attr('disabled',true);
					ModalDialogCallback.trigger('SaveProfileClicked', event.timeStamp);
					//$( this ).dialog( "close" );
				}
			}],
			createContent : function (self) {
				self.contentView = new Lightsaber.Core.View({
					config: {
						template : '<div id="ossui-profileAdminView" class="ossui-profileAdminView"></div>'
					},
					viewModel : new Lightsaber.Core.ViewModel()
				});
				self.profileView = new ProfileAdminView({
					viewModel : self.viewModel,
					el : self.contentView.$el,

					config: {
						useCaseModelURL :'services/rest/profiles',
						profileViewTemplate: '' ,
						selectProfileInputTemplate: '',
						// pass in your own labels - if needed.
						labelDropdown: self.getConfig('labelDropdown'),
						labelInputText: self.getConfig('labelInputText')

					}

				});

				return self.contentView.$el;
			}
		},

		initialize: function(options) {
			_.bindAll(this,'saveClicked', 'cancelClicked');
			ModalDialogCallback.on('SaveProfileClicked',this.saveClicked);
			ModalDialogCallback.on('CancelProfileClicked',this.cancelClicked);
			this.config.counterOk = 0 ;
			this.config.counterSave = 0 ;
			this.config.callingModule = this.options.parent;
			if(OSSUIResourceBundle.prototype.getLabel('ossui.labels.profiles.button.savetoglobal')) {
				this.config.buttons[1].text = OSSUIResourceBundle.prototype.getLabel('ossui.labels.profiles.button.savetoglobal');
			}
			if(OSSUIResourceBundle.prototype.getLabel('ossui.labels.button.cancelString')) {
				this.config.buttons[0].text = OSSUIResourceBundle.prototype.getLabel('ossui.labels.button.cancelString');
			}
			if(OSSUIResourceBundle.prototype.getLabel('ossui.labels.profiles.button.saveprofile')) {
				this.setConfig('title', OSSUIResourceBundle.prototype.getLabel('ossui.labels.profiles.button.saveprofile'));
			}
			this._super(options);
		},

		saveClicked :function() {
			/*this.config.counterOk = this.config.counterOk + 1 ;
				if (this.config.counterOk <= 1)
				{*/
			this.profileView.saveData(this);
			//}
		},

		cancelClicked : function(){
			this.profileView.cancelData(this);
		}
	});

	return ProfileAdminViewDialog;
});
define('text!lib/amdocs/ossui/components/profile/view/template/ProfileView.html',[],function () { return '<div data-uxf-point=\'profileListView\' ></div>\n';});

define('text!lib/amdocs/ossui/components/profile/view/template/SelectProfileInputTemplate.html',[],function () { return '<span class="uxf-selectinput"><div class="mlabel" style="float:left; margin-left:30px; margin-right:0%;"></span><label for="<%=id%>"><%=display%></label></div><select id="<%=id%>"  name="<%=name%>" data-uxf-point="myElement" style="float:right; margin-right:17%"></select> </span>';});

/**
 * $Id: //depot/Applications/OSSUI/v10.1.0.0/components/ossui-client-zip/src/main/webapp/lib/amdocs/ossui/components/profile/view/ProfileView.js#1 $
 * $DateTime: 2017/06/08 19:26:36 $
 * $Revision: #1 $
 * $Change: 1837971 $
 *
 * COPYRIGHT NOTICE:
 * Copyright (c) 2013 Amdocs.
 * The contents and intellectual property contained herein,
 * remain the property of Amdocs.
 *
 * */
define(
    'ossui/widget/ProfileView',
    [       'underscore',
        'jquery',
        'lightsaber',
        'backbone',
        'ossui/widget/ProfileCollection',
        'ossui/widget/ProfileModel',
        'ossui/widget/ModalDialogView',
        'ossui/utils/OSSUIResourceBundle',
        'text!lib/amdocs/ossui/components/profile/view/template/ProfileView.html',
        'text!lib/amdocs/ossui/components/profile/view/template/SelectProfileInputTemplate.html',
        'text!lib/amdocs/ossui/components/buttons/view/templates/OSSUIDefaultButtonTemplate.html',
        'ossui/utils/OSSUIUtils',
        'fixture.object', 'fixture.string', 'fixture.dom' ],
    /*jshint maxparams: 12 */
    function(_, $, Lightsaber, Backbone, ProfileCollection, ProfileModel, OSSUIModalDialog, OSSUIResourceBundle,
             DefaultProfileListViewTemplate, DefaultSelectProfileInputTemplate,
             ossuidefaultbuttontempl,OSSUIUtils) {

        var ProfileShellCollection = ProfileCollection
            .extend({

                model : ProfileModel
            });

        var ProfileView = Lightsaber.Core.View
            .extend({
                template : '',
                config : {
                    savedCollection : new ProfileShellCollection({parentObject : this})
                },
                initialize : function() {
                    _.bindAll(this, 'saveData', 'resetData', 'handleRESTSyncSuccess', 'handleRESTSyncError',
                        '_setSelectedProfile','handleResetProfileSuccess', '_profilesFetchSuccesful');
                    // url used by the [ProfileCollection]
                    this.profileModelURL = this.getConfig('useCaseModelURL') ;

                    // template used by this JS file [profiles list view]
                    this.template = this.getConfig('profileViewTemplate') || DefaultProfileListViewTemplate;
                    this.config.selectProfileInputTemplate = this.getConfig('selectProfileInputTemplate') || DefaultSelectProfileInputTemplate;

                    this.config.labelDropdown = this.getConfig('labelDropdown') ||
                        OSSUIResourceBundle.prototype.getMessage('ossui.labels.profiles.default.labelDropdown');

                    this.showSaveAlert = this.getConfig('showSaveAlert');

                    // lookups for error messages will start off from areas designated as "baseKeyFor.."
                    this.baseKeyForStatusBasedMessages =  this.getConfig('baseKeyForStatusBasedMessages') || "ossui.errorMessages";
                    this.baseKeyForCodeBasedMessages =  this.getConfig('baseKeyForCodeBasedMessages') || "ossui.errorMessages.errorCode";

                },

                _postRender : function() {
                    this.cleanSavedCollections();
                    this.createProfileViews();

                },
                cleanSavedCollections: function() {
                    this.config.savedCollection.reset();
                },
                /**
                 * gets the saved Collection
                 */
                getSavedCollection : function() {
                    return this.config.savedCollection;
                },

                /**
                 * gets the original  Collection
                 */
                getOriginalCollection : function() {
                    return this.config.originalCollection;
                },

                /**
                 * create  Views
                 */
                createProfileViews : function() {
                    this.createSelectProfileView();
                },

                /**
                 * create save & clear buttons
                 */
                profileModelURL : '',

                /**
                 * create the basic and additional item list view to
                 * show attribute information.
                 */
                createSelectProfileView : function() {


                    // ~~~~~~~~~~~~~~~~~~~
                    // preparatory steps for the REST Data source load
                    var ProfileRESTDataSource = new Lightsaber.Core.LSRESTDataSource({
                        defaults:{
                            contentType: 'application/json',
                            url:this.profileModelURL
                        },
                        update: {
                            method: 'PUT'
                        },
                        read: {
                            method: 'GET'
                        },
                        create: {
                            method: 'POST'
                        }
                    });

                    this.config.savedCollection.setDataSource(ProfileRESTDataSource);

                    // create model for basic attribute list
                    var profileCollection = new ProfileCollection({
                        //url : this.profileModelURL
                        parentObject : this
                    });

                    var profileModel  = new ProfileModel();
                    profileModel.set({
                        selectprofile : profileCollection
                    });
                    var selectProfileVM = new Lightsaber.Core.ViewModel({
                        data : {
                            label : this.config.labelDropdown,
                            fieldValue : 'models.myModel.id'
                        },
                        models : {
                            // the options here is mandatory for select view, else UXF
                            // throws
                            // exception at runtime
                            // the collection here is also the data displayed in
                            // the view
                            options : profileCollection,
                            myModel : profileModel
                        },
                        dataBindings : [ {
                            // significance of below attribute for select box
                            // to be clarified with UXF experts
                            'fieldValue' : 'models.myModel.id',
                            options : {
                                setOnBind : true,
                                twoWay : true
                            }
                        } ],
                        config : {
                            optionsModelName : "options",
                            optionsValueFieldName : "id",
                            optionsDisplayFieldName : "displayValue"
                        }
                    });

                    var StylizedSelectView = Lightsaber.SelectView.extend({

                        initialize : function(options) {

                            this._super(options);

                            this.viewModel.on('change:fieldValue', function(evt) {this._toggleStyle('popupclass'); },this);
                        },
                        /**
                         * some css changes which are getting set for the select element
                         */
                        enhanceMarkup : function(){
                            /*this.$('select').css('margin', '0px');
                             this.$('select').css('min-width', '120px');*/
                        },
                        /*
                         * Helper function that toggles the style of the selected option
                         */
                        _toggleStyle : function(elementName) {

                            $('#' + elementName + ' select ').change(function () {
                                $(this).find('option').css('background-color', 'transparent');
                                $(this).find('option').css('color', 'black');
                                $(this).find('option:selected').css('background-color', '#fe7550');  // background in reddish-orange
                                $(this).find('option:selected').css('color', 'white');  // text in white

                            }).trigger('change');

                        }

                    });

                    var selectProfileView = new  StylizedSelectView ({
                        viewModel : selectProfileVM,
                        template: this.config.selectProfileInputTemplate,
                        id : 'selectView',
                        config : {
                            el : this.$("[data-uxf-point='profileListView']"),
                            template: this.config.selectProfileInputTemplate
                        },
                        attributes : {
                            'data-theme' : 'a'
                        }
                    });

                    this.config.profileCollection = profileCollection;

                    // storing for later access
                    this.config.selectProfileView = selectProfileView;
                    this.config.selectProfileVM = selectProfileVM;
                    profileCollection.setDataSource(ProfileRESTDataSource);
                    profileCollection.fetch();
                    profileCollection.on('SetSelectedProfile', this._setSelectedProfile);
                    profileCollection.on('ProfilesFetchSuccess', this._profilesFetchSuccesful);

                    return selectProfileView;
                },

                resetData : function(dialogInstance) {
                    if (!this.dialogInstance) {
                        this.dialogInstance = dialogInstance;
                    }
                    try {
                        this.config.savedCollection.reset();
                        var selectedProfileId = this.config.selectProfileView
                            .getData().fieldValue;
                        var selectedProfileValue = this
                            .getDisplayValue(selectedProfileId);
                        // if value not found , then execute the reverse lookup
                        if ($.isEmptyObject(selectedProfileValue) === true) {
                            selectedProfileValue = selectedProfileId;
                            selectedProfileId = this
                                .getIdValue(selectedProfileValue);

                        }
                        //use jquery to get selected data from the html element
                        if (!selectedProfileId) {
                            selectedProfileId = this.config.selectProfileView.$el.find('option:selected').val();
                        }
                        var restDS = this.config.savedCollection
                            .getDataSource();
                        // below if condition will not allow duplicate
                        // addition of index
                        if (!restDS.defaults.url.match(':index')) {
                            restDS.defaults.url += '/:index';
                        }
                        restDS.setQueryParams({
                            resetProfile : true
                        });
                        this.profileIdForReset = selectedProfileId;
                        // method 'update' --> corresponds to PUT
                        restDS
                            .sync(
                            'update',
                            this.config.savedCollection,
                            {
                                contentType : 'application/json',
                                params : {
                                    index : selectedProfileId
                                },
                                success : this.handleResetProfileSuccess,
                                error : this.handleRESTSyncError
                            });
                    }// end try
                    catch (error) {
                        this.handleGlobalError(error);
                    }
                },
                /*jshint maxcomplexity: 7 */
                saveData : function(dialogInstance) {
                    if (!this.dialogInstance) {
                        this.dialogInstance = dialogInstance;
                    }
                    try {
                        this.config.savedCollection.reset();
                        var selectedProfileId = this.config.selectProfileView
                            .getData().fieldValue;
                        var selectedProfileValue = this
                            .getDisplayValue(selectedProfileId);

                        // if value not found , then execute the reverse lookup
                        if ($.isEmptyObject(selectedProfileValue) === true) {
                            selectedProfileValue = selectedProfileId;
                            selectedProfileId = this
                                .getIdValue(selectedProfileValue);

                        }
                        //use jquery to get selected data from the html element
                        if (!selectedProfileId) {
                            selectedProfileId = this.config.selectProfileView.$el.find('option:selected').val();
                        }
                        // if everything else failed , do select the
                        // first entry in the drop down list
                        if (!selectedProfileId) {
                            selectedProfileValue = this.config.selectProfileView
                                .getData().optionsData.items[0].displayValue;
                            selectedProfileId = this.config.selectProfileView
                                .getData().optionsData.items[0].id;
                        }

                        var restDS = this.config.savedCollection
                            .getDataSource();
                        if (!restDS.defaults.url.match(':index')) {
                            restDS.defaults.url += '/:index';
                        }

                        restDS.setQueryParams({});
                        restDS
                            .sync(
                            'update',
                            this.config.savedCollection,
                            {
                                contentType : 'application/json',
                                params : {
                                    index : selectedProfileId
                                },
                                success : this.handleRESTSyncSuccess,
                                error : this.handleRESTSyncError
                            });
                    }// end try
                    catch (error) {
                        this.handleGlobalError(error);
                    }

                },
                handleRESTSyncSuccess : function() {
                    //nothing more to be done so close dialog
                    if(this.dialogInstance){
                        this.dialogInstance.close();
                    }
                },
                handleRESTSyncError : function(serviceResponse){
                    if (this.profileIdForReset){
                        this.profileIdForReset = null;
                    }
                    var windowTitle = OSSUIResourceBundle.prototype.getMessage('ossui.labels.heading.errorString');
                    var buttonText =  OSSUIResourceBundle.prototype.getMessage('ossui.labels.button.okString');
                    //  var localisedMessage = OSSUIResourceBundle.prototype.getMessage('ossui.errorMessages.genericBEError');
                    OSSUIUtils.launchErrorWindow(serviceResponse,windowTitle, buttonText,212,null,this.baseKeyForStatusBasedMessages , this.baseKeyForCodeBasedMessages);
                    if(this.dialogInstance){
                        this.dialogInstance.close();
                    }
                },
                handleGlobalError : function(error) {
                    // signature looks like this :
                    // function(response, windowTitle,
                    //        windowButtonText, windowHeight, localisedMessage,baseKeyForStatusBasedMessages , baseKeyForCodeBasedMessages) {
                    OSSUIUtils.launchErrorWindow(error, null, null, 212,null,this.baseKeyForStatusBasedMessages , this.baseKeyForCodeBasedMessages);
                },
                handleResetProfileSuccess : function(){
                    if(this.dialogInstance){
                        this.dialogInstance.close();
                    }
                    if(this.profileIdForReset){
                        var jQVarForOptionSelect = 'option[value=' + this.profileIdForReset + ']';
                        var optionText = this.config.selectProfileView.$el.find(jQVarForOptionSelect).text();
                        var optionTextTrunc = optionText.substr(0,optionText.indexOf(' *'));
                        this.config.selectProfileView.$el.find(jQVarForOptionSelect).text(optionTextTrunc);
                        this.profileIdForReset = null;
                    }
                },

                _setSelectedProfile : function(eventData){
                    //this.config.selectProfileView._setValue(eventData.id);
                    /*The below line does not work for IE 9 hence setting the data manually in
                     * the select box
                     * */
                    this.config.selectProfileView._setVMData('data.fieldValue',eventData.id);
                    if(eventData.id != this.config.selectProfileView.$el.find('select').find('option:selected').val()){
                        this.config.selectProfileView.$el.find('select').val(eventData.id) ;
                    }
                },

                _profilesFetchSuccesful : function(){
                    //The select view has issues in IE if this inline
                    //attribute is present
                    this.$('select').removeAttr('style');
                },

                getDisplayValue : function(selectedItemId) {
                    var itemValue = '';

                    var itemsArray = this.config.selectProfileView
                        .getData().optionsData.items;
                    for ( var k = 0; k < itemsArray.length; k++) {
                        if ((''+selectedItemId) === (''+itemsArray[k].id)) {
                            itemValue = itemsArray[k].displayValue;
                            break;
                        }
                    }
                    return itemValue;
                },
                getIdValue : function(selectedValue) {
                    var itemId = '';

                    var itemsArray = this.config.selectProfileView
                        .getData().optionsData.items;
                    for ( var k = 0; k < itemsArray.length; k++) {
                        if (selectedValue === itemsArray[k].displayValue) {
                            itemId = ''+itemsArray[k].id;
                            break;
                        }
                    }
                    return itemId;
                }

            });
        return ProfileView;
    });

/**
 * $Id: //depot/Applications/OSSUI/v10.1.0.0/components/ossui-client-zip/src/main/webapp/lib/amdocs/ossui/components/profile/view/ProfileViewDialog.js#1 $
 * $DateTime: 2017/06/08 19:26:36 $
 * $Revision: #1 $
 * $Change: 1837971 $
 *
 * COPYRIGHT NOTICE:
 * Copyright (c) 2013 Amdocs.
 * The contents and intellectual property contained herein,
 * remain the property of Amdocs.
 *
 * */
define('ossui/widget/ProfileViewDialog',
    [ 'jquery',
        'underscore',
        'lightsaber' ,
        'ossui/widget/ProfileView',
        'ossui/widget/ModalDialogCallback',
        'ossui/utils/OSSUIResourceBundle',
        'ossui/widget/ProfileAdminViewDialog'],

    function($, _, Lightsaber, ProfileView, ModalDialogCallback, OSSUIResourceBundle, ProfileAdminViewDialog) {

        var ProfileViewDialog = Lightsaber.PopupView.extend({
            config : {
                position : 'center',
                resizable : false,
                show: 'fade',
                hide: 'fade',
                modal: true,
                title: 'Select Display Profile',
                width : 435,
                height : 220,
                autoShow : true,
                autoRender:false,
                dialogClass : 'ossui-lightbox ossui-profiles ossui-nonadmin-profile',
                buttons : [
                    {
                        text : 'Save to Global',
                        parentViewModel : this.viewModel,
                        click : function(event) {
                            ModalDialogCallback.trigger('SaveGlobalClicked', event.timeStamp);
                            //$( this ).dialog( "close" );
                        }
                    },

                    {
                        text : 'Reset to Default',
                        parentViewModel : this.viewModel,
                        click : function(event) {
                            ModalDialogCallback.trigger('ResetClicked', event.timeStamp);
                            //$( this ).dialog( "close" );
                        }
                    },
                    {
                        text : 'Select',
                        parentViewModel : this.viewModel,
                        click : function(event) {
                            ModalDialogCallback.trigger('SelectClicked', event.timeStamp);
                            //$( this ).dialog( "close" );
                        }
                    }
                ],
                createContent : function (self){
                    self.contentView = new Lightsaber.Core.View({
                        config: {
                            template : '<div id="ossui-profileView" class="ossui-profileView"></div>'
                        },
                        viewModel : new Lightsaber.Core.ViewModel()
                    });
                    self.profileView = new ProfileView({
                        viewModel : self.viewModel,
                        el : self.contentView.$el,

                        config: {
                            useCaseModelURL :'services/rest/profiles',
                            profileViewTemplate: '' ,
                            selectProfileInputTemplate: '' ,
                            // pass in your own labels - if needed.
                            labelDropdown: self.getConfig('labelDropdown'),
                            labelInputText: self.getConfig('labelInputText')
                        }

                    });
                    //this.viewData = self.modalDialogView;
                    return self.contentView.$el;
                }
            },
            render : function(){
                this._super();
                var self = this;
                //when the dialog is rendered on screen check to see if the width needs to be increased for localisation
                 setTimeout(function() {
                     var totalButtonTextLength = self.config.buttons[0].text.length + self.config.buttons[1].text.length + self.config.buttons[2].text.length;
                     //if more than the english button text length
                     if (totalButtonTextLength > 36){
                         //multiply up the difference to increase the width of the window
                         var difference = totalButtonTextLength - 36;
                         var extraWidth = difference * 7;
                         var newWidthNum = 435+extraWidth;
                         self.$el.parent().css('width', newWidthNum+'px');
                     }
                 }, 0);    
            },
            initialize: function(options) {
                _.bindAll(this,'selectClicked', 'resetClicked' ,'saveGlobalClicked');
                ModalDialogCallback.on('SelectClicked',this.selectClicked);
                ModalDialogCallback.on('ResetClicked',this.resetClicked);
                ModalDialogCallback.on('SaveGlobalClicked',this.saveGlobalClicked);
                this.config.counterOk = 0 ;
                this.config.counterSave = 0 ;
                this.config.callingModule = this.options.parent;
                if(OSSUIResourceBundle.prototype.getLabel('ossui.labels.profiles.button.savetoglobal')) {
                    this.config.buttons[0].text = OSSUIResourceBundle.prototype.getLabel('ossui.labels.profiles.button.savetoglobal');
                }
                if(OSSUIResourceBundle.prototype.getLabel('ossui.labels.profiles.button.cancelString')) {
                    this.config.buttons[1].text = OSSUIResourceBundle.prototype.getLabel('ossui.labels.profiles.button.cancelString');
                }
                if(OSSUIResourceBundle.prototype.getLabel('ossui.labels.profiles.button.selectString')) {
                    this.config.buttons[2].text = OSSUIResourceBundle.prototype.getLabel('ossui.labels.profiles.button.selectString');
                }
                this.setConfig('buttons', this.config.buttons);
                if(OSSUIResourceBundle.prototype.getLabel('ossui.labels.profiles.display.title')) {
                    this.setConfig('title', OSSUIResourceBundle.prototype.getLabel('ossui.labels.profiles.display.title'));
                }
                this.adminView = new ProfileAdminViewDialog({
                    viewModel : new Lightsaber.Core.ViewModel(),
                    config : {
                        // pass in your own labels - if needed.
                        labelDropdown : this
                            .getConfig('labelDropdown'),
                        labelInputText : this
                            .getConfig('labelInputText')
                    }
                });
                this._super(options);
            },

            selectClicked :function(){

                /*this.config.counterOk = this.config.counterOk + 1 ;
                 if (this.config.counterOk <= 1)
                 {*/
                this.profileView.saveData(this);
                /*}*/

            },

            resetClicked : function(){
                this.profileView.resetData(this);
            },

            saveGlobalClicked : function(){
                /*this.config.counterSave = this.config.counterSave + 1 ;
                 if (this.config.counterSave <= 1)
                 {*/
                this.close();
                this.adminView.render();
                /*}*/
            }
        });

        return ProfileViewDialog;
    });
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

/** 
@memberOf OSSUI.widgets
@name TooltipView
@class TooltipView
@type View
@description
This class provides a Lightsaber view wrapper on top of jquery-ui-tooltip.
refer http://api.jqueryui.com/tooltip/ for api docs and all available options

@example 1 --> create a default TooltipView
    var tooltip1 = new Ossui.TooltipView({
                 config : {
                 //where iconView below is an Ossui/Lightsaber widget instance
                     element : iconView,
                    },
                    viewModel : new Lightsaber.Core.ViewModel(),
             });
    
@example 2 --> Create a TooltipView with some extra config parameters
var tooltip2 = new Ossui.TooltipView({
                 config : {
                     //element can be a jquery result also
                     element : $('[ossui-tooltip-img]'),
                     tooltipConfig : {
                         hide: {
                             effect: "slidedown",
                             delay: 250
                           },
                         items: "[ossui-tooltip-img],[title]",
                         content:function(){
                               var element = $( this );
                               if ( element.is( "[ossui-tooltip-img]" ) ) {
                                   return "<img class='map' alt='antarctica'" +
                                   " src='../../../../../res/images/antarctica.jpg'" + "'>";
                               }
                               if ( element.is( "[title]" ) ) {
                                   return element.attr( "title" );
                                   }                                   
                               
                           }
                    }},
                    viewModel : new Lightsaber.Core.ViewModel(),
             });
@example 3 --> to bind a jquery-ui-tootip event to callback method
   tooltip2.bindEvent("tooltipopen",function(event, ui){
                 console.log("opened");
             });
            
@example 4 --> to call a jquery-ui-tootip method
get all set tooltip options
 var result = tooltip2.callMethod("option");

set a tooltip option property
 var result = tooltip2.callMethod("option", "disabled", true );

 */

define('ossui/widget/TooltipView', 
        [ 'underscore', 
          'jquery',
          'lightsaber'],
          function(_, $, Lightsaber) {

            var TooltipView = Lightsaber.Core.View
                    .extend({

                        selector : null,
                        defaultTooltipConfig : {
                            tooltipClass : 'ossui-tooltip',
                            position : {
                                my : "center bottom-20",
                                at : "center top",
                                using : function(position, feedback) {
                                    $(this).css(position);
                                    $("<div>").addClass("ossui-tooltip-arrow")
                                            .addClass(feedback.vertical)
                                            .addClass(feedback.horizontal)
                                            .appendTo(this);
                                }
                            }
                        },

                        initialize : function(config) {
                            var element = this.getConfig('element');
                            var toolTipConfig = this.getConfig('tooltipConfig');
                            if (element instanceof Lightsaber.Core.View) {
                                this.selector = element.$root;
                            } else {
                                // jquery object has been passed
                                this.selector = element;
                            }
                            this._initializeTooltip(toolTipConfig);
                        },

                        _initializeTooltip : function(toolTipConfig) {
                            // if tootipconfig does not contain the default
                            // attributes add them.
                            if (toolTipConfig) {
                                var positionAttrConsolidation = false;
                                if (toolTipConfig && toolTipConfig.position) {
                                    positionAttrConsolidation = true;
                                }
                                this._consolidateUserAndDefaultData(
                                        toolTipConfig,
                                        this.defaultTooltipConfig);

                                // since position is a composite attribute
                                // and user data is present there is a need
                                // to iterate though all the elements of the
                                // position attribute and set default if not set
                                if (positionAttrConsolidation) {
                                    this._consolidateUserAndDefaultData(
                                            toolTipConfig.position,
                                            this.defaultTooltipConfig.position);
                                }
                            } else {
                                toolTipConfig = this.defaultTooltipConfig;
                            }
                            this.selector.tooltip(toolTipConfig);

                        },

                        _consolidateUserAndDefaultData : function(userData,
                                defaultData) {
                            for ( var attr in defaultData) {
                                if (!userData[attr]) {
                                    userData[attr] = defaultData[attr];
                                }
                            }
                        },
                        
                        /**
                         * This method can be used to call jquery-ui-tooltip methods like
                         * open, close, option etc
                         * @returns: if the jquery tooltip method returns some value the same is
                         *            returned
                         */
                        callMethod : function(argument1,argument2,argument3) {
                            return this.selector.tooltip(argument1,argument2,argument3);
                        },
                        
                        /**
                         * This method can be used to bind jquery-ui-tootip events
                         * to callback methods
                         * @param event : jquery-ui-tootip event 
                         * @param bindmethod : call back method to which the event
                         *                     should be bound to
                         */
                        bindEvent : function(event, bindmethod) {
                            this.selector.on(event, bindmethod);
                        }

                    });
            return TooltipView;

        });
/**
* $Id: //depot/Applications/OSSUI/v10.1.0.0/components/ossui-client-zip/src/main/webapp/lib/amdocs/ossui/components/utils/OssuiRestModel.js#1 $ 
* $DateTime: 2017/06/08 19:26:36 $ 
* $Revision: #1 $ 
* $Change: 1837971 $
*
* COPYRIGHT NOTICE:
* Copyright (c) 2013 Amdocs.
* The contents and intellectual property contained herein,
* remain the property of Amdocs.
* 
* */

define('ossui/utils/OSSUIRestModel',[
    'underscore',
    'lightsaber' 
], function(_, Lightsaber) {
    
    /**
     * @class: can be used by any class to make a rest call
     * a success and error response is triggered with the 
     * event name configured by the calling class. 
     */
    var ossuiRestModel = Lightsaber.Core.RESTModel.extend({

        options : {
            error : this.errorHandler,
            success : this.successHandler
        },
        //default 
        url: 'services/rest/ossui/config',
        
        modelInstanceData: '',
        
        initialize : function(options) {
            _.bindAll(this);
            Lightsaber.Core.Model.prototype.initialize.call(this);
            this.url = options.messageUrl || this.url;
            this.responseEvent = options.responseEvent || 'ConfigRestResponse';
            this.modelInstanceData = options.modelInstanceData || this.modelInstanceData;
        },

        successHandler : function(data, response) {
            this.set(response);
            this.trigger(this.responseEvent + ':success', response,this);
        },
        
        errorHandler : function(data, response) {
            // Error fetching the navigation module registry object. Using the default registry config.
            this.set(response);
            this.trigger(this.responseEvent + ':error', response, this);
        },
        
        fetch : function() {
            Lightsaber.Core.Model.prototype.fetch.call(this, {
                    success : this.successHandler,
                    error : this.errorHandler
                });
        }
    });
    return ossuiRestModel;
    
});
/**
* $Id: //depot/Applications/OSSUI/v10.1.0.0/components/ossui-client-zip/src/main/webapp/lib/amdocs/ossui/components/utils/ossui-config-reader.js#1 $ 
* $DateTime: 2017/06/08 19:26:36 $ 
* $Revision: #1 $ 
* $Change: 1837971 $
*
* COPYRIGHT NOTICE:
* Copyright (c) 2013 Amdocs.
* The contents and intellectual property contained herein,
* remain the property of Amdocs.
* 
* */

define('ossui/utils/OSSUIConfigReader', [ 'underscore', 'lightsaber',
        'backbone', 'ossui/utils/OSSUIRestModel',
        'ossui/utils/OSSUIConfigurationData'], function(_, Lightsaber,
        Backbone, OSSUIRestModel, OSSUIConfigurationData) {

    var OSSUIConfigReader = function(options) {
       
        this.errorResponses = [];
        
        this.applications = [];
        
        this.getConfigDataViaREST = function(configUrlList) {
            //_.bindAll(this,'responseSuccessHandler');
            for ( var configUrl in configUrlList) {
                        if (configUrlList[configUrl]) {
                            var startIndex = configUrlList[configUrl]
                                    .lastIndexOf('/');
                            var application = configUrlList[configUrl]
                                    .substring(configUrlList[configUrl]
                                            .lastIndexOf('/') + 1,
                                            configUrlList[configUrl].length);
                            this.applications.push(application);
                            var restModel = new Lightsaber.Core.RESTModel();
                            var rESTDS = new Lightsaber.Core.LSRESTDataSource(
                                    {
                                        defaults : {
                                            contentType : 'application/json',
                                            url : configUrlList[configUrl]
                                        },
                                        update : {
                                            method : 'PUT'
                                        },
                                        read : {
                                            method : 'GET'
                                        },
                                        create : {
                                            method : 'POST'
                                        }
                                    });
                            restModel.on('ossuiConfigurationLoad:success',
                                    this.responseSuccessHandler);
                            restModel.on('ossuiConfigurationLoad:error',
                                    this.responseErrorHandler);
                            restModel.setDataSource(rESTDS);
                            rESTDS.sync('read', restModel, {
                                contentType : 'application/json',
                                success : this.responseSuccessHandler,
                                error : this.responseErrorHandler
                            });
                            //restModel.fetch();
                        }
            }
        };

        this.responseSuccessHandler = function(eventData, restModelInstance){           
            var parsedMessages = {};
            for(var message in eventData.configData){
                if(message) {
                parsedMessages[message] = eventData.configData[message];
                }
            }
            OSSUIConfigurationData.prototype.configMap[restModelInstance.modelInstanceData] = parsedMessages;
            this.sendConfigRetrievedEvent(restModelInstance.modelInstanceData);
        };   
        
        this.responseErrorHandler = function(response, restModelInstance){
            this.errorResponses.push(response);
            this.sendConfigRetrievedEvent(restModelInstance.modelInstanceData);
        };
        /**
         * The below method acts like a semaphore and prevents both the error and success
         * handlers from simultaneously popping data out of the array causing threading issues
         * Javascript being single threaded in a browser the below method cannot be called
         * simultaneously by both the handlers
         */
        this.sendConfigRetrievedEvent = function(appName){
            this.applications.pop(appName);
            if(this.applications.length === 0) {
                this.trigger('ossuiConfigurationLoaded' , this.errorResponses);
            }
        };

        _.bindAll(this, 'responseSuccessHandler', 'responseErrorHandler');

        if (options.configUrlList) {
            this.getConfigDataViaREST(options.configUrlList);
        }
    };
    _.extend(OSSUIConfigReader.prototype, Backbone.Events, {});

    return OSSUIConfigReader;

});
/**
* $Id: //depot/Applications/OSSUI/v10.1.0.0/components/ossui-client-zip/src/main/webapp/lib/amdocs/ossui/components/utils/ossui-locale-reader.js#1 $ 
* $DateTime: 2017/06/08 19:26:36 $ 
* $Revision: #1 $ 
* $Change: 1837971 $
*
* COPYRIGHT NOTICE:
* Copyright (c) 2013 Amdocs.
* The contents and intellectual property contained herein,
* remain the property of Amdocs.
* 
* */

define('ossui/utils/OSSUILocaleReader',[
    'underscore',
    'lightsaber',
    'backbone',
    'ossui/utils/OSSUIRestModel',
    'ossui/utils/OSSUIResourceBundle','ossui/utils/OSSUIUtils'
], function(_, Lightsaber, Backbone,  OSSUIRestModel, OSSUIResourceBundle,OSSUIUtils) {
    
    var OSSUILocaleReader = function(options){
        /**
         * options.messagesUrlList -- specify the list of urls to fetch asynchronously
         * options.cacheBundleValues -- if value is boolean:true then the bundle keys are cached in session storage
         * options.callbackAfterRestoringCachedValues -- callback method which will be called after the resources are restored
         * from session storage. If atleast one new REST call is made then the "resourceBundleCreated" 
        **/
        this.errorResponses = [];
        
        this.bundleNames = [];
        
        this.handleGlobalError = function(error) {
            // method signature looks like this :
            // function(response, windowTitle,
            //        windowButtonText, windowHeight, localisedMessage,baseKeyForStatusBasedErrorMessages baseKeyForCodeBasedErrorMessages)
            OSSUIUtils.launchErrorWindow(error, null, null, 212,null,"ossui.errorMessages","ann.search.ui.error.popup.servicefailure");
        };
       
       this.getResourceContent = function(messagesUrlList){
           if(this.cacheBundleValues){
                this.checkBundleValuesCacheElseFetch(messagesUrlList);
           }else{
                this.getResourceContentFromREST(messagesUrlList);
           }
       };
        
       this.checkBundleValuesCacheElseFetch = function(urlList){
            var urlListForFetch = [];
            for ( var id in urlList) {
                var url = urlList[id];
                if(sessionStorage.getItem(url) !== null){
                        this.setBundlesValuesInOSSUIResourceBundle(JSON.parse(sessionStorage.getItem(url)));            
                }else{
                     urlListForFetch.push(url);                   
                }
            }
           if(urlListForFetch.length > 0){
                this.getResourceContentFromREST(urlListForFetch);
          }else{
                //call registered callback 
                if(_.isFunction(options.callbackAfterRestoringCachedValues)){
                    options.callbackAfterRestoringCachedValues();
                }
          }
       };
       this.getResourceContentFromREST = function(messagesUrlList){
          
           for ( var msgUrl in messagesUrlList) {
               if(messagesUrlList[msgUrl]){
                   var startIndex = messagesUrlList[msgUrl].lastIndexOf('/');
                   var bundleName = messagesUrlList[msgUrl].substring(messagesUrlList[msgUrl]
                           .lastIndexOf('/') + 1, messagesUrlList[msgUrl].length);
                   this.bundleNames.push(bundleName);
                   
                   var restModel = new Lightsaber.Core.RESTModel({},{url:messagesUrlList[msgUrl], rest: {read: {method:'GET', contentType:'application/json'}}});
                 
                   try {
                     
                        restModel.fetch({success:this.responseSuccessHandler, error:this.responseErrorHandler});
                   }
                   catch (error) {
                       this.handleGlobalError(error);
                   }
                   //restModel.fetch();
                   }
               }            
        };
        
        this.responseSuccessHandler = function(restModelInstance, messages ){
           var restUrlRoot = restModelInstance.urlRoot;
           var bundleName = restUrlRoot.substring(restUrlRoot.lastIndexOf('/') + 1, restUrlRoot.length);
           if(this.cacheBundleValues){
            sessionStorage.setItem(restUrlRoot,JSON.stringify(messages));
           }
           this.setBundlesValuesInOSSUIResourceBundle(messages);
            //OSSUIResourceBundle.prototype.resourceBundle = parsedMessages;
            this.sendResourceBundleCreatedEvent(bundleName);
        };   
        
        this.responseErrorHandler = function(model,response, restModelInstance){
            this.errorResponses.push(response);
            var restUrlRoot = restModelInstance.urlRoot;
            var bundleName = [];
            if(restUrlRoot) {
                bundleName = restUrlRoot.substring(restUrlRoot.lastIndexOf('/') + 1, restUrlRoot.length);
            }
            this.sendResourceBundleCreatedEvent(bundleName);
            // raise a popup error message when response holds an error code like "401" - aka "unauthorized access" 
            // Note - default window params will be calculated automatically (including the message)
            // signature looks like this :
            // function(response, windowTitle,
            //        windowButtonText, windowHeight, localisedMessage,baseKeyForStatusBasedErrorMessages ,baseKeyForCodeBasedErrorMessages
            if(bundleName.length !== 0) {
                OSSUIUtils.launchErrorWindow(response, null, null, 212, null,"ossui.errorMessages","ann.search.ui.error.popup.servicefailure");
            }
        };
        this.setBundlesValuesInOSSUIResourceBundle = function(messages){
             for(var message in messages){
                if(message) {
                    OSSUIResourceBundle.prototype.resourceBundle[message] = messages[message];
                }
            }
        };
        /**
         * The below method acts like a semaphore and prevents both the error and success
         * handlers from simultaneously popping data out of the array causing threading issues
         * Javascript being single threaded in a browser the below method cannot be called
         * simultaneously by both the handlers
         */
        this.sendResourceBundleCreatedEvent = function(bundleName){
            if(bundleName){
                this.bundleNames.splice(this.bundleNames.indexOf(bundleName),1);
            }
            if(this.bundleNames.length === 0) {
                this.trigger('resourceBundleCreated' , this.errorResponses);
            }
        };
        
        _.bindAll(this,'responseSuccessHandler', 'responseErrorHandler', 'sendResourceBundleCreatedEvent');       
    
        if(options.messagesUrlList) {
            this.cacheBundleValues = !_.isUndefined(options.cacheBundleValues) ? options.cacheBundleValues :false;
            this.getResourceContent(options.messagesUrlList);               
        }
    };
  _.extend(OSSUILocaleReader.prototype, Backbone.Events, {});
  
    return OSSUILocaleReader;
    
});

define('ossui/utils/OSSUIBasicResourceBundle',[
    'underscore',
    'backbone',
    'lightsaber',
    'messages',
    'ossui/utils/OSSUIResourceBundle'
],
    function(_, Backbone,Lightsaber, localMessages,OSSUIResourceBundle) {
        /*jshint camelcase:false*/
        var ossui_i18n = function(options){
            this.localeConfigs = {
                en_US : {
                    dateFormat : "mm/dd/yyyy",
                    type : "en_US",
                    currency : {
                        symbol : "$",
                        position : "start"
                    },
                    number : {
                        decimalSeparator : ".",
                        thousandSeparator : ","
                    }

                },
                en_UK : {
                    dateFormat : "dd/mm/yyyy",
                    type : "en_UK",
                    currency : {
                        symbol : "?"
                    },
                    number : {
                        decimalSeparator : ".",
                        thousandSeparator : ","
                    }
                },
                fr_FR : {
                    dateFormat : "dd/mm/yyyy",
                    type : "fr_FR",
                    currency : {
                        symbol : "?",
                        position : "end"
                    },
                    number : {
                        decimalSeparator : ",",
                        thousandSeparator : " "
                    }
                },
                ru_RU : {
                    dateFormat : "dd/mm/yyyy",
                    type : "ru_RU",
                    currency : {
                        symbol : "???",
                        position : "end"
                    },
                    number : {
                        decimalSeparator : ".",
                        thousandSeparator : " "
                    }
                }

            };
            this.getCurrentLocale = function() {
                return this.localeConfigs[this.currLocaleKey];
            };
            /*jshint camelcase:false*/
            this.getResourceContent = function(messagesURL) {

                var ajaxResponseForRemoteMessages = $
                    .ajax({

                        beforeSend : function(x) {
                            if (x && x.overrideMimeType) {
                                x
                                    .overrideMimeType("application/j-son;charset=UTF-8");
                            }
                        },
                        dataType : "json",
                        type : "GET",
                        async : false, // calling AJAX *synchronously*
                        url : messagesURL, // Note : this can be any
                        // file (local or remote).
                        complete : function(ajaxData) {
                            return ajaxData;
                        },
                        success : function(data) {
                            return data;
                        },
                        error : function(ajaxData, textStatus,
                                         errorThrown) {
                            throw new Error('Error when fetching localization data:'
                                + textStatus);
                        }
                    });// ajax call

                var remoteFileContent = $
                    .parseJSON(ajaxResponseForRemoteMessages.responseText);

                // if the file is empty , then use the globally declared
                // "messages" file
                var parsedMessages = ($.isEmptyObject(remoteFileContent) === true) ?
                    localMessages
                    :
                    // the actual strings are underneath a root called "messages"
                    $.parseJSON(ajaxResponseForRemoteMessages.responseText).messages;

                return parsedMessages;
            };



            /* this.currentLocale = function() {
             return this.getCurrentLocale();
             };*/

            /**
             * Get a translated string keyed by 'key'
             */

            if(options){
                 if(options.customdir){
                     this.basedir = options.basedir || 'lib/amdocs/ossui/components/login/nls';
                     this.filename = options.filename || 'ossui-login-messages.json';
                     this.messagesURL = this.basedir +  '/' + this.filename;
                 }
                 else{
                    this.currLocaleKey = options.locale || 'en_UK';
                    this.basedir = options.basedir || 'lib/amdocs/ossui/components/login/nls';
                    this.filename = options.filename || 'ossui-login-messages.json';
                    this.localeConfigs = options.localeConfigs || this.localeConfigs;
    
                    if(this.getCurrentLocale()){
                        this.currentLocaleType =  this.getCurrentLocale().type;
                    } else{
                        this.currentLocaleType =  options.currentLocaleType || this.currLocaleKey;
                    }
                    this.messagesURL = options.messagesURL || this.basedir +  '/' +this.currentLocaleType+ '/' +this.filename;
                 }
            }else{
                this.currLocaleKey = 'en_UK';
                this.basedir = 'lib/amdocs/ossui/components/login/nls';
                this.filename = 'ossui-login-messages.json';
                this.currentLocaleType = 'en_UK';
                this.messagesURL = this.basedir +  '/' +this.currentLocaleType+ '/' +this.filename;
            }
            this.parsedMessages =  this.getResourceContent(this.messagesURL);
            this.resourceBundle = new Lightsaber.Core.ResourceBundle({
                defaultBundle : this.parsedMessages
            }, 'defaultBundle');

            this.populateOssuiResourceBundle = function(){
                for(var i=0;i<Object.keys(this.parsedMessages).length;i++){
                    var messageKey = Object.keys(this.parsedMessages)[i];
                    OSSUIResourceBundle.prototype.resourceBundle[messageKey] = this.parsedMessages[messageKey];
                }
            };
            this.getString = function(key, params) {
                return this.resourceBundle.getString(key, params);
            };

            this.getMessage = function(key, args) {
                return this.getString(key, args);
            };

        };
        return ossui_i18n;
    });
/**
 * Class that adds new validations or overrides some of the original validations extant in the Lightsaber Model.
 * It also adds new "date" related validations; they had been initially present in the ARIM codebase.
 */
define('ossui/validator/ValidatorOSSUI',[ 'underscore', 'lightsaber' ], function(_, Lightsaber) {

    /**
     * Return a bogus object - just to force the runtime loading of the extended Lightsaber Validator.
     * Note- this validator object is not going to be invoked a such.
     */
    var Validator = function() {
    };
    /**
     * Checks if the length of a model's string attribute is greater than a
     * given number.
     * 
     * @param {String}
     *            conf.fieldName The name of a string attribute.
     * @param {Number}
     *            conf.min The min value
     */
    _.extend(Lightsaber.Core.Validator.prototype, {
        minLength : function(conf, attrs, model) {
            var val = this.getFieldValue('fieldName', conf, attrs, model);
            if (_.isUndefined(val) || (Number(val.length) < Number(conf.min))) {
                return this.makeError('minLength', conf.fieldName
                        + "'s length should not be shorter than " + conf.min
                        + ', was >' + val.length + '<', conf.fieldName, val);
            }
        }
    });

    /**
     * Checks if the length of a model's string attribute is less than a given
     * number.
     * 
     * @param {String}
     *            conf.fieldName The name of a string attribute.
     * @param {Number}
     *            conf.max The max value
     */
    _.extend(Lightsaber.Core.Validator.prototype, {
        maxLength : function(conf, attrs, model) {
            var val = this.getFieldValue('fieldName', conf, attrs, model);
            if (_.isUndefined(val) || (Number(val.length) > Number(conf.max))) {
                return this.makeError('maxLength', conf.fieldName
                        + "'s length should not be longer than " + conf.max
                        + ', was >' + val.length + '<', conf.fieldName, val);
            }
        }
    });

    /**
     * Checks if the value of a model's numeric attribute is less than a given
     * number.
     * 
     * @param {String}
     *            conf.fieldName The name of a string attribute.
     * @param {Number}
     *            conf.min The min value
     */
    _.extend(Lightsaber.Core.Validator.prototype,
            {
                min : function(conf, attrs, model) {
                    this.checkConf([ 'fieldName', 'min' ], conf);
                    var val = this.getFieldValue('fieldName', conf, attrs,
                            model);
                    if (($.isNumeric(val) !== true) || (Number(val) < Number(conf.min))) {
                        return this.makeError('min', conf.fieldName
                                + " should be minimum " + conf.min + ', was >'
                                + val + '<', conf.fieldName, val);
                    }
                }
            });

    /**
     * Checks if the value of a model's numeric attribute is greater than a
     * given number.
     * 
     * @param {String}
     *            conf.fieldName The name of a string attribute.
     * @param {Number}
     *            conf.max The max value
     */
    _.extend(Lightsaber.Core.Validator.prototype,
            {
                max : function(conf, attrs, model) {
                    this.checkConf([ 'fieldName', 'max' ], conf);
                    var val = this.getFieldValue('fieldName', conf, attrs,
                            model);
                    if (($.isNumeric(val) !== true) || (Number(val) > Number(conf.max))) {
                        return this.makeError('max', conf.fieldName
                                + " should be maximum " + conf.max + ', was >'
                                + val + '<', conf.fieldName, val);
                    }
                }
            });

    /**
     * Checks if the string is a number .
     * 
     * @param {String}
     *            conf.fieldName The name of a string attribute.
     */
    _.extend(Lightsaber.Core.Validator.prototype, {
        isNumber : function(conf, attrs, model) {
            this.checkConf([ 'fieldName' ], conf);
            var val = this.getFieldValue('fieldName', conf, attrs, model);
            if ($.isNumeric(val) !== true) {
                return this.makeError('isNumber', conf.fieldName
                        + ' is not a number', conf.fieldName, val);
            }
        }
    });

    /**
     * Checks if the string is a Date .
     * 
     * @param {String}
     *            conf.fieldName The name of a string attribute.
     */

    Lightsaber.Core.Validator.prototype.isDate = function(conf, attrs, model) {
        this.checkConf([ 'fieldName' ], conf);
        var val = this.getFieldValue('fieldName', conf, attrs, model);

        if (_.isUndefined(val)) {
            return this.makeError('isDate', "value for '" + conf.fieldName
                    + "' is undefined", conf.fieldName, val);
        } else {
            var date = new Date(val);
            if (date == "Invalid Date") {
                return this.makeError('isDate', "value for '" + conf.fieldName
                        + "' is not a Date", conf.fieldName, val);
            }
        }
    };

    /**
     * Checks if the string is a Date above today's date ; else trigger an error.
     * 
     * @param {String}
     *            conf.fieldName The name of a string attribute.
     */
    Lightsaber.Core.Validator.prototype.isFutureDate = function(conf, attrs,
            model) {
        this.checkConf([ 'fieldName' ], conf);
        var val = this.getFieldValue('fieldName', conf, attrs, model);
        var date = new Date(val);
        if (date == "Invalid Date") {
            return this.makeError('isFutureDate', "value for '"
                    + conf.fieldName + "' is not a Date", conf.fieldName, val);
        }
        if (date < new Date()) {
            return this.makeError('isFutureDate', "value for '"
                    + conf.fieldName + "' is not a Future Date",
                    conf.fieldName, val);
        }
    };

    /**
     * Checks if the string is a Date below today's date ; else trigger an error.
     * 
     * @param {String}
     *            conf.fieldName The name of a string attribute.
     */
    Lightsaber.Core.Validator.prototype.isPastDate = function(conf, attrs,
            model) {
        this.checkConf([ 'fieldName' ], conf);
        var val = this.getFieldValue('fieldName', conf, attrs, model);

        if (_.isUndefined(val)) {
            return this.makeError('isDate', "value for '" + conf.fieldName
                    + "' is undefined", conf.fieldName, val);
        } else {
            var date = new Date(val);
            if (date == "Invalid Date") {
                return this.makeError('isPastDate', "value for '"
                        + conf.fieldName + "' is not a Date", conf.fieldName,
                        val);
            }
            if (date > new Date()) {
                return this.makeError('isPastDate', "value for '"
                        + conf.fieldName + "' is not a Past Date",
                        conf.fieldName, val);
            }
        }
    };
    
    return Validator;
});
/*
 * This object attempts to supply a resource bundle to the LightSaber i18n routine.
 * It then delegates the fetching of the localized string to the super "Lightsaber" method -  
 * which in its turn executes the parameters insertions as well.
 * Code structure based on an ARIM codebase example.  
 */
define('lib/amdocs/ossui/core/util/i18n/ossui_i18n.js',[
    'underscore', 
    'lightsaber', 
    'messages'
],
function(_, Lightsaber, localMessages) {


            var defaultDirBase = 'nls'; 
            var defaultFilename = 'messages.json';

    // Config locales
            var localeConfigs = {
                en_US : {
                    dateFormat : "mm/dd/yyyy",
                    type : "en_US",
                    currency : {
                        symbol : "$",
                        position : "start"
                    },
                    number : {
                        decimalSeparator : ".",
                        thousandSeparator : ","
                    }

                },
                en_UK : {
                    dateFormat : "dd/mm/yyyy",
                    type : "en_UK",
                    currency : {
                        symbol : "Â£",
                        position : "start"
                    },
                    number : {
                        decimalSeparator : ".",
                        thousandSeparator : ","
                    }
                },
                fr_FR : {
                    dateFormat : "dd/mm/yyyy",
                    type : "fr_FR",
                    currency : {
                        symbol : "â¬",
                        position : "end"
                    },
                    number : {
                        decimalSeparator : ",",
                        thousandSeparator : " "
                    }
                }
            };

            var helperMethods = {
                getCurrentLocale : function() {
                    // a provisional "english" default
          return localeConfigs["en_UK"];
                },

                getResourceContent : function(messagesURL) {

                    var ajaxResponseForRemoteMessages = $
                            .ajax({

                                beforeSend : function(x) {
                                    if (x && x.overrideMimeType) {
                                        x
                                                .overrideMimeType("application/j-son;charset=UTF-8");
                                    }
                                },
                                dataType : "json",
                                type : "GET",
                                async : false, // calling AJAX *synchronously*
                                url : messagesURL, // Note : this can be any
                                                    // file (local or remote).
                                complete : function(ajaxData) {
                                    return ajaxData;
                                },
                                success : function(data) {
                                    return data;
                                },
                                error : function(ajaxData, textStatus,
                                        errorThrown) {
                                    alert('Error when fetching localization data:'
                                            + textStatus);
                                }
                            });// ajax call

                    var remoteFileContent = $
                            .parseJSON(ajaxResponseForRemoteMessages.responseText);

                    // if the file is empty , then use the globally declared
                    // "messages" file
                    var parsedMessages = ($.isEmptyObject(remoteFileContent) === true) ? 
                            localMessages
                            :
                            // the actual strings are underneath a root called "messages"
                            $.parseJSON(ajaxResponseForRemoteMessages.responseText).messages;

                    return parsedMessages; 
                }

            };

        var i18nOperations = {
                /**
                 * Get the current locale as set in the login model
                 */
                currentLocale : function() {
                    return helperMethods.getCurrentLocale();
                },

                /**
                 * Get a translated string keyed by 'key'
                 */
                getString : function(key, params) {
                    return resourceBundle.getString(key, params);
                }

            };
    
   
            var currentLocaleType = helperMethods.getCurrentLocale().type;
            var defaultMessagesURL = defaultDirBase +  '/' +currentLocaleType+ '/' +defaultFilename;
            var parsedMessages =  helperMethods.getResourceContent(defaultMessagesURL);

    
            var resourceBundle = new Lightsaber.Core.ResourceBundle({

                defaultBundle : parsedMessages
            }, 'defaultBundle');

            var i18n = function(key, args) {
                return i18nOperations.getString(key, args);
            };

            _.extend(i18n, i18nOperations);

    // When each view is configured we need to replace the method _getLocaleString
    // which provides the 18n object. It's not enough to override that method
    // because when that method is bound to the object inside _configure it loses the enhanced functions        
    var _configure = Lightsaber.Core.View.prototype._configure;
            Lightsaber.Core.View.prototype._configure = function(options) {
                // Let the original configuration take place
                _configure.call(this, options);
                //Override the method so our enhanced 18n is returned
                this._getLocaleString = i18n;
            };
    
    return i18n;
});
/*global $*/
/*jshint devel:true */

define('lib/amdocs/ossui/components/preferences/preferences',['jquery'], function ($) {
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

/**
 * $Id: //depot/Applications/OSSUI/v10.1.0.0/components/ossui-client-zip/src/main/webapp/lib/amdocs/ossui/components/datetimepicker/datetimepicker.js#1 $ 
 * $DateTime: 2017/06/08 19:26:36 $ 
 * $Revision: #1 $ 
 * $Change: 1837971 $
 *
 * COPYRIGHT NOTICE:
 * Copyright (c) 2016 Amdocs.
 * The contents and intellectual property contained herein,
 * remain the property of Amdocs.
 *-----------------------------------------------------------------------------
 * This datetimepicker div is a thin wrapper around the http://eonasdan.github.io/bootstrap-datetimepicker/
 * to allow date and time picking features.
 * This wrapper adds the css class and will allow easy future enhancements of the
 * datetimepicker
 * parameters that can be passed in options
 * options = {
 *  el = <dom or jquery dom element>, this is where the datetimepicker will be shown, 
 *        this can be a input element or a div with input-group which wraps an
 *        input element and a calendar icon span see the eonasdan/bootstrap-datetimepicker for examples
 *  showDPOnInputClick = true/false, if this is set as true in the options then the datepicker shows up
 *                       on click of the input field as well when it is grouped with a calendar icon
 *                       (OOB the eonasdan/datetimepicker/ when grouped with calendar icon shows up only
 *                       when the calendar button is clicked) 
 *  
 *                        
 * }
 * Methods 
 * testMethod : just a test method currently showing how we can ehnahance the datetimepicker to add 
 *              our own methods and make them accessible same as the OOB methods provided by the 
 *              thirdparty lib
 *--------------------------------------------------------------------------------
 */
define('ossui/widget/DateTimePicker',
['jquery',
 'jquery.ui',
 'underscore'
 ],
 function($,$$,_){
    var ossuidatetimepicker = function(options){
        require(['bootstrap',
                 'moment',
                 'bootstrap-datetimepicker'], function(Bootstrap,Moment,bootstrapdatetimepicker){
            if(_.isUndefined($.fn.bootstrapBtn)){
                //bootstrap has a button method defined which clashes with
                //jQuery button method hence below has to be done
                var bootstrapButton = $.fn.button.noConflict(); // return $.fn.button to previously assigned value
                $.fn.bootstrapBtn = bootstrapButton;         // give $().bootstrapBtn the Bootstrap functionality
             }
            var $el = options.el;
            var ossuiOptions = ["el","showDPOnInputClick"];
            //testMethod is just a testmethod to show how the ossuidatetimepicker can be
            //enhanced to add new methods and added to the jquery data object
            //allow it to be accessed similar to the other datetimepicker funtions
            var testMethod = function(){
                console.log("in testmethod");
            };
            if(_.isUndefined($el)){
                throw Error("please provide a valid input element to initialize a DateTimePicker");
            }else{
                $($el).addClass("ossui-datetimepicker");  
                $($el).parent().addClass("ossui-datetimepicker-parent");
                var dpOptions = {};
                $.each(options,function(key){
                    if($.inArray(key,ossuiOptions) == -1){
                        dpOptions[key] = options[key];
                    }               
                });
                //create the datetimepicker
                $($el).datetimepicker(dpOptions);
                //now $($el).data("DateTimePicker") should be available 
                if(options.showDPOnInputClick && options.showDPOnInputClick === true && $($el).hasClass("input-group")){
                    $($el).find("input").on('click',function(){
                        $($el).data("DateTimePicker").show();
                    });           
                }
                //add new methods to the DateTimePicker data object  
                var orgData = $($el).data("DateTimePicker");
                if(typeof orgData === "object"){
                    orgData.testMethod = testMethod;
                }
            }
        });
            
            
        };
        return ossuidatetimepicker;
});

define(
        'ossui/widget/DateTimeRangePickerModel',
        [ 'underscore', 'lightsaber' ], function(_, Lightsaber) {

    var DateTimeRangePickerModel = Lightsaber.Core.RESTModel.extend({

        defaults : {
			rangeDropdown : null,
			fromDate : null,
			toDate : null
        }

    });

    return DateTimeRangePickerModel;
});
define('text!lib/amdocs/ossui/components/datetimerangepicker/view/template/datetimerangetpl.html',[],function () { return '<div class="ossui-datetime-range-picker">\n\t<div class="range-dropdown-parent">\n\t\t<fieldset>\n\t\t\t<label class="dropdown-label"></label>\n\t\t\t<span id="ossui-range-dropdown"></span>\n\t\t</fieldset>\n\t</div>\n\n\t<div class="ossui-date-input-parent">\n\t\t<fieldset>\n\t\t\t\t<label class="picker1-label" for="picker1input"></label>\n\t\t\t\t<div id="dtrangepicker1" class="input-group date ossui-daterange-picker1-parent">\n\t\t\t\t\t<input id="picker1input" placeholder="Any Date" type="text" name="picker1input" class="form-control date-time-range-picker-input"></input>\n\t\t\t\t\t<span class="input-group-addon date-time-range-picker-ip-group-addon">\n\t\t\t\t\t\t<span class="date-time-range-picker-cal-addon"></span>\n\t\t\t\t\t</span>\n\t\t\t\t</div>\n\n\t\t\t\t<label class="picker2-label" for="picker2input"></label>\n\t\t\t\t<div id="dtrangepicker2" class="input-group date ossui-daterange-picker2-parent">\n\t\t\t\t\t<input id="picker2input" placeholder="Any Date" type="text" name="picker2input" class="form-control date-time-range-picker-input"></input>\n\t\t\t\t\t<span class="input-group-addon date-time-range-picker-ip-group-addon">\n\t\t\t\t\t\t<span class="date-time-range-picker-cal-addon"></span>\n\t\t\t\t\t</span>\n\t\t\t\t</div>\n\t\t</fieldset>\n\t</div>\n</div>';});

define('ossui/widget/DateTimeRangePicker',
['jquery',
 'jquery.ui',
 'underscore',
 'ossui/widget/DateTimeRangePickerModel',
 'text!lib/amdocs/ossui/components/datetimerangepicker/view/template/datetimerangetpl.html'
 ],
function($,$$,_, DateTimeRangePickerModel,dateTimeRangeTpl){
    var ossuidatetimerangepicker = function(options){
        require(['bootstrap',
                 'moment',
                 'bootstrap-datetimepicker'], function(Bootstrap,Moment,bootstrapdatetimepicker){
            if(_.isUndefined($.fn.bootstrapBtn)){
                //bootstrap has a button method defined which clashes with
                //jQuery button method hence below has to be done
                var bootstrapButton = $.fn.button.noConflict(); // Return $.fn.button to previously assigned value
                $.fn.bootstrapBtn = bootstrapButton; // Give $().bootstrapBtn the Bootstrap functionality
            }
			
			var _self=this, picker1El, picker2El, dateOptionDropdown;
            var $el = options.$el;

			$el.append(dateTimeRangeTpl);
            var ossuiOptions = ['$el','showPickerOnInputClick', 'rangeDropdownOptions', 'hideCustomRangeOption', 'labels', 'model'];
				
                var dpOptions = {};
                $.each(options,function(key){
                    if($.inArray(key,ossuiOptions) == -1){
                        dpOptions[key] = options[key];
                    }               
                });
				dpOptions.useCurrent = false; //Necessary to implement linked datepickers(i.e. to set min and max dates of pickers)
                
				if(!options.labels){
					throw Error("Please provide the label values for range dropdown and date pickers");
				}
				if(!options.model || !(options.model instanceof DateTimeRangePickerModel)){
					throw Error("Please provide a valid DateTimeRangePickerModel instance");
				}
				$el.find('.dropdown-label').text(options.labels.dropdownLabel);
				$el.find('.picker1-label').text(options.labels.fromLabel);
				$el.find('.picker2-label').text(options.labels.toLabel);
				
				
				picker1El = $el.find('#dtrangepicker1');
				picker2El = $el.find('#dtrangepicker2');
				
                picker1El.datetimepicker(dpOptions);				
                picker2El.datetimepicker(dpOptions);
				
				//Create Range Dropdown
				if(_.isUndefined(options.rangeDropdownOptions)){
					console.warn("No range options provided");
				}				
				dateOptionDropdown = $el.find('#ossui-range-dropdown');
				dateOptionDropdown.select2(options.rangeDropdownOptions);

                if(options.showPickerOnInputClick && options.showPickerOnInputClick === true && picker1El.hasClass("input-group") && picker2El.hasClass("input-group")){
                    picker1El.find("input").on('click',function(){
                        picker1El.data("DateTimePicker").show();
                    });
                    picker2El.find("input").on('click',function(){
                        picker2El.data("DateTimePicker").show();
                    });
                }
				
				//-------- Restore the inputs from model state ---------------

				if(options.model.get('fromDate')){
					picker1El.data("DateTimePicker").date(options.model.get('fromDate'));
					picker2El.data("DateTimePicker").minDate(options.model.get('fromDate'));
				}
				
				if(options.model.get('toDate')){
					picker2El.data("DateTimePicker").date(options.model.get('toDate'));
					picker1El.data("DateTimePicker").maxDate(options.model.get('toDate'));
				}
				
				if(options.model.get('rangeDropdown')){
					dateOptionDropdown.select2('val', options.model.get('rangeDropdown').id);
					if(options.model.get('rangeDropdown').id=='BEFORE'){
						picker1El.data("DateTimePicker").disable();
					}else if(options.model.get('rangeDropdown').id=='AFTER'){
						picker2El.data("DateTimePicker").disable();
					}else if(options.model.get('rangeDropdown').id=='CUSTOM'){
					}else{
						picker1El.data("DateTimePicker").disable();
						picker2El.data("DateTimePicker").disable();
					}
				}
				//------------------------------------------------------
				
				dateOptionDropdown.on('change', function (evt) {
					var selectedData = dateOptionDropdown.select2('data');
					options.model.set('rangeDropdown',selectedData);
					var momentTimeString = evt.val;
					
					if(!momentTimeString){
						picker1El.data("DateTimePicker").clear();
						picker2El.data("DateTimePicker").clear();
						picker1El.data("DateTimePicker").enable();
						picker2El.data("DateTimePicker").enable();
					}else{						
							switch (momentTimeString) {
								case 'CUSTOM':
									picker1El.data("DateTimePicker").clear();
									picker2El.data("DateTimePicker").clear();
									picker1El.data("DateTimePicker").enable();
									picker2El.data("DateTimePicker").enable();
									break;
								case 'BEFORE':
									picker1El.data("DateTimePicker").clear();
									picker2El.data("DateTimePicker").clear();
									picker1El.data("DateTimePicker").disable();
									picker2El.data("DateTimePicker").enable();
									break;
								case 'AFTER':
									picker1El.data("DateTimePicker").clear();
									picker2El.data("DateTimePicker").clear();
									picker2El.data("DateTimePicker").disable();
									picker1El.data("DateTimePicker").enable();
									break;
								default:
									//Handle predefined date-range selection
									var momentTimeObject = JSON.parse(momentTimeString);
									var momentTime = Moment().add(momentTimeObject);
									picker1El.data("DateTimePicker").clear();
									picker2El.data("DateTimePicker").clear();
									if(momentTime.isBefore(Moment())){
										picker1El.data("DateTimePicker").date(momentTime);
										picker2El.data("DateTimePicker").date(Moment());
									}else {
										picker1El.data("DateTimePicker").date(Moment());
										picker2El.data("DateTimePicker").date(momentTime);
									}
									picker1El.data("DateTimePicker").disable();
									picker2El.data("DateTimePicker").disable();	
							}				
					}
				});
				
				
				picker1El.on('dp.change',function(e){
					options.model.set('fromDate',picker1El.data("DateTimePicker").date());
					if(e.date){
						picker2El.data("DateTimePicker").minDate(e.date);
					}else {
						picker2El.data("DateTimePicker").minDate(false);
					}					
				});

				picker2El.on('dp.change',function(e){
					options.model.set('toDate',picker2El.data("DateTimePicker").date());
					if(e.date){
						picker1El.data("DateTimePicker").maxDate(e.date);
					}else {
						picker1El.data("DateTimePicker").maxDate(false);
					}
				});
	
			});
        };
        return ossuidatetimerangepicker;
});
/*jshint maxparams: 100 */
define('src_web/ossui.components', [ 'lightsaber', 'ossui/widget/MenuView',
        'ossui/widget/ScrollbarWidget', 'ossui/widget/HyperlinkView',
        'ossui/widget/BorderLayoutView', 'ossui/widget/BreadcrumbsView',
        'ossui/widget/TooltipView', 'ossui/widget/CollectionView',
        'ossui/validator/ValidatorOSSUI', 'ossui/widget/ModalDialogCallback',
        'ossui/widget/ModalDialogView', 'ossui/widget/DynamicTabPanelView',
        'ossui/widget/DualListView','ossui/widget/DualListCollection','ossui/widget/DualListModel',
        'ossui/widget/CollectionDualListView','ossui/widget/CheckboxTextView','ossui/widget/CollectionListView','ossui/widget/SortableCollectionView',
        'ossui/navigation/ModuleRegistry',
        'ossui/navigation/ControllerModule',
        'ossui/navigation/EventManagerModule',
        'ossui/navigation/ObservableModule',
        'ossui/controllers/BreadcrumbController',
        'ossui/controllers/TabController', 'ossui/widget/LoginModule',
        'ossui/widget/LoginView', 'ossui/widget/LoginViewModel',
        'ossui/widget/LoginDialog', 'ossui/controller/Router',
        'ossui/controller/Application', 'ossui/application/view/Module',
        'ossui/widget/ProfileView', 'ossui/widget/ProfileAdminView',
        'ossui/widget/ProfileViewDialog', 'ossui/widget/ProfileAdminViewDialog',
        'ossui/widget/ProfileCollection', 'ossui/widget/ProfileModel', 'ossui/widget/profile/InputTextViewValidated',
        'ossui/helper/BreadcrumbsOverflowHandler',
        'ossui/utils/OSSUIRestModel', 'ossui/utils/OSSUIConfigReader',
        'ossui/utils/OSSUILocaleReader','ossui/utils/OSSUIResourceBundle', 'ossui/utils/OSSUIBasicResourceBundle',
        'ossui/utils/OSSUIConfigurationData','ossui/utils/OSSUIUtils','ossui/portalregistrar/PortalRegistrar','ossui/widget/ConfigurableTabPanelView',
        'ossui/widget/ConfigurableTabPanelViewModel', 'ossui/widget/ListFilterView',
        'ossui/widget/TabpaneViewModel',
        'ossui/widget/FormInputView',
        'ossui/widget/FormInputDialog',
        'ossui/widget/FormInputViewModel',
        'ossui/widget/DatepickerView',
        'ossui/widget/DateTimePicker',
		'ossui/widget/DateTimeRangePicker',
		'ossui/widget/DateTimeRangePickerModel'
        ], function(Lightsaber,
        MenuView, ScrollbarWidget, HyperlinkView, BorderLayoutView,
        BreadcrumbsView, TooltipView, CollectionView, ValidatorOSSUI,
        ModalDialogCallback, ModalDialogView, DynamicTabPanelView,
        DualListView, DualListCollection ,DualListModel,CollectionDualListView,CheckboxTextView,
        CollectionListView,SortableCollectionView,
        ModuleRegistry, ControllerModule, EventManagerModule,
        ObservableModule, BreadcrumbController, TabController, LoginModule,
        LoginView, LoginViewModel, LoginDialog, Router, Application, Module,
        ProfileView, ProfileAdminView, ProfileViewDialog, ProfileAdminViewDialog, ProfileCollection, ProfileModel,InputTextViewValidated,
        BreadcrumbsOverflowHandler,
        OSSUIRestModel, OSSUIConfigReader, OSSUILocaleReader, OSSUIResourceBundle, OSSUIBasicResourceBundle,
        OSSUIConfigurationData,OSSUIUtils, PortalRegistrar,
        ConfigurableTabPanelView, ConfigurableTabPanelViewModel, ListFilterView, TabpaneViewModel,
        FormInputView, FormInputDialog, FormInputViewModel, DatepickerView, DateTimePicker, DateTimeRangePicker, DateTimeRangePickerModel) {
    return {
        MenuView : MenuView,
        ScrollbarWidget : ScrollbarWidget,
        HyperlinkView : HyperlinkView,
        BorderLayoutView : BorderLayoutView,
        BreadcrumbsView : BreadcrumbsView,
        TooltipView : TooltipView,
        CollectionView : CollectionView,
        ValidatorOSSUI : ValidatorOSSUI,
        ModalDialogCallback : ModalDialogCallback,
        ModalDialogView : ModalDialogView,
        DynamicTabPanelView : DynamicTabPanelView,
        DualListView : DualListView,
        DualListCollection:DualListCollection,
        DualListModel:DualListModel,
        CollectionDualListView : CollectionDualListView,
        CheckboxTextView :CheckboxTextView,
        CollectionListView:CollectionListView,
        SortableCollectionView:SortableCollectionView,
        ModuleRegistry : ModuleRegistry,
        ControllerModule : ControllerModule,
        EventManagerModule : EventManagerModule,
        ObservableModule : ObservableModule,
        BreadcrumbController : BreadcrumbController,
        TabController : TabController,
        LoginModule : LoginModule,
        LoginView : LoginView,
        LoginViewModel : LoginViewModel,
        LoginDialog : LoginDialog,
        Router : Router,
        Application : Application,
        Module : Module,
        ProfileView : ProfileView,
        ProfileAdminView : ProfileAdminView,
        ProfileViewDialog : ProfileViewDialog,
        ProfileAdminViewDialog : ProfileAdminViewDialog,
        ProfileCollection : ProfileCollection,
        ProfileModel : ProfileModel,
        InputTextViewValidated:InputTextViewValidated,
        BreadcrumbsOverflowHandler : BreadcrumbsOverflowHandler,
        OSSUIRestModel : OSSUIRestModel,
        OSSUIConfigReader : OSSUIConfigReader,
        OSSUILocaleReader : OSSUILocaleReader,
        OSSUIResourceBundle : OSSUIResourceBundle,
        OSSUIBasicResourceBundle : OSSUIBasicResourceBundle,
        OSSUIConfigurationData : OSSUIConfigurationData,
        OSSUIUtils : OSSUIUtils,
        PortalRegistrar : PortalRegistrar,
        ConfigurableTabPanelView : ConfigurableTabPanelView,
        ConfigurableTabPanelViewModel : ConfigurableTabPanelViewModel,
        ListFilterView : ListFilterView,
        TabpaneViewModel : TabpaneViewModel,
        FormInputView : FormInputView,
        FormInputDialog : FormInputDialog,
        FormInputViewModel : FormInputViewModel,
        DatepickerView : DatepickerView,
        DateTimePicker : DateTimePicker,
		DateTimeRangePicker : DateTimeRangePicker,
		DateTimeRangePickerModel : DateTimeRangePickerModel
    };
});
/* jshint maxparams: 7 */

define('ossui', [ 'src_web/ossui.components' ], function(Ossui) {
    return Ossui;
});
