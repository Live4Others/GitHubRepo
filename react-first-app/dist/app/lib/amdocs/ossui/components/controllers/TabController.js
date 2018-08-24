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
