(function () {
    'use strict';

    var serviceId = 'repository.pantryitem';
    angular.module('app').factory(serviceId,
        ['config', 'model', 'repository.abstract', RepositoryPantryItem]);

    function RepositoryPantryItem(config, model, AbstractRepository) {
        var entityName = model.entityNames.pantryitem;
        var localPantryItemSort = config.localPantryItemSort || function () { /*noop for Mongo*/ };
        var orderBy = 'name';
        var pantryItemsQuery = breeze.EntityQuery.from('PantryItems');

        return {
            create: createRepo // factory function to create the repository
        };

        /* Implementation */
        function createRepo(manager) {
            var base = new AbstractRepository(manager, entityName, serviceId);
            //var count = undefined, sessionsPerTrack = undefined;
            var count = undefined;
            var repo = {
                create: create,
                getById: base.getById,
                getCount: getCount,
                getEntityByIdOrFromWip: base.getEntityByIdOrFromWip,
                getPartials: getPartials
            };

            return repo;

            function create() { return manager.createEntity(entityName); }

            function getCount() {
                if (base.zStorage.areItemsLoaded('pantryitems')) {
                    return base.$q.when(base.getLocalEntityCount(entityName));
                }
                if (count !== undefined) { return base.$q.when(count); }
                // Ingredients aren't loaded and don't have a count yet;
                // ask the server for a count and remember it
                return pantryItemsQuery.take(0).inlineCount()
                    .using(manager).execute()
                    .then(function (data) {
                        return count = data.inlineCount;
                    });
            }

            function getPartials(forceRemote) {
                var pantryitems;
                if (base.zStorage.areItemsLoaded('pantryitems') && !forceRemote) {
                    pantryitems = base.getAllLocal(entityName, orderBy);
                    return base.$q.when(pantryitems);
                }

                return pantryItemsQuery
                    .select('id, name, description, imageSource, ingredientId, ingredient')
                    .orderBy(orderBy)
                    .toType(entityName)
                    .using(manager).execute()
                    .then(success).catch(base.queryFailed);

                function success(response) {
                    pantryitems = base.setIsPartialTrue(response.results);
                    localPantryItemSort(pantryitems); // for Mongo
                    base.zStorage.areItemsLoaded('pantryitems', true);
                    base.log('Retrieved [PantryItem Partials] from remote data source', pantryitems.length, true);
                    base.zStorage.save();
                    return pantryitems;
                }

            }

        }
    }
})();