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
