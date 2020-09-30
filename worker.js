var projectId = "";
var queryId = "";
var baseUrl = "";
var strAutorization = "";
var arrAllWorkItems = [];
var arrAllWorkItemsDetailed = [];
var workerWorkItems = new Worker("workitems.js");

workerWorkItems.onmessage = function(e) {

	console.log('WorkItems done!');

	arrAllWorkItemsDetailed = e.data;

	var arrReport = [];
	var objReport = {};

	arrReport.push(["Id","Name","BoardColumn.NewValue","BoardColumn.OldValue","ChagedDate","CoS","Type","CommentCount","Rev"]);

	arrAllWorkItems.forEach(function (workitem, index, array) {

		objReport[workitem.id] = {"name":"", "type":"", "rev":[]};

		arrAllWorkItemsDetailed[workitem.id].value.forEach(function (revision, index, array) {

			objReport[workitem.id]['rev'][revision['rev']] = {};
			objReport[workitem.id]['rev'][revision['rev']]['cos'] = "";
			objReport[workitem.id]['rev'][revision['rev']]['oldValue'] = "";
			objReport[workitem.id]['rev'][revision['rev']]['newValue'] = "";
			objReport[workitem.id]['rev'][revision['rev']]['changedDate'] = "";

			if (revision['fields']) {

				switch (typeof revision['fields']['System.Title']) {
					case "string":
						objReport[workitem.id]['name'] = revision['fields']['System.Title'];
						break;
					case "object":
						objReport[workitem.id]['name'] = revision['fields']['System.Title']['newValue'];
						break;
				}

				switch (typeof revision['fields']['System.WorkItemType']) {
					case "string":
						objReport[workitem.id]['type'] = revision['fields']['System.WorkItemType'];
						break;
					case "object":
						objReport[workitem.id]['type'] = revision['fields']['System.WorkItemType']['newValue'];
						break;
				}


				if (revision['fields']['System.BoardLane'] && revision['fields']['System.BoardLane']['newValue'])
					objReport[workitem.id]['rev'][revision['rev']]['cos'] = revision['fields']['System.BoardLane']['newValue'];

				if (revision['fields']['System.BoardColumn']) {
					if (revision['fields']['System.BoardColumn']['oldValue'])
						objReport[workitem.id]['rev'][revision['rev']]['oldValue'] = revision['fields']['System.BoardColumn']['oldValue'];

					if (revision['fields']['System.BoardColumn']['newValue'])
						objReport[workitem.id]['rev'][revision['rev']]['newValue'] = revision['fields']['System.BoardColumn']['newValue'];
				}
				if (revision['fields']['System.ChangedDate'] && revision['fields']['System.ChangedDate']['newValue'])
					objReport[workitem.id]['rev'][revision['rev']]['changedDate'] = revision['fields']['System.ChangedDate']['newValue'];

			} 
		});

		objReport[workitem.id]['rev'].forEach(function (revision, rev, array) {

			if (revision['newValue'] != "" || revision['oldValue'] != "" || revision['cos'] != "")
				arrReport.push([
					workitem.id,
					objReport[workitem.id]['name'].replace(/,/g, "-"),
					revision['newValue'].replace(/,/g, "-"), 
					revision['oldValue'].replace(/,/g, "-"),
					revision['changedDate'].replace(/,/g, "-"),
					revision['cos'].replace(/,/g, "-"),
					objReport[workitem.id]['type'].replace(/,/g, "-"),
					rev
				]);
		});

	});

	objReport = {};
	arrAllWorkItems = [];
	arrAllWorkItemsDetailed = [];

	csvContent = arrReport.map(e => e.join(",")).join("\n");

	encodedUri = encodeURIComponent("\uFEFF" + csvContent);

	postMessage({'raw':arrReport, 'encoded': encodedUri});

};

var loadQuery = function (callback) {

	var req = new XMLHttpRequest();
	req.open("GET", baseUrl + projectId + "/_apis/wit/wiql/" + queryId + "?api-version=5.0", true);
	req.setRequestHeader( 'Authorization', strAutorization);
	req.onreadystatechange = function() {
		if (this.readyState == 4 && this.status == 200) {
			callback(JSON.parse(this.responseText));
		}
	};
	req.send();

}

onmessage = function(e) {
	
	projectId = e.data[0];
	queryId = e.data[1];
	baseUrl = e.data[2];
	strAutorization = e.data[3];

	loadQuery(function (result) {

		arrAllWorkItems = result.workItems;
		workerWorkItems.postMessage([arrAllWorkItems, baseUrl, strAutorization]);

	});

}