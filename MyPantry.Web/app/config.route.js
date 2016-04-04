(function () {
    'use strict';

    var app = angular.module('app');

    // Collect the routes
    app.constant('routes', getRoutes());
    
    // Configure the routes and route resolvers
    app.config(['$routeProvider', 'routes', routeConfigurator]);
    function routeConfigurator($routeProvider, routes) {

        //#region testing
        // Learning Point:
        // If we are testing, we do NOT want to se the routes. 
        // We did this to prevent the route changes from happening during tests
        if (window.testing) return;
        // some tests fail if this is EVER executed during ANY test in the run
        //#endregion
        
        //#region Test resolvers
        //$routeProvider.when('/invalid', {
        //    templateUrl: 'app/invalid.html',
        //    resolve: { fake: fakeAllow }
        //});
        //$routeProvider.when('/pass', {
        //    templateUrl: 'app/wip/wip.html',
        //    resolve: { fake: fakeAllow }
        //});
        //$routeProvider.when('/fail', {
        //    templateUrl: 'app/attendee/attendees.html',
        //    resolve: { fake: fakeReject }
        //});
        //fakeReject.$inject = ['$q'];
        //function fakeReject($q) {
        //    var defer = $q.defer();
        //    defer.reject({ msg: 'You shall not pass!' });
        //    return defer.promise;
        //}
        //fakeAllow.$inject = ['$q'];
        //function fakeAllow($q) {
        //    var data = { x: 1 };
        //    var defer = $q.defer();
        //    defer.resolve(data);
        //    return defer.promise;
        //}
        //#endregion

        routes.forEach(function (r) {
            setRoute(r.url, r.config);
        });
        $routeProvider.otherwise({ redirectTo: '/' });

        function setRoute(url, definition) {
            // Sets resolvers for all of the routes
            // 1. Anything you need to do prior to going to a new route
            // 2. Any logic that might prevent the new route ($q.reject)
            definition.resolve = angular.extend(definition.resolve || {}, {
                prime: prime //Learning Point: do not prime as a test
            });
            $routeProvider.when(url, definition);

            return $routeProvider;
        }
    }

    // prime the core data for the app
    prime.$inject = ['datacontext'];
    function prime(dc) { return dc.prime(); }
    
    // Define the routes 
    function getRoutes() {
        return [
            {
                url: '/',
                config: {
                    templateUrl: 'app/dashboard/dashboard.html',
                    title: 'dashboard',
                    settings: {
                        nav: 1,
                        content: '<i class="fa fa-dashboard"></i> Dashboard'
                    }
                }
            }, {
                url: '/pantryitems',
                config: {
                    title: 'pantryitems',
                    templateUrl: 'app/pantry/pantryitems.html',
                    settings: {
                        nav: 2,
                        content: '<i class="fa fa-shopping-cart"></i> Pantry Items'
                    }
                }
            }
            , {
                url: '/pantryitems/search/:search',
                config: {
                    title: 'pantryitems-search',
                    templateUrl: 'app/pantry/pantryitems.html',
                    settings: {}
                }
            }, {
                url: '/pantryitem/:id',
                config: {
                    templateUrl: 'app/pantry/pantryitemdetail.html',
                    title: 'pantryitem',
                    settings: { }
                }
            }, {
                url: '/ingredient/:id',
                config: {
                    templateUrl: 'app/ingredient/ingredientdetail.html',
                    title: 'ingredient',
                    settings: {}
                }
            }, {
                url: '/ingredients',
                config: {
                    templateUrl: 'app/ingredient/ingredients.html',
                    title: 'ingredients',
                    settings: {
                        nav: 3,
                        content: '<i class="fa fa-cutlery"></i> Ingredients'
                    }
                }
            }, {
                url: '/recipes',
                config: {
                    templateUrl: 'app/recipe/recipes.html',
                    title: 'recipes',
                    settings: {
                        nav: 4,
                        content: '<i class="fa fa-list"></i> Recipes'
                    }
                }
            }, {
                url: '/recipe/:id',
                config: {
                    templateUrl: 'app/recipe/recipedetail.html',
                    title: 'recipe',
                    settings: {}
                }
            }, {
                url: '/workinprogress',
                config: {
                    templateUrl: 'app/wip/wip.html',
                    title: 'workinprogress',
                    settings: {
                        content: '<i class="fa fa-asterisk"></i> Work In Progress'
                    }
                }
            }
        ];
    }
})();