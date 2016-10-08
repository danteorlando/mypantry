(function () {
    'use strict';

    var useManualMetadata = true; // true: use model.metadata; false: use generated metadata

    var serviceId = 'model';
    angular.module('app').factory(serviceId, ['model.metadata', 'model.validation', model]);

    function model(manualMetadata, modelValidation) {
        var nulloDate = new Date(1900, 0, 1);
        var nullosExist = false;

        var entityNames = {
            ingredient: 'Ingredient',
            pantryitem: 'PantryItem',
            recipe: 'Recipe',
            recipeingredient: 'RecipeIngredient',
            unit: 'Unit'
        };

        var service = {
            configureMetadataStore: configureMetadataStore,
            //createNullos: createNullos,
            entityNames: entityNames,
            extendMetadata: extendMetadata,
            useManualMetadata: useManualMetadata
        };

        return service;

        //#region internal methods
        function configureMetadataStore(metadataStore) {
            // Pass the Type, Ctor (breeze tracks properties created here), and initializer 
            registerPantryItem(metadataStore);
            registerIngredient(metadataStore);
            registerRecipe(metadataStore);
            registerRecipeIngredient(metadataStore);
            registerUnit(metadataStore);

            modelValidation.createAndRegister(entityNames);

            if (useManualMetadata) {
                manualMetadata.fillMetadataStore(metadataStore);
                extendMetadata(metadataStore);
            }
        }
        
        function extendMetadata(metadataStore) {
            modelValidation.applyValidators(metadataStore);
            registerResourceNames(metadataStore);
        }
        
        function createNullos(manager) {
        }

        // Wait to call until entityTypes are loaded in metadata
        function registerResourceNames(metadataStore) {
            // every entityName is its own resource name
            var types = metadataStore.getEntityTypes();
            types.forEach(function (type) {
                if (type instanceof breeze.EntityType) {
                    set(type.shortName, type);
                }
            });

            function set(resourceName, entityName) {
                metadataStore.setEntityTypeForResourceName(resourceName, entityName);
            }
        }

        function registerPantryItem(metadataStore) {
            metadataStore.registerEntityTypeCtor('PantryItem', PantryItem);

            function PantryItem() {
                this.isPartial = false;
            }
        }
        
        function registerIngredient(metadataStore) {
            metadataStore.registerEntityTypeCtor('Ingredient', Ingredient);

            function Ingredient() {
                this.isPartial = false;
            }
        }

        function registerRecipe(metadataStore) {
            metadataStore.registerEntityTypeCtor('Recipe', Recipe);

            function Recipe() {
                this.isPartial = false;
            }
        }
        function registerRecipeIngredient(metadataStore) {
            metadataStore.registerEntityTypeCtor('RecipeIngredient', RecipeIngredient);

            function RecipeIngredient() {
                this.isPartial = false;
            }
        }
        function registerUnit(metadataStore) {
            metadataStore.registerEntityTypeCtor('Unit', Unit);

            function Unit() {
                this.isPartial = false;
            }
        }
        //#endregion
    }
})();