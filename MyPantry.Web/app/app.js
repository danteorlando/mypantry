(function () {
    'use strict';

    var id = 'app';

    var app = angular.module('app', [
        'breeze.angular',
        'breeze.directives',

        // Custom modules 
        'common',           // common functions, logger, spinner
        'common.bootstrap', // bootstrap dialog wrapper functions
        'environment',      // the environment we are running in

        // Angular modules 
        'ngAnimate',        // animations
        'ngRoute',          // routing
        'ngSanitize',       // sanitizes html bindings (ex: sidebar.js)

        // 3rd Party Modules
        'ui.bootstrap',     // ui-bootstrap (ex: carousel, pagination, dialog)
        'ngplus',           // ngplus utilities
        'ngzWip'            // zStorage and zStorageWip
    ]);

    // Handle routing errors and success events
    // trigger breeze configuration
    app.run(['breeze', 'routemediator', 
        function (breeze, routemediator) {

            // backingStore works for Angular (ES5 property 'ready')
            breeze.config.initializeAdapterInstance('modelLibrary', 'backingStore', true);

            // Tell breeze not to validate when we attach a newly created entity to any manager.
            // We could also set this per entityManager
            new breeze.ValidationOptions({ validateOnAttach: false }).setAsDefault();

            breeze.NamingConvention.camelCase.setAsDefault();

            routemediator.setRoutingEventHandlers();
        }]);
})();