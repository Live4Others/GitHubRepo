/*jshint devel:true, maxcomplexity: 11 */
define('ossui/widget/MenuView',['underscore','jquery','backbone',
    'text!lib/amdocs/ossui/components/menu/template/MenuItemTemplate.html',
    'text!lib/amdocs/ossui/components/menu/template/UpStemTemplate.html',
    'text!lib/amdocs/ossui/components/menu/template/DownStemTemplate.html',
    'ossui/widget/ScrollbarWidget','lightsaber','jquery.ui'],
    function(_, $, Backbone, MenuItemTemplate, UpStemTemplate, DownStemTemplate, OssuiScrollbar, Lightsaber) {

        var MenuView =  Lightsaber.Core.View.extend({

            menuIdAttribute : 'oss-ui-menu-id',
            subMenuIdAttribute : 'oss-ui-submenu-of-item',
            itemIdAttribute : 'oss-ui-menu-item-id',
            template : '<ul></ul>',
            vmKeys: {
                "data.menuitems" : "items"
            },

            initialize: function(options){
                _.bindAll(this, '_handleHideForStickyMenus', '_hideMenu', '_showMenu', 'repositionMenu');
                //to be moved to config params
                this.defaultMenuMaxHeight = '120';
                this.menuOptions = options.menuOptions;
                this.options = options;
                this.template = this.getConfig('template') || this.template;
                this.menuItemTemplate =
                    _.template(this.menuOptions.menuItemTemplate || MenuItemTemplate);
                this.titleTemplate = this.menuOptions.titleTemplate;
                this.menuIdAttribute = this.getConfig('menuIdAttribute') || this.menuIdAttribute;
                this.itemIdAttribute = this.getConfig('itemIdAttribute') || this.itemIdAttribute;
                this.scrollbar = null;

                this.viewModel.on('items:reset',this._loadMenuItems , this);
                this.viewModel.on('items:reset',this._decorate , this);
                this.viewModel.on('items:loaded',this._loadMenuItems , this);
                this.viewModel.on('items:loaded',this._decorate , this);
                this.viewModel.on('items:added',this._refresh , this);
                //this is the state for the menu which can have values visible/hidden
                this.menuState = 'visible';
            },

            _postRender:function(){
                if(this.options.menuItems){
                    var items = this.options.menuItems;
                    var itemModels = [];
                    for(var i=0;i<items.length;i++){
                        itemModels[i] = new Lightsaber.Core.Model(items[i]);
                    }
                    if(items && items.length >0){
                        this.options.viewModel.models.data.reset(itemModels);
                    }
                }
            },

            _refresh:function(){
                //console.log('refreshing!');

            },

            _decorate: function(data){

                var $menuElement = $('#'+this.root.id);
                var $stemElement = null;
                if(this.menuOptions.stem){
                    $stemElement = this._addStem();
                }else{
                    var submenuOptions = this.menuOptions.submenuOptions;
                    $menuElement.menu(submenuOptions);
                }

                this.$stemElement = $stemElement;
                this.$menuElement = $menuElement;
                this._applyScrollability();

                if((this.menuOptions.stem &&this.menuOptions.hidden && this.menuOptions.hidden=='true')){
                    this._hideMenu();
                }
                //var scrollbar = this.scrollbar;
                this.menuClickAnchor = this.menuOptions.menuClickAnchor || this.$el;
                if(this.menuOptions.sticky){
                    this.menuClickAnchor.on('click',this._showMenu);
                }else{
                    this.menuClickAnchor.on('mouseenter',this._showMenu);
                }
                //var $menuModule = this.$el;
                //var selectorForClosingStickyMenu = 'body :not(' + this.menuClickAnchor.selector + ',' + this.menuClickAnchor.selector + ' *)';
                if(this.menuOptions.sticky){
                    $('body').on('click',this._handleHideForStickyMenus);
                } else{
                    this.menuClickAnchor.on('mouseleave',this._hideMenu);
                }
                this.$menuElement.trigger('menu:created',this);
            },

            _applyScrollability:function(){
                var menus = $(this.el).find('.'+this.menuOptions.menuClassName);
                var self = this;
                $.each(menus,function(index, value){
                    if(self.menuOptions.ossuiScrollbar){
                    self._makeElementScrollable(value);
                    }
                });
            },

            _handleHideForStickyMenus : function(event){
                if(this.menuClickAnchor.find($(event.target)).length === 0 && !(this.menuClickAnchor.is($(event.target)))) {
                    
                    if ( !this.menuOptions.sticky || !this._isClickedParentMenuItem() ){
                        this._hideMenu(event);
                    }
                    
                }
            },

            _hideMenu : function(event){
                if(this.menuState === 'visible'){
                    this.menuState = 'hidden';
                    //close submenus
                    if(this.$menuElement.data('ui-menu')) {
                        this.$menuElement.menu("collapseAll",null,true);
                    }
                    if(this.$stemElement){
                        this.$stemElement.hide();
                        }
                    this.$menuElement.hide();
                    if(event){
                        event.stopPropagation();
                    }
                }

            },

            _showMenu : function(event){
                if(this.menuState === 'hidden' ){
                    this.menuState = 'visible';
                    if(this.$stemElement){
                        this.$stemElement.show();
                        }
                    this.$menuElement.show();
                    if(event){
                        event.stopPropagation();
                    }
                    this.repositionMenu();
                    if(this.scrollbar){
                        this.scrollbar.refreshScrollbars();
                    }
                } else if(this.menuState === 'visible' ){
                    
                    if ( !this.menuOptions.sticky || !this._isClickedParentMenuItem() ){
                        this._hideMenu(event);
                    }
                    
                }
            },
            
            _isClickedParentMenuItem : function() {
                var menuItem = $(this._getMenuElement()).find("li:hover");                
                return this._hasSubMenuItems(menuItem);
            },
            
            _hasSubMenuItems : function(menuItem) {
                return menuItem !== null && typeof menuItem !== 'undefined' && menuItem.length == 1 && menuItem.children("ul").length > 0;
            },

            _makeElementScrollable: function(element){
                var $element = element;
                if(!($element instanceof jQuery)){
                    $element = $(element);
                }
                $element.contents().wrapAll('<div class="ossui-scrollable-items"/>');
                if(this.menuOptions.ossuiScrollbar && $element.hasClass($element.attr('ossui-scrollable-class-name'))){
                    var menuHeight = this.defaultMenuMaxHeight ;
                    if(this.menuOptions.menuMaxHeight){
                        menuHeight =    $element.outerHeight() < this.menuOptions.menuMaxHeight ? $element.outerHeight() : this.menuOptions.menuMaxHeight;
                      }
                    //$element.css('height', menuHeight+'px');
                    this.scrollbar = new OssuiScrollbar({scrollbarScrollPane:this.$('.ossui-scrollable-items'), scrollbarViewPort : $element,
                        scrollbarType : 'ossui-popup-scrollbar', scrollbarOrientation : 'vertical', scrollingWithArrowKeys : 'false',
                        scrollbarViewPortHeight:  menuHeight+'px', donotAutoHandleDOMModifiedEvent : true });
                }  //else HTML default scrollbar will be used
            },

            _addStem: function(){

                var stemTemplate = null;

                if(this.menuOptions.stem.stemTemplate){
                    stemTemplate = this.menuOptions.stem.stemTemplate;
                }else if(this.menuOptions.direction){

                    if(this.menuOptions.direction === 'down'){
                        stemTemplate = UpStemTemplate;
                    }
                    if(this.menuOptions.direction === 'up'){
                        stemTemplate = DownStemTemplate;
                    }

                }

                var $stemElement = $(stemTemplate);
                $stemElement.addClass('ossui-popup-pointer-arrow');

                var stemOptions = this.menuOptions.stem;
                var $menuElement = $('#'+this.root.id);
                if(!(stemOptions.popupMenuAnchorElement || stemOptions.popupMenuAnchorTemplate))    {
                    //no anchor element/template specified so giving a default template
                    this.popupMenuAnchorTemplate = '<a href="blank" class="ossui-menu-top-link">Ossui fall down Menu</a>';
                }else {
                    this.popupMenuAnchorTemplate = stemOptions.popupMenuAnchorTemplate;
                }
                var $popupMenuAnchorElement = stemOptions.popupMenuAnchorElement || $(this.popupMenuAnchorTemplate);
                var submenuOptions = this.menuOptions.submenuOptions;
                $menuElement.menu(submenuOptions);   //create menu


                this._addHorizontalStems($menuElement);
                $('.ossui-popup-submenu-pointer-arrow').hide();

                this._applyDirection($stemElement,$menuElement,$popupMenuAnchorElement);

                if(this.menuOptions.state == 'disable'){
                    $menuElement.menu("disable");
                }

                this.popupMenuAnchor = $popupMenuAnchorElement;


                return $stemElement;
            },

            _applyDirection: function($stemElement,$menuElement,$popupMenuAnchorElement){

                var stemOptions = this.menuOptions.stem;
                var menuAnchorPosition = null;
                var pointerPosition = null;
                var menuPosition = null;
                if(this.menuOptions.direction=='down'){
                    if(this.popupMenuAnchorTemplate){
                        //append the anchor only if this element is present
                        //do not attempt to append element which is already
                        //present
                        this.$el.append(this.popupMenuAnchorTemplate);
                    }
                    this.$el.append($stemElement);
                    this.$el.append($menuElement);
                    menuAnchorPosition = stemOptions.popupMenuAnchorPosition || {of: this.$el, my: 'center top', at: 'center top'};
                    pointerPosition = stemOptions.stemPosition || { of: $popupMenuAnchorElement, my: 'center center', at: 'center bottom'};
                    menuPosition = stemOptions.rootMenuPosition || { of: $stemElement, my: 'center+12px top', at: 'center bottom'};

                } else if(this.menuOptions.direction=='up'){
                    if(this.popupMenuAnchorTemplate){
                        this.$el.append(this.popupMenuAnchorTemplate);
                    }
                    this.$el.append($menuElement);
                    this.$el.append($stemElement);
                    menuAnchorPosition = stemOptions.popupMenuAnchorPosition || {of: this.$el,  my: 'center top', at: 'center top'};
                    pointerPosition = stemOptions.stemPosition || { of: $popupMenuAnchorElement,  my: 'center center', at: 'center top'};
                    menuPosition = stemOptions.rootMenuPosition || { of: $stemElement, my: 'center+12px bottom', at: 'center top'};

                    /*$menuElement.position(stemOptions.rootMenuPosition);
                     $stemElement.position(stemOptions.stemPosition);
                     $popupMenuAnchorElement.position(stemOptions.popupMenuAnchorPosition);*/
                }
                //$popupMenuAnchorElement.position(menuAnchorPosition);
                $stemElement.position(pointerPosition);
                $menuElement.position(menuPosition);
            },
            _addHorizontalStems: function(topMenu){
                var subMenus = topMenu.find('[oss-ui-submenu-of-item]');
                var i = 0;
                while(i < subMenus.length){
                    var $subMenu = $(subMenus[i]);
                    var expandableItemId = $subMenu.attr('oss-ui-submenu-of-item');
                    var $expandableItem = topMenu.find("[oss-ui-menu-item-id='"+expandableItemId+"']");
                    this._addSubmenuArrowPointer(topMenu,$subMenu,$expandableItem);
                    i++;
                }
            },

            _addSubmenuArrowPointer: function(topMenu,subMenu,item){
                var $sideStem = this._createSubmenuArrowPointer();
                var expandDirection = this.menuOptions.expandDirection;
                var popDirection = this.menuOptions.direction;

                if(expandDirection=='right' && popDirection=='up' || expandDirection=='left' && popDirection=='down'){
                    $sideStem.addClass('ossui-arrow-rotate-90deg');
                }else if(expandDirection=='left' && popDirection=='up' || expandDirection=='right' && popDirection=='down'){
                    $sideStem.addClass('ossui-arrow-rotate-240deg');
                }

                var stemPositioning = {of:item, my:'left+6px center', at:expandDirection+' center'};
                $sideStem.insertBefore(subMenu);
                $sideStem.position(stemPositioning);


                subMenu.on('onmenufocus',null,subMenu,function(data){
                    console.log('subMenu:onmenufocus!');
                }  );
                subMenu.on('menufocus',null,subMenu,function(data){
                    console.log('subMenu:menufocus!');
                } );
                /*subMenu.on('menublur',null,subMenu,function(data){
                 console.log('subMenu:menublur!');
                 } );


                 topMenu.on('onmenufocus',null,topMenu,function(data){
                 console.log('topMenu:onmenufocus!');
                 }  );*/

                /*function _hideArrow(item,menu){
                 console.log('topMenu:menublur');
                 var linkInFocus = item.children('.ui-state-focus');
                 var arrow2hide = linkInFocus.sibling('.ossui-popup-submenu-pointer-arrow');
                 arrow2hide.hide();
                 };

                 function _showArrow(item,menu){
                 console.log('topMenu:menufocus');
                 var linkInFocus = item.children('.ui-state-focus');
                 var arrow2show = linkInFocus.sibling('.ossui-popup-submenu-pointer-arrow');
                 arrow2show.show();
                 };*/

                item.mouseenter(function(){
                    if(item.children('.ui-menu').attr('aria-hidden')==='true'){ //if item's submenu is active
                        $('.ossui-popup-submenu-pointer-arrow').hide();
                        item.children('.ossui-popup-submenu-pointer-arrow').delay(300).show(0);
                    }

                });
                item.mouseleave(function(){
                    if(item.children('.ui-menu').attr('aria-hidden') ||  item.children('.ui-menu').attr('aria-hidden')=='true'){  //if item's submenu is hidden
                        item.children('.ossui-popup-submenu-pointer-arrow').hide();
                    }

                });
            },

            _createSubmenuArrowPointer: function(){
                var $arrow = $(this.menuOptions.submenuStemTemplate);
                $arrow.addClass('ossui-popup-submenu-pointer-arrow');
                return $arrow;
            },

            _loadMenuItems : function(data) {
                this.$root.empty();
                this._addMenuItems(data);
            },

            _addMenuItems : function(data) {
                var menuItems = data.items || [data.item];
                var i = menuItems.length;

                while(i--) {
                    this._addMenuItem(menuItems[menuItems.length - i - 1], menuItems.length-i,(i===0));
                }

            },

            _getMenuElement: function(){
                var $menuEl = $(this.$root);
                if(!$menuEl.attr(this.menuIdAttribute) || $menuEl.attr(this.menuIdAttribute) ===''){ // => top level menu
                    $menuEl.attr(this.menuIdAttribute,'top-level-menu'+'-'+this._config.id);
                    $menuEl.addClass(this.menuOptions.menuClassName);
                    if(this.titleTemplate){
                        $menuEl.append($(this.titleTemplate));
                    }
                }
                return $menuEl;
            },

            _addMenuItem: function(data,index,isLastItem){
                var $menuEl = this._getMenuElement();

                data.menuItemId = index;


                if(data.scrollable){
                    this._addScrollabilityIndicators($menuEl,data);
                    return 'scrollable';
                }

                var $menuItem = this._createMenuItemElement(data);
                if(data.disabled == 'true'){
                    $menuItem.addClass('ui-state-disabled');
                    $menuItem.attr("aria-disabled", "true");
                }else if(data.submenu){
                    this._addSubMenuItems(data,$menuItem);
                    this._removeScrollabilityIndicators($menuEl);
                }
                $menuEl.append($menuItem);
                if(!isLastItem ){
                    $menuEl.append('<div></div>');
                }
                if(data.eventArgs){
                    for(var eventIndex = 0;  eventIndex < data.eventArgs.length ; eventIndex++){
                        var eventArg = data.eventArgs[eventIndex];
                        $menuItem.on(eventArg.event,null,$menuItem,$.proxy(eval(eventArg.func),$menuItem));
                    }
                }

                if( !this.menuOptions.sticky || !this._hasSubMenuItems($menuItem) ){
                    $menuItem.on('click', this._hideMenu);
                }
                
                return $menuItem;
            },

            _addSubMenuItems : function(item,context) {

                var items = item.submenu;
                var i = items.length;
                var subMenuElement = $(this.template).attr(this.subMenuIdAttribute,item.menuItemId);
                $(context).append(subMenuElement);  //add sub list tag

                while(i--) {
                    this._addSubMenuItem(subMenuElement,items[items.length - i - 1], items.length-i,(i===0));
                }
                return context;

            },

            _addSubMenuItem: function($menu,item,index,isLastItem){
                item.menuItemId = $menu.attr(this.subMenuIdAttribute)+'.'+index;
                $menu.addClass(this.menuOptions.menuClassName);
                if(item.scrollable){
                    this._addScrollabilityIndicators($menu, item);
                    return 'scrollable';
                }
                var $newSubmenuItem;
                var $subMenuItem = this._createMenuItemElement(item);
                if(item.disabled == 'true'){
                    $subMenuItem.addClass('ui-state-disabled');
                    $subMenuItem.attr("aria-disabled", "true");
                } else if(item.submenu){
                    $newSubmenuItem = this._addSubMenuItems(item, $subMenuItem);
                    this._removeScrollabilityIndicators($menu);
                }else{
                    $newSubmenuItem = $subMenuItem;
                }
                if(item.eventArgs){
                    //var eventIndex, eventArg;
                    for(var eventIndex = 0;  eventIndex < item.eventArgs.length ; eventIndex++){
                        var eventArg = item.eventArgs[eventIndex];
                        $newSubmenuItem.on(eventArg.event,null,$newSubmenuItem,$.proxy(eval(eventArg.func),$newSubmenuItem));
                    }
                    /*var eventName = item.eventArgs.event;
                    $newSubmenuItem.on(eventName,null,$newSubmenuItem,$.proxy(eval(item.eventArgs.func),$newSubmenuItem));*/
                }
                $newSubmenuItem.on('click', this._hideMenu);
                $menu.append($newSubmenuItem);
                if(!isLastItem ){
                    $menu.append('<div></div>');
                }
            } ,

            _createMenuItemElement: function(item){

                if(this.menuOptions.expandDirection == 'left'){
                    item.iconalign = 'ossui-menu-item-icon-right';
                    item.itemtextalign = 'ui-menu-item-text-align-right';
                } else if(this.menuOptions.expandDirection == 'right'){
                    item.iconalign = 'ossui-menu-item-icon-left';
                    item.itemtextalign = 'ui-menu-item-text-align-left';

                }
                var itemTemplate = this.menuItemTemplate;
                if(item.template){
                    itemTemplate = item.template;
                }
                return $(itemTemplate(item));
            },


            _addScrollabilityIndicators: function ($menu, item) {

                if(item.scrollable.classname){
                    $menu.addClass(item.scrollable.classname);
                    $menu.attr('ossui-scrollable-class-name',item.scrollable.classname);
                }
            },

            _removeScrollabilityIndicators: function ($menu){
                var scrollabilityClassName = $menu.attr('ossui-scrollable-class-name');
                if(scrollabilityClassName){
                    $menu.removeClass(scrollabilityClassName);
                    $menu.removeAttr('ossui-scrollable-class-name');
                }
            },

            repositionMenu : function(){
                var menuStateBeforePosition = this.menuState;
                //jQuery position does not work for hidden elements
                //hence showMenu is called before reposition
                /*if(menuStateBeforePosition === 'hidden'){
                    this.showMenu();
                }  */
                var stemOptions = this.menuOptions.stem;
                var menuAnchorPosition = null;
                var pointerPosition = null;
                var menuPosition = null;
                if(this.menuOptions.direction=='down'){
                    menuAnchorPosition = stemOptions.popupMenuAnchorPosition || {of: this.$el, my: 'center top', at: 'center top'};
                    pointerPosition = stemOptions.stemPosition || { of: this.popupMenuAnchor, my: 'center center', at: 'center bottom'};
                    menuPosition = stemOptions.rootMenuPosition || { of: this.$stemElement, my: 'center+12px top', at: 'center bottom'};

                } else if(this.menuOptions.direction=='up'){
                    menuAnchorPosition = stemOptions.popupMenuAnchorPosition || {of: this.$el,  my: 'center top', at: 'center top'};
                    pointerPosition = stemOptions.stemPosition || { of: this.popupMenuAnchor,  my: 'center center', at: 'center top'};
                    menuPosition = stemOptions.rootMenuPosition || { of: this.$stemElement, my: 'center+12px bottom', at: 'center top'};
                }
                this.$stemElement.position(pointerPosition);
                this.$menuElement.position(menuPosition);
               /* if(menuStateBeforePosition === 'hidden'){
                    this.hideMenu();
                }  */
            },

            getWidget: function(){
                return $('#'+this.root.id).menu("widget");
            },

            showMenu : function(){
                //showMenu is called externally so need to bind the
                //hide of the menu also
                this._showMenu();
            },

            hideMenu : function(){
                this._hideMenu();
            },

            destroy: function() {
                this.viewModel.off();
                this.options.menuItems.length = 0;
                this.menuClickAnchor.off();
                $('body').off('click',this._handleHideForStickyMenus);
            }
        });
        return MenuView;
    });
