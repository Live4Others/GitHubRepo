/*
 * $Id: //depot/Applications/OSSUI/v10.1.0.0/components/ossui-client-zip/src/main/webapp/lib/amdocs/ossui/ossui-frame.js#1 $
 * $DateTime: 2017/06/08 19:26:36 $
 * $Revision: #1 $
 * $Change: 1837971 $
 *
 * COPYRIGHT NOTICE:
 * Copyright (c) 2013 Amdocs.
 * The contents and intellectual property contained herein,
 * remain the property of Amdocs.
 */

define('ossui_frame', [ 'lib/amdocs/ossui/components/sidebar/sidebar', 'lib/amdocs/ossui/core/frame/frame' ],

function(sidebar, frame) {

    var ossui = {
        Sidebar : sidebar,
        Frame : frame
    };

    return ossui;
}

);
