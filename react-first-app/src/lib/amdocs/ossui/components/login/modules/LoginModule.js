define('ossui/widget/LoginModule',[
    'jquery',
    'underscore',
    'lightsaber',
    'ossui/widget/LoginDialog',
    'ossui/widget/LoginViewModel'
    ],
    function($, _, Lightsaber, LoginDialog, LoginViewModel, loginModuleTemplate) {

  var loginModule = Lightsaber.Module.extend({

            template :  '<div id="loginView" class ="loginView ossui-splash-screen"></div>',

            // Behaviour Detection: Device features are sent as Query Parameters to the Rest service
            makeQueryString : function(params) {
                return _.map(params, function(value, key) {
                    return key + '=' + value;
                }).join('&');
            },

            init : function(options) {
                _.bindAll(this, 'triggerLoginSuccess', 'triggerLoginFailure');

                // Behaviour Detection: Requires device feature detection which is stored as a temporary object
                var deviceFeatures = {
                    isTouchSupported : !!(("ontouchstart" in window) || window.DocumentTouch
                            && document instanceof window.DocumentTouch),
                    isOrientationSupported : ("orientation" in window),
                    deviceWidth : screen.width,
                    deviceHeight : screen.height,
                    usrAgent : (navigator.userAgent),
                    operatingSys : (navigator.platform)
                };
                var behaviourDetectionQueryParams = '?' + this.makeQueryString(deviceFeatures);
                if(typeof options.noBehaviourDetectionNeeded !== 'undefined' && options.noBehaviourDetectionNeeded === true) {
                    behaviourDetectionQueryParams = '';
                }
                    
                var LoginModel = Lightsaber.Core.RESTModel.extend({
                    // Behaviour Detection: Device features are sent as Query Parameters to the Rest service
                    url: (options.resturl || "lightsaber/secure/Login") + behaviourDetectionQueryParams,
                    defaults : {
                        user:'',
                        password:''
                    }
                });

                var loginModel =  new LoginModel(null,{rest:{
                    read:{
                        contentType: "application/json",
                        method: "POST"
                    }
                }
                });

                var loginViewModel = new LoginViewModel({

                    models : {
                        myModel : loginModel
                    },

                    dataBindings : [
                        { 'username' : 'models.myModel.user' ,
                            options : {
                                setOnBind : true,
                                twoWay : true
                            }
                        },
                        { 'password' : 'models.myModel.password' ,
                            options : {
                                setOnBind : true,
                                twoWay : true
                            }
                        }
                    ]
                });
                
                var productInfo, productInfoClass ;
                if( options.loadParams && options.loadParams.productInfo){
                    productInfo = options.loadParams.productInfo;
                    }
                if( options.loadParams && options.loadParams.productInfoClass){
                    productInfoClass = options.loadParams.productInfoClass;
                    }

                this.loginDialog = new LoginDialog({
                    productInfo : productInfo,
                    productInfoClass : productInfoClass,
                    viewModel : loginViewModel
                });
                loginViewModel.on('loginSuccess', this.triggerLoginSuccess);
                loginViewModel.on('loginError', this.triggerLoginFailure);
            },

            postInit : function(options){
                //render the loginDialog
                this.loginDialog.render();
                var thisLoginModule = this;
                $('.'+this.loginDialog.getConfig('dialogClass').replace(/\s+/g, '.')).on('keypress',function(e){
                    if(e && e.keyCode === 13 && thisLoginModule.loginDialog.$el.parent().find('.ui-button').attr('disabled') === undefined)
                    {
                        thisLoginModule.loginDialog.$el.parent().find('[type="button"].ui-button').focus().trigger('click');
                    }
                });
            },

            triggerLoginSuccess : function(){
                this.$el.empty();
                // Behaviour Detection : Response from server contains, 'loginResponse' which in turn contains an attribute 'user'
                var loginResponse = this.loginDialog.viewModel.models.myModel.get("loginResponse");
                if (_.isUndefined(loginResponse)) {
                    // BWC for version 9.0 for which the login response only contained the attribute user
                    loginResponse = this.loginDialog.viewModel.models.myModel.get("user");
                }
                this.trigger('LoginSuccess',loginResponse);
            },

            triggerLoginFailure : function(resp){
                this.trigger('LoginFailure',resp);
            }
        });
        return loginModule;
 });
