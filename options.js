$( "#btnSaveSettings" ).click(function() {

	var baseUrl = $("#tfsBaseURL").val();
	var tfsAPIKey = $("#tfsAPIKey").val();

	chrome.storage.sync.set({baseUrl: baseUrl, APIKey:tfsAPIKey}, function() {
		console.log('Base URL is ' + baseUrl);
		console.log('Personal Access Token is ' + tfsAPIKey);
    });
	alert("Options Updated!");
	window.close();
});

chrome.storage.sync.get(['baseUrl','APIKey'], function(result) {
	$("#tfsBaseURL").val(result.baseUrl);
	$("#tfsAPIKey").val(result.APIKey);
});