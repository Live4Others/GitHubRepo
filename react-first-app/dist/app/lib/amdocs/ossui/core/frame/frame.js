/*global $*/
/*jshint devel:true */

define(['jquery','jquery.layout'], function ($) {

    var OSSUIFrame = {

        activate : function(layoutSelector) {
                _framelayout =
                    $(layoutSelector).layout({
                        initHidden: false,
                        fxName:"fadeIn",
                        resizable: false,
                        spacing_open : 0,
                        spacing_closed : 0,
                        speed:1000,
                        animatePaneSizing: true,
                        north: {size: 33, slidable: false, spacing_open: 0},
                        west: {
                            size: 115, 
                            slidable: false,
                            onopen : function() {
                                $(layoutSelector).find('#ossui-mainframe-sidebar-toggle').css('background-image', "url('/ossui-framework/res/amdocs/ossui/sidebar/I_teeth_grey_left_white.png')");
                            },
                            onclose : function() {
                                $(layoutSelector).find('#ossui-mainframe-sidebar-toggle').css('background-image', "url('/ossui-framework/res/amdocs/ossui/sidebar/I_teeth_grey_right_white.png')");
                            }
                        }
                    });
        },
        
        decorateFrame : function(frameDecorator){
            $(frameDecorator.titleSelector).html(frameDecorator.titleText);
            $("#ossui-mainframe-header-center-text").html(frameDecorator.frameCenterText);
            $("#ossui-mainframe-header-application").html(frameDecorator.headerText);
            $("#ossui-mainframe-header-user").html(frameDecorator.userName);
            $("#ossui-mainframe-header-logout").html(frameDecorator.loginInfo);
            _framelayout.addToggleBtn("#ossui-mainframe-sidebar-toggle", "west");
        },

        toggleAll : function() {
            $.each(["north","west"], function(i, pane) {
                $('body').toggle(pane);
            });
        }
    };

    return function() {
        return OSSUIFrame;
    };

});
