var ifLockDoor = {
	clusters : {},
	pluginInfo : {
		name : "lockDoor",
		applianceTypes : [],
		deviceInterface : this
	}
}

Elettrodomestici.registerPlugin(ifLockDoor.pluginInfo);

ifLockDoor.getName = function() {
	return this.pluginInfo.name;
}

ifLockDoor.init = function($scope, clusters) {

	this.$scope = $scope;
	this.clusters = clusters;
	this.device = ifUtils.getDeviceByPid($scope.devices, $scope.devicePid);

	// var deviceEl = this.device.elId;

	instance = this;

	$("#btnLockUnlock").on("click", {
		value : this
	}, function(event) {
		event.preventDefault();

		instance = event.data.value;

		var pid = instance.device.id;

		if (pid == undefined) {
			return;
		}

		var btn = $("#Interfaccia").find("#btnLockUnlock");
		addSpinner("#Interfaccia", "#0a0a0a");

		if (btn.hasClass("LOCKED")) {
			btn.removeClass("LOCKED").addClass("UNLOCKED");
		} else if (btn.hasClass("UNLOCKED")) {
			btn.removeClass("UNLOCKED").addClass("LOCKED");
		} else {

		}

		var lockUnlock = ifUtils.getAttribute(instance.device, "LockUnlockState");

		if (lockUnlock == true || lockUnlock == false) {
			var p = InterfaceEnergyHome.objService.setDeviceState(pid, lockUnlock ? 0 : 1);
			p.done(function(result) {
				if (result != null && result == true) {
					removeSpinner("#Interfaccia");
					ifUtils.setAttribute(instance.device, "LockUnlockState", !lockUnlock);
					instance.$scope.$apply(function() {
						instance.update();
					})
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

ifLockDoor.update = function($scope, i) {

	var updateDeviceDetails = false;

	if ($scope == undefined) {
		device = this.device;
		$scope = this.$scope;
		updateDeviceDetails = true;
	} else {
		device = $scope.devices[i];
	}

	var measure = device["measure"]["IstantaneousDemands"];
	if (measure != null) {
		consumption = Math.round(measure.value) + measure.unit;
	} else {
		consumption = "--";
	}

	var lockUnlock = ifUtils.getAttribute(device, "LockUnlockState");

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

	if (device.connessione == InterfaceEnergyHome.APP_CLOCKEDNECTED) {
		if (lockUnlock == true) {
			stateName = "UNLOCKED";
			cssClass = "UNLOCKED";
			suffix = "_open";
		} else if (lockUnlock == false) {
			stateName = "LOCKED";
			cssClass = "LOCKED";
			suffix = "_close";
		} else {

		}
	}

	var icon = "devices/" + this.getName() + "/images/" + device.icon + suffix + ".png";

	if (updateDeviceDetails) {
		var ifObject = $("#Interfaccia");

		ifObject.find(".header .titolo").text(device.nome);
		ifObject.find(".deviceState .lblMeasure").text(consumption);
		ifObject.find(".deviceState .location").text(location);

		ifObject.find("#btnLockUnlock").removeClass("UNLOCKED LOCKED NP").addClass(cssClass);
		if (cssClass == "NP") {
			ifObject.find("#btnLockUnlock").text(stateName);
		}

		ifObject.find(".deviceIcon img").attr("src", icon);
		ifObject.find(".deviceIcon").removeClass("LOCKED UNLOCKED NP").addClass(cssClass);
		ifObject.find(".state").removeClass("LOCKED UNLOCKED NP").addClass(cssClass);
		ifObject.find(".state").text(stateName);
	}

	device.view.state = stateName;
	device.view.stateClass = cssClass;
	device.view.measureValue = consumption;
	device.view.measureName = "Consumo";
	device.view.location = location;
	device.view.icon = icon;
}