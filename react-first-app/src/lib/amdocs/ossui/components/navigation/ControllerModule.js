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
