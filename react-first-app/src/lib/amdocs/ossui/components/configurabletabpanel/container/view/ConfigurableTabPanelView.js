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


