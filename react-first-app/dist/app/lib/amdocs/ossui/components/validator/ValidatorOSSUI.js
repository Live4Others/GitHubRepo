/**
 * Class that adds new validations or overrides some of the original validations extant in the Lightsaber Model.
 * It also adds new "date" related validations; they had been initially present in the ARIM codebase.
 */
define('ossui/validator/ValidatorOSSUI',[ 'underscore', 'lightsaber' ], function(_, Lightsaber) {

    /**
     * Return a bogus object - just to force the runtime loading of the extended Lightsaber Validator.
     * Note- this validator object is not going to be invoked a such.
     */
    var Validator = function() {
    };
    /**
     * Checks if the length of a model's string attribute is greater than a
     * given number.
     * 
     * @param {String}
     *            conf.fieldName The name of a string attribute.
     * @param {Number}
     *            conf.min The min value
     */
    _.extend(Lightsaber.Core.Validator.prototype, {
        minLength : function(conf, attrs, model) {
            var val = this.getFieldValue('fieldName', conf, attrs, model);
            if (_.isUndefined(val) || (Number(val.length) < Number(conf.min))) {
                return this.makeError('minLength', conf.fieldName
                        + "'s length should not be shorter than " + conf.min
                        + ', was >' + val.length + '<', conf.fieldName, val);
            }
        }
    });

    /**
     * Checks if the length of a model's string attribute is less than a given
     * number.
     * 
     * @param {String}
     *            conf.fieldName The name of a string attribute.
     * @param {Number}
     *            conf.max The max value
     */
    _.extend(Lightsaber.Core.Validator.prototype, {
        maxLength : function(conf, attrs, model) {
            var val = this.getFieldValue('fieldName', conf, attrs, model);
            if (_.isUndefined(val) || (Number(val.length) > Number(conf.max))) {
                return this.makeError('maxLength', conf.fieldName
                        + "'s length should not be longer than " + conf.max
                        + ', was >' + val.length + '<', conf.fieldName, val);
            }
        }
    });

    /**
     * Checks if the value of a model's numeric attribute is less than a given
     * number.
     * 
     * @param {String}
     *            conf.fieldName The name of a string attribute.
     * @param {Number}
     *            conf.min The min value
     */
    _.extend(Lightsaber.Core.Validator.prototype,
            {
                min : function(conf, attrs, model) {
                    this.checkConf([ 'fieldName', 'min' ], conf);
                    var val = this.getFieldValue('fieldName', conf, attrs,
                            model);
                    if (($.isNumeric(val) !== true) || (Number(val) < Number(conf.min))) {
                        return this.makeError('min', conf.fieldName
                                + " should be minimum " + conf.min + ', was >'
                                + val + '<', conf.fieldName, val);
                    }
                }
            });

    /**
     * Checks if the value of a model's numeric attribute is greater than a
     * given number.
     * 
     * @param {String}
     *            conf.fieldName The name of a string attribute.
     * @param {Number}
     *            conf.max The max value
     */
    _.extend(Lightsaber.Core.Validator.prototype,
            {
                max : function(conf, attrs, model) {
                    this.checkConf([ 'fieldName', 'max' ], conf);
                    var val = this.getFieldValue('fieldName', conf, attrs,
                            model);
                    if (($.isNumeric(val) !== true) || (Number(val) > Number(conf.max))) {
                        return this.makeError('max', conf.fieldName
                                + " should be maximum " + conf.max + ', was >'
                                + val + '<', conf.fieldName, val);
                    }
                }
            });

    /**
     * Checks if the string is a number .
     * 
     * @param {String}
     *            conf.fieldName The name of a string attribute.
     */
    _.extend(Lightsaber.Core.Validator.prototype, {
        isNumber : function(conf, attrs, model) {
            this.checkConf([ 'fieldName' ], conf);
            var val = this.getFieldValue('fieldName', conf, attrs, model);
            if ($.isNumeric(val) !== true) {
                return this.makeError('isNumber', conf.fieldName
                        + ' is not a number', conf.fieldName, val);
            }
        }
    });

    /**
     * Checks if the string is a Date .
     * 
     * @param {String}
     *            conf.fieldName The name of a string attribute.
     */

    Lightsaber.Core.Validator.prototype.isDate = function(conf, attrs, model) {
        this.checkConf([ 'fieldName' ], conf);
        var val = this.getFieldValue('fieldName', conf, attrs, model);

        if (_.isUndefined(val)) {
            return this.makeError('isDate', "value for '" + conf.fieldName
                    + "' is undefined", conf.fieldName, val);
        } else {
            var date = new Date(val);
            if (date == "Invalid Date") {
                return this.makeError('isDate', "value for '" + conf.fieldName
                        + "' is not a Date", conf.fieldName, val);
            }
        }
    };

    /**
     * Checks if the string is a Date above today's date ; else trigger an error.
     * 
     * @param {String}
     *            conf.fieldName The name of a string attribute.
     */
    Lightsaber.Core.Validator.prototype.isFutureDate = function(conf, attrs,
            model) {
        this.checkConf([ 'fieldName' ], conf);
        var val = this.getFieldValue('fieldName', conf, attrs, model);
        var date = new Date(val);
        if (date == "Invalid Date") {
            return this.makeError('isFutureDate', "value for '"
                    + conf.fieldName + "' is not a Date", conf.fieldName, val);
        }
        if (date < new Date()) {
            return this.makeError('isFutureDate', "value for '"
                    + conf.fieldName + "' is not a Future Date",
                    conf.fieldName, val);
        }
    };

    /**
     * Checks if the string is a Date below today's date ; else trigger an error.
     * 
     * @param {String}
     *            conf.fieldName The name of a string attribute.
     */
    Lightsaber.Core.Validator.prototype.isPastDate = function(conf, attrs,
            model) {
        this.checkConf([ 'fieldName' ], conf);
        var val = this.getFieldValue('fieldName', conf, attrs, model);

        if (_.isUndefined(val)) {
            return this.makeError('isDate', "value for '" + conf.fieldName
                    + "' is undefined", conf.fieldName, val);
        } else {
            var date = new Date(val);
            if (date == "Invalid Date") {
                return this.makeError('isPastDate', "value for '"
                        + conf.fieldName + "' is not a Date", conf.fieldName,
                        val);
            }
            if (date > new Date()) {
                return this.makeError('isPastDate', "value for '"
                        + conf.fieldName + "' is not a Past Date",
                        conf.fieldName, val);
            }
        }
    };
    
    return Validator;
});