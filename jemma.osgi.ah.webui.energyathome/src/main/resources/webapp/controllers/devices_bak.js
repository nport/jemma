mainApp.controller('devices', function($scope) {

	$scope.locations = [];
	$scope.categories = [];

	$scope.devices = {};

	$scope.consumoTotale = 3;
	$scope.altroConsumo = 5;
	$scope.potenzaAttuale = 6;

	// this is a configuration parameter.
	$scope.devicesPerPage = 6;
	$scope.currentPage = 0;

	console.log("entering devices controller");
	Elettrodomestici.init($scope);

	$scope.$on('$destroy', function deactivate() {
		console.log("deactivate devices controller");
		Elettrodomestici.exit($scope);
	});
});

var Elettrodomestici = {
	TIMER_UPDATE_ELETTR : 20000,
	timerElettr : null,
	indexElettrodomestico : 0,
	timerDispo : null,
	nextStep : null,
	startTime : null,
	midTime : null,
	endTime : null,
};

Elettrodomestici.init = function($scope) {
	Elettrodomestici.indexElettrodomestico = 0;

	$("#RigaPulsanti").hide();

	$("#RigaPulsanti #indietro").click(function() {
		if ($scope.currentPage > 0) {
			$scope.currentPage--;
			Elettrodomestici.refreshDevices($scope);
		}

	});

	$("#RigaPulsanti #avanti").click(function() {
		if ($scope.currentPage < Elettrodomestici.getPagesNumber($scope) - 1) {
			$scope.currentPage++;
			Elettrodomestici.refreshDevices($scope);
		}
	});

	Elettrodomestici.addSpinner("#RigaElettrodomestici");

	if (InterfaceEnergyHome.objService == null) {
		Elettrodomestici.applianceServiceInit = setInterval(function() {
			if (InterfaceEnergyHome.objService != null) {
				clearInterval(Elettrodomestici.applianceServiceInit);
				Elettrodomestici.update($scope);
			}

		}, 4000);
	} else {
		Elettrodomestici.update($scope);
	}
}

// Funzione che crea un dizionario pid->nome locazione
Elettrodomestici.getLocations = function($scope) {
	try {
		// get the scope of the mainController
		// var scope = angular.element($('[ng-controller=devices]')).scope();

		var p = InterfaceEnergyHome.objService.getLocations();
		p.done(function(result) {

			for (i = 0; i < result.length; i++) {
				pid = result[i][InterfaceEnergyHome.ATTR_LOCATION_PID];
				name = result[i][InterfaceEnergyHome.ATTR_LOCATION_NAME];
				$scope.locations[pid] = name;
			}

		}).fail(function(err) {
			InterfaceEnergyHome.GestErrorEH("GetCategories", err);
			console.log("Err: " + err);
		});
	} catch (e) {
		console.log("exception: " + e);
	}
}

/**
 * Lettura delle categorie configurate in Jemma
 */
Elettrodomestici.getCategories = function($scope) {
	try {
		// get the scope of the mainController
		// var scope = angular.element($('[ng-controller=devices]')).scope();

		var p = InterfaceEnergyHome.objService.getCategoriesWithPid();
		p.done(function(result) {
			for (i = 0; i < result.list.length; i++) {
				pid = result.list[i]["map"]["pid"];
				name = result.list[i]["map"][InterfaceEnergyHome.ATTR_CATEGORY_NAME];
				icona = result.list[i]["map"]["icon"];

				$scope.categories[i] = {
					"name" : name,
					"icon" : icona,
					"pid" : pid
				};
			}
		}).fail(function(err) {
			InterfaceEnergyHome.GestErrorEH("GetCategories", err);
			console.log("Err: " + err);
		});
	} catch (e) {
		console.log("Err: " + e);
	}
}

Elettrodomestici.getCategoryIndex = function(name) {

	for ( var cat in Elettrodomestici.categorie) {
		if (Elettrodomestici.categorie[cat].name == name) {
			return cat;
		}
	}
	return -1;
}

Elettrodomestici.getDeviceInfos = function($scope, callback) {

	try {
		var p = InterfaceEnergyHome.objService.getAppliancesConfigurationsDemo();
		p.done(function(result) {
			Elettrodomestici.removeSpinner("#RigaElettrodomestici");
			var listaRicevuta = {};

			/*
			 * removes elements added by jabsorb (like map elements) and filter
			 * out the Smart Info devices.
			 */

			$.each(result.list, function(indice, elettrodom) {
				var deviceInfo = elettrodom["map"];

				var appType = deviceInfo[InterfaceEnergyHome.ATTR_APP_TYPE];
				var pid = deviceInfo[InterfaceEnergyHome.ATTR_APP_PID];

				if (appType == InterfaceEnergyHome.SMARTINFO_APP_TYPE) {
					/* This is a SmartInfo */
					if (device["category"]["name"] == "Meter") {
						$scope.smartInfoDevice = deviceInfo;
					} else {
						/* this is probably the Photovoltaic Smart Meter */
						$scope.smartInfoPVDevice = deviceInfo;
					}

				} else {
					listaRicevuta[pid] = deviceInfo;
				}
			});

			$scope.devices = [];
			$scope.consumoTotale = 0;
			$scope.altroConsumo = 0;

			$.each(listaRicevuta, function(index, deviceInfo) {
				var device = {};

				/*
				 * Convert a deviceInfo into a device, that is the structure
				 * used internally
				 */
				device["id"] = deviceInfo[InterfaceEnergyHome.ATTR_APP_PID];
				device["nome"] = deviceInfo[InterfaceEnergyHome.ATTR_APP_NAME];
				device["category"] = deviceInfo[InterfaceEnergyHome.ATTR_APP_CATEGORY];
				device["location"] = deviceInfo[InterfaceEnergyHome.ATTR_APP_LOCATION];
				device["connessione"] = deviceInfo[InterfaceEnergyHome.ATTR_APP_AVAIL];

				var values = deviceInfo["device_value"];

				device["measure"] = {
					principal : {
						value : "",
						unity : "",
						label : "",
						name : "",
						type : ""
					}
				};

				$.each(values.list, function(idx, el) {
					Elettrodomestici.mapDeviceValues($scope, device, el);
				});

				device["stato"] = 0;
				if (device["connessione"] == 2) {
					device["stato"] = 1;
				}

				appType = deviceInfo[InterfaceEnergyHome.ATTR_APP_TYPE];

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
				} else if ((appType == InterfaceEnergyHome.LOCKDOOR_APP_TYPE)
						|| (appType == InterfaceEnergyHome.LOCKDOOR_APP_TYPE_2)) { // LockDoor
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
				var str = deviceInfo[InterfaceEnergyHome.ATTR_APP_ICON];

				device["icona"] = str.replace(".png", "");
				$scope.devices.push(device);
			});

			/**
			 * The smart info is a special device. FIXME: why it is handled
			 * here??? Why not in the previous loop??
			 */
			if ($scope.smartInfoDevice != undefined) {
				var device = {};
				device["icona"] = "plug";
				device["nome"] = "Altri consumi";
				device["category"] = 12;
				$scope.altroConsumo = $scope.potenzaAttuale - Elettrodomestici.consumoTotale;
				$scope.altroConsumo = $scope.altroConsumo > 0 ? $scope.altroConsumo : 0;
				device["consumo"] = $scope.altroConsumo;
				device["location"] = 10;
				device["stato"] = 1;
				device["connessione"] = 2;
				$scope.smartInfoDevice = device;
			}

			callback();
		});
	} catch (e) {
		console.log("exception: " + e);
	}
}

/**
 * This function fills the device with the relevant information received by
 * Jemma.
 */

Elettrodomestici.mapDeviceValues = function($scope, device, el) {

	if (el.name == "IstantaneousDemands") {
		device["consumo"] = el.value.value;
		device["measure"][el.name] = {
			value : el.value.value.toFixed(0),
			unity : "W",
			label : "Consumption: ",
			name : "watt",
			type : el.name
		};
		device["measure"]["principal"] = device["measure"][el.name];
		$scope.consumoTotale += device["consumo"];
	} else if (el.name == "CurrentLevel") {
		device["level"] = el.value.value;
		var val = Math.round((el.value.value / 254) * 100);

		device["measure"][el.name] = {
			value : val,
			unity : "% ",
			label : "Level",
			name : "",
			type : el.name
		};
		if (device["measure"]["principal"] == null)
			device["measure"]["principal"] = device["measure"][el.name];
	} else if (el.name == "OnOffState") {
		device["stato"] = el.value.value;
		device["measure"][el.name] = {
			value : el.value.value,
			unity : " ",
			label : "State: ",
			name : "",
			type : el.name
		};
		if (device["measure"]["principal"] == null)
			device["measure"]["principal"] = device["measure"][el.name];
	} else if (el.name == "LocalHumidity") {
		device["humidity"] = el.value.value;
		device["measure"][el.name] = {
			value : el.value.value,
			unity : "% RH",
			label : "Umidity: ",
			name : "relative humidity",
			type : el.name
		};
		if (device["measure"]["principal"] == null)
			device["measure"]["principal"] = device["measure"][el.name];
	} else if (el.name == "ZoneStatus") {
		device["zonestatus"] = el.value.value;
		device["measure"][el.name] = {
			value : el.value.value,
			unity : " ",
			label : "State: ",
			name : "",
			type : el.name
		};
		if (device["measure"]["principal"] == null)
			device["measure"]["principal"] = device["measure"][el.name];
	} else if (el.name == "Illuminance") {
		device["illuminance"] = el.value.value;
		device["measure"][el.name] = {
			value : el.value.value,
			unity : " ",
			label : "State: ",
			name : "",
			type : el.name
		};
		if (device["measure"]["principal"] == null)
			device["measure"]["principal"] = device["measure"][el.name];
	} else if (el.name == "Occupancy") {
		device["occupancy"] = el.value.value;
		device["measure"][el.name] = {
			value : el.value.value,
			unity : " ",
			label : "State: ",
			name : "",
			type : el.name
		};
		if (device["measure"]["principal"] == null)
			device["measure"]["principal"] = device["measure"][el.name];
	} else if (el.name == "Temperature") {
		device["temperature"] = el.value.value;
		device["measure"][el.name] = {
			value : el.value.value.toFixed(1),
			unity : "C",
			label : "Temperature: ",
			name : "celsius",
			type : el.name
		};
		device["measure"]["principal"] = device["measure"][el.name];
	} else if (el.name == "TargetTemperature") {
		device["target_temperature"] = el.value.value;
		device["measure"][el.name] = {
			value : el.value.value.toFixed(1),
			unity : "C",
			label : "Temperature: ",
			name : "celsius",
			type : el.name
		};
		if (device["measure"]["principal"] == null)
			device["measure"]["principal"] = device["measure"][el.name];
	} else if (el.name == "AwayState") {
		device["stato"] = el.value.value;
		device["away"] = el.value.value;
		device["measure"][el.name] = {
			value : el.value.value,
			unity : " ",
			label : "Away: ",
			name : "",
			type : el.name
		};
		if (device["measure"]["principal"] == null)
			device["measure"]["principal"] = device["measure"][el.name];
	}

	else if (el.name == "LocalTemperature") {
		device["temperature"] = el.value.value;
		device["measure"][el.name] = {
			value : el.value.value.toFixed(1),
			unity : "C",
			label : "Temperature: ",
			name : "celsius",
			type : el.name
		};
		if (device["measure"]["principal"] == null)
			device["measure"]["principal"] = device["measure"][el.name];
	} else if (el.name == "LockState") {
		device["lockState"] = el.value.value;
		var val = null;
		if (device["lockState"] == 2) {
			val = "OPEN";
		} else if (device["lockState"] == 1) {
			val = "CLOSE";
		} else {
			val = "NP";
		}
		device["measure"][el.name] = {
			value : val,
			unity : " ",
			label : "Door: ",
			name : "",
			type : el.name
		};
		device["measure"][el.name] = {
			value : " ",
			unity : " ",
			label : " ",
			name : "",
			type : el.name
		};
		if (device["measure"]["principal"] == null)
			device["measure"]["principal"] = device["measure"][el.name];
	} else if (el.name == "CurrentPositionLiftPercentage") {
		device["WindowState"] = el.value.value;
		var val = null;
		if (device["WindowState"] > 0) {
			val = "OPEN";
		} else if (device["WindowState"] == 0) {
			val = "CLOSE";
		} else {
			val = "NP";
		}
		device["measure"][el.name] = {
			value : val,
			unity : " ",
			label : "Window: ",
			name : "",
			type : el.name
		};
		device["measure"][el.name] = {
			value : " ",
			unity : " ",
			label : " ",
			name : ""
		};
		if (device["measure"]["principal"] == null)
			device["measure"]["principal"] = device["measure"][el.name];
	}
}

Elettrodomestici.getCurrentProduction = function($scope) {
	try {
		var p = InterfaceEnergyHome.objService.getAttribute(InterfaceEnergyHome.PRODUZIONE_TOTALE);
		p.done(function(result) {

			if (!isNaN(result.value)) {
				if ($scope.potenzaAttuale < 0) {
					$scope.potenzaAttuale = 0;
				}
				if ($scope.potenzaAttuale < $scope.consumoTotale) {
					$scope.potenzaAttuale = $scope.consumoTotale;
				}
			}
		});
	} catch (e) {
		console.log("exception: " + e);
	}
};

Elettrodomestici.getCurrentPower = function($scope) {
	try {
		var p = InterfaceEnergyHome.objService.getAttribute(InterfaceEnergyHome.POTENZA_TOTALE);
		p.done(function(result) {
			$scope.potenzaAttuale = result.value;
		});
	} catch (e) {
		console.log("exception: " + e);
	}
};

Elettrodomestici.getPagesNumber = function($scope) {
	return $scope.devices / $scope.devicesPerPage;
}

Elettrodomestici.update = function($scope) {

	if (Elettrodomestici.update.$scope != undefined) {
		$scope = Elettrodomestici.update.$scope;
	}
	if ($scope == undefined) {
		console.log("please set $scope");
		return;
	}
	Elettrodomestici.update.$scope = $scope;

	if (Elettrodomestici.timerDispo == null) {
		Elettrodomestici.timerDispo = setInterval(Elettrodomestici.update, Elettrodomestici.TIMER_UPDATE_ELETTR);
	}

	Elettrodomestici.getCategories($scope);
	Elettrodomestici.getLocations($scope);

	Elettrodomestici.getDeviceInfos($scope, function() {
		Elettrodomestici.refreshDevices($scope);
		if ($scope.currentDevice != null) {
			$scope.currentDevice.update(false);
		}
	});
}

Elettrodomestici.stopUpdate = function() {
	if (Elettrodomestici.timerDispo != null) {
		clearInterval(Elettrodomestici.timerDispo);
		Elettrodomestici.timerDispo = null;
	}
}

Elettrodomestici.refreshDevices = function($scope) {
	$("#RigaElettrodomestici .device").remove();

	var start = Elettrodomestici.pagina * $scope.devicesPerPage;

	var totalPages = ($scope.devices.length / $scope.devicesPerPage | 0) + 1;

	if (totalPages <= 1) {
		$("#RigaPulsanti").hide();
	} else {
		$("#RigaPulsanti").show();
	}

	if ($scope.currentPage > 0) {
		$("#RigaPulsanti #indietro").show();
	} else {
		$("#RigaPulsanti #indietro").hide();
	}

	if ($scope.currentPage >= totalPages - 1) {
		$("#RigaPulsanti #avanti").hide();
	} else {
		$("#RigaPulsanti #avanti").show();
	}

	$.get('views/deviceTemplate.html', function(data) {

		var start = $scope.currentPage * $scope.devicesPerPage;
		var end = Math.min(start + $scope.devicesPerPage, $scope.devices.length);

		for (i = start; i < end; i++) {
			var device = $scope.devices[i];
			var el = $(document.createElement('div')).attr('id', "device_" + i).addClass(
					"device col-lg-2 col-md-3 col-sm-4 col-xm-6").append(data);
			$("#RigaElettrodomestici").append(el);
			var pid = device.id;

			// Salva l'appliance id all'interno dell'elemento
			el.data("pid", pid);
			el.data("category_id", device.categoria);
			el.data("current_index", i);

			// Imposto i valori dei campi
			$("#device_" + i + " .deviceName span").text(device.nome);
			$("#device_" + i + " .deviceState .stato").text(device.nome);

			var state = Elettrodomestici.getDeviceState(device);

			el.addClass(state.class_stato);
			$("#device_" + i + " .deviceState .stato").text(state.state);

			$("#device_" + i + " .deviceState .lblFirstValue").text(device["measure"]["principal"].label);
			$("#device_" + i + " .deviceState .lblMeasure").text(
					device["measure"]["principal"].value + " " + device["measure"]["principal"].unity);
			$("#device_" + i + " .deviceState .posizione_value").text($scope.locations[device.location]);

			// variable that points to the class interface to be
			// shown
			var deviceDetailedInterface = ifBase;
			var deviceIfName = "base";

			var cat_id = device.category;
			cat_id = parseInt(cat_id);

			// FIXME: fix all the devices URL
			switch (cat_id) {
			case 47:
				// Nest Thermostat
				deviceIfName = "nestThermostat";
				deviceDetailedInterface = ifNestThermostat;
				break;

			case 35:
				// Philips Hue
				deviceIfName = "hue";
				deviceDetailedInterface = ifLampada;
				break;

			case 34:
				// luce Mac
				deviceIfName = "macLamp";
				deviceDetailedInterface = ifLampadaMac;
				break;

			case 36:
				// thermostat
				deviceIfName = "thermostat";
				deviceDetailedInterface = ifThermostat;
				break;

			case 37:
				// Indesit lavatrice
				deviceIfName = "indesitWM";
				deviceDetailedInterface = ifIndesitWM;
				break;

			case 38:
				// Indesit forno
				deviceIfName = "indesitOven";
				deviceDetailedInterface = ifIndesitOven;
				break;

			case 39:
				// Indesit frigorifero
				deviceIfName = "indesitFridge";
				deviceDetailedInterface = ifIndesitFridge;
				break;

			case 40:
				// LockDoor
				deviceIfName = "lockDoor";
				deviceDetailedInterface = ifLockDoor;
				break;

			case 44:
				// WindowCovering
				deviceIfName = "windowCovering";
				deviceDetailedInterface = ifWindowCovering;
				break;

			default:
				break;
			}

			el.data("deviceIfName", deviceIfName);
			el.data("deviceDetailedInterface", deviceDetailedInterface);

			var icona_src = "devices/" + deviceIfName + "/images/" + Elettrodomestici.getIcon(device);
			$("#device_" + i + " .deviceIcon .icona-dispositivo").attr("src", icona_src);

			el.click(function() {
				$('#Interfaccia .content').html(" ");
				$('#Interfaccia .header .titolo').text("");

				var pid = $(this).data("pid");
				var id = $(this).attr("id");
				var category = $(this).data("category_id");
				var index = $(this).data("current_index");
				var nome = $("#" + id + " .deviceName span").text();

				var deviceIfName = $(this).data("deviceIfName");
				var deviceDetailedInterface = $(this).data("deviceDetailedInterface");

				$scope.currentDevice = deviceDetailedInterface;
				$scope.currentDevicePid = pid;

				if (device.connessione != 2 || device.stato == 4) {
					Elettrodomestici.loadInterfaccia($scope, nome, pid, cat_id, index, deviceIfName, null);
				} else {
					// read all the clusters available on the device
					Elettrodomestici.getDeviceClusters(pid, function(clusters) {
						Elettrodomestici.loadInterfaccia($scope, nome, pid, category, index, deviceIfName, clusters);
					});
				}
			});
		}
	});
}

Elettrodomestici.loadInterfaccia = function($scope, nome, pid, cat_id, index, deviceIfName, clusters) {
	// FIXME: use jquery remove
	$('#Interfaccia .content').html(" ");
	$('#Interfaccia .header .titolo').text("");

	var baseUrl = "devices/" + deviceIfName + "/";

	$.get(baseUrl + deviceIfName + ".html", function(data) {
		$("#Interfaccia").hide();
		$("#Interfaccia").data("pid", undefined);
		$("#Interfaccia").data("current_index", -1);
		$('#Interfaccia .header .titolo').text(nome);
		$('#Interfaccia .content').append(data);

		Elettrodomestici.removeSpinner("#Interfaccia");

		$("#Interfaccia").data("pid", pid);
		$("#Interfaccia").data("current_index", index);
		var icona_src = "devices/" + deviceIfName + "/images/" + Elettrodomestici.getIcon($scope.devices[index]);
		$("#Interfaccia .icona .icona-dispositivo").attr("src", icona_src);
		$("#Interfaccia").fadeIn(200);
		if ($scope.currentDevice != null) {
			console.debug(clusters);
			$scope.currentDevice.init($scope, clusters, index);
		}
	});
}

Elettrodomestici.getDeviceClusters = function(pid, callback) {
	var p = InterfaceEnergyHome.objService.getDeviceClusters(pid);
	p.done(function(clusters) {
		if (clusters == null) {
			callback(null);
			return;
		}

		var clusterobj = {};
		for ( var keys in clusters["map"]) {
			n = clusters["map"][keys];
			clusterobj[n] = true;

		}
		callback(clusterobj);
	});

}

Elettrodomestici.getIcon = function(device, forza_stato) {
	connessioneElettr = device["connessione"];
	consumoElettr = device["consumo"];
	categoriaElettr = device["categoria"];
	nomeElettr = device["nome"];
	statoElettr = device["stato"];
	if (forza_stato != null) {
		statoElettr = forza_stato;
	}
	typeElettr = device["type"];
	locationElettr = device["location"];
	estensioneIcona = ".png";
	if (connessioneElettr != 2 || statoElettr == 4) {
		estensioneIcona = "_disconnesso.png";
	} else if (statoElettr) {
		if (nomeElettr == 'Altri consumi') {
			if (consumoElettr > 0) {
				// Se c'e' consumo visualizzo l'icona verde
				estensioneIcona = "_acceso.png";
			} else {
				// Altrimenti lo visualizzo spento
				estensioneIcona = "_spento.png";

			}
		} else if (categoriaElettr == 47) {
			// NestThermostat
			var lockStateElettr;
			if (forza_stato != null) {
				lockStateElettr = forza_stato;
				if (lockStateElettr == 0) {
					estensioneIcona = "_acceso.png";
				} else {
					estensioneIcona = "_spento.png";
				}
			} else {
				lockStateElettr = device["lockState"];
				if (lockStateElettr == 2) {
					estensioneIcona = "_acceso.png";
				} else {
					estensioneIcona = "_spento.png";
				}
			}
		} else if (categoriaElettr == 40) {
			// DoorLock
			var lockStateElettr;
			if (forza_stato != null) {
				lockStateElettr = forza_stato;
				if (lockStateElettr == 2) {
					estensioneIcona = "_acceso.png";
				} else {
					estensioneIcona = "_spento.png";
				}
			} else {
				lockStateElettr = device["lockState"];
				if (lockStateElettr == 2) {
					estensioneIcona = "_acceso.png";
				} else {
					estensioneIcona = "_spento.png";
				}
			}
		} else if (categoriaElettr == 44) {
			// WindowCovering
			var wCoveringStateElettr;
			if (forza_stato != null) {
				wCoveringStateElettr = forza_stato;
				if (wCoveringStateElettr == 6) {
					estensioneIcona = "_aperta.png";
				} else if (wCoveringStateElettr == 7) {
					estensioneIcona = "_chiusa.png";
				} else {
					estensioneIcona = "_acceso.png";
				}
			} else {
				wCoveringStateElettr = device["WindowState"];
				if ((wCoveringStateElettr > 0) && (wCoveringStateElettr < 65535)) {
					estensioneIcona = "_acceso.png";
				} else if (wCoveringStateElettr == 65535) {
					estensioneIcona = "_aperta.png";
				} else if (wCoveringStateElettr == 0) {
					estensioneIcona = "_aperta.png";
				} else {
					estensioneIcona = "_disconnesso.png";
				}
			}
		} else if ((typeElettr == 'whitegood') || (categoriaElettr == 34) || (categoriaElettr == 35)) {
			// Se il dispositivo e' una lavatrice ed e' connesso
			if (connessioneElettr == 2) {
				estensioneIcona = "_acceso.png";
			} else {
				// Se il dispositivo e' una lavatrice ed NON e' connesso
				estensioneIcona = "_spento.png";
			}
		} else if (consumoElettr > 0) {
			// Se c'� consumo visualizzo l'icona verde
			estensioneIcona = "_acceso.png";

		} else {
			if (connessioneElettr == 2) {
				estensioneIcona = "_acceso.png";
			} else {
				// Se il dispositivo e' una lavatrice ed NON e' connesso
				estensioneIcona = "_spento.png";
			}

		}
	} else {
		// whitegood
		if ((typeElettr == 'whitegood') || (categoriaElettr == 34) || (categoriaElettr == 35)) {
			// Se il dispositivo e' una lavatrice ed e' connesso
			if (connessioneElettr == 2) {
				estensioneIcona = "_acceso.png";
			} else {
				// Se il dispositivo e' una lavatrice ed NON e' connesso
				estensioneIcona = "_spento.png";
			}
		} else if (categoriaElettr == 40) {
			// DoorLock
			var lockStateElettr;
			if (forza_stato != null) {
				lockStateElettr = forza_stato;
				if (lockStateElettr == 1) {
					estensioneIcona = "_acceso.png";
				} else {
					estensioneIcona = "_spento.png";
				}
			} else {
				lockStateElettr = device["lockState"];
				if (lockStateElettr == 2) {
					estensioneIcona = "_acceso.png";
				} else {
					estensioneIcona = "_spento.png";
				}
			}
		} else if (categoriaElettr == 44) {
			// WindowCovering
			var wCoveringStateElettr;
			if (forza_stato != null) {
				wCoveringStateElettr = forza_stato;
				if (wCoveringStateElettr == 6) {
					estensioneIcona = "_aperta.png";
				} else if (wCoveringStateElettr == 7) {
					estensioneIcona = "_chiusa.png";
				} else {
					estensioneIcona = "_acceso.png";
				}
			} else {
				wCoveringStateElettr = device["WindowState"];
				if ((wCoveringStateElettr > 0) && (wCoveringStateElettr < 65535)) {
					estensioneIcona = "_acceso.png";
				} else if (wCoveringStateElettr == 65535) {
					estensioneIcona = "_aperta.png";
				} else if (wCoveringStateElettr == 0) {
					estensioneIcona = "_aperta.png";
				} else {
					estensioneIcona = "_disconnesso.png";
				}
			}
		} else if (categoriaElettr == 47) {
			// NestThermostat
			var lockStateElettr;
			if (forza_stato != null) {
				lockStateElettr = forza_stato;
				if (lockStateElettr == 0) {
					estensioneIcona = "_acceso.png";
				} else {
					estensioneIcona = "_spento.png";
				}
			}
		} else {
			estensioneIcona = "_spento.png";
		}
	}
	return device.icona + estensioneIcona;
}

Elettrodomestici.addSpinner = function(parentId) {
	var id = parentId + ".devices-spinner";
	$(id).remove();

	$(parentId).append("<div class=\"devices-spinner\"></div>");
}

Elettrodomestici.removeSpinner = function(parentId) {
	if (parentId == null) {
		$(".devices-spinner").remove();
	} else {
		$(parentId + " .devices-spinner").remove();
	}
}

Elettrodomestici.exit = function($scope) {
	Main.ResetError();
	if (Elettrodomestici.timerDispo != null) {
		clearInterval(Elettrodomestici.timerDispo);
		Elettrodomestici.timerDispo = null;
	}
	// InterfaceEnergyHome.Abort();
	$scope.devices = [];
}

Elettrodomestici.getDeviceState = function(device) {
	var stato = "--";
	var class_stato = "NONPRESENTE"
	if (device.connessione == 2) {
		if (device.stato == 1) {
			if (device.categoria == 40) { // doorlock
				stato = "OPEN";
				class_stato = "ON";
			} else if (device.categoria == 44) { // windowcovering
				stato = "OPEN";
				class_stato = "ON";
			} else if (device.categoria == 47) { // nestThermostat
				stato = "Away";
				class_stato = "ON";
			} else if ((device.categoria == 35) || (device.categoria == 34)) { //
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
			if (device.categoria == 40) {
				stato = "CLOSE";
				class_stato = "ON";
			} else if (device.categoria == 44) {
				stato = "CLOSE";
				class_stato = "ON";
			} else if (device.categoria == 47) {
				stato = "Home";
				class_stato = "ONOFF";
			} else if ((device.categoria == 35) || (device.categoria == 34)) {
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
			if (device.categoria == 40) {
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
			} else if (device.categoria == 47) {
				if (device.stato == 1) {
					stato = "CLOSE";
					class_stato = "ON";
				} else {
					stato = "OPEN";
					class_stato = "ON";
				}
			} else if (device.categoria == 44) {
				if (device.stato == 7) {
					stato = "CLOSE";
					class_stato = "ON";
				} else {
					stato = "OPEN";
					class_stato = "ON";
				}
			} else if ((device.categoria == 35) || (device.categoria == 34)) {
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
