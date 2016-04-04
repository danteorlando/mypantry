(function() {
    'use strict';
    
    var controllerId = 'pantryitems';
    angular.module('app').controller(controllerId,
        ['$location', '$scope', '$route', '$routeParams',
            'common', 'config', 'datacontext', pantryitems]);

    function pantryitems($location, $scope, $route, $routeParams, common, config, datacontext) {
        var vm = this;
        var keyCodes = config.keyCodes;
        var applyFilter = function (){};

        vm.filteredPantryItems = [];
        vm.gotoPantryItem = gotoPantryItem;
        vm.refresh = refresh;
        vm.search = search;
        vm.pantryitems = [];
        vm.pantryitemsFilter = pantryitemsFilter;
        vm.pantryitemsSearch = $routeParams.search || '';
        vm.title = 'Pantry Items';

        activate();
        
        function activate() {
            // Learning point
            // Could use $q here, but we wrapped it instead.
            //$q.all([getSessions()])
            //    .then(function (data) { common.activateSuccess(controllerId); });
            common.activateController([getPantryItems()], controllerId).then(function () {
                // createSearchThrottle uses values by convention, via its parameters:
                //     vm.sessionsSearch is where the user enters the search 
                //     vm.sessions is the original unfiltered array
                //     vm.filteredSessions is the filtered array
                //     vm.sessionsFilter is the filtering function
                applyFilter = common.createSearchThrottle(vm, 'pantryitems');
                if (vm.pantryitemsSearch) { applyFilter(true /*now*/); }
            });
        }
        
        function search($event) {
            if ($event.keyCode === keyCodes.esc) {
                vm.pantryitemsSearch = '';
                applyFilter(true /*now*/);
            } else {
                applyFilter();
            }
        }

        function getPantryItems(forceRefresh) {
            return datacontext.pantryitem.getPartials(forceRefresh).then(function (data) {
                return vm.pantryitems = vm.filteredPantryItems = data;
            });
        }

        function gotoPantryItem(pantryitem) {
            if (pantryitem && pantryitem.id) {
                // '#/session/71'
                //$route.transition(url)
                $location.path('/pantryitem/' + pantryitem.id);
            }
        }

        function refresh() { getPantryItems(true); }

        function pantryitemsFilter(pantryitem) {
            var textContains = common.textContains;
            var searchText = vm.pantryitemsSearch;
            var isMatch = searchText ? textContains(pantryitem.name, searchText)
                || textContains(pantryitem.description, searchText) : true;
            return isMatch;
        }
    }
})();