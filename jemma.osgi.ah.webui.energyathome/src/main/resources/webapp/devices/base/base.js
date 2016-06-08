jemmaModule.directive("ehBaseDetails", ehBaseDetails);

var ifBase = {
	clusters : {},
	pluginInfo : {
		name : "base",
		applianceTypes : [],
		deviceInterface : this
	}
}

ifBase.getName = function() {
	return this.pluginInfo.name;
}

/**
 * This function updates both the device bar and the specific interface (if
 * opened). Probably it has to be moved into the directive.
 */

ifBase.update = function(device) {

	if (device == undefined) {
		return;
	}

	var consumption;

	var measure = device["measure"]["IstantaneousDemand"];
	if (measure != null) {
		consumption = Math.round(measure.value) + measure.unit;
	} else {
		consumption = "--";
	}

	var onOff = ifUtils.getAttribute(device, "OnOff");

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

	device.view.state = stateName;
	device.view.stateClass = cssClass;
	device.view.measureValue = consumption;
	device.view.measureName = "Consumo";
	device.view.icon = icon;
}

function ehBaseDetails($uibModal) {

	return {
		restrict : 'EC',
		replace : true,
		scope : {
			device : '=ngModel',
			translation : '=',
		},
		templateUrl : 'devices/base/base.html',
		link : link
	};

	function link($scope, element, attrs) {
		console.log("called directive");

		$scope.$watch("device", function(newValue, oldValue) {
			ifBase.update(newValue);
		}, true);

		$scope.clicked = function() {
			console.log("called clicked");

			var device = $scope.device;

			var onOff = ifUtils.getAttribute(device, "OnOff");

			if (onOff == true || onOff == false) {

				addSpinner("#Interfaccia", "#0a0a0a");

				var p = InterfaceEnergyHome.objService.setDeviceState(device.id, onOff ? 0 : 1);
				p.done(function(result) {
					if (result != null && result == true) {
						removeSpinner("#Interfaccia");
						$scope.$apply(function() {
							ifUtils.setAttribute(device, "OnOff", !onOff);
						})
					}
				}).fail(function(e) {
					console.log(device.nome + ": getAttribute() failed");
					removeSpinner("#Interfaccia");
				});
			}
		}

		var options = element.find("#options");

		if (!useAngular) {

			var btnOnOff = element.find("#btnOnOff");

			btnOnOff.on("click", function(event) {

				event.preventDefault();
				return;

				var device = $scope.device;
				if (!ifUtils.isConnected(device)) {
					return;
				}

				addSpinner("#Interfaccia", "#0a0a0a");

				if (btnOnOff.hasClass("ON")) {
					btnOnOff.removeClass("ON").addClass("OFF");
				} else if (btnOnOff.hasClass("OFF")) {
					btnOnOff.removeClass("OFF").addClass("ON");
				} else {

				}

				var onOff = ifUtils.getAttribute(device, "OnOff");

				if (onOff == true || onOff == false) {
					var p = InterfaceEnergyHome.objService.setDeviceState(device.id, onOff ? 0 : 1);
					p.done(function(result) {
						if (result != null && result == true) {
							removeSpinner("#Interfaccia");
							$scope.$apply(function() {
								ifUtils.setAttribute(device, "OnOff", !onOff);
							})
						}
					}).fail(function(e) {
						console.log(device.nome + ": getAttribute() failed");
						removeSpinner("#Interfaccia");
					});
				}
			});

		}

		options.on("click", function(event) {

			var modalInstance = $uibModal.open({
				templateUrl : 'dialogs/modal-device.html',
			    controller: 'ModalInstanceCtrl'
			});

//			$scope.$apply(function() {
//				$scope.$parent.devices.deviceInfo = angular.copy($scope.device);
//				$('#modalDevice').modal('show');
//			});
		});
	}
}
