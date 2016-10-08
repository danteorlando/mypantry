(function () {
    'use strict';

    var serviceId = 'repository.recipe';
    angular.module('app').factory(serviceId,
        ['config', 'model', 'repository.abstract', RepositoryRecipe]);

    function RepositoryRecipe(config, model, AbstractRepository) {
        var entityName = model.entityNames.recipe;
        var localRecipeSort = config.localRecipeSort || function () { /*noop for Mongo*/ };
        var orderBy = 'name';
        var recipesQuery = breeze.EntityQuery.from('Recipes');

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
                getPartials: getPartials,
                getRecipeById: getRecipeById
            };

            return repo;

            function create() { return manager.createEntity(entityName); }

            function getCount() {
                if (base.zStorage.areItemsLoaded('recipes')) {
                    return base.$q.when(base.getLocalEntityCount(entityName));
                }
                if (count !== undefined) { return base.$q.when(count); }
                // Ingredients aren't loaded and don't have a count yet;
                // ask the server for a count and remember it
                return recipesQuery.take(0).inlineCount()
                    .using(manager).execute()
                    .then(function (data) {
                        return count = data.inlineCount;
                    });
            }
            function getRecipeById(id) {
                return breeze.EntityQuery.from('Recipes')
                    .expand('recipeIngredientList')
                    .toType(entityName)
                    .using(manager).execute()
                    .then(success).catch(base.queryFailed);

                function success(response) {
                    //recipes = base.setIsPartialTrue(response.results);
                    //localRecipeSort(recipes); // for Mongo
                    //base.zStorage.areItemsLoaded('recipes', true);
                    //base.log('Retrieved [Recipe Recipe ] ' + id + 'from remote data source', recipes.length, true);
                    //base.zStorage.save();
                    return response.results[0];
                }

            }

            function getPartials(forceRemote) {
                var recipes;
                if (base.zStorage.areItemsLoaded('recipes') && !forceRemote) {
                    recipes = base.getAllLocal(entityName, orderBy);
                    return base.$q.when(recipes);
                }

                return recipesQuery
                    .select('id, name, description, imageSource')
                    .orderBy(orderBy)
                    //.expand('recipeIngredientList')
                    .toType(entityName)
                    .using(manager).execute()
                    .then(success).catch(base.queryFailed);

                function success(response) {
                    recipes = base.setIsPartialTrue(response.results);
                    localRecipeSort(recipes); // for Mongo
                    base.zStorage.areItemsLoaded('recipes', true);
                    base.log('Retrieved [Recipe Partials] from remote data source', recipes.length, true);
                    base.zStorage.save();
                    return recipes;
                }

            }

        }
    }
})();