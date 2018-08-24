define('ossui/widget/DatepickerView',
[	'jquery',
	'jquery.ui',
	'underscore', 
	'lightsaber'

], function($, $$, _, Lightsaber) {

	var Datepicker = Lightsaber.Core.View.extend({
		_element : null,
		_locale  : null,
		
		initialize : function(options) {
			_.bindAll(this,'extendDatepicker');
			this._element = this.getConfig('element') || this.element || options.element;
			this._locale  = this.getConfig('locale') || this.locale|| options.locale;			
			this.target = this.getConfig('target') || this.target || options.target;
			this.dateFormat = this.getConfig('dateFormat') || this.dateFormat || options.dateFormat;
			this.extendDatepicker();			
		},
		
		extendDatepicker : function(){		
			$.datepicker.setDefaults(_.extend({
				showOn : "button",
				buttonImage : "res/amdocs/ossui/images/DatePicker_Icon.png",
				changeYear: true,
				buttonImageOnly : true,
				showButtonPanel : true,
				dateFormat : this.dateFormat,
				beforeShow : function(input) {
					setTimeout(function() {
						var buttonPane = $(input).datepicker("widget").find(".ui-datepicker-buttonpane");
						$("<button>", {
							text : "Clear",
							click : function() {
								$.datepicker._clearDate(input);
							}
						}).addClass("ui-state-default ui-priority-primary ui-corner-all").appendTo(buttonPane);
						//Mark this as OSSUI datepicker instance for further custom styling
						$(input).datepicker("widget").addClass("ossui-datepicker");						
					}, 1);
				},
				
				onChangeMonthYear : function(input) {
					var targetinput=this;
					setTimeout(function() {
						var buttonPane = $(input).datepicker("widget").find(".ui-datepicker-buttonpane");
						$("<button>", {
							text : "Clear",
							click : function() {
								$.datepicker._clearDate(targetinput);
							}
						}).addClass("ui-state-default ui-priority-primary ui-corner-all").appendTo(buttonPane);
					}, 1);
				}
			}, $.datepicker.regional[this._locale]));

		},
		
		
		_postRender : function() {
			if(this.target === undefined)
			{
				$(this._element).datepicker();
			}else{
				this.target.find(this._element).datepicker();
			}		
		}
		
		
	}); 

	return Datepicker;
});

