jemmaModule.directive("ehUnknownDetails", ehUnknownDetailsDirective);

var ifUnknown = {
	clusters : {},
	pluginInfo : {
		name : "unknown",
		applianceTypes : [],
		deviceInterface : this
	}
}

ifUnknown.getName = function() {
	return this.pluginInfo.name;
}

/**
 * This function updates both the device bar and the specific interface (if
 * opened). Probably it has to be moved into the directive.
 */

ifUnknown.update = function(device) {

	if (device == undefined) {
		return;
	}

	// default value
	var cssClass = "NP";
	var stateName = "--";
	var suffix = "_disconnected";

	if (device.connessione == InterfaceEnergyHome.APP_CONNECTED) {
			stateName = "--";
			cssClass = "NP";
			suffix = "";
	}

	var icon = "devices/" + this.getName() + "/images/" + device.icon + suffix + ".png";

	device.view.state = stateName;
	device.view.stateClass = cssClass;
	device.view.measureValue = "";
	device.view.measureName = "";
	device.view.icon = icon;
}

function ehUnknownDetailsDirective() {
	return {
		restrict : 'EC',
		replace : true,
		scope : {
			device : '=ngModel',
			translation : '=',
		},
		templateUrl : 'devices/unknown/unknown.html',
		link : link
	};

	function link($scope, element, attrs) {
		$scope.$watch("device", function(newValue, oldValue) {
			ifUnknown.update(newValue);
		}, true);

		var options = element.find("#options");
		options.on("click", function(event) {
			//$scope.$apply(function() {
				$scope.$parent.devices.deviceInfo = angular.copy($scope.device);
				$('#modalDevice').modal('show');
			//});
		});
	}
}
