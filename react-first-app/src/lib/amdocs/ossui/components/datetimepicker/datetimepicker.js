/**
 * $Id: //depot/Applications/OSSUI/v10.1.0.0/components/ossui-client-zip/src/main/webapp/lib/amdocs/ossui/components/datetimepicker/datetimepicker.js#1 $ 
 * $DateTime: 2017/06/08 19:26:36 $ 
 * $Revision: #1 $ 
 * $Change: 1837971 $
 *
 * COPYRIGHT NOTICE:
 * Copyright (c) 2016 Amdocs.
 * The contents and intellectual property contained herein,
 * remain the property of Amdocs.
 *-----------------------------------------------------------------------------
 * This datetimepicker div is a thin wrapper around the http://eonasdan.github.io/bootstrap-datetimepicker/
 * to allow date and time picking features.
 * This wrapper adds the css class and will allow easy future enhancements of the
 * datetimepicker
 * parameters that can be passed in options
 * options = {
 *  el = <dom or jquery dom element>, this is where the datetimepicker will be shown, 
 *        this can be a input element or a div with input-group which wraps an
 *        input element and a calendar icon span see the eonasdan/bootstrap-datetimepicker for examples
 *  showDPOnInputClick = true/false, if this is set as true in the options then the datepicker shows up
 *                       on click of the input field as well when it is grouped with a calendar icon
 *                       (OOB the eonasdan/datetimepicker/ when grouped with calendar icon shows up only
 *                       when the calendar button is clicked) 
 *  
 *                        
 * }
 * Methods 
 * testMethod : just a test method currently showing how we can ehnahance the datetimepicker to add 
 *              our own methods and make them accessible same as the OOB methods provided by the 
 *              thirdparty lib
 *--------------------------------------------------------------------------------
 */
define('ossui/widget/DateTimePicker',
['jquery',
 'jquery.ui',
 'underscore'
 ],
 function($,$$,_){
    var ossuidatetimepicker = function(options){
        require(['bootstrap',
                 'moment',
                 'bootstrap-datetimepicker'], function(Bootstrap,Moment,bootstrapdatetimepicker){
            if(_.isUndefined($.fn.bootstrapBtn)){
                //bootstrap has a button method defined which clashes with
                //jQuery button method hence below has to be done
                var bootstrapButton = $.fn.button.noConflict(); // return $.fn.button to previously assigned value
                $.fn.bootstrapBtn = bootstrapButton;         // give $().bootstrapBtn the Bootstrap functionality
             }
            var $el = options.el;
            var ossuiOptions = ["el","showDPOnInputClick"];
            //testMethod is just a testmethod to show how the ossuidatetimepicker can be
            //enhanced to add new methods and added to the jquery data object
            //allow it to be accessed similar to the other datetimepicker funtions
            var testMethod = function(){
                console.log("in testmethod");
            };
            if(_.isUndefined($el)){
                throw Error("please provide a valid input element to initialize a DateTimePicker");
            }else{
                $($el).addClass("ossui-datetimepicker");  
                $($el).parent().addClass("ossui-datetimepicker-parent");
                var dpOptions = {};
                $.each(options,function(key){
                    if($.inArray(key,ossuiOptions) == -1){
                        dpOptions[key] = options[key];
                    }               
                });
                //create the datetimepicker
                $($el).datetimepicker(dpOptions);
                //now $($el).data("DateTimePicker") should be available 
                if(options.showDPOnInputClick && options.showDPOnInputClick === true && $($el).hasClass("input-group")){
                    $($el).find("input").on('click',function(){
                        $($el).data("DateTimePicker").show();
                    });           
                }
                //add new methods to the DateTimePicker data object  
                var orgData = $($el).data("DateTimePicker");
                if(typeof orgData === "object"){
                    orgData.testMethod = testMethod;
                }
            }
        });
            
            
        };
        return ossuidatetimepicker;
});
