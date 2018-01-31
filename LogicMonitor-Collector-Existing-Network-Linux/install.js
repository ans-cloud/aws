
var request = require('request');
var fs = require('fs');
var cryptojs = require("crypto-js");

// Input Parameters
var accessId = process.argv[2];
var accessKey = process.argv[3];
var collectorSize = process.argv[4];
var lmHost = process.argv[5];
var Sostenuto_Id = process.argv[6];

// ***************************** Variables and Functions ***************************
var epoch = (new Date).getTime();
var path ="\\";

function signHeaders(accessId,accessKey,requestVars,epoch)
{
    // Construct signature 
    var hex = cryptojs.HmacSHA256(requestVars, accessKey);
    var signature = new Buffer(hex.toString(), "utf8").toString('base64');

    // Construct auth header
    var auth = "LMv1 " + accessId + ":" + signature + ":" + epoch;
    var headers = {
        "ContentType" : "application/json",
        "Authorization": auth
    };
    return headers
};

function getCustomerBySosId(Sostenuto_Id, callback)
{
    //Request details
    var httpVerb = "GET";
    var resourcePath = "/device/groups";
    var queryParams = "?fields=id,fullPath,name,customProperties&filter=customProperties.name:SOS_CUSTOMER_ID,customProperties.value:" + Sostenuto_Id;

    //Construct URL
    var url = "https://" + lmHost + ".logicmonitor.com/santaba/rest" + resourcePath  + queryParams;

    //Concatenate Request Details
    var requestVars = httpVerb + epoch + resourcePath;
    var signedHeaders = signHeaders(accessId, accessKey, requestVars, epoch);
    
    //Set Request Options
    var options = {
        "method": httpVerb,
        "uri": url,
        "json": true,
        "headers": signedHeaders
    };
    
    //Make request and check if customer was retrieved
    request(options, function (error, response, body) {
		if (response.statusCode == 200 && body.data.total == 1 ) {
            console.log("Customer: " + body.data.items[0].name);
		    callback(body.data.items[0].name);
		 }else{
            console.log("Error: "+ error);
            throw "Somthing went wrong retrieving customer"
            callback(mull);
         };
	 });
};

function createLmCollector(collectorGroupId, customerName, backupAgentId)
{
    console.log("Creating LogicMonitor collector");
    //request details
    var httpVerb = 'POST';
    var resourcePath = '/setting/collectors';
    var queryParams = '';
    if(backupAgentId)
    {
        var collectorType = "Primary";
        var data = '{"collectorGroupId": '+ collectorGroupId +',"description": "' + customerName + ' - ' + collectorType + '","backupAgentId":'+ backupAgentId +'}';
    }else{
        var collectorType = "Secondary";
        var data = '{"collectorGroupId": '+ collectorGroupId +',"description": "' + customerName + ' - ' + collectorType + '"}';
    };

    //Construct URL
    var url = 'https://' + lmHost + '.logicmonitor.com/santaba/rest' + resourcePath + queryParams;

    //Concatenate Request Details
    var requestVars = httpVerb + epoch + data + resourcePath;
    var signedHeaders = signHeaders(accessId, accessKey, requestVars, epoch);

    //Set Request Options
    var options = {
        "method": httpVerb,
        "uri": url,
        "json": true,
        "body": data,
        "headers": signedHeaders
    };

    //Make request and check if customer was retrieved
    request(options, function (error, response, body) {
		if (response.statusCode == 200) {
            console.log(body.data.id);
		    return body.data.id
		 }else{
            throw "Somthing went wrong creating collector"
         };
     });
}

function getLmCollector(customerName, callback)
{
    //request details

    var httpVerb = 'GET';
    var resourcePath = '/setting/collectors';
    var queryParams = '?fields=id,description,hostname&filter=description:' + customerName + ' - Secondary';
    //Construct URL
    var url = 'https://' + lmHost + '.logicmonitor.com/santaba/rest' + resourcePath + queryParams;
    
    //Concatenate Request Details
    var requestVars = httpVerb + epoch + resourcePath;
    var signedHeaders = signHeaders(accessId, accessKey, requestVars, epoch);

    //Set Request Options
    var options = {
        "method": httpVerb,
        "uri": url,
        "json": true,
        "headers": signedHeaders
    };
    
    //Make request and check if customer was retrieved
    request(options, function (error, response, body) {
		if (response.statusCode == 200 && body.data.total == 1 ) {
            console.log(body.data.items[0].id);
		    callback(body.data.items[0].id);
		 }else{
            callback(null);
         };
	 });
}

function createDirectory(path)
{
    if (!fs.existsSync(path)){
        fs.mkdirSync(path);
    };
};

function downloadLmInstaller(collectorId, collectorSize)
{
    //request details
    var httpVerb = 'GET'
    var resourcePath = '/setting/collectors/' + collectorId +'/installers/Linux64'
    var queryParams = '?collectorSize=' + collectorSize 

    //Construct URL
    var url = 'https://' + lmHost + '.logicmonitor.com/santaba/rest' + resourcePath + queryParams
    var signedHeaders = signHeaders(accessId, accessKey, requestVars, epoch);

    //Concatenate Request Details
    var requestVars = httpVerb + epoch + resourcePath
    var signedHeaders = signHeaders(accessId, accessKey, requestVars, epoch);
    
    //Set Request Options
    var options = {
        "method": httpVerb,
        "uri": url,
        "headers": signedHeaders
    };

    //Make request and stream file
    request(options, function (error, response, body) {

        if (error) {
            throw "Somthing went wrong downloading collector"

            callback(null);
        }
        else {

            callback(body);
        }
    });
}


function getCollectorGroup(customerName, callback)
{
    //request details

    var httpVerb = 'GET'
    var resourcePath = '/setting/collectors/groups'
    var queryParams = '?fields=id,name,description&filter=name:' + encodeURIComponent(customerName)
    //Construct URL
    url = 'https://' + lmHost + '.logicmonitor.com/santaba/rest' + resourcePath + queryParams
    
    //Concatenate Request Details
    var requestVars = httpVerb + epoch + resourcePath
    var signedHeaders = signHeaders(accessId, accessKey, requestVars, epoch);

    //Set Request Options
    var options = {
        "method": httpVerb,
        "uri": url,
        "json": true,
        "headers": signedHeaders
    };
    
    //Make request and check if customer was retrieved
    request(options, function (error, response, body) {
		if (response.statusCode == 200 && body.data.total == 1 ) {
            console.log(body.data.items[0].id);
		    callback(body.data.items[0].id);
		 }else{
            
            createCollectorGroup(customerName, function(collectorGroupId) {

                callback(collectorGroupId);
            });
         };
	 });
}


function createCollectorGroup(customerName, callback)
{
    //request details 
    var httpVerb = 'POST'
    var resourcePath = '/setting/collectors/groups'
    var queryParams = ''
    var data = '{"name": "' + customerName +'", "description": "' + customerName +' Collector Group"}'
    //Construct URL
    var url = 'https://' + lmHost + '.logicmonitor.com/santaba/rest' + resourcePath + queryParams
    
    //Concatenate Request Details
    requestVars = httpVerb + epoch + data + resourcePath
    var signedHeaders = signHeaders(accessId, accessKey, requestVars, epoch);
    
    //Set Request Options
    var options = {
        "method": httpVerb,
        "uri": url,
        "json": true,
        "body": data,
        "headers": signedHeaders
    };

    //Make request and check if customer was retrieved
    request(options, function (error, response, body) {
		if (response.statusCode == 200) {
            console.log(body.data.id);
		    callback(body.data.id);
		 }else{
            throw "Somthing went wrong creating customer group"
            callback(null);
         };
     });
}

function downloadAndInstall(newCollectorId, collectorSize) {

    //Create Directory
    createDirectory(path);
                    
    //Download Installer
    downloadLmInstaller(newCollectorId, collectorSize, function (installerData) {

        // Write data to the file
        fs.writeFile(path + '/LogicMonitorSetup.bin', installerData, function(error) {

            if (error) {
                throw "Somthing went wrong writing the file data"
            }
            else {

                //Check if file exists continue
                if (fs.existsSync(path+"/LogicMonitorSetup.bin")) {
                    console.log("Downloaded LogicMonitor collector installer successfuly");
                }else{
                    throw "Somthing went wrong downloading collector"
                };
            }
        });
    });
}


// ***************************** Script *************************** 
// Get Customer Name
getCustomerBySosId(Sostenuto_Id, function(customerName) {

    //Create Collector Group if it does not exist
    getCollectorGroup(customerName, function(collectorGroupId) {

        //Check if Secondary collector exists, then create a Secondary or Primary on test result
        getLmCollector(customerName, function(collectorId) {

            if (collectorId == null) {

                //Create a Secondary Collector in LogicMonitor
                createLmCollector(collectorGroupId, customerName, "", function(newCollectorId) {

                    downloadAndInstall(newCollectorId, collectorSize);
                });
            }else{
                //Create a Primary Collector in LogicMonitor
                createLmCollector(collectorGroupId, customerName, collectorId, function(newCollectorId) {

                    downloadAndInstall(newCollectorId, collectorSize);
                });
            }
        });

        //child_process.execFileSync(file -y);
    });
});


 