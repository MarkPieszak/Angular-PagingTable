'use strict';

var evTableModule = angular.module('evTable', []);

evTableModule.factory('evTableParams', function () {

	return function (tableOptions) {

		var tableOptions = {

			pageNumber     		  	: tableOptions.pageNumber				|| 1,
			pageSize       			: tableOptions.pageSize					|| 10,
			orderBy					: tableOptions.orderBy					|| '',
			orderDirection 			: tableOptions.orderDirection			|| '',

			pageSizeOptions 	   	: tableOptions.pageSizeOptions			|| [10, 25, 50],
			disablePageSizeOptions	: tableOptions.disablePageSizeOptions	|| false,

			// AJAX
			serverPaging			: tableOptions.serverPaging				|| false,
			getData					: tableOptions.getData 					|| function () { },

			ajaxUrl					: tableOptions.ajaxUrl					|| '',
			callback				: tableOptions.callback					|| function () { },

			// STATIC - To Do
			data					: tableOptions.data						|| [],

			// Parameter Object for the Server-side
			params : function () {
				return {
					PageSize		: tableOptions.pageSize,
					PageNumber		: tableOptions.pageNumber,
					OrderBy			: tableOptions.orderBy,
					OrderDirection	: tableOptions.orderDirection
				}
			}
		};

		return tableOptions;
	};

});

evTableModule.directive('evTable', function ($http, $filter, $timeout) {

	return {

		restrict		: 'A',

		scope : {
			evTable		: '=',
			collection	: '='
		},

		transclude		: true,
		template		: '<div ng-transclude></div>\
			<div ev-paging="evTablePages" class="ev-pagers"></div>\
			<div ev-page-select="evTablePageOptions" class="ev-page-options"></div>',

		controller		: controllerFunction,
		link			: linkFunction

	};

	function controllerFunction ($scope) {

		var tableObject 	= $scope.evTable;
		var server_paging 	= tableObject.serverPaging;
		var tableParams 	= tableObject.params();

		$scope.evTablePageOptions = tableObject.pageSizeOptions;

		// Start everything up
		HandlePaging();

		$scope.changePage = function (pageNumber) {

			tableParams = tableObject.params();

			tableParams.PageNumber = parseInt(pageNumber, 10);

			if (tableParams.PageNumber > tableObject.pages) {
				tableParams.PageNumber = 1;
			}

			if (tableParams.PageNumber < 1) {
				tableParams.PageNumber = tableObject.pages;
			}

			console.log(tableParams);

			HandlePaging();
		};

		$scope.sort = function (column, direction) {

			tableParams.OrderBy 		= column;
			tableParams.OrderDirection 	= direction || 'asc';
			tableParams.PageNumber 		= 1; // Go back to the first page

			HandlePaging()
		}

		function HandlePaging () {

			if (server_paging) {
				var promise = $http({
					method : 'GET',
					url    : tableObject.ajaxUrl + '?' + $.param(tableParams || '')
				});

				promise.success(function (response) {

					// TO DO : get from Server-side
					var totalCount = 100;
					var pages      = totalCount / tableObject.pageSize;

					tableObject.totalCount = totalCount;
					tableObject.pages      = pages;

					$scope.evTablePages = Array.apply(null, {length: pages}).map(Number.call, Number).splice(1);
					$scope.currentPage        = tableParams.PageNumber;
					$scope.$parent.collection = response;

					// Pass the response back to the Calling controller (if they passed it in)
					tableObject.callback(response);

				});
			}
			else {

				// Static paging

				var totalCount = tableObject.data.length;
				var pages      = parseInt(totalCount / tableObject.pageSize, 10) + 1;

				tableObject.totalCount = totalCount;
				tableObject.pages      = pages;

				var dataCopy = angular.copy(tableObject.data);

				// Sorting
				if (tableParams.OrderBy) {
					var direction = tableParams.OrderDirection === 'asc' ? '' : 'reverse';

					dataCopy = $filter('orderBy')(dataCopy, tableParams.OrderBy, direction);
				}

				console.log(tableParams);

				var take = tableParams.PageSize;
				var skip = tableParams.PageNumber > 1
					? (tableParams.PageNumber - 1) * tableParams.PageSize
					: 0;

				if (dataCopy.length >= totalCount) {

				}

				console.log(skip, take);

				dataCopy = dataCopy.splice(skip, take);

				var currentPageData = dataCopy;

				$scope.evTablePages = Array.apply(null, {length: pages + 1}).map(Number.call, Number).splice(1);
				$scope.currentPage = tableParams.PageNumber;

				// Async Bind to table
				$timeout(function () {
					$scope.currentPage - tableParams.PageNumber;
					$scope.$parent.collection = currentPageData;
					tableObject.callback(currentPageData);
				}, 0);

			}


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
		<li ng-click="changePage(currentPage - 1)"><<</a>\
		<li ng-repeat="page in evTablePages" ng-click="changePage(page)" ng-class="{ \'ev-current-page\' : page === currentPage }">\
			{{ page }}\
		</li>\
		<li ng-click="changePage(currentPage + 1)">>></a>\
		</ul>';

	return {
		restrict : 'A',
		template : templateString
	};

});

evTableModule.directive('evPageSelect', function () {
	return {
		restrict : 'A',
		template : '<select ng-model="pageSizeAmount" ng-change="changeSize()" ng-options="num as num for num in evTablePageOptions"></select>',
		controller : controllerFunction
	};

	function controllerFunction ($scope) {

		$scope.pageSizeAmount = $scope.evTable.pageSize;

		$scope.changeSize = function () {

			$scope.evTable.pageSize = $scope.pageSizeAmount;
			$scope.changePage(1);
		};

	}
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
