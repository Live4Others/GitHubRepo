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
