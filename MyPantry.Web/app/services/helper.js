﻿(function () {
    'use strict';

    var serviceId = 'helper';

    angular.module('app').factory(serviceId, ['$rootScope', '$location', 'common', 'bootstrap.dialog', helper]);

    function helper($rootScope, $location, common, bsDialog) {
        var service = {
            replaceLocationUrlGuidWithId: replaceLocationUrlGuidWithId,
            openImageChooserDialog: openImageChooserDialog,
            convertToFraction: convertToFraction
        };

        return service;

        function convertToFraction(input) {
            var x = new Fraction(input);
            input = x.toFraction(true); // String "1 22/25"
            return input;
        }

        function replaceLocationUrlGuidWithId(id) {
            // If the current Url is a Guid, then we replace 
            // it with the passed in id. Otherwise, we exit.
            var currentPath = $location.path();
            var slashPos = currentPath.lastIndexOf('/', currentPath.length - 2);
            var currentParameter = currentPath.substring(slashPos-1);
            
            if (common.isNumber(currentParameter)) { return; }
            
            var newPath = currentPath.substring(0, slashPos + 1) + id;
            $location.path(newPath);
        }

        function openImageChooserDialog(mesg, inputText) {
            return bsDialog.fileChooserDialog(mesg, null, null, null, inputText)
                .then(success).catch(failed);

            function success(selectedItem) {
                $rootScope.selectedImage = selectedItem;
                //vm.pantryitem.imageSource = selectedItem;
            }

            function failed(error) {
            }
        }

    }
})();