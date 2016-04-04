(function () {
    'use strict';

    var controllerId = 'pantryitemdetail';
    angular.module('app').controller(controllerId,
        ['$location', '$scope', '$routeParams', '$window',
            'bootstrap.dialog', 'common', 'config', 'datacontext', 'helper', 'model', pantryitemdetail]);

    function pantryitemdetail($location, $scope, $routeParams, $window,
        bsDialog, common, config, datacontext, helper, model) {
        var vm = this;
        var entityName = model.entityNames.pantryitem;
        var logError = common.logger.getLogFn(controllerId, 'error');
        var logWarning = common.logger.getLogFn(controllerId, 'warn');
        var $q = common.$q;
        var wipEntityKey = undefined;

        vm.cancel = cancel;
        vm.deletePantryItem = deletePantryItem;
        vm.goBack = goBack;
        vm.hasChanges = false;
        vm.isSaving = false;
        vm.save = save;
        vm.pantryitem = undefined;
        vm.ingredients = [];

        Object.defineProperty(vm, 'canSave', { get: canSave });

        activate();

        function activate() {
            //routemediator.register(vm);
            initLookups();
            onDestroy();
            onHasChanges();
            // Whether we succeed or fail, we still want to call onEveryChange
            common.activateController([getRequestedPantryItem()], controllerId)
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
            helper.replaceLocationUrlGuidWithId(vm.pantryitem.id);
            if (vm.pantryitem.entityAspect.entityState.isDetached()) {
                gotoPantryItems();
            }
        }
        
        function gotoPantryItems() { $location.path('/pantryitems'); }

        function canSave() { return vm.hasChanges && !vm.isSaving; }

        function deletePantryItem() {
            return bsDialog.deleteDialog('PantryItem')
                .then(confirmDelete);

            function confirmDelete() {
                datacontext.markDeleted(vm.pantryitem);
                vm.save().then(success).catch(failed);

                function success() {
                    removeWipEntity();
                    gotoPantryItems();
                }

                function failed(error) {
                    cancel(); // Makes the entity available to edit again
                }
            }
        }

        $scope.openFileChooserDialog = function openFileChooserDialog() {
            return bsDialog.fileChooserDialog('PantryItem Image')
                .then(success).catch(failed);

            function success(selectedItem) {
                $scope.selectedItem = selectedItem;
                vm.pantryitem.imageSource = selectedItem;
            }

            function failed(error) {
            }
        }

        function getRequestedPantryItem() {
            var val = $routeParams.id;
            if (val === 'new') { return vm.pantryitem = datacontext.pantryitem.create(); }

            return datacontext.pantryitem.getEntityByIdOrFromWip(val)
                .then(function (data) {
                    if (data) {
                        // data is either an entity or an {entity, wipKey} pair
                        wipEntityKey = data.key;
                        vm.pantryitem = data.entity || data;
                    } else {
                        logWarning('Could not find pantry item id = ' + val);
                        gotoPantryItems();
                    }
                })
                .catch(function (error) {
                    logError('Error while getting pantry item id = ' + val + "; " + error);
                    gotoPantryItems();
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
                helper.replaceLocationUrlGuidWithId(vm.pantryitem.id);
                //datacontext.speaker.calcIsSpeaker();
            }).catch(function (error) {
                vm.isSaving = false;
            });
        }

        function storeWipEntity() {
            if (!vm.session) return;
            var description = vm.pantryitem.name || '[New Pantry Item]' + vm.pantryitem.id;
            wipEntityKey = datacontext.zStorageWip.storeWipEntity(
                vm.pantryitem, wipEntityKey, entityName, description);
        }

    }
})();