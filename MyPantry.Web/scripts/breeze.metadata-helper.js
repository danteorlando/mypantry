//#region Copyright, Version, and Description
/*
 * Copyright 2015 IdeaBlade, Inc.  All Rights Reserved.
 * Use, reproduction, distribution, and modification of this code is subject to the terms and
 * conditions of the IdeaBlade Breeze license, available at http://www.breezejs.com/license
 *
 * Author: Ward Bell
 * Version: 1.0.7
 * --------------------------------------------------------------------------------
 * Adds metadataHelper extensions to Breeze
 * Source:
 *   https://github.com/Breeze/breeze.js.labs/blob/master/breeze.metadata-helper.js
 *
 * Depends on Breeze which it patches
 *
 * You can use these helpers when creating metadata by hand
 * to improve workflow and reduce data entry errors.
 *
 * The helpers reflect an opinion about developer workflow
 * that may or may not work for you.
 * Use these helpers "as is" or use for inspiration in creating your own.
 *
 * For example usage, see:
 * https://github.com/Breeze/breeze.js.samples/blob/master/net/DocCode/DocCode/tests/helpers/metadataOnClient.js
 *
 * For a discussion of how they work and why, see:
 * http://www.breezejs.com/documentation/metadata-by-hand#addTypeToStore
 *
 */
//#endregion
// ReSharper disable InconsistentNaming
(function (definition) {
    if (typeof breeze === "object") {
        definition(breeze);
    } else if (typeof require === "function" && typeof exports === "object" && typeof module === "object") {
        // CommonJS or Node
        var b = require('breeze');
        definition(b);
    } else if (typeof define === "function" && define["amd"]) {
        // Requirejs / AMD
        define(['breeze'], definition);
    } else {
        throw new Error("Can't find breeze");
    }
}(function (breeze) {
    'use strict';
    // MetadataHelper constructor
    var helper = function (defaultNamespace, defaultAutoGeneratedKeyType) {
        this.defaultNamespace = defaultNamespace || '';
        this.defaultAutoGeneratedKeyType =
            defaultAutoGeneratedKeyType ||
            breeze.AutoGeneratedKeyType.None;
    };

    helper.prototype = {
        constructor: helper,
        addDataService: addDataService,
        addTypeNameAsResource: addTypeNameAsResource,
        addTypeToStore: addTypeToStore,
        convertValidators: convertValidators,
        findEntityKey: findEntityKey,
        inferDefaultResourceName: inferDefaultResourceName,
        inferValidators: inferValidators,
        patch: patch,
        pluralize: pluralize,
        replaceDataPropertyAliases: replaceDataPropertyAliases,
        replaceNavPropertyAliases: replaceNavPropertyAliases,
        setDefaultAutoGeneratedKeyType: setDefaultAutoGeneratedKeyType,
        setDefaultNamespace: setDefaultNamespace,
        _hasOwnProperty: _hasOwnProperty,
        _isArray: _isArray
    };

    breeze.config.MetadataHelper = helper;

    var DT = breeze.DataType;
    var Validator = breeze.Validator;

    function addDataService(store, serviceName) {
        store.addDataService(
            new breeze.DataService({ serviceName: serviceName })
        );
    }

    // Create the type from the definition hash and add the type to the store
    // fixes some defaults, infers certain validators,
    // add adds the type's "shortname" as a resource name
    function addTypeToStore(store, typeDef) {
        this.patch(typeDef);
        var type = typeDef.isComplexType ?
            new breeze.ComplexType(typeDef) :
            new breeze.EntityType(typeDef);
        store.addEntityType(type);
        this.inferValidators(type);
        this.addTypeNameAsResource(store, type);

        return type;
    }

    // Often helpful to have the type's 'shortName' available as a resource name
    // as when composing a query to be executed locally against the cache.
    // This function adds the type's 'shortName' as one of the resource names for the type.
    // Theoretically two types in different models could have the same 'shortName'
    // and thus we would associate the same resource name with the two different types.
    // While unlikely, breeze should offer a way to remove a resource name for a type.
    function addTypeNameAsResource(store, type) {
        if (!type.isComplexType) {
            store.setEntityTypeForResourceName(type.shortName, type);
        }
    }

    // While Breeze requires that the validators collection be defined with Validator instances
    // we support alternative expression of validators in JSON form (as if coming from the server)
    // Validator:
    //    phone: { maxLength: 24, validators: [ Validator.phone() ] },
    // JSON:
    //    phone: { maxLength: 24, validators: [ {name: 'phone'} ] },
    // This fn converts JSON to a Validator instance
    function convertValidators(typeName, propName, propDef) {
        var validators = propDef.validators;
        if (!_isArray(validators)) {
            //throw "{0}.{1}.validators must be an array".format(typeName, propName);
            // coerce to array instead of throwing
            propDef.validators = validators = [validators];
        }
        validators.forEach(function (val, ix) {
            if (val instanceof Validator) return;
            try {
                validators[ix] = Validator.fromJSON(val);
            } catch (ex) {
                throw "{0}.{1}.validators[{2}] = '{3}' can't be converted to a known Validator."
                    .format(typeName, propName, ix, JSON.stringify(val));
            }
        });
    }

    function findEntityKey(typeDef) {
        var dps = typeDef.dataProperties;
        var typenameId = typeDef.shortName.toLowerCase() + 'id';
        for (var key in dps) {
            var prop = dps[key];
            if (prop.isPartOfKey) { // found a key part; stop analysis
                return key;
            }
            // if type were Person, would look for 'id' or 'personid'
            if (prop.isPartOfKey == null) {
                // isPartOfKey is null or undefined; is it a candidate?
                var keyLc = key.toLowerCase();
                if (keyLc === 'id' || keyLc === typenameId) {
                    // infer this property is the key; stop further analysis
                    prop.isPartOfKey = true;
                    return key;
                }
            }
        }
        return null;
    }

    function inferDefaultResourceName(typeDef) {
        if (typeDef.defaultResourceName === undefined) {
            typeDef.defaultResourceName = this.pluralize(typeDef.shortName);
        }
    }

    function inferValidators(entityType) {

        entityType.dataProperties.forEach(function (prop) {
            if (!prop.isNullable) { // is required.
                addValidator(prop, Validator.required());
            };

            addValidator(prop, getDataTypeValidator(prop));

            if (prop.maxLength != null && prop.dataType === DT.String) {
                addValidator(prop, Validator.maxLength({ maxLength: prop.maxLength }));
            }

        });

        return entityType;

        function addValidator(prop, validator) {
            if (!validator) { return; } // no validator arg
            var valName = validator.name;
            var validators = prop.validators;
            var found = validators.filter(function (val) { return val.name == valName; });
            if (!found.length) { // this validator has not already been specified
                validators.push(validator);
            }
        }

        function getDataTypeValidator(prop) {
            var dataType = prop.dataType;
            var validatorCtor = !dataType || dataType === DT.String ? null : dataType.validatorCtor;
            return validatorCtor ? validatorCtor() : null;
        }
    }

    function normalizeNavProp(key, prop) {
        switch (typeof (prop)) {
            case 'string':
                return { entityTypeName: prop };
            case 'object':
                return prop;
            default:
                // nav prop name (key) is same as EntityName (PascalCased)
                var ename = key.substr(0, 1).toUpperCase() + key.substr(1);
                return { entityTypeName: ename };
        }
    }

    // Patch some defaults in the type definition object
    // Todo: consider moving some of these patches into breeze itself
    function patch(typeDef) {
        var key, prop;
        if (typeDef.name) { // 'name' -> 'shortName' property
            renameAttrib(typeDef, 'name', 'shortName');
        }
        var typeName = typeDef.shortName;

        // if no namespace specified, assign the helper defaultNamespace
        var namespace = typeDef.namespace = typeDef.namespace || this.defaultNamespace;

        if (!typeDef.isComplexType) {
            this.inferDefaultResourceName(typeDef);
            this.findEntityKey(typeDef);
            // if entityType lacks an autoGeneratedKeyType, use the helper defaultAutoGeneratedKeyType
            typeDef.autoGeneratedKeyType = typeDef.autoGeneratedKeyType || this.defaultAutoGeneratedKeyType;
        }

        var dps = typeDef.dataProperties;
        for (key in dps) {
            prop = dps[key];
            this.replaceDataPropertyAliases(prop, key);
            if (prop.complexTypeName && prop.complexTypeName.indexOf(":#") === -1) {
                // if complexTypeName is unqualified, suffix with the entity's own namespace
                prop.complexTypeName += ':#' + namespace;
            }
            // key always required (not nullable) unless explictly nullable
            if (prop.isPartOfKey) { prop.isNullable = prop.isNullable === true; }
            if (prop.validators) { this.convertValidators(typeName, key, prop); }
        };

        var navs = typeDef.navigationProperties;
        for (key in navs) {
            prop = navs[key] = normalizeNavProp(key, navs[key]);
            this.replaceNavPropertyAliases(prop, key);

            var propTypeName = prop.entityTypeName;

            // append the namespace to entityTypeName if missing
            var nsStart = propTypeName.indexOf(":#");
            if (nsStart === -1) {
                // name is unqualified; append the namespace
                prop.entityTypeName += ':#' + namespace;
            } else {
                propTypeName = propTypeName.slice(0, nsStart);
            }

            // Infer that it's a child nav if no FKs, no invFKs, and not a collection
            if (prop.foreignKeyNames === undefined && prop.isScalar !== false &&
                prop.invForeignKeyNames === undefined) {
                // Look for candidate FK property among the data properties as
                // (1) propertyname + id OR (2) unqualified typename + 'id'
                var candidate1 = key.toLowerCase() + 'id';
                var candidate2 = propTypeName.toLowerCase() + 'id';
                var fk = Object.keys(dps).filter(
                    function (k) {
                        k = k.toLowerCase();
                        return k === candidate1 || k === candidate2;
                    })[0];
                if (fk) { prop.foreignKeyNames = [fk]; }
            }

            if (prop.associationName === undefined) {
                var isParent = prop.isScalar === false ||
                               prop.invForeignKeyNames ||
                               prop.foreignKeyNames === undefined;
                // association name is 'ChildType_ParentType'
                prop.associationName =
                    (isParent ? propTypeName : typeName) + '_' +
                    (isParent ? typeName : propTypeName);
            }

            // coerce FK names to array
            var keyNames = prop.foreignKeyNames;
            if (keyNames && !_isArray(keyNames)) {
                prop.foreignKeyNames = [keyNames];
            }
            keyNames = prop.invForeignKeyNames;
            if (keyNames && !_isArray(keyNames)) {
                prop.invForeignKeyNames = [keyNames];
            }
        };
    }

    function pluralize(word) {
        // Lame English pluralizer; plenty better on the web
        var len = word.length;
        switch (word[len - 1]) {
            case 's': // class -> classes
                return word + 'es';
            case 'x': // box -> boxes
                return word + 'es';
            case 'y': // fly -> flies
                return word.substr(0, len - 1) + 'ies';
            default:  // cat -> cats
                return word + 's';
        }
    }

    function renameAttrib(obj, oldName, newName) {
        if (obj[newName] !== undefined) {
            throw "renameAttrib error; new name, '" + newName + "' is already defined for the object.";
        }
        obj[newName] = obj[oldName];
        delete obj[oldName];
    }

    /*
     *  Support common aliases in DataProperty attributes to reduce tedium
     *  type -> dataType
     *  complex || complexType -> complexTypeName
     *  null -> isNullable
     *  max  -> maxLength
     *  default -> defaultValue
     */
    function replaceDataPropertyAliases(prop, propertyName) {
        for (var key in prop) {
            if (_hasOwnProperty(prop, key)) {
                var keyLc = key.toLowerCase();
                if (keyLc === 'type') {
                    renameAttrib(prop, key, 'dataType');
                } else if (keyLc === 'complex' || keyLc === 'complextype') {
                    renameAttrib(prop, key, 'complexTypeName');
                } else if (keyLc === 'max' && (prop.dataType === undefined || prop.dataType === DT.String)) {
                    renameAttrib(prop, key, 'maxLength');
                } else if (keyLc.indexOf('null') > -1 && key !== 'isNullable' && typeof (prop[key]) === 'boolean') {
                    renameAttrib(prop, key, 'isNullable');
                } else if (keyLc === 'required') {
                    prop[key] = !prop[key];
                    renameAttrib(prop, key, 'isNullable');
                } else if (keyLc.indexOf('key') > -1 && key !== 'isPartOfKey' && typeof (prop[key]) === 'boolean') {
                    renameAttrib(prop, key, 'isPartOfKey');
                } else if (keyLc === 'default') {
                    renameAttrib(prop, key, 'defaultValue');
                } else if (keyLc === 'isone' || keyLc === 'hasone') {
                    renameAttrib(prop, key, 'isScalar');
                    // Mongo subdocuments could be collections of complex types
                } else if (keyLc === 'ismany' || keyLc === 'hasmany') {
                    prop[key] = !prop[key];
                    renameAttrib(prop, key, 'isScalar');
                }
            }
        }
    }

    /*
     *  Support common aliases in Navigation Property attributes to reduce tedium
     *  type -> entityTypeName
     *  FK|FKs -> foreignKeyNames
     *  invFK|invFKs -> invForeignKeyNames
     *  assoc -> associationName
     *  isOne | hasOne -> isScalar
     *  isMany | hasMany -> isScalar with boolean flipped
     */
    function replaceNavPropertyAliases(prop, propertyName) {
        for (var key in prop) {
            if (_hasOwnProperty(prop, key)) {
                var keyLc = key.toLowerCase();
                if (keyLc === 'type') {
                    renameAttrib(prop, key, 'entityTypeName');
                } else if (keyLc === 'fk' || keyLc === 'fks' || keyLc === 'key') {
                    renameAttrib(prop, key, 'foreignKeyNames');
                } else if (keyLc === 'isone' || keyLc === 'hasone') {
                    renameAttrib(prop, key, 'isScalar');
                } else if (keyLc === 'ismany' || keyLc === 'hasmany') {
                    prop[key] = !prop[key];
                    renameAttrib(prop, key, 'isScalar');
                } else if (keyLc === 'invfk' || keyLc === 'invfks') {
                    renameAttrib(prop, key, 'invForeignKeyNames');
                } else if (keyLc.indexOf('assoc') > -1 && key !== 'associationName') {
                    renameAttrib(prop, key, 'associationName');
                }
            }
        }
    }

    function setDefaultAutoGeneratedKeyType(autoGeneratedKeyType) {
        this.defaultAutoGeneratedKeyType =
            autoGeneratedKeyType ||
            breeze.AutoGeneratedKeyType.None;
    }

    function setDefaultNamespace(namespace) {
        this.defaultNamespace = namespace || '';
    }

    function _hasOwnProperty(obj, key) {
        return Object.prototype.hasOwnProperty.call(obj, key);
    }

    function _isArray(obj) {
        return Object.prototype.toString.call(obj) === '[object Array]';
    }

}));