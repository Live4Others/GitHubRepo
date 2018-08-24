/**
 * ListFilterView is used by ConfigurableTabPanelView to provide  filter support.
 */
define('ossui/widget/ListFilterView', [
        'jquery',
        'lightsaber',
				'underscore',
        'ossui/utils/OSSUIResourceBundle',
        'text!lib/amdocs/ossui/components/configurabletabpanel/filter/view/template/ListFilterTemplate.html'
	], function ($, Lightsaber, _, OSSUIResourceBundle, FilterTemplate) {
	
	var FilterView = Lightsaber.Core.View.extend({

		template: FilterTemplate,
		
		_checkIfNoMatchesFound: function () {
			var filteredModelObj = this.viewModel.getData();
			var filteredModelLength = filteredModelObj.items.length;
			if (filteredModelLength === 0) {
				this.noMatchesMsg.show();
			} else {
				this.noMatchesMsg.hide();
			}
		},
		
		_addEventHandlers: function () {
			var self = this;
			this.clearButton.on('click', function () {
				self.putPlaceHolder();
				self.filterTxt.trigger('keyup');
			});
			this.filterTxt.on('keyup input', function (event) {
				if (self.filterTxt.val().length > 0) {
					self.filterTxt.attr('title', self.filterTxt.val());
				} else {
					self.filterTxt.attr('title', self.filterTxtPlaceholder);
				}
				var filterToApply = self.filterTxt.val();
				if (self.filterTxt.hasClass('ossui-configurable-tab-filter-txt-bar-placeholder')) {
					filterToApply = '';
				}
				
				if (!filterToApply || filterToApply === '') {
					self.noMatchesMsg.hide();
					self.viewModel.applyFilterCondition(filterToApply);
					self.viewModel.refresh();
				}else { 
					self.viewModel.applyFilterCondition(filterToApply);
					self.viewModel.refresh();
					self._checkIfNoMatchesFound();
				}

			});
			
			this.handlePlaceHolder();
		},
		
		postRender: function () {
			this._super();
			this.noMatchesMsg = this.$el.find('[data-uxf-point="ossui-configurable-tab-filter-no-matches"]');
			this.noMatchesMsg.append(OSSUIResourceBundle.prototype.getMessage('ossui.labels.filter.text.noMatchedFound') || 'Sorry, no matches found');
			this.noMatchesMsg.hide();
			
			this.filterTxt = this.$el.find('[data-uxf-point="ossui-configurable-tab-filter-txt-bar"]');
			this.clearButton = this.$el.find('[data-uxf-point="ossui-configurable-tab-filter-clear-btn-link"]');
			
			
			this.filterTxtPlaceholder = OSSUIResourceBundle.prototype.getMessage('ossui.labels.filter.text.placeholder') || 'Search';
			this.clearTxtLabel = OSSUIResourceBundle.prototype.getMessage('ossui.labels.filter.button.clearText') || 'Clear Text';
			
			this.filterTxt.attr('data-placeholder', this.filterTxtPlaceholder);
			this.putPlaceHolder();
			this.filterTxt.attr('title', this.filterTxtPlaceholder);
			this.clearButton.attr('title', this.clearTxtLabel);
			this._addEventHandlers();
			
		},
		
		handlePlaceHolder : function () {
			var self = this;
			this.filterTxt.focus(function () {
				if (self.filterTxt.hasClass('ossui-configurable-tab-filter-txt-bar-placeholder')) {
					self.clearPlaceHolder();
				}
			}).blur(function () {
				var value = self.filterTxt.val();
				if (value === '' || (value === self.filterTxt.attr('data-placeholder') && self.filterTxt.hasClass('ossui-configurable-tab-filter-txt-bar-placeholder'))) {
					self.putPlaceHolder();
				}
			});
		},
		
		putPlaceHolder: function () {
			this.filterTxt.addClass('ossui-configurable-tab-filter-txt-bar-placeholder');
			this.filterTxt.val(this.filterTxt.attr('data-placeholder'));
		},
		
		clearPlaceHolder: function () {
			this.filterTxt.val('');
			this.filterTxt.removeClass('ossui-configurable-tab-filter-txt-bar-placeholder');
		}
	});
	
	return FilterView;
});
