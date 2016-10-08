(function () {
    'use strict';
    var controllerId = 'dashboard';
    angular.module('app').controller(controllerId, ['common', 'datacontext', dashboard]);

    function dashboard(common, datacontext) {
        var vm = this;
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