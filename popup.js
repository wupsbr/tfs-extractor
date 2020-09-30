var baseUrl = "";
var APIKey  = "";
var strAutorization = "";

var myWorker = new Worker("worker.js");

var loadQueries = function (projectId) {

	$("#btnExportData").prop('disabled', true);
	$("#selectQuery").empty().prop('disabled', true).append($("<option />").text("Loading..."));

	$.ajax({
		type: "GET",
		url: baseUrl + projectId + "/_apis/wit/queries?$depth=1",
		dataType: 'json',
		headers: {
			"Authorization": strAutorization
		},
		success: function (result){

			$("#selectQuery").empty();
			$.each(result.value, function() {

				var groupName = this.name;
				$.each(this.children, function() {
				    $("#selectQuery").append($("<option />").val(this.id).text(groupName + " - " + this.name));
				});
			});
			$("#selectQuery").prop('disabled', false);
			$("#btnExportData").prop('disabled', false);
		}
	});
};

var loadProjects = function () {

	$("#btnExportData").prop('disabled', false);
	$("#selectQuery").empty().prop('disabled', true).append($("<option />").text("Select project first..."));

	$.ajax({
		type: "GET",
		url: baseUrl + "_apis/projects",
		dataType: 'json',
		headers: {
			"Authorization": strAutorization
		},
		success: function (result){
			console.log(result);

			var firstId = false;

			$("#selectProject").empty().prop('disabled', false);
			$.each(result.value, function() {
				if (!firstId) {firstId = this.id;loadQueries(firstId);}
			    $("#selectProject").append($("<option />").val(this.id).text(this.name));
			});
			$("#selectQuery").empty().prop('disabled', true).append($("<option />").text("Select project first..."));
			$("#btnExportData").prop('disabled', true);

		}
	});
};


myWorker.onmessage = function(e) {

	console.log(e.data['raw']);
	console.log('Message received from worker');

	$("#btnExportData").hide();
	$("#btnExportData").prop('disabled', false);
	$("#btnExportData").attr('value', 'Export Report');
	$("#btnExportData").show(1);

	var link = document.createElement("a");
	link.href ="data:text/csv; charset=utf-8," + e.data['encoded'];
	link.download = $( "#selectProject :selected" ).text() + " - " + $('#selectQuery :selected').text() + ".csv";
	link.click();

}

window.onload = function() {

	chrome.storage.sync.get(['baseUrl','APIKey'], function(result) {

		baseUrl = result.baseUrl;
		APIKey  = result.APIKey;

		if (baseUrl == "" || APIKey  == "") {
			alert("Please, you must edit the Options first to use this extension!");
			window.open(chrome.runtime.getURL("options.html"));
			window.close(); 
		} else {

			strAutorization = "Basic " + btoa(":" + APIKey);

			loadProjects();

			$( "#selectProject" ).change(function() {
				loadQueries(this.value);
			});			

			$( "#selectQuery" ).change(function() {
				$("#selectQuery").off( "focus" );
				$('#selectQuery').hide().show(0);
			});		

			$( "#btnExportData" ).click(function() {

				$("#btnExportData").prop('disabled', true);
				$("#btnExportData").attr('value', 'Loading...');
				$('#btnExportData').hide().show(0);

				myWorker.postMessage([$( "#selectProject" ).val(), $('#selectQuery').val(), baseUrl, strAutorization]);

			});
		}

	});

}