/**
* $Id: //depot/Applications/OSSUI/v10.1.0.0/components/ossui-client-zip/src/main/webapp/lib/amdocs/ossui/components/breadcrumbs/view/BreadcrumbsOverflowHandler.js#1 $ 
* $DateTime: 2017/06/08 19:26:36 $ 
* $Revision: #1 $ 
* $Change: 1837971 $
*
* COPYRIGHT NOTICE:
* Copyright (c) 2013 Amdocs.
* The contents and intellectual property contained herein,
* remain the property of Amdocs.
* */

/**
 * This class is a helper class for BreadcrumbsView widget to handle the overflow of breadcrumbs.
 * When the width of the all the breadcrumbs overflow the breadcrumbs container then the
 * breadcrumbs pagination happens and overflow next and overflow previous buttons/links appear which 
 * can take the user to different pages of the breadcrumbs trail.
 */

define('ossui/helper/BreadcrumbsOverflowHandler',['underscore','jquery'],
    function(_, $) {

                var BreadcrumbsOverflowHandler = function(options) {  
                                     
                    this.breadcrumbsElement = options.breadcrumbsElement;
                    this.overflowNextPageBt = '&#187;' ;
                    this.overflowPrevPageBt = '&#171;' ;
                    
                    /**
                     * This method handles the click on the overflow next button
                     * On click of the button the next breadcrumbs page is shown
                     * and the first breadcrumb in the page is selected
                     */
                    this.handleOverflowNextPgBt = function(){
                        if(this.currentPage < this.pages.length){
                            this.currentPage ++;
                        }
                        this.showCurrentPage();
                        var bcIndex = this.pages[this.currentPage].start;
                        //trigger click on the anchor element for the breadcrumb element to show that breadcrumb
                        $(this.breadcrumbsElement.find('.ossui-breadcrumbs').find('.ossui-breadcrumbs-item')[bcIndex]).
                                find('[data-uxf-point^="anchor_"]').trigger('click');
                    };
                    
                    /**
                     * This method handles the click on the overflow previous button
                     * On click of the button the previous breadcrumbs page is shown
                     * and the last breadcrumb in the page is selected
                     */
                    this.handleOverflowPrevPgBt = function(){
                        if(this.currentPage > 0){
                            this.currentPage --;
                        }
                        this.showCurrentPage();
                        var bcIndex = this.pages[this.currentPage].end - 1;
                        $(this.breadcrumbsElement.find('.ossui-breadcrumbs').find('.ossui-breadcrumbs-item')[bcIndex]).
                                   find('[data-uxf-point^="anchor_"]').trigger('click');
                    };
                    
                    /**
                     * This is method is the start point for all breadcrumb overflow checks
                     * if the breadcrumbs width increases beyond the container width the
                     * breadcrumbs overflow buttons appear
                     */
                    this.checkOverflow = function(){
                        var outerContainer = this.breadcrumbsElement.find('.ossui-breadcrumbs');
                        var innerBCItems = outerContainer.find('.ossui-breadcrumbs-item');  
                        var allBreadcrumbsWidth = 0;
                        innerBCItems.each(function(index){
                            allBreadcrumbsWidth += $(this).outerWidth(true);
                        });
                      //the left padding for the breadcrumbs has to be explicitly
                        //added since that does not get accounted for otherwise
                        //but this should be done refactored later to handle
                        //generically by accepting an input param instead of assuming
                        //20 px by default
                        allBreadcrumbsWidth += 20;
                        if(allBreadcrumbsWidth > outerContainer.outerWidth(true)){
                            this.handleBreadcrumbsOverflow(outerContainer, innerBCItems);
                        }
                    };
                    
                    /**
                     * This method creates the overflow next button
                     */
                    this.enableOverflowNext = function(outerContainer){
                        var classIdForOverflowNxtPage = 'ossui-breadcrumbs-overflow ossui-breadcrumbs-nextpage';
                        var overflowNextEl = $('<li></li>')
                        .addClass(classIdForOverflowNxtPage).click(this.handleOverflowNextPgBt).append($('<span></span>')                            
                                .html(this.overflowNextPageBt));
                        outerContainer.append(overflowNextEl);
                        this.overflowNextBtWidth = overflowNextEl.outerWidth(true);
                    };
                    
                    /**
                     * This method creates the overflow previous button
                     */
                    this.enableOverflowPrev = function(outerContainer){
                        var classIdForOverflowPrevPage = 'ossui-breadcrumbs-overflow ossui-breadcrumbs-prevpage';
                        var overflowPrevEl = $('<li></li>')
                        .addClass(classIdForOverflowPrevPage).click(this.handleOverflowPrevPgBt).append($('<span></span>')                            
                                .html(this.overflowPrevPageBt));
                        outerContainer.prepend(overflowPrevEl);
                        this.overflowPrevBtWidth = overflowPrevEl.outerWidth(true);
                    };
                    
                    /**
                     * TODO:
                     */                    
                    this.handleBreadcrumbsOverflow = function(outerContainer, innerBCItems){ 
                        this.enableOverflowNext(outerContainer);
                        this.enableOverflowPrev(outerContainer);
                        this.calculatePageWidth(outerContainer, innerBCItems);
                    };
                    
                    /**
                     * This method paginates the breadcrumbs and decides the currentPage
                     * which should be visible
                     */
                    this.calculatePageWidth = function(outerContainer, innerBCItems){
                        var pageIndex = 0;
                        //set the start point for first page
                        this.pages = [];
                        this.pages[pageIndex] = { start: 0 , pageWidth:0};
                        this.currentPage = 0;
                        var minPadding = 20;
                        for (var i = 0; i < innerBCItems.length; i++) {
                            if((this.pages[pageIndex].pageWidth + $(innerBCItems[i]).outerWidth(true) + this.overflowNextBtWidth + minPadding)
                                    > outerContainer.outerWidth(true)){
                                pageIndex++;
                                this.pages[pageIndex] = { start: i , pageWidth:this.overflowPrevBtWidth};
                            }
                            this.pages[pageIndex].pageWidth +=  $(innerBCItems[i]).outerWidth(true);
                            this.pages[pageIndex].end = i+1;
                            if($(innerBCItems[i]).hasClass('ossui-breadcrumbs-selecteditem')){
                                this.currentPage = pageIndex;
                            }
                        }
                        this.showCurrentPage();
                    };
                    
                    /**
                     * This method shows the page in which the selected breadcrumb is present while
                     * hiding all other breadcrumbs
                     */
                    this.showCurrentPage = function(){                        
                        var outerContainer = this.breadcrumbsElement.find('.ossui-breadcrumbs');
                        var innerBCItems = outerContainer.find('.ossui-breadcrumbs-item');  
                        this.showOverflowBt(outerContainer, '.ossui-breadcrumbs-nextpage');
                        this.showOverflowBt(outerContainer, '.ossui-breadcrumbs-prevpage');
                        
                        innerBCItems.hide().slice(this.pages[this.currentPage].start, this.pages[this.currentPage].end).show(100);
                        
                        if(this.currentPage  == (this.pages.length - 1)){
                            this.hideOverflowBt(outerContainer, '.ossui-breadcrumbs-nextpage');
                        }
                        if(this.currentPage  === 0){
                            this.hideOverflowBt(outerContainer, '.ossui-breadcrumbs-prevpage');
                        }
                    };
                    
                    this.timer = 0;
                    /**
                     * Method to handle the breadcrumbs overflow on window resize
                     */
                    this.handleWindowResize = function(){
                        clearTimeout (this.timer);
                        this.timer = setTimeout(this.resetBCOnResize, 200);
                    };
                    
                    this.resetBCOnResize = function(){
                        var outerContainer = this.breadcrumbsElement.find('.ossui-breadcrumbs');
                        outerContainer.find('.ossui-breadcrumbs-overflow').remove();
                        outerContainer.find('.ossui-breadcrumbs-item').show(); 
                        this.checkOverflow();
                    };
                    
                    this.hideOverflowBt = function(container, selector){
                        container.find(selector).hide();
                    };
                    
                    this.showOverflowBt = function(container, selector){
                        container.find(selector).show();
                    };
                    _.bindAll(this, 'handleOverflowPrevPgBt', 'handleOverflowNextPgBt', 'handleWindowResize', 'checkOverflow', 'resetBCOnResize');
                    $(window).on('resize', this.handleWindowResize);
                };
            return BreadcrumbsOverflowHandler;
    });
