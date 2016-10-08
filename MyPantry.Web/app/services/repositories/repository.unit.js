(function () {
    'use strict';

    var serviceId = 'repository.unit';
    angular.module('app').factory(serviceId,
        ['config', 'model', 'repository.abstract', RepositoryUnit]);

    function RepositoryUnit(config, model, AbstractRepository) {
        var entityName = model.entityNames.unit;
        var localUnitSort = config.localUnitSort || function () { /*noop for Mongo*/ };
        var orderBy = 'name';
        var unitsQuery = breeze.EntityQuery.from('Units');

        return {
            create: createRepo // factory function to create the repository
        };

        /* Implementation */
        function createRepo(manager) {
            var base = new AbstractRepository(manager, entityName, serviceId);
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
                if (base.zStorage.areItemsLoaded('units')) {
                    return base.$q.when(base.getLocalEntityCount(entityName));
                }
                if (count !== undefined) { return base.$q.when(count); }
                // Units aren't loaded and don't have a count yet;
                // ask the server for a count and remember it
                return unitsQuery.take(0).inlineCount()
                    .using(manager).execute()
                    .then(function (data) {
                        return count = data.inlineCount;
                    });
            }

            function getPartials(forceRemote) {
                var units;
                if (base.zStorage.areItemsLoaded('units') && !forceRemote) {
                    units = base.getAllLocal(entityName, orderBy);
                    return base.$q.when(units);
                }

                return unitsQuery
                    .select('id, name')
                    .orderBy(orderBy)
                    .toType(entityName)
                    .using(manager).execute()
                    .then(success).catch(base.queryFailed);

                function success(response) {
                    units = base.setIsPartialTrue(response.results);
                    localUnitSort(units); // for Mongo
                    base.zStorage.areItemsLoaded('units', true);
                    base.log('Retrieved [Unit Partials] from remote data source', units.length, true);
                    base.zStorage.save();
                    return units;
                }

            }

        }
    }
})();