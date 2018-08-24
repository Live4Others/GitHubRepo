/**
* $Id: //depot/Applications/OSSUI/v10.1.0.0/components/ossui-client-zip/src/main/webapp/lib/amdocs/ossui/components/scrollbar/widget/ScrollbarWidget.js#1 $
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

/**
  * parameters passed in options
  *                      options = {
  *                            scrollbarScrollPane  = <div> //represents the inner div which will be scrollable
  *                            scrollbarViewPort    = <div> //represents the outter div which has hidden overflow
  *                            scrollbarOrientation = 'vertical'/'horizontal'/'both' //default is 'both'
  *                            scrollbarType        = 'ossui-page-scrollbar'/'ossui-popup-scrollbar'/'ossui-custom-scrollbar'
  *                                                    //if the type is page-scrollbar/popup-scrollbar the width and color
  *                                                   //of the scrollbar is as per the OSSUI Style guide automatically
  *                                                   //however if a custom width/color is needed then the type should be
  *                                                   //set as ossui-custom-scrollbar
  *                                                   //If scrollbarType not specified then the default scrollbar is
  *                                                   // 'ossui-page-scrollbar'
  *                            scrollbarWidth       = '<number>px' this option is read only if the scrollbarType is custom
  *                            scrollbarColor       = '#<colorcode>'this option is read only if the scrollbarType is custom
  *                            scrollbarViewPortHeight = '<number>px' //The viewport should have fixed max height/width dimensions
  *                                                      //If this option is not specified then it is assumed the application
  *                                                      //takes care of setting this itself
  *                            scrollbarViewPortWidth = '<number>px' //The viewport should have fixed max height/width dimensions
  *                                                      //If this option is not specified then it is assumed the application
  *                                                      //takes care of setting this itself
  *                            scrollingWithArrowKeys = 'true'/'false' //True by default but should be switched off by setting the
  *                                                     //param to false if the widget already supports scrolling with arrows
  *                                                     //jQuery widgets might throw exceptions if this is already supported by
  *                                                     //the widget
  *                            sliderRange = <number> this is the max slider range value. Which is defaulted to 300 if not provided
  *                            donotAutoHandleDOMModifiedEvent = <boolean> if set to true the auto handling of refresh on DOMSubtreeModified
  *                                                          //event is not done, if this attribute is false or not present
  *                                                      //scrollbar listen's to the DOMSubtreeModified and auto refresh
  *                                                   (Note: This has been introduced to workaround the IE9 bug which
  *                                                    triggers the DOMSubtreeModified infinitely)
  *                            insertScrollYAfter    = in default the scroll is locate after the scrollContentElement, use this option to place the Y scroll near other element
  *                            insertScrollXAfter    = in default the scroll is locate after the scrollContentElement, use this option to place the X scroll near other element
  *                            topOffset             = <number> start the top of Y scroll with offset from the top.
  *                        }
  **/
define('ossui/widget/ScrollbarWidget',['underscore','jquery','jquery.ui','mousewheel','backbone'],

    function(_, $, $$, mousewheel, Backbone) {

                var ScrollbarWidget = function(options) {

                    /*jshint maxcomplexity: 14 */
                    
                    this.scrollContentElement = options.scrollbarScrollPane;
                    this.outerContainerElement = options.scrollbarViewPort;
                    this.insertScrollYAfter = options.insertScrollYAfter || this.scrollContentElement;
                    this.insertScrollXAfter = options.insertScrollXAfter || this.scrollContentElement;
                    this.topOffset = options.topOffset || 0;
                    //default orientation
                    this.scrollbarOrientation = 'both';

                    var webkitCalcVar = '-webkit-calc(';
                    var mozCalcVar = '-moz-calc(' ;
                    var ieCalcVar = 'calc(' ;
                    var scrollbarWidth = '- 12px)';
                    if(options.scrollbarViewPortHeight){
                        //needed for vertical scrolling. If the height is not set then it is assumed
                        //the application is setting the property itself
                        this.outerContainerElement.css('height', options.scrollbarViewPortHeight);
                        this.scrollContentElement.css('height',webkitCalcVar + options.scrollbarViewPortHeight  + scrollbarWidth);
                        this.scrollContentElement.css('height',mozCalcVar + options.scrollbarViewPortHeight  + scrollbarWidth);
                        this.scrollContentElement.css('height',ieCalcVar + options.scrollbarViewPortHeight  + scrollbarWidth);
                    }
                    if(options.scrollbarViewPortWidth){
                        //needed for horizontal scrolling. If the height is not set then it is assumed
                        //the application is setting the property itself
                        this.outerContainerElement.css('width', options.scrollbarViewPortWidth);
                        this.scrollContentElement.css('width',webkitCalcVar + options.scrollbarViewPortHeight  + scrollbarWidth);
                        this.scrollContentElement.css('width',mozCalcVar + options.scrollbarViewPortHeight  + scrollbarWidth);
                        this.scrollContentElement.css('width',ieCalcVar + options.scrollbarViewPortHeight  + scrollbarWidth);
                    }
                    if(options.scrollbarOrientation){
                        // options.scrollbarOrientation = "horizontal"/ "vertical"/"both"
                        this.scrollbarOrientation = options.scrollbarOrientation;
                    }

                    this.scrollContentElement.addClass('ossui-scrollable-pane');

                    this.outerContainerElement.addClass('ossui-scrollbar-viewport');

                    this.donotAutoHandleDOMModifiedEvent = false;
                    if (options && options.donotAutoHandleDOMModifiedEvent
                            && (options.donotAutoHandleDOMModifiedEvent === true)) {
                        this.donotAutoHandleDOMModifiedEvent = options.donotAutoHandleDOMModifiedEvent;
                        }
                    switch (this.scrollbarOrientation) {

                        case 'horizontal' : this.xScroll = true;
                                            this.yScroll = false;
                                            break;
                        case 'vertical' : this.yScroll = true;
                                          this.xScroll = false;
                                           break;
                        default  :       this.xScroll = true;
                                         this.yScroll = true;
                                           break;

                        }

                    this.ySlider = $('<div class="ossui-slider" ></div>');
                    this.xSlider = $('<div class="ossui-slider" ></div>');

                    this.sliderRange = options.sliderRange || 300;

                    this.removeScrollbar = function() {
                        this.ySlider.remove();
                        this.xSlider.remove();
                        this.outerContainerElement.off();
                        this.outerContainerElement.unbind();
                        this.scrollContentElement.off();
                    };

                    /**
                     * API can be used to scroll the scrollbar programatically
                     * but the value here should fall between 0-sliderRange and be an integer
                     */
                    this.setYScrollbarPosition = function(position){
                        this.ySlider.slider('value',position);
                    };
                    /**
                     * API can be used to scroll the scrollbar programatically
                     * but the value here should fall between 0-sliderRange and be an integer
                     */
                    this.setXScrollbarPosition = function(position){
                        this.xSlider.slider('value',position);
                    };

                    this.getYScrollbarPosition = function(){
                        return this.ySlider.slider('option','value');
                    };

                    this.getXScrollbarPosition = function(){
                        return this.xSlider.slider('option','value');
                    };

                    this.resetYScrollbar = function() {
                        this.ySlider.slider({
                            value : this.sliderRange
                        });
                    };

                    this.resetXScrollbar = function() {
                        var remainder = this.outerContainerElement.width() - this.scrollContentElement.width();
                        var leftVal = this.scrollContentElement.css( "margin-left" ) === "auto" ? 0 :
                        parseInt( this.scrollContentElement.css( "margin-left" ) , 10);
                        var percentage = Math.round( leftVal / remainder * 100 );
                        this.xSlider.slider( {value : percentage });
                    };

                    this.reset = function(argument){
                        //function to be removed once menuview is aligned
                    };

                    this.getYOverflow = function() {
                        // ratio of contentElement height to actual content
                        return (this.outerContainerElement.height() - this.topOffset) / this.scrollContentElement.height();

                    };
                    this.getXOverflow = function() {
                        // ratio of contentElement height to actual content
                        return this.outerContainerElement.width() / this.scrollContentElement.width();

                    };
                    this._setScrollbarType = function(scrollbarType,sliderType){
                        switch (scrollbarType) {

                        case 'ossui-page-scrollbar'  : break;
                        case 'ossui-popup-scrollbar' : if (this.yScroll){
                                                         this.ySlider.css({width : '6px'});
                                                         this.ySlider.find('.ui-slider-handle').css({background : '#d7cebf', width : '6px'});
                                                       }
                                                      if (this.xScroll){
                                                         this.xSlider.css({height : '6px'});
                                                         this.xSlider.find('.ui-slider-handle').css({background : '#d7cebf', height : '6px'});
                                                       }
                                                       break;
                        case 'ossui-custom-scrollbar' : if(options.scrollbarWidth){
                                                          this.ySlider.css('width' , options.scrollbarWidth);
                                                          this.ySlider.find('.ui-slider-handle').css('width', options.scrollbarWidth);
                                                          this.xSlider.css('height' , options.scrollbarWidth);
                                                          this.xSlider.find('.ui-slider-handle').css('height', options.scrollbarWidth);
                                                        }
                                                        if(options.scrollbarColor){
                                                            this.ySlider.find('.ui-slider-handle').css('background', options.scrollbarColor);
                                                            this.xSlider.find('.ui-slider-handle').css('background', options.scrollbarColor);
                                                        }
                                                        break;

                        }
                    };

                    this.addScrollbars = function(){
                        //add scrollbar
                         var outerContainerElement = this.outerContainerElement;
                         var scrollContentElement = this.scrollContentElement;
                         var sliderRange = this.sliderRange;
                         var topOffset = this.topOffset;
                         if(this.xScroll){
                             this.xSlider.insertAfter(this.insertScrollXAfter);
                             this.xSlider.slider({
                                 max : this.sliderRange,
                                 min : 0,
                                 orientation : 'horizontal',
                                 value : options.value || this.sliderRange,
                                 change : function(event, ui) {
                                     var diff = outerContainerElement.width()
                                         - scrollContentElement.width();
                                 var left =    Math.round(ui.value / sliderRange * diff);
                                 scrollContentElement.css('margin-left', left +'px' );
                                 },
                                 slide : function(event, ui) {
                                     var diff =  outerContainerElement.width() - scrollContentElement.width();
                                     var left =  Math.round( ui.value / sliderRange * diff);
                                     scrollContentElement.css( "margin-left",  left + "px" );
                                     }
                                 });
                             if(options.scrollbarType){
                                 this._setScrollbarType(options.scrollbarType,this.xSlider);
                                 }
                         }
                         if(this.yScroll){
                         this.ySlider.insertAfter(this.insertScrollYAfter);
                         this.ySlider.hide();
                         this.ySlider.slider({
                             max : this.sliderRange,
                             min : 0,
                             orientation : 'vertical',
                             value : options.value || this.sliderRange,
                             change : function(event, ui) {
                                 var diff = scrollContentElement.height()
                                                 - outerContainerElement.height();
                                 var topValue = -((1 - (ui.value / sliderRange)) * diff);
                                  if (topValue < 0 )
                                  {
                                    topValue = topValue - topOffset;
                                  }
                                 scrollContentElement.css({top : topValue });
                                 },
                                 slide : function(event, ui) {
                                     var diff = scrollContentElement.height()
                                                 - outerContainerElement.height();
                                         var topValue = -((1 - (ui.value / sliderRange)) * diff);
                                         if (topValue !== 0)
                                         {
                                           topValue = topValue - topOffset;
                                         }
                                         scrollContentElement.css({top : topValue});
                                     }
                                 });
                         if(options.scrollbarType){
                             this._setScrollbarType(options.scrollbarType,this.ySlider);
                             }
                         }


                     };

this.refreshScrollbars = _.bind(function() {
  //handle refresh only if the scroll pane overflows
  //else the scrollbar is hidden
  //The minimum height if not set in options set at 20px
  var minScrollbarHeight = options.minScrollbarHeight || 20;
  if(this.xScroll){
    if (this.getXOverflow() > 0 && this.getXOverflow() < 1) {
      this.xSlider.show();
      var xscrollbarWidth = this.outerContainerElement.width() * this.getXOverflow();

      this.xSlider.find(".ui-slider-handle").css({
        width : xscrollbarWidth,
        'margin-left' : -0.5 * xscrollbarWidth
      });
      var sliderWidth = this.outerContainerElement.height() - xscrollbarWidth;
      var xsliderMargin = xscrollbarWidth * 0.5;
      this.xSlider.css({
        width : sliderWidth,
        "margin-left" : xsliderMargin
      });
    }else{
      this.resetXScrollbar();
      this.xSlider.hide();                             }
    }

    if(this.yScroll){
       if (this.getYOverflow() > 0 && this.getYOverflow() < 1) {
        // handle height: same proportion from
        // contentElement height as contentElement height to
        // actual content.
        var yscrollbarHeight = minScrollbarHeight;
        var approxScrollbarHeight = this.outerContainerElement.height() * this.getYOverflow();
        if(approxScrollbarHeight > yscrollbarHeight){
          yscrollbarHeight = approxScrollbarHeight;
        }
        this.ySlider.find(".ui-slider-handle").css({
          height : yscrollbarHeight ,
          'margin-bottom' : -0.5 * yscrollbarHeight
        });
        var sliderHeight = this.outerContainerElement.height() - yscrollbarHeight;
        var sliderMargin = yscrollbarHeight * 0.5;
        this.ySlider.css({
          height : sliderHeight - this.topOffset,
          'margin-top' : sliderMargin + this.topOffset
        });
        this.ySlider.show();
        this._fixYSliderPosition();
      } else {
        this.resetYScrollbar();
        this.ySlider.hide();
      }
    }
    this.trigger('scrollbarsRefreshed');  
},this);

this._fixYSliderPosition = function(){
  var scrollbarLocatedInTheMostDown = this.getYScrollbarPosition() === 0;
  if (scrollbarLocatedInTheMostDown) {
    var expectedTop = this.outerContainerElement.height() - this.scrollContentElement.height() - this.topOffset;
    var currentTop = this.scrollContentElement.position().top;
    var delta = currentTop - expectedTop - this.ySlider.find('.ui-slider-handle').height();
    var position = delta * this.sliderRange / this.outerContainerElement.height();
    if(position >= 0){
      this.setYScrollbarPosition(position);
    }else{
      this.setYScrollbarPosition(0);
    }
  }
};

                    this.handleMouseWheel = function(event, delta) {
                        event.preventDefault();
                        if(this.isVisible()){
                            var speed = this.sliderRange * this.getYOverflow() / 3;
                            var sliderPosition = this.ySlider.slider("value");
                            sliderPosition = (delta * speed) + sliderPosition;
                            this.ySlider.slider("value", sliderPosition);
                        }
                    };

                    this.timer = 0;
                    /**
                     * the below method method delays refresh scrollbar call by 200milliSec
                     * this will handle in IE window resize multiple events and DOMSubtreeModified
                     * infinte events which can cause IE browser to hang
                     */
                    this.delayedRefreshOfScrollbars = function(){
                        clearTimeout (this.timer);
                        this.timer = setTimeout(this.refreshScrollbars, 200);
                    };

                    this.handleArrowUpDown = function(delta){
                        if(this.isVisible()){
                            var speed = this.sliderRange * this.getYOverflow() / 3; //(1/overflow)*7;
                            var sliderPosition = this.ySlider.slider("value");
                            sliderPosition = (delta * speed) + sliderPosition;
                            this.ySlider.slider("value", sliderPosition);
                        }
                    };

                    this.handleArrowRightLeft = function(delta){
                        if(this.isVisible()){
                            var speed = this.sliderRange * this.getXOverflow() / 3; //(1/overflow)*7;
                            var sliderPosition = this.xSlider.slider("value");
                            sliderPosition = (delta * speed) + sliderPosition;
                            this.xSlider.slider("value", sliderPosition);
                        }
                    };

this.isVisible = function(){
  if(this.ySlider.css('display') == 'none'){
    return false;
  }
  return true;
};


                    _.bindAll(this, 'refreshScrollbars', 'handleMouseWheel', 'delayedRefreshOfScrollbars');
                    if(!this.donotAutoHandleDOMModifiedEvent){
                        //unless instructed auto bind the DOMSubtreeModified event
                        this.scrollContentElement.on('DOMSubtreeModified', this.delayedRefreshOfScrollbars);
                    }
                    //handle mousewheel scrolling
                    this.outerContainerElement.on('mousewheel',this.handleMouseWheel);
                    //handle query resizable event
                    this.outerContainerElement.on('resizestop',this.refreshScrollbars);
                    //handle window resize
                    $(window).on('resize', this.delayedRefreshOfScrollbars);

                    //For responding to keyboard arrows
                    //this is set by default but if options.scrollingWithArrowKeys == false
                    //this is disabled
                    this._scrollWithArrowKeys = true;
                    if(!(options.scrollingWithArrowKeys && options.scrollingWithArrowKeys === 'false')) {
                        this.outerContainerElement.on('mouseover', _.bind(function() {
                            this.outerContainerElement.focus();
                            }, this));
                        this.outerContainerElement.on('mouseout', _.bind(function() {
                            this.outerContainerElement.blur();
                            }, this));
                    }

                    if(!this.outerContainerElement.attr('tabindex')){
                        this.outerContainerElement.attr('tabindex','-1');
                    }
                   /* this.outerContainerElement.focus(function(event){
                        event.preventDefault();
                    });*/
                    this.outerContainerElement.bind('keydown', _.bind(function (e) {
                        var keyCode = e.keyCode || e.which,
                            arrow = {left: 37, up: 38, right: 39, down: 40 };

                        switch (keyCode) {
                          case arrow.left : this.handleArrowRightLeft(-1);
                                           break;
                          case arrow.up : this.handleArrowUpDown(1);
                                         break;
                          case arrow.right : this.handleArrowRightLeft(1);
                                           break;
                          case arrow.down: this.handleArrowUpDown(-1);
                                          break;
                        }
                    },this));
        
                    _.extend(this, Backbone.Events);
                    this.addScrollbars();
                    this.refreshScrollbars();
                };
            return ScrollbarWidget;
    });
