# Angular-Table

Designed to be extremely uninvasive, `ev-table` let's you sculpt tables exactly the way you want!
Created with server-side paging in mind - Extremely easy to use and lightweight Angular table/grid (ngTable) directive.

 > Only server-side paging is functioning right now. I'll be updating the project to include client-side paging as well very soon.

# Easy to use

### Include the directive:

`<script src="ev-table.directive.js"></script>`

### Add evTable to your App module dependencies:

`var APP = angular.module('app', ['evTable']);`


# Directive in action:

In your View, make your `<table>` like usual! Simply add the `ev-table="{TableDataFromController"` attribute directive!
Sorting is as easy as adding ev-sort on a your Header & providing the server-side column name.
Just make sure for the actual table you repeat through `collection` that is what's passed up to your View to loop through.

            <table ev-table="vmDemo.tableData">
				<thead>
					<tr>
						<!-- Sorting is as easy as adding ev-sort on a your Header & providing the server-side column name -->
						<th ev-sort="Name">Name</th>
						<th ev-sort="Age">Age</th>
					</tr>
				</thead>  
				<!-- "collection" is required - data is passed to it -->
				<tr ng-repeat="item in collection">
					<td>{{ item.Name }}</td>
					<td>{{ item.Age }}</td>
				</tr>
			</table>


### In the Controller

All we need is to pass that tableData.

    APP.controller('DemoController', function (evTableParams) {
			var vm = this;
			
			vm.tableData = new evTableParams({ 

				pageSize 	 : 10, 		// [Optional] Defaults to 10
				pageNumber	 : 1,  		// [Optional] Defaults to 1 : If you want to start on a different page

				serverPaging : true,

				ajaxUrl      : 'http://localhost/rest/api/pagingdemo',

				// [Optional] Incase you want to do something else everytime it finishes running AJAX
				callback     : function (data) { 
					
				}

			});

		});
		
# That's it!

> NOTE: For server-side paging, I'm passing an Object with these properties for you to handle your Take/Skips/Orders etc

	PageSize 
	PageNumber 
	OrderBy 
	OrderDirection
