(function () {
    'use strict';

    var serviceId = 'repository.ingredient';
    angular.module('app').factory(serviceId,
        ['config', 'model', 'repository.abstract', RepositoryIngredient]);

    function RepositoryIngredient(config, model, AbstractRepository) {
        var entityName = model.entityNames.ingredient;
        var localIngredientSort = config.localIngredientSort || function () { /*noop for Mongo*/ };
        var orderBy = 'name';
        var ingredientsQuery = breeze.EntityQuery.from('Ingredients');

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
                if (base.zStorage.areItemsLoaded('ingredients')) {
                    return base.$q.when(base.getLocalEntityCount(entityName));
                }
                if (count !== undefined) { return base.$q.when(count); }
                // Ingredients aren't loaded and don't have a count yet;
                // ask the server for a count and remember it
                return ingredientsQuery.take(0).inlineCount()
                    .using(manager).execute()
                    .then(function (data) {
                        return count = data.inlineCount;
                    });
            }

            function getPartials(forceRemote) {
                var ingredients;
                if (base.zStorage.areItemsLoaded('ingredients') && !forceRemote) {
                    ingredients = base.getAllLocal(entityName, orderBy);
                    return base.$q.when(ingredients);
                }

                return ingredientsQuery
                    .select('id, name, description, imageSource')
                    .orderBy(orderBy)
                    .toType(entityName)
                    .using(manager).execute()
                    .then(success).catch(base.queryFailed);

                function success(response) {
                    ingredients = base.setIsPartialTrue(response.results);
                    localIngredientSort(ingredients); // for Mongo
                    base.zStorage.areItemsLoaded('ingredients', true);
                    base.log('Retrieved [Ingredient Partials] from remote data source', ingredients.length, true);
                    base.zStorage.save();
                    return ingredients;
                }

            }

        }
    }
})();