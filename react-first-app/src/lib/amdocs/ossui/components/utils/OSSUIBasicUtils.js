/*
 * $Id$ 
 * $DateTime$ 
 * $Revision$ 
 * $Change$
 * 
 * COPYRIGHT NOTICE:
 * Copyright (c) 2012 Amdocs.
 * The contents and intellectual property contained herein,
 * remain the property of Amdocs.
 */
define('ossui/utils/OSSUIBasicUtils',[
	'jquery',
	'underscore',
	'lightsaber'
], function($, _, Lightsaber) {

	/**
	 * Utility functions that don't have any 'complex' dependencies. This keeps the
	 * dependency graph simple, and helps to avoid problems with different jQuery
	 * versions (esp. for models).
	 */
	function OSSUIBasicUtils() {

		/**
		 * Encodes a string so that special characters are HTML encoded.
		 *   For example, it will convert "town/city" to "town&#x2F;city".
		 */
		this.htmlEscape = function(value) {
			if (!_.isString(value) || value.length === 0) return value;
			return _.escape(value);
		};

		/**
		 * Unencodes a string that may contain HTML encoded characters.
		 *   For example, it will convert "town&#x2F;city" to "town/city".
		 */
		this.htmlUnescape = function(value) {
			if (!_.isString(value) || value.length === 0) return value;
			return this._unescape(value);
		};

		this._invert = function(obj) {
			var result = {};
			var keys = _.keys(obj);
			for (var i = 0, length = keys.length; i < length; i++) {
				result[obj[keys[i]]] = keys[i];
			}
			return result;
		};

		this._entityMap = {
			escape: {
				'&': '&amp;',
				'<': '&lt;',
				'>': '&gt;',
				'"': '&quot;'
			},

			REGEXP_HEX : "&#x([0-9A-F])+;"
		};
		this._entityMap.unescape = this._invert(this._entityMap.escape);
		this._entityMap.unescape[this._entityMap.REGEXP_HEX] = "REGEXP_HEX";


		this._entityRegexes = {
			escape:   new RegExp('[' + _.keys(this._entityMap.escape).join('') + ']', 'g'),
			unescape: new RegExp('(' + _.keys(this._entityMap.unescape).join('|') + ')', 'g')
		};

		this._unescape = function(string) {
			if (string.indexOf('&') === -1) return string;
			var self = this;
			return string.replace(this._entityRegexes.unescape, function(match) {
				var result = self._entityMap.unescape[match];

				// hex encoded character, e.g., "&#x2F;" --> "/".
				if (!_.isString(result) && (match.match(self._entityMap.REGEXP_HEX) !== null)) {
					var hex = match.substring(3, match.length-1);
					var num = parseInt(hex, 16);
					result = (num >= 32 && num <= 255) ? String.fromCharCode(num) : "";
				}
				
				return result;
			});
		};
	}

	return new OSSUIBasicUtils();
});

// console.log('* ossui/utils/OSSUIBasicUtils loaded');


