'use strict';

var evTableModule = angular.module('evTable', []);

evTableModule.factory('evTableParams', function () {

	return function (tableOptions) {

		var tableOptions = {

			pageNumber     		  	: tableOptions.pageNumber 				|| 1,
			pageSize       			: tableOptions.pageSize 				|| 10,
			orderBy 	   			: tableOptions.orderBy 					|| '',
			orderDirection 			: tableOptions.orderDirection			|| '',

			pageSizeOptions 	   	: tableOptions.pageSizeOptions 			|| [10, 25, 50],
			disablePageSizeOptions 	: tableOptions.disablePageSizeOptions 	|| false,

			// AJAX
			serverPaging 			: tableOptions.serverPaging 			|| false,
			getData		 			: tableOptions.getData 					|| function () { },

			ajaxUrl  				: tableOptions.ajaxUrl					|| '',
			callback 				: tableOptions.callback					|| function () { },

			// STATIC - To Do
			data 					: tableOptions.data 					|| [],

			// Parameter Object for the Server-side
			params : function () {
				return {
					PageSize 		: tableOptions.pageSize,
					PageNumber 		: tableOptions.pageNumber,
					OrderBy 		: tableOptions.orderBy,
					OrderDirection  : tableOptions.orderDirection
				}
			}
		};

		return tableOptions;
	};

});

evTableModule.directive('evTable', function ($http) {
	return {

		restrict		: 'A',

		scope : {
			evTable 	: '=',
			collection  : '='
		},

		transclude 		: true,
		template 		: '<div ng-transclude></div>\
			<div ev-paging="evTablePages"></div>',

		controller 		: controllerFunction,
		link 			: linkFunction

	};

	function controllerFunction ($scope) {

		var tableObject = $scope.evTable;
		var server_paging = tableObject.serverPaging;
		var tableParams = tableObject.params();


		if (server_paging) {
			handleServerPaging();
		}
		else {
			// To Do: static paging
			// Static paging
		}

		$scope.changePage = function (pageNumber) {

			tableParams.PageNumber = parseInt(pageNumber, 10);

			handleServerPaging();
		};

		$scope.sort = function (column, direction) { 

			tableParams.OrderBy 		= column;
			tableParams.OrderDirection 	= direction || 'asc';
			tableParams.PageNumber 		= 1; // Go back to the first page

			handleServerPaging()
		}

		function handleServerPaging () {

			var promise = $http({
				method : 'GET',
				url    : tableObject.ajaxUrl + '?' + $.param(tableParams || '')
			});

			promise.success(function (response) {

				// TO DO : get from Server-side
				var totalCount = 100; 
				var pages = totalCount / tableObject.pageSize;

				$scope.evTablePages = Array.apply(null, {length: pages}).map(Number.call, Number).splice(1);
				$scope.currentPage = tableParams.PageNumber;
				$scope.$parent.collection = response;

				// Pass the response back to the Calling controller (if they passed it in)
				tableObject.callback(response);

			});
	  	}

	}

	function linkFunction ($scope, $element, $attrs, $ctrl, $transclude) {

		$element.addClass('ev-table');
		$element.attr('cellSpacing', '0');
		$element.attr('cellPadding', '0');

	}

	
});

evTableModule.directive('evPaging', function () {

	var templateString = '<ul class="ev-paging">\
		<li ng-repeat="page in evTablePages" ng-click="changePage(page)" ng-class="{ \'ev-current-page\' : page === currentPage }">\
			{{ page }}\
		</li>\
		</ul>';

	return {
		restrict : 'A',
		template : templateString
	};

});

evTableModule.directive('evSort', function () {

	return {
		restrict	: 'A',
		controller 	: controllerFunction,
		compile 	: compileFunction
	};

	function controllerFunction ($scope, $element, $attrs, $transclude) {

		$scope.sort = $scope.$parent.sort;

	}

	function compileFunction ($element, $attrs) {

		$attrs.evDirection = 'asc';

		return function ($scope, $elem) {

			$elem.bind('click', function () {

				$scope.sort($attrs.evSort, $attrs.evDirection);

				// Flip the direction
				$attrs.evDirection = $attrs.evDirection === 'asc' 
					? 'desc' 
					: 'asc';
			});  

		};
    }
});