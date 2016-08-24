﻿(function () {
    'use strict';

    var controllerId = 'recipedetail';
    angular.module('app').controller(controllerId,
        ['$location', '$scope', '$routeParams', '$window',
            'bootstrap.dialog', 'common', 'config', 'datacontext', 'helper', 'model', recipedetail]);

    function recipedetail($location, $scope, $routeParams, $window,
        bsDialog, common, config, datacontext, helper, model) {
        var vm = this;
        var entityName = model.entityNames.recipe;
        var logError = common.logger.getLogFn(controllerId, 'error');
        var logWarning = common.logger.getLogFn(controllerId, 'warn');
        var $q = common.$q;
        var wipEntityKey = undefined;
        var ingredientList = [];

        vm.cancel = cancel;
        vm.deleteRecipe = deleteRecipe;
        vm.goBack = goBack;
        vm.hasChanges = false;
        vm.isSaving = false;
        vm.save = save;
        vm.recipe = undefined;
        vm.openImageChooserDialog = openImageChooserDialog;
        vm.addIngredientToList = addIngredientToList;
        vm.ingredientList = ingredientList;
        vm.ingredients = [];

        Object.defineProperty(vm, 'canSave', { get: canSave });

        activate();

        function addIngredientToList() {
            if (angular.isDefined($scope.ingredientName) && $scope.ingredientName != '') {

                vm.ingredientList.push({ name: $scope.ingredientName });

                $scope.ingredientName = '';
            }
        }

        function addIngredient() {
            vm.ingredientList.push({});
        }

        function openImageChooserDialog() {
            helper.openImageChooserDialog('Recipe Image')
                .then(function () {
                    if ($scope.selectedImage != null && $scope.selectedImage != '') {
                        vm.recipe.imageSource = $scope.selectedImage;
                    }
                });
        }

        function activate() {
            //routemediator.register(vm);
            initLookups();
            onDestroy();
            onHasChanges();
            // Whether we succeed or fail, we still want to call onEveryChange
            common.activateController([getRequestedRecipe()], controllerId)
                .then(onEveryChange);
        }
         
        function initLookups() {
            var forceRefresh = false;
            return datacontext.ingredient.getPartials(forceRefresh).then(function (data) {
                vm.ingredients = data;
            });
        }

        function autoStoreWip(immediate) {
            common.debouncedThrottle(controllerId, storeWipEntity, 1000, immediate);
        }

        function cancel() {
            datacontext.cancel();
            removeWipEntity();
            helper.replaceLocationUrlGuidWithId(vm.recipe.id);
            if (vm.pantryitem.entityAspect.entityState.isDetached()) {
                gotoRecipes();
            }
        }
        
        function gotoRecipes() { $location.path('/recipes'); }

        function canSave() { return vm.hasChanges && !vm.isSaving; }

        function deleteRecipe() {
            return bsDialog.deleteDialog('Recipe')
                .then(confirmDelete);

            function confirmDelete() {
                datacontext.markDeleted(vm.recipe);
                vm.save().then(success).catch(failed);

                function success() {
                    removeWipEntity();
                    gotoRecipes();
                }

                function failed(error) {
                    cancel(); // Makes the entity available to edit again
                }
            }
        }

        function getRequestedRecipe() {
            var val = $routeParams.id;
            if (val === 'new') { return vm.recipe = datacontext.recipe.create(); }

            return datacontext.recipe.getEntityByIdOrFromWip(val)
                .then(function (data) {
                    if (data) {
                        // data is either an entity or an {entity, wipKey} pair
                        wipEntityKey = data.key;
                        vm.recipe = data.entity || data;
                        vm.ingredientList = data.recipeIngredientList;
                    } else {
                        logWarning('Could not find recipe id = ' + val);
                        gotoRecipes();
                    }
                })
                .catch(function (error) {
                    logError('Error while getting recipe id = ' + val + "; " + error);
                    gotoRecipes();
                });
        }
        
        function goBack() { $window.history.back(); }

        
        function onEveryChange() {
            $scope.$on(config.events.entitiesChanged,
                function (event, data) { autoStoreWip(); });
        }

        function onDestroy() {
            $scope.$on('$destroy', function () {
                autoStoreWip(true);
                datacontext.cancel();
            });
        }

        function onHasChanges() {
            $scope.$on(config.events.hasChangesChanged,
                function (event, data) { vm.hasChanges = data.hasChanges; });
        }

        function removeWipEntity() {
            datacontext.zStorageWip.removeWipEntity(wipEntityKey);
        }

        function save() {
            if (!canSave()) { return $q.when(null); } // Must return a promise

            vm.isSaving = true;
            return datacontext.save().then(function (saveResult) {
                vm.isSaving = false;
                removeWipEntity();
                helper.replaceLocationUrlGuidWithId(vm.recipe.id);
                //datacontext.speaker.calcIsSpeaker();
            }).catch(function (error) {
                vm.isSaving = false;
            });
        }

        function storeWipEntity() {
            if (!vm.recipe) return;
            var description = vm.recipe.name || '[New Recipe]' + vm.recipe.id;
            var routeState = "recipe";
            wipEntityKey = datacontext.zStorageWip.storeWipEntity(
                vm.recipe, wipEntityKey, entityName, description, routeState);
        }

    }
})();