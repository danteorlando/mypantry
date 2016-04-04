(function () {
    'use strict';
    var controllerId = 'dashboard';
    angular.module('app').controller(controllerId, ['common', 'datacontext', dashboard]);

    function dashboard(common, datacontext) {
        var vm = this;
        vm.map = {
            title: 'Location'
        };
        vm.news = {
            title: 'Code Camp',
            description: 'Code Camp is a community event where developers learn from fellow developers. All are welcome to attend and speak. Code Camp is free, by and for the deveoper community, and occurs on the weekends.'
        };
        vm.speakers = {
            interval: 5000,
            list: [],
            title: 'Top Speakers'
        };
        vm.content = {
            predicate: '',
            reverse: false,
            setSort: setContentSort,
            title: 'Content',
            tracks: []
        };

        vm.title = 'Dashboard';

        activate();

        function activate() {
            var promises = [getPantryItemCount(), getIngredientCount(), getRecipeCount()];
            common.activateController(promises, controllerId);
            
            // Learning Point
            //$q.all([getAttendeeCount(), getSessionCount(), getTrackCounts()])
            //    .then(function (data) { common.activateSuccess(controllerId); });
        }
        
        function getPantryItemCount() {
            return datacontext.pantryitem.getCount().then(function (data) {
                return vm.pantryItemCount = data;
            });
        }

        function getIngredientCount() {
            return datacontext.ingredient.getCount().then(function (data) {
                return vm.ingredientCount = data;
            });
        }

        function getRecipeCount() {
            return datacontext.recipe.getCount().then(function (data) {
                return vm.recipeCount = data;
            });
        }

        function setContentSort(prop) {
            vm.content.predicate = prop;
            vm.content.reverse = !vm.content.reverse;
        }
    }
})();