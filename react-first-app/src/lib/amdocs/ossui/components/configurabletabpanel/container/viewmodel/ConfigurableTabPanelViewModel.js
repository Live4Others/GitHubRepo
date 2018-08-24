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
