(function () {
    'use strict';
    
    var controllerId = 'ingredients';
    angular.module('app').controller(controllerId,
        ['$location', 'common', 'config', 'datacontext', ingredients]);

    function ingredients($location, common, config, datacontext) {
        // Always define vm first
        var vm = this;
        var keyCodes = config.keyCodes;

        // Define viewmodel variables
        vm.filteredIngredients = [];
        vm.gotoIngredient = gotoIngredient;
        vm.refresh = refresh;
        vm.search = search;
        vm.ingredientSearch = '';
        vm.ingredients = [];
        vm.title = 'Ingredients';

        // Kickoff functions
        activate();

        function activate() {
            common.activateController([getIngredients()], controllerId);
        }
        
        function applyFilter() {
            vm.filteredIngredients = vm.ingredients.filter(ingredientFilter);
        }

        function getIngredients(forceRefresh) {
            return datacontext.ingredient.getPartials(forceRefresh).then(function (data) {
                // We don't handle the 'fail' because the datacontext will handle the fail.
                vm.ingredients = data;
                applyFilter();
                return data;
            });
        }

        function gotoIngredient(ingredient) {
            if (ingredient && ingredient.id) {
                $location.path('/ingredient/' + ingredient.id);
            }
        }

        function refresh() { getIngredients(true); }

        function search($event) {
            if ($event.keyCode === keyCodes.esc) { vm.ingredientSearch = ''; }
            applyFilter();
        }
        
        function ingredientFilter(ingredient) {
            var isMatch = vm.ingredientSearch ? common.textContains(ingredient.name, vm.ingredientSearch) : true;
            //if (isMatch) { vm.filteredCount++; }
            return isMatch;
        }
    }
})();