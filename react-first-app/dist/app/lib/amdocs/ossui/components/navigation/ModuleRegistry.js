/**
* $Id: //depot/Applications/OSSUI/v10.1.0.0/components/ossui-client-zip/src/main/webapp/lib/amdocs/ossui/components/navigation/ModuleRegistry.js#1 $
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

define(
        'ossui/navigation/ModuleRegistry',
        [ 'jquery', 'underscore', 'lightsaber' ],
        function($, _, Lightsaber) {

            /**
             * ModuleRegistry contains the list of modules participate in an Application
             * and its dependencies (i.e., - dependent modules)
             * 
             * Each entry in this registry represents a module and contains configuration 
             * details (module config) required to manage (load/instantiate) a module in
             * Lightsaber environment.
             * 
             * Also it can contain any specific configuration parameters required by that module.
             * 
             * Eg.: 'breadcrumbsSelector' - parameter is only configured for 'Breadcrumb controller'
             * and it needs that parameter.
             */
            var ModuleRegistry = function() {

            };
            
            /**
             * This object should be (prototype) extended by the application(s) 
             * by providing the list of modules to load and manage within that application.
             * 
             * <code>
             * Format:
             * 
             *      {
             *          'module_id_1' : [ {
             *                                  id : 'module_id_2',
             *                                  el : 'jquery selector of the DOM element to which this module will be attached.',
                                                module : 'app/amdocs/ann/container/pages/ann-search-tab',
                                                browserHistory : false,
             *                             }      
             *                          ],
             *                       
             *          'module_id_2' : [ {
             *                                  id : 'module_id_3',
             *                             }      
             *                          ], 
             *          .......
             *          .......
             *          .......
             *      }
             *      
             * </code>
             */
            ModuleRegistry.prototype.registryObject = {};
            
            /**
             * Retrieve the module configuration entries configured for a given module 
             * represented by given 'moduleId'
             * 
             * @param moduleId - ID of the module
             * @returns entries configured for the given module using it's id - 'moduleId'
             */
            ModuleRegistry.prototype.getModulesToRegister = function(moduleId) {
               
                //Way to deep clone. UnderscoreJS's clone is just a shallow copy.
               return $.extend(true, [], this.registryObject[moduleId]);
              
            };
            
            return ModuleRegistry;
        });