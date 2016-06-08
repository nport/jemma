var ifBase = {
	clusters : {},
	pluginInfo : {
		name : "base",
		applianceTypes : [],
		deviceInterface : this
	}
}

var useAngularForUpdate = true;

Elettrodomestici.registerPlugin(ifBase.pluginInfo);

ifBase.getName = function() {
	return this.pluginInfo.name;
}

ifBase.init = function(model, clusters) {

	this.model = model
	this.clusters = clusters;
	this.device = ifUtils.getDeviceByPid(model.devices, model.devicePid);

	// var deviceEl = this.device.elId;

	var _this = this;

	$("#btnOnOff").on("click", {
		value : this
	}, function(event) {
		event.preventDefault();

		var instance = event.data.value;
		var pid = instance.device.id;

		if (pid == undefined) {
			return;
		}

		if (!ifUtils.isConnected(instance.device)) {
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

		var onOff = ifUtils.getAttribute(instance.device, "OnOff");

		if (onOff == true || onOff == false) {
			var p = InterfaceEnergyHome.objService.setDeviceState(pid, onOff ? 0 : 1);
			p.done(function(result) {
				if (result != null && result == true) {
					removeSpinner("#Interfaccia");
					ifUtils.setAttribute(instance.device, "OnOff", !onOff);
					instance.$scope.$apply(function() {
						instance.update();
					})
				}
			}).fail(function(e) {
				console.log(instance.device.nome + ": getAttribute() failed");
				removeSpinner("#Interfaccia");
			});
		}
	});

	$("#options").on("click", {
		value : this
	}, function(event) {
		var instance = event.data.value;
		var pid = instance.device.id;

		if (pid == undefined) {
			return;
		}

		console.log("sto leggendo categoria : " + instance.device.category);

		instance.$scope.deviceInfo = angular.copy(instance.device);

		$('#modalDevice').modal('show');
	});

	this.update();
};

/**
 * This function updates both the device bar and the specific interface (if
 * opened).
 */

ifBase.update = function(model, i) {

	var updateDeviceDetails = false;

	var model;
	var device;

	if (model == undefined) {
		device = this.device;
		model = this.model;
		updateDeviceDetails = true;
	} else {
		device = model.devices[i];
	}

	var measure = device["measure"]["IstantaneousDemand"];
	if (measure != null) {
		consumption = Math.round(measure.value) + measure.unit;
	} else {
		consumption = "--";
	}

	var onOff = ifUtils.getAttribute(device, "OnOff");

	var location;
	if (device.location != null) {
		// FIXME: check about availability of locations!
		location = model.locations[device.location];
	} else {
		location = "--";
	}

	// default value
	var cssClass = "NP";
	var stateName = "--";
	var suffix = "_disconnected";

	if (device.connessione == InterfaceEnergyHome.APP_CONNECTED) {
		if (onOff == true) {
			stateName = "ON";
			cssClass = "ON";
			suffix = "_on";
		} else if (onOff == false) {
			stateName = "OFF";
			cssClass = "OFF";
			suffix = "_off";
		}
	}

	var icon = "devices/" + this.getName() + "/images/" + device.icon + suffix + ".png";

	if (updateDeviceDetails) {
		var ifObject = $("#Interfaccia");
		ifObject.find(".header .titolo").text(device.nome);
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

	device.view.state = stateName;
	device.view.stateClass = cssClass;
	device.view.measureValue = consumption;
	device.view.measureName = "Consumo";
	device.view.location = location;
	device.view.icon = icon;
}

jemmaModule.directive("ehGenericDevice", BaseDeviceDirective);

function BaseDeviceDirective() {

	return {
		restrict: 'EC',
		replace : true,
		templateUrl : 'views/deviceTemplate1.html',
		link : link
	};

	function link(scope, element, attrs) {
	}
}