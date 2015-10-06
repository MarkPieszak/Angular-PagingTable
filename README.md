# Angular-Table
Designed with server-side paging in mind - Extremely easy to use and lightweight Angular table/grid (ngTable) directive

# Easy to use

            <table ev-table="vmDemo.tableData">
				<thead>
					<tr>
						<th ev-sort="Name">CancerName</th>
						<th ev-sort="Guid">CancerGuid</th>
					</tr>
				</thead>  
				<!-- "collection" is required - data is passed to it -->
				<tr ng-repeat="item in collection">
					<td>{{ item.Name }}</td>
					<td>{{ item.Guid }}</td>
				</tr>
			</table>
