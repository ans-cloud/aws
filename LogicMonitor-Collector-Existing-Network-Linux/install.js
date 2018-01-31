
var request = require('request');
var requestProgress = require('request-progress');
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
var path = __dirname+"/lm";

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
            callback(null);
         };
	 });
};

function createLmCollector(collectorGroupId, customerName, backupAgentId, callback)
{
    console.log("Creating LogicMonitor collector");
    //request details
    var httpVerb = 'POST';
    var resourcePath = '/setting/collectors';
    var queryParams = '';

    var data = null;
    if(backupAgentId)
    {
        var collectorType = "Primary";
        data = {
            "collectorGroupId": collectorGroupId,
            "description": customerName + ' - ' + collectorType,
            "backupAgentId": backupAgentId
        }
    }else{
        var collectorType = "Secondary";
        data = {
            "collectorGroupId": collectorGroupId,
            "description": customerName + ' - ' + collectorType
        };
    };

    //Construct URL
    var url = 'https://' + lmHost + '.logicmonitor.com/santaba/rest' + resourcePath + queryParams;

    //Concatenate Request Details
    var requestVars = httpVerb + epoch + JSON.stringify(data) + resourcePath;
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
		    callback(body.data.id)
		 }else{
            throw "Somthing went wrong creating collector"
            callback(null);
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

function downloadLmInstaller(collectorId, collectorSize, callback)
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

    var fullPath = path + '/LogicMonitorSetup.bin';
    var fileStream = fs.createWriteStream(fullPath);

    //Make request and stream file
    var req = requestProgress(request(options));

    req.on("progress", function (state) {

        console.log("Percent Complete: " + ((state.size.total / 100) * state.size.transferred) + "% - Speed: " + (state.speed / 125000).toFixed(2) + " Mbps - Time Remaining: " + state.time.remaining + " Seconds");
    });

    req.on("end", function (error, response, body) {

        if (error) {
            throw "Somthing went wrong downloading collector"

            callback(null);
        }
        else {

            callback(fullPath);
        }
    });

    // Pipe into the file stream
    req.pipe(fileStream);
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
    console.log(customerName);
    //request details 
    var httpVerb = 'POST'
    var resourcePath = '/setting/collectors/groups'
    var queryParams = ''
    var data = {
        "name": customerName,
        "description": customerName + " Collector Group"
    };

    //Construct URL
    var url = 'https://' + lmHost + '.logicmonitor.com/santaba/rest' + resourcePath + queryParams
    
    //Concatenate Request Details
    var requestVars = httpVerb + epoch + JSON.stringify(data) + resourcePath
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
            console.log("Customer Group Error: " + body)
            throw "Somthing went wrong creating customer group"
            callback(null);
         };
     });
}

function downloadAndInstall(newCollectorId, collectorSize) {

    //Create Directory
    console.log("Path: "+path);
    if (!fs.existsSync(path)){
        console.log("Path: "+path);
        fs.mkdirSync(path);
    };
                    
    //Download Installer
    downloadLmInstaller(newCollectorId, collectorSize, function (filePath) {

        if (error) {
            throw "Somthing went wrong writing the file data"
        }
        else {

            //Check if file exists continue
            if (fs.existsSync(filePath)) {
                console.log("Downloaded LogicMonitor collector installer successfuly at: " + filePath);
            }else{
                throw "Somthing went wrong downloading collector"
            };
        }
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


 