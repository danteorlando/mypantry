(function () {
    'use strict';

    var controllerId = 'ingredientdetail';
    angular.module('app').controller(controllerId,
        ['$location', '$scope', '$routeParams', '$window',
            'bootstrap.dialog', 'common', 'config', 'datacontext', 'helper', 'model', ingredientdetail]);

    function ingredientdetail($location, $scope, $routeParams, $window,
        bsDialog, common, config, datacontext, helper, model) {
        var vm = this;
        var entityName = model.entityNames.ingredient;
        var logError = common.logger.getLogFn(controllerId, 'error');
        var logWarning = common.logger.getLogFn(controllerId, 'warn');
        var $q = common.$q;
        var wipEntityKey = undefined;

        vm.deleteIngredient = deleteIngredient;
        vm.cancel = cancel;
        vm.goBack = goBack;
        vm.hasChanges = false;
        vm.isSaving = false;
        vm.save = save;
        vm.ingredient= undefined;
        vm.ingredients = [];

        Object.defineProperty(vm, 'canSave', { get: canSave });

        activate();

        function activate() {
            onDestroy();
            onHasChanges();
            common.activateController([getRequestedIngredient()], controllerId)
                .then(onEveryChange);
        }

        function autoStoreWip(immediate) {
            common.debouncedThrottle(controllerId, storeWipEntity, 1000, immediate);
        }

        function cancel() {
            datacontext.cancel();
            removeWipEntity();
            helper.replaceLocationUrlGuidWithId(vm.ingredient.id);
            if (vm.ingredient.entityAspect.entityState.isDetached()) {
                gotoIngredients();
            }
        }

        function gotoIngredients() { $location.path('/ingredients'); }

        function canSave() { return vm.hasChanges && !vm.isSaving; }

        function deleteIngredient() {
            return bsDialog.deleteDialog('Ingredient')
                .then(confirmDelete);

            function confirmDelete() {
                datacontext.markDeleted(vm.ingredient);
                vm.save().then(success).catch(failed);

                function success() {
                    removeWipEntity();
                    gotoIngredients();
                }

                function failed(error) {
                    cancel(); // Makes the entity available to edit again
                }
            }
        }

        $scope.openFileChooserDialog = function openFileChooserDialog(inputText) {
            return bsDialog.fileChooserDialog('Ingredient Image', null, null, null, inputText)
                .then(success).catch(failed);

            function success(selectedItem) {
                $scope.selectedItem = selectedItem;
                vm.ingredient.imageSource = selectedItem;
            }

            function failed(error) {
            }
        }

        function getRequestedIngredient() {
            var val = $routeParams.id;
            if (val === 'new') { return vm.ingredient = datacontext.ingredient.create(); }

            return datacontext.ingredient.getEntityByIdOrFromWip(val)
            .then(function (data) {
                if (data) {
                    // data is either an entity or an {entity, wipKey} pair
                    wipEntityKey = data.key;
                    vm.ingredient = data.entity || data;
                } else {
                    logWarning('Could not find ingredient id = ' + val);
                    gotoIngredients();
                }
            })
            .catch(function (error) {
                logError('Error while getting ingredient id = ' + val + "; " + error);
                gotoIngredients();
            });
        }

        function goBack() { $window.history.back(); }

        function onEveryChange() {
            $scope.$on(config.events.entitiesChanged, function (event, data) { autoStoreWip(); });
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
                helper.replaceLocationUrlGuidWithId(vm.ingredient.id);
            }).catch(function (error) {
                vm.isSaving = false;
            });
        }

        function storeWipEntity() {
            if (!vm.ingredient) return;
            var description = (vm.ingredient.name || '[New ingredient]') + ' ' + vm.ingredient.id;
            var routeState = 'ingredient';
            wipEntityKey = datacontext.zStorageWip.storeWipEntity(
                vm.ingredient, wipEntityKey, entityName, description, routeState);
        }
    }
})();
