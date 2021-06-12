# AWS Cloud Practitioner Essentials

## Cloud Computing

_Amazon Web Services_ (AWS) is a cloud computing offering, meaning that it delivers IT resources on-demand with pay-as-you-go pricing. This is different compared to the traditional server/hosting model where resources needed to be allocated in advance and payed fully even when not needed at all times.

Deployment models can still vary, ranging from full _cloud-based deployment_ (where all parts of an application run in the cloud), to _on-premise deployment_ (also known as _private cloud deployment_ where everything still runs in on-premises data centers but using virtualization to achieve some of the benefits of cloud computing), with _hybrid deployments_ mixing both extremes.

Cloud Computing comes with a couple of benefits:

- Upfront expenses (e.g. physical server purchases) exchanged for variable expenses
- Capacity estimations are no longer necessary
- Costs can benefit from AWS economies of scale
- Increased speed in accessing new resources (e.g. compared to having to purchase new servers for a data center)
- Benefit from global infrastructure

## Basic Cloud Computing with EC2 and ELB

### Amazon EC2

_Amazon Elastic Compute Cloud_ (more famously known under its acronym _EC2_) is a service for providing virtual servers. The advantage of such a virtual server is that it can be available within minutes of being requested and terminated when it's no longer required, thus only incurring costs for an instance's active time.

Each EC2 instance is run by a hypervisor on a physical server, coordinating the multitenancy of a couple of virtual servers by allocating resources to each of them and isolating them from each other.

Each EC2 instance can be configured with its own OS and whatever software should run on it. EC2 instances can also be vertically scaled, increasing or decreasing their memory or CPU power.

There are various families of EC2 instances, grouped by and optimized for their expect use case:

- _General purpose_ instances provide a good balance of compute, memory and networking resources
- _Compute optimized_ instances provide more CPU power for compute-intensive tasks like game servers
- _Memory optimized_ instances are good for memory-intensive tasks (e.g. when needing to preload lots of data into memory)
- _Accelerated computing_ instances use hardware accelerators to perform some functionality way quicker than when running on a normal CPU (e.g. floating point operations on a mathematic co-processor)
- _Storage optimized_ instances are optimized for fast access to locally stored data

Pricing options for EC2 come in various flavors:

1. Full on-demand billing is purely based on actual usage and requires no further contract or communication
2. _Savings Plan_ offer lower prices in exchange for a commitment to a consistent amount of EC2 usage (measured in $ per hour for one or three years)
3. _Reserved instances_ for workloads with predictable usage
4. _Spot instances_ that request spare EC2 computing capacity that can be terminated with a 2-minute notice by AWS, but is up to 90% cheaper than the on-demand pricing
5. _Dedicated Hosts_, meaning physical servers for EC2 use without sharing their power in a multitenancy environment

### Amazon EC2 Auto Scaling

_EC2 Auto Scaling_ can automatically add or remove EC2 instances in response to changing demands. _Dynamic scaling_ (responding to changing demand) and _Predictive scaling_ (based on automatic predictions) can be used together to scale for varying amounts of requests.

Scaling is done with EC2 Auto Scaling groups. On setup, a minimum capacity is configured, meaning that this number of EC2 instances will always run, no matter what. The _desired capacity_ (defaults to the minimum cap) can be set as well as a _maximum capacity_ to allow auto scaling to automatically add instances when the existing ones are at capacity.

### Elastic Load Balancing

_Elastic Load Balancing_ (_ELB_) runs at a AWS region level and balances load to multiple resources like EC2 instances. ELB and EC2 Auto Scaling are separate services but work perfectly in tandem.

### Messaging and Queuing

Too keep components of an applications loosely coupled, architectures that introduce a buffer between components are preferrable. This can be achieve with _Amazon Simple Queue Service_ (_SQS_) or _Amazon Simple Notification Service_ (_SNS_).

_SNS_ is a pub/sub service, where publishers can publish messages to certain suscribers, using SNS topics. Many AWS offerings can be subscribers.

_SQS_ is a message queuing service and can be used to send, store and receive messages between software components, independent of these component's availability.

### Additional Compute Services

An AWS service for serverless computing (i.e. not needing a dedicated instance like EC2) is _AWS Lambda_. It lets a user run code without the need to provision or manage any kind of server. An example would be resizing images: The so-called Lambda function is triggered on an image upload (a defined event source like a HTTP endpoint), computes the image and only that compute time is actually billed. With its maximum run time of 15 minutes, Lambdas are suited for quick processing tasks.

For using containerized (i.e. Docker) software at scale, AWS provides orchestration services like _Elastic Container Service_ (_ECS_) or even _Elastic Kubernetes Service_ (_EKS_). Both can run on top of EC2 instances or use the serverless compute platform _AWS Fargate_.

## Global Infrastructure and Reliability

AWS structures its offerings into several geographically independent _Regions_, each one comprising many data centers for redundancy. Each region is also connected to other regions to allow global reach. By default, though, data only lives in one region unless exported explicitly. Choosing a region comes down to deciding between

- Compliance and legal requirements
- Customer proximity
- Available services
- Pricing

Inside each region, _Availability Zones_ (one or more data centers) guarantee independent units of operation over which resources can be distributed to allow redundancy and safety in case of any AZ becoming unavailable (i.e. running two EC2 instances, one in the `us-west-1a` AZ and one in `us-west-1b`).

To dstribute cached copies of data all around the world, the AWS CDN can be used: _Amazon CloudFront_. By using Edge locations (separate entities from regions), content can be distributed with the closest proximity to a global audience.

### Resource Provisioning

To provision or manage any AWS resource, APIs are used. API calls can be made through either

- the AWS Management Console (the web interface)
- the AWS Command Line Interface (`awscli`)
- or programmatically through the AWS SDKs or tools like _Elastic Beanstalk_ or _CloudFormation_

_CloudFormation_ specifically is a tool following the _infrastructure as code_ approach, allowing for the definition of a wide array of AWS services declaratively by using JSON or YAML documents called _templates_.

## Networking

_Virtual Private Clouds_ (_VPCs_) are private networks within AWS to define private IP ranges for AWS resources. Those resources are placed into different subnets, with each subnet having rule definitions to decide who can access those resources.

To allow traffic to flow from the public internet to a VPC, an internet gateway (IGW) is needed. A VPC with all internal private resources can also be made accessible to certain users with a virtual private gateway to create a VPN connection between e.g. an on-premises data center and a VPC. To increase security even more and bypass public infrastructure, _AWS Direct Connect_ can be used for a direct private fiber connection between a data center and an AWS VPC.

Subnets allow checks against a _network access control list_ (_ACL_), a stateless mechanism to determine each packet's permissions to cross a subnet boundary. One level deeper down, _security groups_ regulate (stateful) access control on an instance level. Each EC2 instance, for example, belongs to a security group that allows specific traffic in and out.

Public and private subnets are most typically used to separate web applications (that need to be reached from the public internet) and databases (that should only be reachable by the web applications).

_Route 53_ is AWS' DNS web service that can route traffic directly to specific AWS resources like EC2 instances or ELB.

## Databases and Storage

### Storage

Normal EC2 instances have, by default, something called _instance store volumes_. This is hard drive space directly on the EC2 host system. When an EC2 instance is spun down and restarted, it's likely that the new instance is running on a different host, so no data written to the instance store volume would have been persisted.

_Elastic Block Store_ (_EBS_) is a volume that can be attached to an EC2 instance and that isn't tied to a specific host. It can therefore be used to store persistent data across instance runs. Regular snapshots (incrementally done) prevent data loss in case of a file system corruption.

As a general data store, _Simple Storage Service_ (best known under its acronym _S3_) provides an interface to store files (as objects) in collections of files (buckets). Depending on a variable storage class, data can be saved according to access needs and safety over a long period of time. Services like _S3 Glacier_ are suited for data that needs to be stored for a long time but not immediately acessed, so retrieval times range from minutes to hours.

The maximum size of an object stored in S3 is 5 terabytes. Per-object permissions control an object's visiblity and access. The standard S3 object tier stores each object across three availability zones.

Since block storage like EBS stores data in blocks, it only needs to update changes to those increments. For S3, as soon as an object changes, the whole object needs to be stored again.

_Elastic File System_ (_EFS_) is a scalable file system that can be used like a regular Linux file system. It is ideal for when a large number of AWS resources need access to a shared file system.

### Databases

_Relational Database Service_ (_RDS_) offers managed relational databases like MySQL, PostgreSQL etc. with the benefit of also providing ready-made solutions for backups, replication and disaster recovery. _Amazon Aurora_ is another step up from RDS in terms of availability and reliability.

_DynamoDB_ is a non-relational managed database offering similar to e.g. MongoDB.

_Amazon Redshift_, in comparison, is a data warehousing service best used for big data analytics, providing performance for huge queries at scale over large amounts of data in different formats.

_AWS Database Migration Service_ provides a set of functionality for migrating different types of data stores as well as helping with testing and replication of databases.

For other specific use cases there is a variety of database services in AWS (e.g. _DocumentDB_, _Neptune_, a graph database, _ElastiCache_ for a hosted Redis or Memcached, or even _Managed Blockchain_).

## Security

### Shared Responsibility Model

With AWS, there is a distinction between _security in the cloud_ and _security of the cloud_. The latter is AWS's responsibility and touches on all layers of the infrastructure: the host operating systems, the virtualization layer and the physical network, hardware and data centers from which AWS services operate.

The former, the customer responsibility, refers to whatever runs _in_ AWS. This includes managing security requirements for content and access to services, depending on the sepcific AWS services.

### AWS Identity and Access Management (IAM)

By default, the AWS root use (who registered the AWS account) has access to and control over every resource in the account. This level of access is often not necessary and a security risk when multiple people might need access to only parts of an AWS system. That's where AWS IAM comes into place, allowing fine-grained permissions for all AWS offerings.

A freshly registered IAM user does not have any permissions - she can't even log into her AWS account (following the _least privileged principle_). By creating IAM policies,
