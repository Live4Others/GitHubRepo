/**
 * $Id: //depot/Applications/OSSUI/v10.1.0.0/components/ossui-client-zip/src/main/webapp/lib/amdocs/ossui/components/profile/model/ProfileCollection.js#1 $
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
define('ossui/widget/ProfileCollection',[
	'underscore', 
	'jquery',
	'lightsaber',
	'ossui/widget/ProfileModel' 
], function(_, $, Lightsaber, ProfileModel) {

	var ProfileCollection = Lightsaber.Core.Collection
	.extend({

		model : ProfileModel,

		options : {
			error : this.errorHandler,
			success : this.successHandler
		},

		initialize : function(request) {
			this.url = (($.isEmptyObject(request) === false) ? request.url : "");
			this.parentObject = ($.isEmptyObject(request.parentObject) === false)?request.parentObject:"";
			_.bindAll(this, 'successHandler', 'errorHandler', 'parse', 'fetch', 'getAllAttributes');

			// console
			// .log('DLElements Collection init');
			Lightsaber.Core.Collection.prototype.initialize
			.call(this);
		},

		// This is the function that gets called
		// on a successful load.
		successHandler : function(data, response) {
			for(var i=0; i< response.length;i++){
				if(response[i].active){
					this.trigger('SetSelectedProfile', response[i]);
					break;
				}
			}
			this.trigger('ProfilesFetchSuccess');
		},

		errorHandler : function(data, response) {
//			this.set(response);
			//                            console
			//                                    .error("DualList Collection  INNER :Error");

		},

		parse : function(response) {
			for(var i=0; i< response.length;i++){
				if(response[i].customized){
					response[i].displayValue = response[i].displayValue.concat(' *');
				}
			}
			return response;

		},

		fetch : function(objectId, objectClass) {
			this.options.success = this.successHandler;

			try { // catching network errors and the like
				Lightsaber.Core.Collection.prototype.fetch
				.call(this, this.options);
			} catch (error) {
				if ($.isEmptyObject(this.parentObject) === false) {
					this.parentObject.handleGlobalError(error);
				}
			}
		},

		getAllAttributes : function(objectId, objectClass) {
			this.fetch(objectId, objectClass);
		}

	});
	return ProfileCollection;
});
