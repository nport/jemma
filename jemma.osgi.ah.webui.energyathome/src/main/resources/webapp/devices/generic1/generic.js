var ifGeneric = {
	timeout_timer : null,
	clusters : {},
	UPDATE_FREQ : 1000,
}

ifGeneric.getName = function() {
	return "generic";
}

ifGeneric.init = function($scope, clusters) {

	this.$scope = $scope;
	this.clusters = clusters;
	this.device = $scope.device;

	// var deviceEl = this.device.elId;

	instance = this;

	$("#btnOnOff").click(function(event) {
		event.preventDefault();
		var pid = instance.device.id;

		if (pid == undefined) {
			return;
		}

		var btn = $("#Interfaccia").find("#btnOnOff");
		addSpinner("#Interfaccia", "#0a0a0a");

		if (btn.hasClass("ON")) {
			btn.removeClass("ON").addClass("OFF");
		} else if (btn.hasClass("OFF")) {
			btn.removeClass("OFF").addClass("ON");
		} else {

		}

		var onOff = ifUtils.getAttribute(instance.device, "OnOffState");

		if (onOff == true) {
			var p = InterfaceEnergyHome.objService.setDeviceState(pid, 0);
			p.done(function(result) {
				if (result != null && result == true) {
					removeSpinner("#Interfaccia");
					ifUtils.setAttribute(instance.device, "OnOffState", false);
					instance.update();
				}
			});
		} else if (onOff == false) {
			var p = InterfaceEnergyHome.objService.setDeviceState(pid, 1);
			p.done(function(result) {
				if (result != null && result == true) {
					removeSpinner("#Interfaccia");
					ifUtils.setAttribute(instance.device, "OnOffState", false);
					instance.update();
				}
			});
		}
	});
	this.update();
};

/**
 * This function updates both the device bar and the specific interface (if
 * opened).
 */

ifGeneric.update = function($scope, device) {

	if (device == undefined) {
		device = this.device;
	}

	if ($scope == undefined) {
		$scope = this.$scope;
	}

	var updateDeviceDetails = false;
	if (device == this.device) {
		updateDeviceDetails = true;
	}

	// var ifTile = device.deviceEl;
	var ifObject = $("#Interfaccia");

	var measure = device["measure"]["IstantaneousDemands"];
	if (measure != null) {
		consumption = Math.round(measure.value) + measure.unit;
	} else {
		consumption = "--";
	}

	var onOff = ifUtils.getAttribute(instance.device, "OnOffState");

	var location;
	if (device.location != null) {
		// FIXME: check about availability of locations!
		location = $scope.locations[device.location];
	} else {
		location = "--";
	}

	// ifTile.find(".deviceState .location").text(location);

	// default value
	var cssClass = "NP";
	var stateName = "--";
	var suffix = "";

	if (device.connessione == InterfaceEnergyHome.APP_CONNECTED) {
		if (onOff == true) {
			stateName = "ON";
			cssClass = "ON";
			suffix = "_on";
		} else if (onOff == false) {
			stateName = "OFF";
			cssClass = "OFF";
			suffix = "_off";
		} else {

		}
	}

	var icon = "devices/" + this.getName() + "/images/" + device.icon + suffix + ".png";

	if (updateDeviceDetails) {
		ifObject.find(".deviceState .lblMeasure").text(consumption);
		ifObject.find(".deviceState .location").text(location);

		ifObject.find("#btnOnOff").removeClass("ON OFF NP").addClass(cssClass);
		if (cssClass == "NP") {
			ifObject.find("#btnOnOff").text(stateName);
		}

		ifObject.find(".deviceIcon img").attr("src", icon);
		ifObject.find(".deviceIcon").removeClass("ON OFF NP").addClass(cssClass);
		ifObject.find(".state").removeClass("ON OFF NP").addClass(cssClass);
		ifObject.find(".state").text(stateName);

	}

	// ifTile.find(".deviceIcon").removeClass("ON OFF NP").addClass(cssClass);
	// ifTile.find(".deviceState .state").removeClass("ON OFF
	// NP").addClass(cssClass);
	// ifTile.find(".deviceState .state").text(stateName);

	device.view.state = stateName;
	device.view.stateClass = cssClass;
	device.view.measureValue = consumption;
	device.view.measureName = "Consumo";
	device.view.location = location;
	device.view.icon = icon;
}

/**
 * This is a generic implementation for base (generic) device.
 */
ifGeneric.updateTile = function($scope, device) {

	this.setPrincipals(device);

	if (device.connessione == 2) {
		if (device.stato == 1) {
			stateName = "ON";
			cssClass = "ON";
		} else if (device.stato == 0) {
			stateName = "OFF";
			cssClass = "OFF";
		} else {
			device.stato = -1;
		}
	}

	// var ifTile = device.deviceEl;

	// Imposto i valori dei campi
	// ifTile.find(".deviceName span").text(device.nome);
	// ifTile.find(".deviceState .state").text(device.nome);

	var primaryMeasure = null;

	if (device.primaryMeasure != null) {
		primaryMeasure = device["measure"][device.primaryMeasure];
	}

	/*
	 * if (primaryMeasure != null) { ifTile.addClass(primaryMeasure.value);
	 * ifTile.find(".deviceState .state").addClass(primaryMeasure.value);
	 * ifTile.find(".deviceState .state").text(primaryMeasure.value); } else {
	 * ifTile.find(".deviceState .state").text("--"); }
	 */
	var secondaryMeasure = null;
	if (device.secondaryMeasure != null) {
		secondaryMeasure = device["measure"][device.secondaryMeasure];
	}

	if (secondaryMeasure != null) {
		ifTile.find(".deviceState .lblFirstValue").text(secondaryMeasure.label + ":");
		ifTile.find(".deviceState .lblMeasure").text(secondaryMeasure.value + " " + secondaryMeasure.unit);
	}

	ifTile.find(".deviceState .posizione_value").text(instance.$scope.locations[device.location]);

	var icon = "devices/" + this.getName() + "/images/" + Elettrodomestici.getIcon(device);
	ifTile.find(".deviceIcon .icona-dispositivo").attr("src", icon);
}

/**
 * Scans the list of the device attributes and select the one that should be the
 * principals (i.e. the two values that will be shown in the first and second
 * line of the device tile in the GUI.
 */
ifGeneric.setPrincipals = function(device) {
	measures = device["measure"];

	// in order of ascending priority

	devicePrimary = null;

	if (measures["IstantaneousDemands"] != null) {
		devicePrimary = "IstantaneousDemands";
	}
	if (measures["OnOffState"] != null) {
		devicePrimary = "OnOffState";
	}
	if (measures["Temperature"] != null) {
		devicePrimary = "Temperature";
	}
	if (measures["TargetTemperature"] != null) {
		devicePrimary = "TargetTemperature";
	}
	if (measures["AwayState"] != null) {
		devicePrimary = "AwayState";
	}

	/*
	 * This particular measure if present, becomes the primary state of the
	 * device, overrinding all the others
	 */
	if (measures["MainState"] != null) {
		devicePrimary = "MainState";
	}

	device.primaryMeasure = devicePrimary;

	// in order of ascending priority
	var deviceSecondary = null;

	if (measures["OnOffState"] != null) {
		deviceSecondary = "OnOffState";
	}
	if (measures["IstantaneousDemands"] != null) {
		deviceSecondary = "IstantaneousDemands";
	}
	if (measures["AwayState"] != null) {
		deviceSecondary = "AwayState";
	}
	if (measures["CurrentLevel"] != null) {
		deviceSecondary = "CurrentLevel";
	}
	if (measures["TargetTemperature"] != null) {
		deviceSecondary = "TargetTemperature";
	}
	if (measures["Temperature"] != null) {
		deviceSecondary = "Temperature";
	}

	if (deviceSecondary == devicePrimary) {
		// we was not able to assign both the primary and a secondary measure.
		// We reset the secondary
		deviceSecondary = null;
	}

	device.secondaryMeasure = deviceSecondary;
}

/**
 * Create the "stato" field in the device, according to the device type. It also
 * setup the icon.
 */

ifGeneric.updateDeviceState = function(device, appType) {

	return;

	if (appType == InterfaceEnergyHome.WHITEGOOD_APP_TYPE) {
		device["type"] = 'whitegood';
	} else if ((appType == InterfaceEnergyHome.THERMOSTAT_SENSOR_APP_TYPE)
			|| (appType == InterfaceEnergyHome.THERMOSTAT_SENSOR_APP_TYPE_2)) {
		device["type"] = "thermostat";
	} else if ((appType == InterfaceEnergyHome.TEMPERATURE_SENSOR_APP_TYPE)
			|| (appType == InterfaceEnergyHome.TEMPERATURE_SENSOR_APP_TYPE_2)) {
		device["type"] = "thermostat";
	} else if (appType == InterfaceEnergyHome.TEMPERATURE_URMET_SENSOR_APP_TYPE) {
		device["type"] = "thermostat";
	} else if ((appType == InterfaceEnergyHome.LOCKDOOR_APP_TYPE) || (appType == InterfaceEnergyHome.LOCKDOOR_APP_TYPE_2)) { // LockDoor
		device["type"] = appType;

		if (device["connessione"] == 2) {
			val = device["lockState"];
			if (val == 2) {
				device["icon"] = "lockdoor_acceso.png";
				device["stato"] = 2; // Forzo
			} else if (val == 2) {
				device["icon"] = "lockdoor_spento.png";
				device["stato"] = 1; // Forzo
			} else {
				device["icon"] = "lockdoor_acceso.png";
				device["stato"] = 0; // Forzo
			}
		} else {
			device["icon"] = "lockdoor_disconnesso.png";
			device["stato"] = 0; // Forzo
		}
		device["icon"] = "lockdoor.png"; // Forzo
	} else if ((appType == InterfaceEnergyHome.WINDOWCOVERING_APP_TYPE)
			|| (appType == InterfaceEnergyHome.WINDOWCOVERING_APP_TYPE_2)) { // WindowCovering
		device["type"] = appType;
		if (device["connessione"] == 2) {
			val = device["WindowState"];
			if ((val > 0) && (val < 254)) {
				device["icon"] = "windowc_acceso.png";
				device["stato"] = 8; // Forzo
			} else if (val == 255) {
				device["icon"] = "windowc_aperta.png";
				device["stato"] = 6; // Forzo
			} else if (val == 0) {
				device["icon"] = "windowc_aperta.png";
				device["stato"] = 7; // Forzo
			} else {
				device["icon"] = "windowc_disconnesso.png";
				device["stato"] = 7; // Forzo
			}
		} else {
			device["icon"] = "windowc_disconnesso.png";
			device["stato"] = 0; // Forzo
		}
		device["icon"] = "windowc.png"; // Forzo
		// x
		// ora
	} else {
		device["type"] = 'smartplug';
		if (device["connessione"] == 2) {
		}
	}
}

ifGeneric.getDeviceState = function(device) {
	var stato = "--";
	var class_stato = "NONPRESENTE"
	if (device.connessione == 2) {
		if (device.stato == 1) {
			if (device.category == 40) { // doorlock
				stato = "OPEN";
				class_stato = "ON";
			} else if (device.category == 44) { // windowcovering
				stato = "OPEN";
				class_stato = "ON";
			} else if (device.category == 47) { // nestThermostat
				stato = "Away";
				class_stato = "ON";
			} else if ((device.category == 35) || (device.category == 34)) { //
				stato = "ON";
				class_stato = "ON";
			} else if (device.type == 'whitegood') {
				if (device.consumo_value <= 0) {
					// Il device whitegood consuma 0W,
					// quindi spento
					stato = "OFF";
					class_stato = "ONOFF";
				} else if ((device.consumo_value > 0) && (device.consumo_value < 1)) {
					// Il device consuma, ma meno di
					// 1km, quindi spento ma stato
					// connesso, per adesso spento
					stato = "OFF";
					class_stato = "ONOFF";
				} else if ((device.consumo_value >= 1) && (device.consumo_value <= 5)) {
					// Il device consuma pi� di un 1W,
					// ma meno di 5km, quindi standby
					// al momento lo mettiamo ON.
					stato = "ON";
					class_stato = "ON";
				} else {
					// Il device whitegood consuma
					// tanto, quindi sta operando
					stato = "ON";
					class_stato = "ON";
				}
			} else {
				stato = "ON";
				class_stato = "ON";
			}
		} else if (device.stato == 0) {
			if (device.category == 40) {
				stato = "CLOSE";
				class_stato = "ON";
			} else if (device.category == 44) {
				stato = "CLOSE";
				class_stato = "ON";
			} else if (device.category == 47) {
				stato = "Home";
				class_stato = "ONOFF";
			} else if ((device.category == 35) || (device.category == 34)) {
				stato = "OFF";
				class_stato = "ONOFF";
			} else if (device.type == 'whitegood') {
				if (device.consumo_value <= 0) {
					// Il device whitegood consuma 0W,
					// quindi spento
					stato = "OFF";
					class_stato = "ONOFF";
				} else if ((device.consumo_value > 0) && (device.consumo_value < 1)) {
					// Il device consuma, ma meno di
					// 1km, quindi spento ma stato
					// connesso, per adesso spento
					stato = "OFF";
					class_stato = "ONOFF";
				} else if ((device.consumo_value >= 1) && (device.consumo_value <= 5)) {
					// Il device consuma pi� di un 1W,
					// ma meno di 5km, quindi standby
					// al momento lo mettiamo ON.
					stato = "OFF";
					class_stato = "ON";
				} else {
					// Il device whitegood consuma
					// tanto, quindi sta operando
					stato = "OFF";
					class_stato = "ON";
				}
			} else {
				stato = "OFF";
				class_stato = "ONOFF";
			}
		} else if (device.stato > 1) {
			if (device.category == 40) {
				if (device.stato == 2) {
					stato = "OPEN";
					class_stato = "ON";
				} else if (device.stato == 1) {
					stato = "CLOSE";
					class_stato = "ON";
				} else {
					stato = "OPEN";
					class_stato = "ON";
				}
			} else if (device.category == 47) {
				if (device.stato == 1) {
					stato = "CLOSE";
					class_stato = "ON";
				} else {
					stato = "OPEN";
					class_stato = "ON";
				}
			} else if (device.category == 44) {
				if (device.stato == 7) {
					stato = "CLOSE";
					class_stato = "ON";
				} else {
					stato = "OPEN";
					class_stato = "ON";
				}
			} else if ((device.category == 35) || (device.category == 34)) {
				if (device.stato == 1) {
					stato = "ON";
					class_stato = "ON";
				} else {
					stato = "OFF";
					class_stato = "ONOFF";
				}
			} else if (device.type == 'whitegood') {
				if (device.consumo_value <= 0) {
					// Il device whitegood consuma 0W,
					// quindi spento
					stato = "OFF";
					class_stato = "ONOFF";
				} else if ((device.consumo_value > 0) && (device.consumo_value < 1)) {
					// Il device consuma, ma meno di
					// 1km, quindi spento ma stato
					// connesso, per adesso spento
					stato = "OFF";
					class_stato = "ONOFF";
				} else if ((device.consumo_value >= 1) && (device.consumo_value <= 5)) {
					// Il device consuma pi� di un 1W,
					// ma meno di 5km, quindi standby
					// al momento lo mettiamo ON.
					stato = "ON";
					class_stato = "ON";
				} else {
					// Il device whitegood consuma
					// tanto, quindi sta operando
					stato = "ON";
					class_stato = "ON";
				}
			} else {
				stato = "OFF";
				class_stato = "ONOFF";
			}
		}
	} else {
		stato = "--";
		class_stato = "OFF";
	}

	return {
		stato : stato,
		class_stato : class_stato
	};
}
