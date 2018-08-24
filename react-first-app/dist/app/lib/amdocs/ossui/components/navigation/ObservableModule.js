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
