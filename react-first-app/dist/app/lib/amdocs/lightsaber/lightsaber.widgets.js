/**
* This component registers views as jquery mobile/ui widgets.
* To use this module, one must pass over to it a library name to expose. If the library is Lightsaber library, one does not have to provide
* the list of views to expose, as these are predefined. However, in order to expose any other library, one must provide the list of views
* included in the library, that they wish to register.
* If the constructor of the view to register has predefined widget name (Ctor.widgetName) it will be used for the registration. Otherwise,
* the name of the widget will be: "uxf.uxfCTORNAMEINLOWERCASE". If the ctor's name contain the word 'view' it will be removed as this is not a view but a widget.
* Unless specified otherwise by the Ctor.publicMethods array, all methods in the Ctor protoptype, 
* that does not start with "_" , will be exposed by the registered widget. Do note that in case of prototype hierarchy:
* If the child exposes only "create" method but the parent does not state any .publicMethods, 
* all the parent methods will also be available on the registered widget, even those overriden by the child and not specified in its .publicMethods
* Example for registered widget usage:
* $('<div></div>').uxfbutton({viewModel : viewModel})
**/

define(
'lightsaber.widgets',[ 	'jquery'
],
function($) {

	var WidgetRegistry = function(Library, views) {

		var uxfViews;

		if (!views) {
			uxfViews = ['ButtonView','InputTextView','CollectionView','AccordionView','ChartView','BooleanInputView','CheckboxView',
						'FlipSwitchView','InputTextAreaView','RadioView','SelectView','BaseFormElementView', 'ItemListView',
						'AutoCompleteView','BreadcrumbsView','LoadingView','WizardView',
						'GroupedItemListView','NavBarView','BarChartView','TabPanelView','FormView','CarouselView','BasePaginationView',
                        'SliderView','HeaderView','PaginationView','PopupView','ProgressBarView','SearchInputView','PickerView','TableView'];
		} else {
			uxfViews = views;
		}

		// exposing the list of views used for the registration
		this.uxfViews = uxfViews;

		$.fn.registry = function(Library, viewsList) {
			// create a widget constructor method with closure for the UXF View constructor and widget name.
		    var createWidgetCtor = function(name, ctor) {
		        return function() {
		            var myWidget = {
		    	        _widgetName : name, 
				        uxfWidget : null,

		                _create: function() {
		                    this.options.config || (this.options.config = {});
		                    this.options.config.el = this.element;
		                    this.uxfWidget = new ctor(this.options);
		                    var actions = ctor.getViewActions();
		                    if (actions) {
		                    	for (var i = 0 ; i < actions.length ; i++) {
		                    		var context = this.uxfWidget;
				                    var myactions = actions;
				                    this[actions[i]] = (function(index) {
				                        	return function() {
				                        		return context[myactions[index]].apply(context, Array.prototype.slice.call(arguments, 0));
				                        	};
				                    }(i));

		                    	}
		                    }
		                    
		                },
		                
		                option: function( key, value ) {
		                     this._setOption(key,value);
		                },
		                
		                _setOption: function(key, value) {
		                    this.uxfWidget.setConfig(key, value);
		                },

		                _destroy: function() {
		                	this.uxfWidget.destroy();
		                	
		                }
		                
			        };
		            
			        return myWidget;
		       };
		    };

		    // register all the widgets with jquery widget factory, and with widget prototype 
		    for (var i = 0 ; i < viewsList.length ; i++ ) {
		    	 var view = null;
		    	 if (viewsList[i] === 'View'){ // handling View seperately as it is in a different package
		    	 	view = Library.Core[viewsList[i]];
		    	 } else {
		    	 	view = Library[viewsList[i]];
		    	 }
		         var widgetName = view.widgetName;
		         if (!widgetName) {
		         	if (viewsList[i] === 'View') widgetName = 'uxf.uxfview';
		         	else widgetName = 'uxf.uxf'+viewsList[i].replace('View','').toLowerCase();
		         }
				$.widget( widgetName , createWidgetCtor(widgetName,view)());
		       
		    }
	   
	 	};

		$.fn.registry(Library,uxfViews);
	}
	return WidgetRegistry;
		
});

