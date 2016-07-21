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
            recipeingredient: 'RecipeIngredient'
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
            // Assume a Session or Person is partial by default
            registerPantryItem(metadataStore);
            registerIngredient(metadataStore);
            registerRecipe(metadataStore);
            registerRecipeIngredient(metadataStore);

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
            if (nullosExist) return;
            nullosExist = true;
            var unchanged = breeze.EntityState.Unchanged;

            createNullo(entityNames.timeslot, { start: nulloDate, isSessionSlot: true });
            createNullo(entityNames.room);
            createNullo(entityNames.speaker, { firstName: ' [Select a person]' });
            createNullo(entityNames.track);

            function createNullo(entityName, values) {
                var initialValues = values || { name: ' [Select a ' + entityName.toLowerCase() + ']' };
                return manager.createEntity(entityName, initialValues, unchanged);
            }
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

            /*
            var personEntityName = entityNames.person;
            ['Speakers', 'Speaker', 'Attendees', 'Attendee'].forEach(function (r) {
                set(r, personEntityName);
            });
            */
            function set(resourceName, entityName) {
                metadataStore.setEntityTypeForResourceName(resourceName, entityName);
            }
        }

        function registerPantryItem(metadataStore) {
            metadataStore.registerEntityTypeCtor('PantryItem', PantryItem);

            function PantryItem() {
                this.isPartial = false; // presume full session objects until informed otherwise
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
        //#endregion
    }
})();