/*global $*/
/*jshint devel:true */

define(['jquery'], function ($) {

    var OSSUISidebar = {

        _menuItems : {},
        _menuActions : {},

        register : function(args, fn) {

            var item = args.menuItem;
            if (item !== undefined) {
                this._menuItems[item] = args;
                var menuClass = args.menuClass;
                this._menuActions[item] = function(event) {
                    $('li.ossui-sidebar-menuitem').removeClass('active');
                    $('li.ossui-sidebar-menuitem').addClass('inactive');
                    $('li.' + menuClass).removeClass('inactive');
                    $('li.' + menuClass).addClass('active');

					// 'currentTarget' is the object that's listening for the event, whereas 'target'
					// is the actual element that received the event (possibly a child of current).
					var targetId = event.target.id;
					if (!_.isString(targetId) || targetId.length === 0) {
						targetId = event.currentTarget.id;
					}

                    fn.apply(this, [targetId]);
                };
            }

            return this;
        },

        activate : function() {

            for (var n in this._menuItems) {
                if (this._menuItems.hasOwnProperty(n)) {

                    var args = this._menuItems[n];
                    var fn = this._menuActions[n];

                    var menuClass = args.menuClass;
                    var menuLabel = args.menuLabel;
                    var menuId = args.menuId;

                    console.log('n=' + n + ',menuClass=' + menuClass + ",menuLabel=" + menuLabel);

                    $('#ossui-sidebar-menu').append(
                        '<li class="ossui-sidebar-menuitem ' + menuClass + ' inactive" id="'+menuId+'"><div class="ossui-sidebar-menuitem-text" id="'+menuId+'">' +
                            menuLabel + '</div></li>');

                    $('li.' + menuClass).click(fn);
                }
             }
        }
    };

    return function() {
        return OSSUISidebar;
    };

});
