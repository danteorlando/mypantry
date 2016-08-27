(function () {
    'use strict';

    var serviceId = 'repository.recipeingredient';
    angular.module('app').factory(serviceId,
        ['config', 'model', 'repository.abstract', RepositoryRecipeIngredient]);

    function RepositoryRecipeIngredient(config, model, AbstractRepository) {
        var entityName = model.entityNames.recipeingredient;
        var localRecipeIngredientSort = config.localRecipeIngredientSort || function () { /*noop for Mongo*/ };
        var orderBy = 'recipeId';
        var recipeIngredientsQuery = breeze.EntityQuery.from('RecipeIngredients');

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
                createTempO: createTempO,
                getById: base.getById,
                getCount: getCount,
                getEntityByIdOrFromWip: base.getEntityByIdOrFromWip,
                getPartials: getPartials,
                detachRecipeIngredient: detachRecipeIngredient
            };

            return repo;

            function create() { return manager.createEntity(entityName); }

            function createTempO() { return manager.createEntity(entityName); }

            function detachRecipeIngredient(ri) {
                manager.detachEntity(ri);
            }

            function getCount() {
                if (base.zStorage.areItemsLoaded('recipeingredients')) {
                    return base.$q.when(base.getLocalEntityCount(entityName));
                }
                if (count !== undefined) { return base.$q.when(count); }
                // RecipeIngredients aren't loaded and don't have a count yet;
                // ask the server for a count and remember it
                return recipeIngredientsQuery.take(0).inlineCount()
                    .using(manager).execute()
                    .then(function (data) {
                        return count = data.inlineCount;
                    });
            }

            function getPartials(forceRemote) {
                var recipeingredients;
                if (base.zStorage.areItemsLoaded('recipeingredients') && !forceRemote) {
                    recipeingredients = base.getAllLocal(entityName, orderBy);
                    return base.$q.when(recipeingredients);
                }

                return recipeIngredientsQuery
                    .select('id, recipeId, ingredientId, unitId')
                    .orderBy(orderBy)
                    .toType(entityName)
                    .using(manager).execute()
                    .then(success).catch(base.queryFailed);

                function success(response) {
                    recipeingredients = base.setIsPartialTrue(response.results);
                    localRecipeIngredientSort(recipeingredients); // for Mongo
                    base.zStorage.areItemsLoaded('recipeingredients', true);
                    base.log('Retrieved [RecipeIngredient Partials] from remote data source', recipeingredients.length, true);
                    base.zStorage.save();
                    return recipeingredients;
                }

            }

        }
    }
})();