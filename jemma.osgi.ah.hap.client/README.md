HAP Client
==========

It is a service adding a reliable layer to transfer data from the platform to the provisioning server. It can use punctual and batch mode (used especially when no connectivity is available).

HAP proxy exposes in the Home network xml apis to access data in the platform and to send commands to sensors through a REST interface.

The HAP Client registers into the OSGi service registry the follwing services:

- IM2MLocalService: permits to access the locally configured home automation 
  device using the same resources description used to interact with the M2M platform

- 



