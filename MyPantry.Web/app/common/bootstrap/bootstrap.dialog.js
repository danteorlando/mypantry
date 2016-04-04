(function () {
	'use strict';

	var bootstrapModule = angular.module('common.bootstrap', ['ui.bootstrap']);

	bootstrapModule.factory('bootstrap.dialog', ['$modal', '$templateCache', modalDialog]);

	function modalDialog($modal, $templateCache) {
		var service = {
			deleteDialog: deleteDialog,
			confirmationDialog: confirmationDialog,
            fileChooserDialog: fileChooserDialog
		};

		$templateCache.put('modalDialog.tpl.html',
			'<div>' +
			'    <div class="modal-header">' +
			'        <button type="button" class="close" data-dismiss="modal" aria-hidden="true" data-ng-click="cancel()">&times;</button>' +
			'        <h3>{{title}}</h3>' +
			'    </div>' +
			'    <div class="modal-body">' +
			'        <p>{{message}}</p>' +
			'    </div>' +
			'    <div class="modal-footer">' +
			'        <button class="btn btn-primary" data-ng-click="ok()">{{okText}}</button>' +
			'        <button class="btn btn-info" data-ng-click="cancel()">{{cancelText}}</button>' +
			'    </div>' +
			'</div>');

		$templateCache.put('fileChooserDialog.tpl.html',
            '<style>' +
            '    img {' + 
            '            border: 1px solid black;' + 
            '    }' + 
	        '    img:hover {' + 
            '            outline: 2px solid black;' + 
	        '    }' +
            '    .block{' +
            '        float:left;' +
	        '        display:block;' +
	        '        margin-right:2.35765%;' +
	        '        width:23.23176%;' +
	        '        margin-bottom:1.875rem' +
	        '    }' +
            '</style>' +
			'<div>' +
			'    <div class="modal-header">' +
			'        <button type="button" class="close" data-dismiss="modal" aria-hidden="true" data-ng-click="cancel()">&times;</button>' +
			'        <h3>{{title}}</h3>' +
			'    </div>' +
			'    <div class="modal-body">' +
		    '        <div class="intro-content">' + 
			'            <form name="instaForm" ng-submit="submitForm()">' +
			'	            <input type="text" placeholder="{{inputText}}" ng-model="formData.tagInput" name="tag-input" autofocus>' +
			'	            <div class="button-wrap">' +
			'		            <button type="submit" class="button small">Submit</button>' +
			'		            <button ng-if="instaForm.$submitted" type="reset" class="button small secondary" ng-click="clear()">' +
			'			            Clear' +
			'		            </button>' +
			'	            </div>' +
			'            </form>' +
			//'            <p class="result-message">{{message}}</p>' +
            //'            <p>Selected: <b>{{ selected.item }}</b></p>' +
		    '        </div>' +
			'    </div>' +
            //'    <div class="insta-results" ng-if="instaForm.$valid && instaForm.$submitted">' +
		    '        <div ng-repeat="instaImage in instaImages" class="block">' +
			'            <a ng-href="" ng-click="selected.item = instaImage.image.thumbnailLink" target="_blank">' +
			'	            <img ng-src="{{instaImage.image.thumbnailLink}}" alt="" />' +
			'            </a>' +
		    '        </div>' +
	        //'    </div>' +
			'    <div class="modal-footer">' +
			'        <button class="btn btn-primary" data-ng-click="ok()">{{okText}}</button>' +
			'        <button class="btn btn-info" data-ng-click="cancel()">{{cancelText}}</button>' +
			'    </div>' +
			'</div>');

		return service;

		function deleteDialog(itemName) {
			var title = 'Confirm Delete';
			itemName = itemName || 'item';
			var msg = 'Delete ' + itemName + '?';

			return confirmationDialog(title, msg);
		}

		function confirmationDialog(title, msg, okText, cancelText) {

			var modalOptions = {
				templateUrl: 'modalDialog.tpl.html',
				controller: ModalInstance,
				keyboard: true,
				resolve: {
					options: function () {
						return {
							title: title,
							message: msg,
							okText: okText,
							cancelText: cancelText
						};
					}
				}
			};

			return $modal.open(modalOptions).result; 
		}

		function fileChooserDialog(title, msg, okText, cancelText, inputText) {
		    var modalOptions = {
		        templateUrl: 'fileChooserDialog.tpl.html',
		        controller: fcModalInstance,
		        keyboard: true,
		        resolve: {
		            options: function () {
		                return {
		                    title: title,
		                    message: msg,
		                    okText: okText,
		                    cancelText: cancelText,
		                    inputText: inputText
		                };
		            }
		        }
		    };

		    return $modal.open(modalOptions).result;
		}
	}
 
	var ModalInstance = ['$scope', '$modalInstance', 'options',
		function ($scope, $modalInstance, options) {
			$scope.title = options.title || 'Title';
			$scope.message = options.message || '';
			$scope.okText = options.okText || 'OK';
			$scope.cancelText = options.cancelText || 'Cancel';
			$scope.ok = function () { $modalInstance.close('ok'); };
			$scope.cancel = function () { $modalInstance.dismiss('cancel'); };
		}];

	var fcModalInstance = ['$scope', '$modalInstance', 'options', '$http',
		function ($scope, $modalInstance, options, $http) {
		    $scope.selected = {
		        item: ''
		    };
		    $scope.instaImages = '';
		    $scope.title = options.title || 'Title';
		    $scope.message = options.message || '';
		    $scope.okText = options.okText || 'OK';
		    $scope.cancelText = options.cancelText || 'Cancel';
		    $scope.inputText = options.inputText || '';
		    $scope.ok = function () {
		        $modalInstance.close($scope.selected.item);
		    };
		    $scope.cancel = function () { $modalInstance.dismiss('cancel'); };
		    $scope.submitForm = function () {
		        console.log('submit');
		        console.log($scope.formData.tagInput);
		        var tag = $scope.formData.tagInput;
		        searchByTag(tag);
		        $scope.message = "Searching google for photos tagged with " + tag;
		    };
		    $scope.clear = function () {
		        console.log('clear');
		        $scope.formData = {};
		        $scope.instaImage = {};
		        $scope.message = null;
		        $scope.instaForm.$submitted = false;
		    };
		    $scope.formData = {};
		    var searchByTag = function (tag) {
		        var url = 'https://www.googleapis.com/customsearch/v1'
		        var clientId = '416e81a93f0d4cb689ded7e74749bc86';
		        var api_key = 'AIzaSyCxXgy_N8eSn21K-lfnx5Y16xU4cBlm1kE';
		        var cse_key = '014720799340192115150:in2gkugynd4'

		        var config = {
		            'params': {
		                'key': api_key,
		                'cx': cse_key,
		                'searchType': 'image',
		                'alt': 'json',
		                'q': tag,
		                'callback': 'JSON_CALLBACK'
		            }
		        }
		        //console.log( 'json request' );
		        $http.jsonp(url, config)
                    .success(function (results) {
                        var dataLength = results.items.length;
                        var resultData = results.items;
                        if (dataLength > 0) {
                            console.log(resultData);
                            $scope.instaImages = resultData;
                            $scope.message = "We found " + dataLength + " results for " + tag;
                        } else {
                            $scope.message = "No results.";
                        }
                    })
                    .error(function () {
                        $scope.message = "Not found.";
                    });
		    };

		}];


})();