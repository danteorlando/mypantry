(function() {
    'use strict';
    
    var controllerId = 'recipes';
    angular.module('app').controller(controllerId,
        ['$location', '$scope', '$route', '$routeParams',
            'common', 'config', 'datacontext', recipes]);

    function recipes($location, $scope, $route, $routeParams, common, config, datacontext) {
        var vm = this;
        var keyCodes = config.keyCodes;
        var applyFilter = function (){};

        vm.filteredRecipes = [];
        vm.gotoRecipe = gotoRecipe;
        vm.refresh = refresh;
        vm.search = search;
        vm.recipes = [];
        vm.recipesFilter = recipesFilter;
        vm.recipesSearch = $routeParams.search || '';
        vm.title = 'Recipes';

        activate();
        
        function activate() {
            // Learning point
            // Could use $q here, but we wrapped it instead.
            //$q.all([getSessions()])
            //    .then(function (data) { common.activateSuccess(controllerId); });
            common.activateController([getRecipes()], controllerId).then(function () {
                // createSearchThrottle uses values by convention, via its parameters:
                //     vm.sessionsSearch is where the user enters the search 
                //     vm.sessions is the original unfiltered array
                //     vm.filteredSessions is the filtered array
                //     vm.sessionsFilter is the filtering function
                applyFilter = common.createSearchThrottle(vm, 'recipes');
                if (vm.recipesSearch) { applyFilter(true /*now*/); }
            });
        }
        
        function search($event) {
            if ($event.keyCode === keyCodes.esc) {
                vm.recipesSearch = '';
                applyFilter(true /*now*/);
            } else {
                applyFilter();
            }
        }

        function getRecipes(forceRefresh) {
            return datacontext.recipe.getPartials(forceRefresh).then(function (data) {
                return vm.recipes = vm.filteredRecipes = data;
            });
        }

        function gotoRecipe(recipe) {
            if (recipe && recipe.id) {
                // '#/session/71'
                //$route.transition(url)
                $location.path('/recipe/' + recipe.id);
            }
        }

        function refresh() { getRecipes(true); }

        function recipesFilter(pantryitem) {
            var textContains = common.textContains;
            var searchText = vm.recipesSearch;
            var isMatch = searchText ? textContains(recipe.name, searchText)
                || textContains(recipe.description, searchText) : true;
            return isMatch;
        }
    }
})();