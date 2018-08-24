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