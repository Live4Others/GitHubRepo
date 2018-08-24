/**
 * $Id:
 * //depot/Applications/OSSUI/main/components/ossui-container-war/src/main/webapp/lib/amdocs/ossui/components/breadcrumbs/view/BreadcrumbsView.js#8 $
 * $DateTime: 2017/06/08 19:26:36 $ $Revision: #1 $ $Change: 1837971 $
 * 
 * COPYRIGHT NOTICE: Copyright (c) 2013 Amdocs. The contents and intellectual
 * property contained herein, remain the property of Amdocs.
 * 
 * @memberOf OSSUI.widgets
 * @name BreadcrumbsView
 * @class BreadcrumbsView
 * @type View
 * @description This class extends from Lightsaber BreadcrumbsView to give
 *              additional functionality of allowing the applications to manage
 *              the lifecycle of the breadcrumbs If the application wants to
 *              preview an old breadcrumb item without deleting the
 *              new/proceeding breadcrumbs then the attribute
 *              applicationMangedBC : true should be set else it is a
 *              selfmanaged breadcrumb where in the proceeding breadcrumb items
 *              are automatically deleted when user clicks on any older
 *              breadcrumb item.
 * 
 * If applicationMangedBC is set it is the application's responsibility to
 * remove the old breadcrumbs if there is change in data/event by calling
 * removeAfterRoute.
 * 
 * If the application wants to add its own template to the breadcrumbs it can do
 * so by providing the template, itemTemplate and lastItemTemplate in the config
 * during the breadcrumb instantiation. The application should take care of
 * maintaining the data-uxf-point same as the BreadcrumbsView's templates to
 * prevent any adverse effect on the functionality of the breadcrumbs.
 * 
 * @example 1 --> create an application managed breadcrumb this.bc = new
 *          Ossui.BreadcrumbsView({ config : { el : '#breadcrumbs' }, viewModel :
 *          new Lightsaber.Core.ViewModel(), });
 *          this.bc.setApplicationManagedBC(true);
 * 
 * @example 2 --> create an application managed breadcrumb this.bc = new
 *          Ossui.BreadcrumbsView({ config : { el : '#breadcrumbs',
 *          applicationMangedBC : true, }, viewModel : new
 *          Lightsaber.Core.ViewModel(), });
 * @example 3 --> add breadcrumbs, load a new module to the current module and
 *          pass the breadcrumb object in the options which can be used by the
 *          new module being loaded this.load('content11/code3', {breadcrumb :
 *          this.bc}); this.bc.add({ route : 'content11/code3', name : 'code3',
 *          handler : _.bind(function() { this.load('content11/code3',
 *          {breadcrumb : this.bc}); }, this) });
 * 
 * @example 4 --> to remove all breadcrumb items after given route
 *          content11/code3 this.bc.removeAfterRoute(content11/code3)
 * 
 * @example 5 --> to add customised template during the breadcrumb instantiation
 *          this.bc = new Ossui.BreadcrumbsView({ config : { el :
 *          '#breadcrumbs', itemTemplate : '
 *          <li style="float: left;"><a data-uxf-point="anchor_<%=route%>"
 *          class="ossui-breadcrumbs-item"><%=name%></a><span
 *          class="ossui-breadcrumbs-divider"> *; </span></li>',
 *          lastItemTemplate : '
 *          <li style="float: left;"><a data-uxf-point="anchor_<%=route%>"
 *          class="ossui-breadcrumbs-selecteditem"><%=name%></a><span
 *          class="ossui-breadcrumbs-divider"> *; </span></li>' }, viewModel :
 *          new Lightsaber.Core.ViewModel(), });
 */
define(
        'ossui/widget/BreadcrumbsView',
        [
                'jquery',
                'underscore',
                'lightsaber',
                'text!lib/amdocs/ossui/components/breadcrumbs/view/template/bctemplate.html',
                'text!lib/amdocs/ossui/components/breadcrumbs/view/template/bcitemtemplate.html',
                'text!lib/amdocs/ossui/components/breadcrumbs/view/template/bclastitemtemplate.html',
                'ossui/helper/BreadcrumbsOverflowHandler' ],
        function($, _, Lightsaber, bcTemplate, bcItemTemplate,
                bcLastItemTemplate, BreadcrumbsOverflowHandler) {

            var breadcrumbsView = Lightsaber.BreadcrumbsView
                    .extend({

                        bctemplate : bcTemplate,
                        bcitemTemplate : bcItemTemplate,
                        bclastItemTemplate : bcLastItemTemplate,
                        applicationMangedBC : false,

                        initialize : function() {
                            this._super();
                            this.template = this.getConfig('template') ? _
                                    .template(this.getConfig('template')) : _
                                    .template(this.bctemplate);
                            this.itemTemplate = this.getConfig('itemTemplate') ? _
                                    .template(this.getConfig('itemTemplate'))
                                    : _.template(this.bcitemTemplate);
                            this.lastItemTemplate = this.getConfig('lastItemTemplate') ? _
                                    .template(this.getConfig('lastItemTemplate'))
                                    : _.template(this.bclastItemTemplate);
                            var applicationMangedBCVal = this
                                    .getConfig('applicationMangedBC');
                            if (true === applicationMangedBCVal) {
                                this.applicationMangedBC = applicationMangedBCVal;
                            }
                            this.bcOverflowHandler = new BreadcrumbsOverflowHandler(
                                    {
                                        breadcrumbsElement : this.$el
                                    });
                        },
                        /**
                         * Overriden If applicationMangedBC then the module
                         * creating the BC should be responsible to remove the
                         * BC on change of data in page by calling
                         * removeAfterRoute else the default UXF feature is
                         * maintained where on click of any previous BC the
                         * proceeding BCs are removed
                         * 
                         * @param config :
                         *            config parameter for handling load
                         */
                        _handleSelect : function(config) {
                            if (!this.applicationMangedBC) {
                                this._super(config);
                            } else {
                                this._update(config);
                                config.handler.apply(this, [ config ]);
                            }
                        },

                        /**
                         * Overriden to handle overflow of breadcrumbs
                         */
                        add : function(config) {
                            this._super(config);
                            this.bcOverflowHandler.checkOverflow();
                        },
                        /**
                         * Overriden to handle overflow of breadcrumbs
                         */
                        remove : function(route) {
                            this._super(route);
                            this.bcOverflowHandler.checkOverflow();
                        },
                        /**
                         * This method recalculates and updates the breadcrumb
                         * items based on the selected item
                         * 
                         * @param config
                         */
                        _update : function(config) {
                            if (config) {
                                this.$el
                                        .find(
                                                '.ossui-breadcrumbs-item.ossui-breadcrumbs-selecteditem')
                                        .removeClass(
                                                'ossui-breadcrumbs-selecteditem');
                                this.$el.find(
                                        '[data-uxf-point="anchor_'
                                                + config.route + '"]').closest(
                                        "li").addClass(
                                        'ossui-breadcrumbs-selecteditem');
                            } else {
                                // this._super();
                                // below lines are from duplicated from
                                // LS:breadcrumbs but with
                                // enhancement to add the breadcrumbIcon
                                var $root = this.$root.detach();
                                $root.empty();
                                $root.find('[data-uxf-point]').each(
                                        function(index, element) {
                                            $(element).off();
                                        });

                                for ( var i = 0, length = this.routes.length - 1; i <= length; i++) {
                                    if (i === length) {
                                        $root
                                                .append(this
                                                        .lastItemTemplate(this.routes[i]));
                                    } else {
                                        $root.append(this
                                                .itemTemplate(this.routes[i]));
                                    }
                                    this._attachSelectHandler($root,
                                            this.routes[i]);
                                    this._addTitleAttribute($root,
                                            this.routes[i]);
                                    this._addBreadcrumbIcon($root,
                                            this.routes[i]);
                                }
                                this.$el.append($root);
                            }
                            /*
                             * this.$el.find("div[data-uxf-point]").each(
                             * function(index) { $(this).attr('title',
                             * $(this).html()); });
                             */
                            // the last divider should be hidden
                            this.$el.find('.ossui-breadcrumbs-item').last()
                                    .find('.ossui-breadcrumbs-divider')
                                    .addClass(
                                            'ossui-breadcrumbs-divider-hidden');
                        },

                        _addBreadcrumbIcon : function($root, config) {
                            if (config.bcIconClass) {
                                $root.find(
                                        '[data-uxf-point="anchor_'
                                                + config.route + '"]').find(
                                        '.ossui-breadcrumb-icon').addClass(
                                        config.bcIconClass);
                            }
                        },

                        _addTitleAttribute : function($root, config) {
                            if (config.name) {
                                $root.find(
                                        '[data-uxf-point="anchor_'
                                                + config.route + '"]').attr(
                                       'title', $('<div/>').html(config.name).text());
                            }
                        },
                        /**
                         * Application can call this method to set the value of
                         * applicationMangedBC
                         * 
                         * @param bcManagement
                         *            applicationMangedBC: false --> click of
                         *            any previous BC the proceeding BCs are
                         *            removed applicationMangedBC : true -->
                         *            click of any previous BC the proceeding
                         *            BCs are not removed application removes
                         *            them specifically by calling
                         *            removeAfterRoute
                         */
                        setApplicationManagedBC : function(bcManagement) {
                            this.applicationMangedBC = bcManagement;
                        },

                        /**
                         * Method to remove all breadcrumbs after given
                         * route/moduleid this method does not do anything if it
                         * is applicationManged breadcrumb
                         * 
                         * @param route:
                         *            given route/moduleid after which all the
                         *            breadcrumb items should be removed
                         */
                        removeAfterRoute : function(route) {

                            if (this.applicationMangedBC) {
                                if (this.routePos[route] !== undefined) {
                                    var position = this.routePos[route] + 1;
                                    var routeLength = this.routes.length - 1;
                                    for ( var i = position; i <= routeLength; i++) {
                                        delete this.routePos[this.routes[i].route];
                                    }
                                    this.routes = this.routes
                                            .slice(0, position);
                                    this._update();
                                }
                            }
                            this.bcOverflowHandler.checkOverflow();
                        }

                    });
            return breadcrumbsView;

        });
