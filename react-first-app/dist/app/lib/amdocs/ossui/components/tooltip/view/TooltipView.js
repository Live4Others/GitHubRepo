/** 
@memberOf OSSUI.widgets
@name TooltipView
@class TooltipView
@type View
@description
This class provides a Lightsaber view wrapper on top of jquery-ui-tooltip.
refer http://api.jqueryui.com/tooltip/ for api docs and all available options

@example 1 --> create a default TooltipView
    var tooltip1 = new Ossui.TooltipView({
                 config : {
                 //where iconView below is an Ossui/Lightsaber widget instance
                     element : iconView,
                    },
                    viewModel : new Lightsaber.Core.ViewModel(),
             });
    
@example 2 --> Create a TooltipView with some extra config parameters
var tooltip2 = new Ossui.TooltipView({
                 config : {
                     //element can be a jquery result also
                     element : $('[ossui-tooltip-img]'),
                     tooltipConfig : {
                         hide: {
                             effect: "slidedown",
                             delay: 250
                           },
                         items: "[ossui-tooltip-img],[title]",
                         content:function(){
                               var element = $( this );
                               if ( element.is( "[ossui-tooltip-img]" ) ) {
                                   return "<img class='map' alt='antarctica'" +
                                   " src='../../../../../res/images/antarctica.jpg'" + "'>";
                               }
                               if ( element.is( "[title]" ) ) {
                                   return element.attr( "title" );
                                   }                                   
                               
                           }
                    }},
                    viewModel : new Lightsaber.Core.ViewModel(),
             });
@example 3 --> to bind a jquery-ui-tootip event to callback method
   tooltip2.bindEvent("tooltipopen",function(event, ui){
                 console.log("opened");
             });
            
@example 4 --> to call a jquery-ui-tootip method
get all set tooltip options
 var result = tooltip2.callMethod("option");

set a tooltip option property
 var result = tooltip2.callMethod("option", "disabled", true );

 */

define('ossui/widget/TooltipView', 
        [ 'underscore', 
          'jquery',
          'lightsaber'],
          function(_, $, Lightsaber) {

            var TooltipView = Lightsaber.Core.View
                    .extend({

                        selector : null,
                        defaultTooltipConfig : {
                            tooltipClass : 'ossui-tooltip',
                            position : {
                                my : "center bottom-20",
                                at : "center top",
                                using : function(position, feedback) {
                                    $(this).css(position);
                                    $("<div>").addClass("ossui-tooltip-arrow")
                                            .addClass(feedback.vertical)
                                            .addClass(feedback.horizontal)
                                            .appendTo(this);
                                }
                            }
                        },

                        initialize : function(config) {
                            var element = this.getConfig('element');
                            var toolTipConfig = this.getConfig('tooltipConfig');
                            if (element instanceof Lightsaber.Core.View) {
                                this.selector = element.$root;
                            } else {
                                // jquery object has been passed
                                this.selector = element;
                            }
                            this._initializeTooltip(toolTipConfig);
                        },

                        _initializeTooltip : function(toolTipConfig) {
                            // if tootipconfig does not contain the default
                            // attributes add them.
                            if (toolTipConfig) {
                                var positionAttrConsolidation = false;
                                if (toolTipConfig && toolTipConfig.position) {
                                    positionAttrConsolidation = true;
                                }
                                this._consolidateUserAndDefaultData(
                                        toolTipConfig,
                                        this.defaultTooltipConfig);

                                // since position is a composite attribute
                                // and user data is present there is a need
                                // to iterate though all the elements of the
                                // position attribute and set default if not set
                                if (positionAttrConsolidation) {
                                    this._consolidateUserAndDefaultData(
                                            toolTipConfig.position,
                                            this.defaultTooltipConfig.position);
                                }
                            } else {
                                toolTipConfig = this.defaultTooltipConfig;
                            }
                            this.selector.tooltip(toolTipConfig);

                        },

                        _consolidateUserAndDefaultData : function(userData,
                                defaultData) {
                            for ( var attr in defaultData) {
                                if (!userData[attr]) {
                                    userData[attr] = defaultData[attr];
                                }
                            }
                        },
                        
                        /**
                         * This method can be used to call jquery-ui-tooltip methods like
                         * open, close, option etc
                         * @returns: if the jquery tooltip method returns some value the same is
                         *            returned
                         */
                        callMethod : function(argument1,argument2,argument3) {
                            return this.selector.tooltip(argument1,argument2,argument3);
                        },
                        
                        /**
                         * This method can be used to bind jquery-ui-tootip events
                         * to callback methods
                         * @param event : jquery-ui-tootip event 
                         * @param bindmethod : call back method to which the event
                         *                     should be bound to
                         */
                        bindEvent : function(event, bindmethod) {
                            this.selector.on(event, bindmethod);
                        }

                    });
            return TooltipView;

        });