﻿(function () {
    'use strict';
    
    var serviceId = 'model.validation';
    angular.module('app').factory(serviceId, ['common', modelValidation]);

    function modelValidation(common) {
        var entityNames;
        var log = common.logger.getLogFn(serviceId);
        var Validator = breeze.Validator;
        var requireReferenceValidator;
        var fractionValidator;

        var service = {
            applyValidators: applyValidators,
            createAndRegister: createAndRegister
        };

        return service;

        function applyValidators(metadataStore) {
            applyRequireReferenceValidators(metadataStore);
            applyFractionValidator(metadataStore);
            //applyTwitterValidators(metadataStore);
            //applyEmailValidators(metadataStore);
            //applyUrlValidators(metadataStore);
            log('Validators applied', null, false);
        }

        function createAndRegister(eNames) {
            entityNames = eNames;
            // Step 1) Create it
            requireReferenceValidator = createRequireReferenceValidator();
            fractionValidator = createFractionValidator();

            //twitterValidator = createTwitterValidator();
            // Step 2) Tell breeze about it
            Validator.register(requireReferenceValidator);
            Validator.register(fractionValidator);
            //Validator.register(twitterValidator);

            // Step 3) Later we will apply them to the properties/entities via applyValidators
            log('Validators created and registered', null, false);
        }

        function applyRequireReferenceValidators(metadataStore) {
            var navigations = ['ingredient'];
            var entityType = metadataStore.getEntityType(entityNames.pantryitem);

            navigations.forEach(function (propertyName) {
                entityType.getProperty(propertyName).validators
                    .push(requireReferenceValidator);
            });
        }

        function applyFractionValidator(metadataStore) {
            var entityType = metadataStore.getEntityType(entityNames.recipeingredient);
            entityType.getProperty('amount').validators.push(fractionValidator);
        }

        function createRequireReferenceValidator() {
            var name = 'requireReferenceEntity';
            // isRequired = true so zValidate directive displays required indicator
            var ctx = { messageTemplate: 'Missing %displayName%', isRequired: true };
            var val = new Validator(name, valFunction, ctx);
            return val;

            // passes if reference has a value and is not the nullo (whose id===0)
            function valFunction(value) {
                return value ? value.id !== 0 : false;
            }
        }

        function createFractionValidator() {
            var name = 'fraction';
            var ctx = { messageTemplate: 'Amount should either be a whole number or a whole number and a fraction.' };
            var val = new Validator(name, valFunction, ctx);
            return val;

            function valFunction(value) {
                var a = value.split(' ');
                if (a.length === 1) { //only one part
                    var b = a[0].split('.');
                    if (b.length > 1) {
                        return false;
                    }
                    else {
                        var c = a[0].split('/');
                        if (c.length > 1) {
                            //is fraction
                            return true;
                        }
                        else {
                            //is whole num
                            return true;
                        }
                    }
                }
                else if (a.length === 2) {
                    var whole = a[0];
                    var fraction = a[1];
                    var d = whole.split('.');
                    var e = whole.split('/');
                    var f = fraction.split('.');
                    var g = fraction.split('/');

                    if (d.length > 1 || e.length > 1 || f.length > 1 || g.length === 1) {
                        return false;
                    }
                    else {
                        //
                        return true;
                    }
                }
                else {
                    return false;
                }
            }
        }
    }
})();