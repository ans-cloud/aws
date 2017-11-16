# LogicMonitor Collectors

[![Deploy to AWS](/aws_deploy.png)](https://portal.azure.com/#create/Microsoft.Template/uri/https%3A%2F%2Fraw.githubusercontent.com%2Fans-cloud%2Fazure%2Fmaster%2FLogicMonitor-Collector%2FCreateLMCollector.json)
<a href="http://armviz.io/#/?load=https%3A%2F%2Fraw.githubusercontent.com%2Fans-cloud%2Fazure%2Fmaster%2FLogicMonitor-Collector%2FCreateLMCollector.json" target="_blank">
    <img src="/aws_view.png"/>
</a>

This template creates a failover pair of LogicMonitor collectors and registers them in the LogicMonitor portal. The template uses the AWS Instance Userdata to download a PowerShell installation script from GitHub, once executed it registers the collectors in LogicMonitor then downloads the collector installation media, and finally installs the collector software. 

![Diagram](/LogicMonitor-Collector/CreateLMCollector.png)