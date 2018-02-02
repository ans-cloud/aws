# LogicMonitor Collectors (No Public IP)

[![Deploy to AWS](/Images/aws_deploy.png)](https://console.aws.amazon.com/cloudformation/home?region=eu-west-2/stacks/new?stackName=ANS-LogicMonitor-Collectors&templateURL=template_location)
[![Deploy to AWS](/Images/aws_view.png)](https://console.aws.amazon.com/cloudformation/designer/home?region=eu-west-2&&templateUrl=template_location)

This template creates a failover pair of LogicMonitor collectors into an existing Subnet and registers them in the LogicMonitor portal. The template uses the EC2 Userdata to download a Python installation script from GitHub, once executed it registers the collectors in LogicMonitor then downloads the collector installation media, and finally installs the collector software. 

![Diagram](/LogicMonitor-Collector-Existing-Network/CreateLMCollector.png)


