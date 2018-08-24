define('ossui/widget/DateTimeRangePicker',
['jquery',
 'jquery.ui',
 'underscore',
 'ossui/widget/DateTimeRangePickerModel',
 'text!lib/amdocs/ossui/components/datetimerangepicker/view/template/datetimerangetpl.html'
 ],
function($,$$,_, DateTimeRangePickerModel,dateTimeRangeTpl){
    var ossuidatetimerangepicker = function(options){
        require(['bootstrap',
                 'moment',
                 'bootstrap-datetimepicker'], function(Bootstrap,Moment,bootstrapdatetimepicker){
            if(_.isUndefined($.fn.bootstrapBtn)){
                //bootstrap has a button method defined which clashes with
                //jQuery button method hence below has to be done
                var bootstrapButton = $.fn.button.noConflict(); // Return $.fn.button to previously assigned value
                $.fn.bootstrapBtn = bootstrapButton; // Give $().bootstrapBtn the Bootstrap functionality
            }
			
			var _self=this, picker1El, picker2El, dateOptionDropdown;
            var $el = options.$el;

			$el.append(dateTimeRangeTpl);
            var ossuiOptions = ['$el','showPickerOnInputClick', 'rangeDropdownOptions', 'hideCustomRangeOption', 'labels', 'model'];
				
                var dpOptions = {};
                $.each(options,function(key){
                    if($.inArray(key,ossuiOptions) == -1){
                        dpOptions[key] = options[key];
                    }               
                });
				dpOptions.useCurrent = false; //Necessary to implement linked datepickers(i.e. to set min and max dates of pickers)
                
				if(!options.labels){
					throw Error("Please provide the label values for range dropdown and date pickers");
				}
				if(!options.model || !(options.model instanceof DateTimeRangePickerModel)){
					throw Error("Please provide a valid DateTimeRangePickerModel instance");
				}
				$el.find('.dropdown-label').text(options.labels.dropdownLabel);
				$el.find('.picker1-label').text(options.labels.fromLabel);
				$el.find('.picker2-label').text(options.labels.toLabel);
				
				
				picker1El = $el.find('#dtrangepicker1');
				picker2El = $el.find('#dtrangepicker2');
				
                picker1El.datetimepicker(dpOptions);				
                picker2El.datetimepicker(dpOptions);
				
				//Create Range Dropdown
				if(_.isUndefined(options.rangeDropdownOptions)){
					console.warn("No range options provided");
				}				
				dateOptionDropdown = $el.find('#ossui-range-dropdown');
				dateOptionDropdown.select2(options.rangeDropdownOptions);

                if(options.showPickerOnInputClick && options.showPickerOnInputClick === true && picker1El.hasClass("input-group") && picker2El.hasClass("input-group")){
                    picker1El.find("input").on('click',function(){
                        picker1El.data("DateTimePicker").show();
                    });
                    picker2El.find("input").on('click',function(){
                        picker2El.data("DateTimePicker").show();
                    });
                }
				
				//-------- Restore the inputs from model state ---------------

				if(options.model.get('fromDate')){
					picker1El.data("DateTimePicker").date(options.model.get('fromDate'));
					picker2El.data("DateTimePicker").minDate(options.model.get('fromDate'));
				}
				
				if(options.model.get('toDate')){
					picker2El.data("DateTimePicker").date(options.model.get('toDate'));
					picker1El.data("DateTimePicker").maxDate(options.model.get('toDate'));
				}
				
				if(options.model.get('rangeDropdown')){
					dateOptionDropdown.select2('val', options.model.get('rangeDropdown').id);
					if(options.model.get('rangeDropdown').id=='BEFORE'){
						picker1El.data("DateTimePicker").disable();
					}else if(options.model.get('rangeDropdown').id=='AFTER'){
						picker2El.data("DateTimePicker").disable();
					}else if(options.model.get('rangeDropdown').id=='CUSTOM'){
					}else{
						picker1El.data("DateTimePicker").disable();
						picker2El.data("DateTimePicker").disable();
					}
				}
				//------------------------------------------------------
				
				dateOptionDropdown.on('change', function (evt) {
					var selectedData = dateOptionDropdown.select2('data');
					options.model.set('rangeDropdown',selectedData);
					var momentTimeString = evt.val;
					
					if(!momentTimeString){
						picker1El.data("DateTimePicker").clear();
						picker2El.data("DateTimePicker").clear();
						picker1El.data("DateTimePicker").enable();
						picker2El.data("DateTimePicker").enable();
					}else{						
							switch (momentTimeString) {
								case 'CUSTOM':
									picker1El.data("DateTimePicker").clear();
									picker2El.data("DateTimePicker").clear();
									picker1El.data("DateTimePicker").enable();
									picker2El.data("DateTimePicker").enable();
									break;
								case 'BEFORE':
									picker1El.data("DateTimePicker").clear();
									picker2El.data("DateTimePicker").clear();
									picker1El.data("DateTimePicker").disable();
									picker2El.data("DateTimePicker").enable();
									break;
								case 'AFTER':
									picker1El.data("DateTimePicker").clear();
									picker2El.data("DateTimePicker").clear();
									picker2El.data("DateTimePicker").disable();
									picker1El.data("DateTimePicker").enable();
									break;
								default:
									//Handle predefined date-range selection
									var momentTimeObject = JSON.parse(momentTimeString);
									var momentTime = Moment().add(momentTimeObject);
									picker1El.data("DateTimePicker").clear();
									picker2El.data("DateTimePicker").clear();
									if(momentTime.isBefore(Moment())){
										picker1El.data("DateTimePicker").date(momentTime);
										picker2El.data("DateTimePicker").date(Moment());
									}else {
										picker1El.data("DateTimePicker").date(Moment());
										picker2El.data("DateTimePicker").date(momentTime);
									}
									picker1El.data("DateTimePicker").disable();
									picker2El.data("DateTimePicker").disable();	
							}				
					}
				});
				
				
				picker1El.on('dp.change',function(e){
					options.model.set('fromDate',picker1El.data("DateTimePicker").date());
					if(e.date){
						picker2El.data("DateTimePicker").minDate(e.date);
					}else {
						picker2El.data("DateTimePicker").minDate(false);
					}					
				});

				picker2El.on('dp.change',function(e){
					options.model.set('toDate',picker2El.data("DateTimePicker").date());
					if(e.date){
						picker1El.data("DateTimePicker").maxDate(e.date);
					}else {
						picker1El.data("DateTimePicker").maxDate(false);
					}
				});
	
			});
        };
        return ossuidatetimerangepicker;
});