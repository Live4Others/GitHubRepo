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
