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
