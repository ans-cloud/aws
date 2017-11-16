# LogicMonitor Collectors

[![Deploy to AWS](/Images/aws_deploy.png)](https://console.aws.amazon.com/cloudformation/home?region=eu-west-2#/stacks/new?stackName=ANS_LogicMonitor&templateURL=https://raw.githubusercontent.com/ans-cloud/aws/master/LogicMonitor-Collector/CreateLMCollector.template)
[![Deploy to AWS](/Images/aws_view.png)](https://console.aws.amazon.com/cloudformation/designer/home?region=eu-west-2&templateURL=https://raw.githubusercontent.com/ans-cloud/aws/master/LogicMonitor-Collector/CreateLMCollector.template)

This template creates a failover pair of LogicMonitor collectors and registers them in the LogicMonitor portal. The template uses the AWS Instance User Data to download a PowerShell installation script from GitHub, once executed it registers the collectors in LogicMonitor then downloads the collector installation media, and finally installs the collector software. 

![AWS Diagram](/LogicMonitor-Collector/CreateLMCollector.png)
