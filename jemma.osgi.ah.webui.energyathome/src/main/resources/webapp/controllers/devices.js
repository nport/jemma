mainApp.controller('DevicesController', DevicesController);

Elettrodomestici = {

	registerPlugin : function() {

	}

};

function DevicesController($scope, $compile) {

	var _this = this;

	this.$compile = $compile;
	this.$scope = $scope;
	this.$ifEh = InterfaceEnergyHome;

	this.firstTime = true;

	this.deviceDetailsView = "eh-generic-device-details";

	this.devicesUpdateInterval = 20000;

	this.locations = [];
	this.categories = [];

	/*
	 * This is the list of devices received from the backend. Every time this
	 * list is updated a watch will update the shownDevices list, that is bound
	 * to the devices.html page.
	 */
	this.devices = [];

	this.shownDevices = {};

	this.consumoTotale = 3;
	this.altroConsumo = 5;
	this.potenzaAttuale = 6;

	// this is a configuration parameter.
	this.devicesPerPage = 6;

	this.currentPage = 0;

	this.disableUpdate = false;

	this.current = undefined;

	/**
	 * The pid of the currently selected device
	 */
	this.devicePid = null;

	/**
	 * The currently selected device data.
	 */
	this.device = null;

	this.timerDevices = null;
	this.notAvailable = "NP";
	this.plugins = {};

	this.$scope.$on('$destroy', function deactivate() {
		console.log("deactivate devices controller");
		_this.exit();
	});

	/**
	 * Updates the parameters changed in the this.deviceInfo field
	 */
	this.updateDeviceInfo = function() {
		var _this = this;

		if (this.current != null) {

			var device = this.current;
			var info = {
				'javaClass' : "java.util.Hashtable",
				'map' : {}
			};

			console.log("sto scrivendo categoria : " + this.deviceInfo.category);

			/* sends only changed infos */

			var changed = false;
			if (device.name != this.deviceInfo.name) {
				info.map[this.$ifEh.ATTR_APP_NAME] = this.deviceInfo.name;
				changed = true;
			}

			if (device.location != this.deviceInfo.location) {
				info.map[this.$ifEh.ATTR_APP_LOCATION] = this.deviceInfo.location;
				changed = true;
			}

			if (device.category != this.deviceInfo.category) {
				info.map[this.$ifEh.ATTR_APP_CATEGORY] = this.deviceInfo.category;
				changed = true;
			}

			if (changed) {
				info.map["appliance.pid"] = device.id;
				var p = this.$ifEh.objService.updateAppliance(info);
				p.done(function(result) {
					_this.$scope.$apply(function() {
						device.name = _this.deviceInfo.name;
						device.location = _this.deviceInfo.location;
						device.category = _this.deviceInfo.category;
					});
				});
			}
		}

	};

	this.getAttribute = function(attributeName) {
		if (this.current == undefined) {
			return undefined;
		}

		var device = this.current;

		var measure = device["measure"][attributeName];
		if (measure != null) {
			return measure.value;
		} else {
			return "--";
		}
	}

	this.updateAttribute = function(appliancePid, attribute) {
		var _this = this;

		var device = this.getDeviceByPid(appliancePid);
		if (device != undefined) {
			// update the attribute present in the device
			this.$scope.$apply(function() {
				_this.mapDeviceValues(device, attribute);
				// _this.refreshDevices();

				if (attribute.name == "IstantaneousDemand") {
					_this.updateIstantaneousDemand();
				}
			});
		}
	}

	this.getDeviceByPid = function(appliancePid) {
		for (var i = 0; i < this.devices.length; i++) {
			if (this.devices[i]["id"] == appliancePid) {
				return this.devices[i];
			}
		}
		return null;
	}

	this.selectDevice = function(device) {
		this.current = device;
		this.deviceDetailsView = "eh-generic-device-details";
	}

	this.checkDeviceDriver = function(controllerName) {
		if (this.current != undefined) {
			var deviceController = this.getInterfaceController(this.current);
			if (deviceController != undefined) {
				return deviceController.getName() == controllerName;
			}
		}

		return false;
	}

	/**
	 * Add a new device to the list of currently configured devices
	 */

	this.addDevice = function(appliancePid, deviceInfo) {

		var _this = this;

		console.log(appliancePid + ": added device " + deviceInfo);

		if (deviceInfo != null) {
			var device = this.getDeviceByPid(deviceInfo[this.$ifEh.ATTR_APP_PID]);
			if (device == undefined) {
				// create it
				device = {};
				device["measure"] = {};
				device.view = {};
				device.view.icon = "";
				device.view.measureName = "";
				device.view.measureValue = "";
				device.view.state = "--";

				this.devices.push(device);
			} else {
				console.log("ERROR: " + appliancePid + ": added an already existing device " + deviceInfo)
			}

			/*
			 * Convert a deviceInfo into a device, that is the structure used
			 * internally.
			 */

			var i = this.devices.length - 1;
			_this.updateDevice(deviceInfo, device);

			var deviceController = _this.getInterfaceController(device);

			device.view.type = deviceController.getName();

			/**
			 * If the device is the currently selected one, then update the view
			 * by calling the interface object
			 */

			if (device.id == _this.devicePid) {
				deviceController.update(device);
			} else {
				deviceController.update(device);
			}

			console.log("Il nuovo device ha categoria: " + device.category);
		}
	};

	/**
	 * Replace completely the device information with the new ones.
	 */

	this.updateDevice = function(deviceInfo, device) {
		var _this = this;

		device["id"] = deviceInfo[this.$ifEh.ATTR_APP_PID];
		device["name"] = deviceInfo[this.$ifEh.ATTR_APP_NAME];
		device["category"] = deviceInfo[this.$ifEh.ATTR_APP_CATEGORY];
		device["location"] = deviceInfo[this.$ifEh.ATTR_APP_LOCATION];
		device["connessione"] = deviceInfo[this.$ifEh.ATTR_APP_AVAIL];
		device["clusters"] = deviceInfo["clusters"];
		device[this.$ifEh.ATTR_APP_TYPE] = deviceInfo[this.$ifEh.ATTR_APP_TYPE];

		var values = deviceInfo["device_value"];

		$.each(values, function(idx, el) {
			_this.mapDeviceValues(device, el);
		});

		device["stato"] = 0;
		if (device["connessione"] == 2) {
			device["stato"] = 1;
		}

		appType = deviceInfo[this.$ifEh.ATTR_APP_TYPE];
		var str = deviceInfo[this.$ifEh.ATTR_APP_ICON];

		var location;
		if (device.location != null && this.locations != null) {
			device.view.location = this.locations[device.location];
		} else {
			device.viewlocation = "--";
		}

		// FIXME: if it is not a png file???
		device["icon"] = str.replace(".png", "");
	}

	this.deleteDevice = function(appliancePid) {

		var _this = this;

		for (var i = 0; i < this.devices.length; i++) {
			if (this.devices[i]["id"] == appliancePid) {
				this.$scope.$apply(function() {
					_this.devices.splice(i, 1);
					if (appliancePid == _this.devicePid) {
						console.log("requested to delete the selected device!");
						_this.devicePid = null;
					}
				});
				return true;
			}
		}
		return false;
	}

	this.removeDevice = function() {
		if (this.current != null) {
			var device = this.current;
			var p = this.$ifEh.objService.removeDevice(device.id);
			p.done(function() {
				console.log("removed device " + device.id);
			});
		}
	}

	this.identify = function(time) {
		if (time == null) {
			time = 10;
		}

		if (this.current != null) {
			var p = $ifEh.objService.identifyAppliance(this.current.id, time);
			p.done(function(result) {

			});
		}
	}

	this.updateIstantaneousDemand = function() {
		var istantaneousDemand = 0;

		$.each(this.devices, function(i, device) {
			var istantaneousDemandAttribute = device.measure["IstantaneousDemand"];
			if (istantaneousDemandAttribute != undefined) {
				istantaneousDemand += istantaneousDemandAttribute.value;
			}
		});

		this.consumoTotale = istantaneousDemand;
	};

	/**
	 * Initialize the Controller!
	 */

	this.init();
}

DevicesController.prototype.init = function() {
	var _this = this;

	if (!useAngular) {

		$("#RigaPulsanti").hide();

		$("#RigaPulsanti #indietro").click(function() {
			if (this.currentPage > 0) {
				this.currentPage--;
				this.refreshDevices();
			}
		});

		$("#RigaPulsanti #avanti").click(function() {
			if (this.currentPage < this.getPagesNumber(this) - 1) {
				this.currentPage++;
				this.refreshDevices();
			}
		});
	}

	this.addSpinner("#RigaElettrodomestici");

	// if (this.$ifEh.objService == null && !this.firstTime) {

	/*
	 * Starts to watch for the $ifEh reference
	 */
	this.applianceServiceInit = setInterval(function() {
		if (_this.$ifEh.objService != null) {
			clearInterval(_this.applianceServiceInit);
			_this.update();
		}

	}, 100);
	// } else {
	// this.update();
	// }

	$("#RigaElettrodomestici").click(function(event) {
		var b = $(event.target).closest(".device");
		var pid = b.data("devicePid");
		var pid = b.attr("id");

		if (pid == undefined) {
			return;
		}

		// find the device by pid
		var device = _this.getDeviceByPid(pid);

		// remember the currently selected devicePid.
		_this.devicePid = pid;

		if (!useAngularForDetails) {

			if (device.connessione != 2) {
				_this.loadInterfaccia(device, null);
			} else {
				_this.loadInterfaccia(device, null);
			}
		}

	});

	/*
	 * $(document).on("click", '#modalDevice', function(event) {
	 * _this.$scope.devicePid;
	 * 
	 * if (_this.devicePid != undefined) { var data =
	 * $('#formDevice').serialize(); } event.preventDefault(); });
	 */

	source = new EventSource("sse" + '/' + Main.topic);

	source.onmessage = function(event) {

		if (event.data != undefined) {
			var data = JSON.parse(event.data);
			var topics = data['event.topics'];
			if (topics == 'jemma/energyathome/event/attribute') {
				_this.updateAttribute(data.appliancePid, data.attributeValue);
			} else if (topics == 'jemma/energyathome/event/device/DELETED') {
				console.log(data.appliancePid + ": deleted device " + event.data);
				_this.deleteDevice(data.appliancePid);
			} else if (topics == 'jemma/energyathome/event/device/ADDED') {
				_this.addDevice(data.appliancePid, data.deviceInfo);
			} else if (topics == 'jemma/energyathome/event/device/UPDATED') {
				/*
				 * This event is sent only when the basic information about the
				 * device are updated, like the name, the category or the
				 * location. For updating device attributes, attributes are
				 * sent.
				 */
				console.log(data.appliancePid + ": updated device " + event.data);
				var deviceInfo = data.deviceInfo;

				if (deviceInfo != null) {
					var device = _this.getDeviceByPid(deviceInfo[$ifEh.ATTR_APP_PID]);
					/*
					 * Convert a deviceInfo into a device, that is the structure
					 * used internally.
					 */

					_this.updateDevice(deviceInfo, device);
				}
			}
		}
	};
}

DevicesController.prototype.getPagesNumber = function() {
	return this.devices / this.devicesPerPage;
}

DevicesController.prototype.registerPlugin = function(info) {
	this.plugins[info.name] = info;
}

// Funzione che crea un dizionario pid->name locazione
DevicesController.prototype.getLocations = function() {

	var _this = this;

	try {
		// get the scope of the mainController
		// var scope = angular.element($('[ng-controller=devices]')).scope();

		var p = this.$ifEh.objService.getLocations();
		p.done(function(result) {
			for (i = 0; i < result.length; i++) {
				pid = result[i][_this.$ifEh.ATTR_LOCATION_PID];
				name = result[i][_this.$ifEh.ATTR_LOCATION_NAME];
				_this.locations[pid] = name;
			}

		}).fail(function(err) {
			console.log("error: " + err);
		});
	} catch (e) {
		console.log("exception: " + e);
	}
}

/**
 * Reads the list of available categories from the backend.
 */
DevicesController.prototype.getCategories = function() {

	var _this = this;

	try {
		var p = this.$ifEh.objService.getCategoriesWithPid();
		p.done(function(result) {
			for (i = 0; i < result.length; i++) {
				var pid = result[i]["pid"];
				var name = result[i][_this.$ifEh.ATTR_CATEGORY_NAME];
				var icon = result[i]["icon"];

				_this.categories[i] = {
					"name" : name,
					"icon" : icon,
					"pid" : pid
				};
			}
		}).fail(function(err) {
			console.log("error: " + err);
		});
	} catch (e) {
		console.log("exception: " + e);
	}
}

DevicesController.prototype.getCategoryIndex = function(name) {

	for ( var cat in this.categorie) {
		if (this.categorie[cat].name == name) {
			return cat;
		}
	}
	return -1;
}

/**
 * Retrieve the list of currently configured devices
 */

DevicesController.prototype.getDeviceInfos = function(callback) {

	var _this = this;

	var currentlySelectedDeviceFound = false;

	try {
		console.log("Requesting device list");
		var p = this.$ifEh.objService.getAppliancesConfigurationsDemo();
		p.done(function(appliances) {
			_this.removeSpinner("#RigaElettrodomestici");

			var currentlySelectedDeviceFound = false;

			_this.consumoTotale = 0;
			_this.altroConsumo = 0;

			/*
			 * We need to update the current list with the new one. We take care
			 * of updating the devices that where already present!
			 * 
			 * FIXME: in case of removal we need to remove the device!!!!
			 */

			$.each(appliances, function(i, deviceInfo) {

				var appType = deviceInfo[_this.$ifEh.ATTR_APP_TYPE];
				var appliancePid = deviceInfo[_this.$ifEh.ATTR_APP_PID];

				if (appType == _this.$ifEh.SMARTINFO_APP_TYPE) {
					if (deviceInfo["category"]["name"] == "Meter") {
						_this.smartInfoDevice = deviceInfo;
					} else {
						/* this is probably the Photovoltaic Smart Meter */
						_this.smartInfoPVDevice = deviceInfo;
					}
				} else {
					_this.addDevice(appliancePid, deviceInfo);
				}

				if (appliancePid == _this.devicePid) {
					currentlySelectedDeviceFound = true;
				}
			});

			if (!currentlySelectedDeviceFound) {
				_this.devicePid = null;
			}

			callback();
		});
	} catch (e) {
		console.log("exception: " + e);
	}
}

/**
 * This function convert the measure representation received from the Jemma
 * backend into the local GUI representation.
 * 
 * FIXME: this is a bad way for doing that move this in the device gui
 * indterfaces.
 */

DevicesController.prototype.mapDeviceValues = function(device, el) {

	if (el.name == "IstantaneousDemand") {
		device["measure"][el.name] = {
			value : el.value.value,
			unit : "W",
			label : "Consumption",
			name : "watt",
			type : el.name
		};
	} else if (el.name == "CurrentLevel") {
		device["measure"][el.name] = {
			value : el.value.value,
			unit : "% ",
			label : "Level",
			name : "",
			type : el.name
		};
	} else if (el.name == "OnOff") {
		device["measure"][el.name] = {
			value : el.value.value,
			unit : " ",
			label : "State",
			name : "",
			type : el.name
		};
	} else if (el.name == "LocalHumidity") {
		device["measure"][el.name] = {
			value : el.value.value,
			unit : "% RH",
			label : "Humidity: ",
			name : "relative humidity",
			type : el.name
		};
	} else if (el.name == "ZoneStatus") {
		device["measure"][el.name] = {
			value : el.value.value,
			unit : " ",
			label : "State",
			name : "",
			type : el.name
		};
	} else if (el.name == "Illuminance") {
		device["measure"][el.name] = {
			value : el.value.value,
			unit : " ",
			label : "State",
			name : "",
			type : el.name
		};
	} else if (el.name == "Occupancy") {
		device["measure"][el.name] = {
			value : el.value.value,
			unit : " ",
			label : "State",
			name : "",
			type : el.name
		};
	} else if (el.name == "Temperature") {
		device["measure"][el.name] = {
			value : el.value.value,
			unit : "C",
			label : "Temperature",
			name : "celsius",
			type : el.name
		};
	} else if (el.name == "TargetTemperature") {
		device["measure"][el.name] = {
			value : el.value.value,
			unit : "C",
			label : "TargetTemperature",
			name : "celsius",
			type : el.name
		};
	} else if (el.name == "TargetTemperatureLow") {
		device["measure"][el.name] = {
			value : el.value.value,
			unit : "C",
			label : "TargetTemperatureLow",
			name : "celsius",
			type : el.name
		};
	} else if (el.name == "TargetTemperatureHigh") {
		device["measure"][el.name] = {
			value : el.value.value,
			unit : "C",
			label : "TargetTemperatureHigh",
			name : "celsius",
			type : el.name
		};
	} else if (el.name == "isHeating") {
		device["measure"][el.name] = {
			value : el.value.value,
			unit : "",
			label : "Is Heating",
			name : "",
			type : el.name
		};
	} else if (el.name == "AwayState") {
		var val = el.value.value;
		device["measure"][el.name] = {
			value : val,
			unit : " ",
			label : "Away",
			name : "",
			type : el.name
		};
	} else if (el.name == "LocalTemperature") {
		device["measure"][el.name] = {
			value : el.value.value,
			unit : "C",
			label : "Temperature",
			name : "celsius",
			type : el.name
		};
	} else if (el.name == "LockState") {
		var val = el.value.value;

		device["measure"][el.name] = {
			value : el.value.value,
			unit : " ",
			label : "Door",
			name : "",
			type : el.name
		};
	} else if (el.name == "CurrentPositionLiftPercentage") {
		var val = null;
		if (device["WindowState"] > 0) {
			val = "OPEN";
		} else if (device["WindowState"] == 0) {
			val = "CLOSE";
		} else {
			val = this.notAvailable;
		}
		device["measure"][el.name] = {
			value : val,
			unit : " ",
			label : "Window",
			name : "",
			type : el.name
		};
	}
}

DevicesController.prototype.getCurrentProduction = function() {
	var _this = this;

	try {
		var p = this.$ifEh.objService.getAttribute($ifEh.attr.ATTR_PRODUCED_POWER);
		p.done(function(result) {
			if (!isNaN(result.value)) {
				if (_this.potenzaAttuale < 0) {
					_this.potenzaAttuale = 0;
				}
				if (_this.potenzaAttuale < _this.consumoTotale) {
					_this.potenzaAttuale = _this.consumoTotale;
				}
			}
		});
	} catch (e) {
		console.log("exception: " + e);
	}
};

DevicesController.prototype.getCurrentPower = function() {
	var _this = this;
	try {
		var p = this.$ifEh.objService.getAttribute(this.$ifEh.attrs.ATTR_TOTAL_POWER);
		p.done(function(result) {
			_this.potenzaAttuale = result.value;
		});
	} catch (e) {
		console.log("exception: " + e);
	}
};

DevicesController.prototype.update = function() {
	var _this = this;

	if (this.$scope == undefined) {
		console.log("please set $scope");
		return;
	}

	if (this.timerDevices == null && !this.disableUpdate) {
		// thanks to stackoverflow this is a way to pass the 'this' context.
		this.timerDevices = setInterval($.proxy(this.update, this), this.devicesUpdateInterval);

	}

	this.getCategories();
	this.getLocations();

	this.getDeviceInfos(function() {
		// NICOLA: togliere i commenti se non si simula!!!!
		_this.$scope.$apply(function() {
			// _this.refreshDevices();
		});
	});
}

DevicesController.prototype.stopUpdate = function() {
	if (this.timerDevices != null) {
		clearInterval(this.timerDevices);
		this.timerDevices = null;
	}
}

if (!useAngular) {

	DevicesController.prototype.refreshDevices = function() {
		var start = this.pagina * this.devicesPerPage;

		var totalPages = (this.devices.length / this.devicesPerPage | 0) + 1;

		if (totalPages <= 1) {
			$("#RigaPulsanti").hide();
		} else {
			$("#RigaPulsanti").show();
		}

		if (this.currentPage > 0) {
			$("#RigaPulsanti #indietro").show();
		} else {
			$("#RigaPulsanti #indietro").hide();
		}

		if (this.currentPage >= totalPages - 1) {
			$("#RigaPulsanti #avanti").hide();
		} else {
			$("#RigaPulsanti #avanti").show();
		}

		var start = this.currentPage * this.devicesPerPage;
		var end = Math.min(start + this.devicesPerPage, this.devices.length);

		for (i = start; i < end; i++) {
			var device = this.devices[i];
			var deviceController = this.getInterfaceController(device);
			/**
			 * If the device is the currently selected one, then update the view
			 * by calling the interface object
			 */
			if (device.id == this.devicePid) {
				deviceController.update(device);
			} else {
				deviceController.update(device);
			}
		}
	}
}

DevicesController.prototype.getDeviceByPid = function(pid) {
	for (var i = 0; i < this.devices.length; i++) {
		if (this.devices[i]["id"] == pid) {
			return this.devices[i];
		}
	}
	return null;
}

DevicesController.prototype.loadInterfaccia = function(device, clusters) {

	var _this = this;

	var ifObject = $("#Interfaccia");
	ifObject.hide();
	ifObject.find(".content").empty();
	ifObject.find(".header .titolo").empty();

	if (device != null) {
		var deviceController = this.getInterfaceController(device);

		// FIXME: each device controller must know where it resides!!!

		var baseUrl = "devices/" + deviceController.getName() + "/";
		$.get(baseUrl + deviceController.getName() + ".html", function(template) {
			_this.$scope.$apply(function() {
				ifObject.empty();
				var content = _this.$compile(template)(_this.$scope);

				ifObject.append(content);
				_this.removeSpinner("#Interfaccia");
				ifObject.fadeIn(500);
				// deviceController.init(_this, device.clusters);
			})
		});
	}
}

DevicesController.prototype.addSpinner = function(parentId) {
	var id = parentId + ".devices-spinner";
	$(id).remove();

	$(parentId).append("<div class=\"devices-spinner\"></div>");
}

DevicesController.prototype.removeSpinner = function(parentId) {
	if (parentId == null) {
		$(".devices-spinner").remove();
	} else {
		$(parentId + " .devices-spinner").remove();
	}
}

DevicesController.prototype.exit = function() {
	Main.ResetError();
	if (this.timerDevices != null) {
		clearInterval(this.timerDevices);
		this.timerDevices = null;
	}
	this.devices = [];
}

// FIXME: must be replaced with a plugin approach
DevicesController.prototype.getInterfaceController = function(device) {

	var id = parseInt(device.category);

	var appType = device[this.$ifEh.ATTR_APP_TYPE];

	switch (appType) {
	case "it.telecomitalia.ah.zigbee.security.doorlock":
		return ifDoorLock;

	case "org.energy_home.jemma.ah.appliance.forecasts":
		return ifForecast;

	case "org.energy_home.jemma.ah.nest.thermostat":
		return ifNestThermostat;

	case "org.energy_home.jemma.ah.zigbee.smartplug":
		return ifBase;

	case "it.telecomitalia.ah.zigbee.metering":
		return ifBase;

	case "com.indesit.ah.app.whitegood":
		return ifIndesitWM;
	}

	var deviceDetailedInterface = null;

	switch (id) {

	case 35:
		// Philips Hue
		deviceDetailedInterface = ifHue;
		break;

	case 34:
		// luce Mac
		deviceDetailedInterface = ifLampadaMac;
		break;

	case 36:
		// thermostat
		deviceDetailedInterface = ifThermostat;
		break;

	case 37:
		// Indesit lavatrice
		deviceDetailedInterface = ifIndesitWM;
		break;

	case 38:
		// Indesit forno
		deviceDetailedInterface = ifIndesitOven;
		break;

	case 39:
		// Indesit frigorifero
		deviceDetailedInterface = ifIndesitFridge;
		break;

	// case 40:
	// // LockDoor
	// deviceDetailedInterface = ifDoorLock;
	// break;

	case 44:
		// WindowCovering
		deviceDetailedInterface = ifWindowCovering;
		break;

	default:
		if (ifUtils.hasCluster(device, "org.energy_home.jemma.ah.cluster.zigbee.general.OnOffServer")) {
			deviceDetailedInterface = ifBase;
		} else {
			deviceDetailedInterface = ifUnknown;
		}
		break;
	}

	return deviceDetailedInterface;
}
