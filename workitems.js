var projectId = "";
var queryId = "";
var baseUrl = "";
var strAutorization = "";
var arrWorkItems = [];
var objWorkItems = {};
var nrTotalWorkItems = 0;
var nrFinishedWorkItems = 0;

var loadAllWorkItems = function () {

	if (arrWorkItems.length > 0) {

		var workItem = arrWorkItems.pop();

		var req = new XMLHttpRequest();
		req.open("GET", baseUrl + projectId + "/_apis/wit/workitems/" + workItem.id + "/updates?api-version=5.0", true);
		req.setRequestHeader( 'Authorization', strAutorization);
		req.onreadystatechange = function() {
			if (this.readyState == 4 && this.status == 200) {

				objWorkItems[workItem.id] = JSON.parse(this.responseText);
				nrFinishedWorkItems++;
				console.log(nrTotalWorkItems - nrFinishedWorkItems);

				if (nrTotalWorkItems == nrFinishedWorkItems) {
					postMessage(objWorkItems);
				} else {
					loadAllWorkItems();
				}
			}
		};
		req.send();

	}

}

onmessage = function(e) {
	
	arrWorkItems = e.data[0];
	baseUrl = e.data[1];
	strAutorization = e.data[2];
	nrTotalWorkItems = arrWorkItems.length;
	nrFinishedWorkItems = 0;

	console.log("Total: " + nrTotalWorkItems);

	loadAllWorkItems();
	loadAllWorkItems();
	loadAllWorkItems();
	loadAllWorkItems();

}