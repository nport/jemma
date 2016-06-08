function DatiElettr() {
	this.id = null;
	this.nome = null;
	this.category = null;
	this.locazione = null;
	this.avail = 0;
	this.stato = null;
	this.value = null;
	this.icona = null;
	this.tipo = null;
}

var InterfaceEnergyHome = {
	jsonrpc : null,
	bindBackend : false,
	simulateMeasures : false,

	MODE_SIMUL : 0,
	MODE_SIMUL_NO_SERVER : -1,
	MODE_DEMO : 1,
	MODE_FULL : 2,
	MODE_COST : 3,
	STATUS_OK : 0,
	STATUS_ERR : -1,
	STATUS_ERR_HTTP : -2,
	STATUS_EXCEPT : -3,
	HTTP_TIMEOUT : 7000,
	errMessage : null,
	errCode : 0,
	ERR_GENERIC : 0,
	ERR_CONN_AG : 1,
	ERR_CONN_SERVER : 2,
	ERR_DATA : 3,
	ERR_NO_SMARTINFO : 4,
	ERR_NO_USER : 5,
	ERR_NO_PRODUCTION : 6,
	visError : null,

	serviceName : "org.energy_home.jemma.ah.greenathome.GreenAtHomeApplianceService",
	objService : null,

	MINUTE : 0,
	HOUR : 1,
	DAY : 2,
	MONTH : 3,
	YEAR : 4,
	LAST : 0,
	FIRST : 1,
	MAX : 2,
	MIN : 3,
	AVG : 4,
	DELTA : 5,
	ALL_PID : null,

	appTypes : {
		// TODO: check merge, do these declarations need to be renamed?
		// WHITEGOOD_APP_TYPE : "com.indesit.ah.app.whitegood",
		WHITEGOOD_APP_TYPE : "org.energy_home.jemma.ah.zigbee.whitegood",
		// SMARTINFO_APP_TYPE : "it.telecomitalia.ah.zigbee.metering",
		SMARTINFO_APP_TYPE : "org.energy_home.jemma.ah.zigbee.metering",
		// SMARTPLUG_APP_TYPE : "it.telecomitalia.ah.zigbee.smartplug",
		SMARTPLUG_APP_TYPE : "org.energy_home.jemma.ah.zigbee.smartplug",
		LOCKDOOR_APP_TYPE : "org.energy_home.jemma.ah.zigbee.lockdoor",
		WINDOWCOVERING_APP_TYPE : "org.energy_home.jemma.ah.zigbee.windowcovering",
		TEMPERATURE_SENSOR_APP_TYPE : "org.energy_home.jemma.ah.zigbee.temperature_humidity",
		THERMOSTAT_SENSOR_APP_TYPE : "org.energy_home.jemma.ah.zigbee.thermostat",
		TEMPERATURE_URMET_SENSOR_APP_TYPE : "org.energy_home.jemma.ah.zigbee.urmet.temperature_humidity",
		// To verify
		THERMOSTAT_SENSOR_APP_TYPE_2 : "org.energy_home.jemma.ah.zigbee.generic-ah.ep.zigbee.thermostat",
		NEST_THERMOSTAT_SENSOR_APP_TYPE_2 : "org.energy_home.jemma.ah.nest.thermostat",
		APP_TYPE_DOORLOCK_2 : "org.energy_home.jemma.ah.zigbee.generic-ah.ep.zigbee.DoorLock",
		TEMPERATURE_SENSOR_APP_TYPE_2 : "org.energy_home.jemma.ah.zigbee.generic-ah.ep.zigbee.temperature_humidity",
		WINDOWCOVERING_APP_TYPE_2 : "org.energy_home.jemma.ah.zigbee.generic-ah.ep.zigbee.WindowCovering",
	},

	attrs : {
		ATTR_TOTAL_POWER : "TotalPower", // potenza totale consumata in casa
		ATTR_PRODUCED_POWER : "ProducedPower", // potenza istantanea generata

		/*
		 * potenza istantanea venduta alla rete meglio usare nella gui solo i
		 * precedenti due valori, e ricavare per differenza questo, cos� si
		 * garantisce che i valori sono coerenti anche se le richieste json
		 * partono in istanti differenti)
		 */
		ATTR_SOLD_POWER : "SoldPower",

		/*
		 * potenza di picco degli impianti fotovoltaici (vale 0 se l�utente non
		 * ha nessun impianto fotovoltaico) e deve essere aggiunta alla gui di
		 * configurazione
		 */
		ATTR_PEAK_PRODUCED_POWER : "PeakProducedPower",

		ATTR_CONSUMPTION : "ah.eh.esp.Energy",
		ATTR_COST : "ah.eh.esp.EnergyCost",

		ATTR_PRODUCTION : "ah.eh.esp.ProducedEnergy",
		ATTR_SOLD_ENERGY : "ah.eh.esp.SoldEnergy",
		ATTR_INST_POWER_LIMIT : "InstantaneousPowerLimit",
	},

	exceptions : {
		AG_APP_EXCEPTION : "org.energy_home.jemma.ah.hac.ApplianceException",
		SERVER_EXCEPTION : "org.energy_home.jemma.ah.eh.esp.ESPException"
	},

	// costanti per nome attributi
	ATTR_APP_NAME : "ah.app.name",
	ATTR_APP_TYPE : "ah.app.type",
	ATTR_APP_PID : "appliance.pid",
	ATTR_APP_ICON : "ah.icon",
	ATTR_APP_LOCATION : "ah.location.pid",
	ATTR_APP_CATEGORY : "ah.category.pid",
	ATTR_APP_AVAIL : "availability",
	ATTR_APP_STATE_AVAIL : "device_state_avail",
	ATTR_APP_STATE : "device_state",
	ATTR_APP_VALUE : "device_value",
	ATTR_APP_VALUE_NAME : "name",
	ATTR_APP_VALUE_VALUE : "value",
	ATTR_LOCATION_PID : "pid",
	ATTR_LOCATION_NAME : "name",
	ATTR_LOCATION_ICON : "iconName",
	ATTR_CATEGORY_PID : "pid",
	ATTR_CATEGORY_NAME : "name",
	ATTR_CATEGORY_ICON : "iconName",

	APP_CONNECTED : 2,
	APP_DISCONECTED : 0
}

function bindService(name) {
	if (InterfaceEnergyHome.jsonrpc == null) {
		try {
			InterfaceEnergyHome.jsonrpc = new JSONRpcClient("/demo/JSON-RPC");
			InterfaceEnergyHome.jsonrpc.http_max_spare = 4;
			JSONRpcClient.toplevel_ex_handler = function(e) {
				console.trace();
			};

			var p = InterfaceEnergyHome.jsonrpc.init();

			p.done(function(result) {
				findService(name);
			});
		} catch (e) {
			console.log("exception: " + e);
			return null;
		}
	}
}

findService = function(name) {
	sReg = new Array();
	try {
		var p = InterfaceEnergyHome.jsonrpc.OSGi.find(name);
		p.done(function(sReg) {
			console.log("service found");
			if (sReg && sReg.length > 0) {
				try {
					map = {};
					map.javaClass = "java.util.Map"
					map.map = sReg[0];

					// The actual line must be: var p1 =
					// InterfaceEnergyHome.jsonrpc.OSGi.bind(sReg[0]);

					// but JSONRPC servlet needs the above structure.
					// TODO: patch JSONRPC!!
					var p1 = InterfaceEnergyHome.jsonrpc.OSGi.bind(map);
					p1.done(function() {
						InterfaceEnergyHome.objService = sReg[0]['service.id'];
						InterfaceEnergyHome.objService = InterfaceEnergyHome.jsonrpc[InterfaceEnergyHome.objService];
						InterfaceEnergyHome.bindFakeFunctions();
					});

				} catch (err) {
					console.log("ERRORE! => ");
					console.log(err);
					InterfaceEnergyHome.GestErrorEH(null, err);
				}
				return null;
			}
			return null;
		});
	} catch (e) {
		console.log("exception in bindService(): " + e.message);
	}
}

// FIXME: delete this implementation!!!!

/**
 * Strips any class info from the JsonRPC result. In the future this meta
 * information will be stripped down at the origin.
 */
stripJavaClassInfo = function(json) {
	if (json == null) {
		return null;
	}
	if (json.list != undefined) {
		json = json.list;
		for (i = 0; i < json.length; i++) {
			json[i] = stripJavaClassInfo(json[i]);
		}
	} else if (json.map != undefined && $.isPlainObject(json.map)) {
		// maps
		json = json.map;
		json = stripJavaClassInfo(json);
	} else if ($.isPlainObject(json)) {
		for ( var property in json) {
			if (json.hasOwnProperty(property)) {
				if (property == "javaClass") {
					delete json[property];
					continue;
				}
				b = stripJavaClassInfo(json[property]);
				json[property] = b;
			}
		}
	} else if ($.isArray(json)) {
		for (i = 0; i < json.length; i++) {
			a = json[i];
			b = stripJavaClassInfo(a);
			json[i] = b;
		}
	}
	return json;
}

// FIXME: delete this json!!!
var json = {
	"javaClass" : "java.util.ArrayList",
	"list" : [ {
		"map" : {
			"device_value" : {
				"javaClass" : "java.util.LinkedList",
				"list" : [ {
					"name" : "LocalHumidity",
					"value" : {
						"timestamp" : 1453473575595,
						"value" : 15,
						"javaClass" : "org.energy_home.jemma.ah.hac.lib.AttributeValue"
					},
					"javaClass" : "org.energy_home.jemma.ah.internal.greenathome.AttributeValueExtended"
				}, {
					"name" : "Temperature",
					"value" : {
						"timestamp" : 1453473575595,
						"value" : 22.99,
						"javaClass" : "org.energy_home.jemma.ah.hac.lib.AttributeValue"
					},
					"javaClass" : "org.energy_home.jemma.ah.internal.greenathome.AttributeValueExtended"
				}, {
					"name" : "TargetTemperature",
					"value" : {
						"timestamp" : 1453473575595,
						"value" : 21.885,
						"javaClass" : "org.energy_home.jemma.ah.hac.lib.AttributeValue"
					},
					"javaClass" : "org.energy_home.jemma.ah.internal.greenathome.AttributeValueExtended"
				}, {
					"name" : "AwayState",
					"value" : {
						"timestamp" : 1453473575595,
						"value" : true,
						"javaClass" : "org.energy_home.jemma.ah.hac.lib.AttributeValue"
					},
					"javaClass" : "org.energy_home.jemma.ah.internal.greenathome.AttributeValueExtended"
				} ]
			},
			"category" : {
				"name" : "Nest Thermostat",
				"iconName" : "nestTh.png",
				"javaClass" : "org.energy_home.jemma.ah.hac.lib.ext.Category",
				"pid" : "47"
			},
			"ah.category.pid" : "47",
			"appliance.pid" : "ah.app.02AA01AC101403WP",
			"ah.location.pid" : "1",
			"ah.app.type" : "org.energy_home.jemma.ah.nest.thermostat",
			"ah.icon" : "nestTh.png",
			"ah.app.name" : "Nest Thermostat 1",
			"ah.app.eps.types" : [ "ah.ep.common", "ah.ep.nest.thermostat" ],
			"availability" : 2
		},
		"javaClass" : "java.util.Hashtable"
	} ]
}

InterfaceEnergyHome.init = function() {

	stripped = stripJavaClassInfo(json);

	try {
		InterfaceEnergyHome.errMessage = null;
		InterfaceEnergyHome.errCode = 0;

		if (!InterfaceEnergyHome.bindBackend || InterfaceEnergyHome.simulateMeasures) {
			InterfaceEnergyHome.parseFakeValues(fakeValuesOffline);
		}

		if (InterfaceEnergyHome.bindBackend) {
			InterfaceEnergyHome.objService = bindService(InterfaceEnergyHome.serviceName);
		} else {
			InterfaceEnergyHome.bindFakeFunctions();
		}

	} catch (e) {
		console.log("exception in InterfaceEnergyHome.init(): " + e.message);
	}
}

InterfaceEnergyHome.setMode = function(mode) {
	InterfaceEnergyHome.simulateMeasures = false;
	InterfaceEnergyHome.bindBackend = false;

	if ((mode > 0) || ((mode == -1))) {
		InterfaceEnergyHome.bindBackend = true;
	}

	if ((mode == -1) || (mode == -2)) {
		InterfaceEnergyHome.simulateMeasures = true;
	}
}

/**
 * JSONRpcClient.Exception.CODE_REMOTE_EXCEPTION = 490;
 * JSONRpcClient.Exception.CODE_ERR_CLIENT = 550;
 * JSONRpcClient.Exception.CODE_ERR_PARSE = 590;
 * JSONRpcClient.Exception.CODE_ERR_NOMETHOD = 591;
 * JSONRpcClient.Exception.CODE_ERR_UNMARSHALL = 592;
 * JSONRpcClient.Exception.CODE_ERR_MARSHALL = 593;
 */
InterfaceEnergyHome.GestErrorEH = function(func, err) {
	// TODO: check merge, following line was commented in 3.3.0
	// hideSpinner();
	var msg;
	InterfaceEnergyHome.visError = InterfaceEnergyHome.ERR_GENERIC;

	// mi puo' arrivare msg o message a seconda da dove arriva l'errore
	msg = (err.msg == undefined) ? msg = err.message : msg = err.msg;

	if ((err.code == undefined) && (InterfaceEnergyHome.objService == null)) {
		tmpMsg = "Service not found";
		InterfaceEnergyHome.visError = InterfaceEnergyHome.ERR_CONN_AG;
	} else if (err.code == JSONRpcClient.Exception.CODE_REMOTE_EXCEPTION) {
		tmpMsg = msg + " " + err.name;
		// console.log('err.code', err.code);
		if (err.msg == "Invalid appliance pid") {
			InterfaceEnergyHome.visError = InterfaceEnergyHome.ERR_NO_SMARTINFO;
		} else if (err.name == InterfaceEnergyHome.SERVER_EXCEPTION) {
			InterfaceEnergyHome.visError = InterfaceEnergyHome.ERR_CONN_SERVER;
		} else {
			InterfaceEnergyHome.visError = InterfaceEnergyHome.ERR_CONN_AG;
		}
	} else if (((err.code == 0) && (msg == "")) || (err.code == JSONRpcClient.Exception.CODE_ERR_CLIENT)) {
		tmpMsg = "Error in gateway connection";
		InterfaceEnergyHome.visError = InterfaceEnergyHome.ERR_CONN_AG;
	} else if (err.code == 1) {
		tmpMsg = "Error in peak production";
		InterfaceEnergyHome.visError = InterfaceEnergyHome.ERR_NO_PRODUCTION;
	} else {
		if (err.code != null) {
			tmpMsg = err.code;
			if (msg != null) {
				tmpMsg += " " + msg;
			}
		} else {
			tmpMsg = msg;
		}
		InterfaceEnergyHome.visError = InterfaceEnergyHome.ERR_CONN_AG;
	}
	// console.log(20, InterfaceEnergyHome.MODULE, func + " code = " + err.code
	// + " errMsg = " + tmpMsg);
	// nel caso di errore in inizializzazione della connessione AG non posso
	// fare trace perche' non riesco a contattare l'AG
	if (func != null) {
		Tracing.Trace(null, Tracing.ERR, Tracing.ERR_GENERIC, tmpMsg);
	}

	console.log("ERRORE! => ");
	console.log(err);

	// visualizzo l'errore
	Main.VisError(InterfaceEnergyHome.visError);
}

// TODO: check if needed!!!
InterfaceEnergyHome.GetStorico = function(tipo, pid, dataInizio, dataFine, intervallo, backFunc) {
	var paramTr, param1, param2;

	InterfaceEnergyHome.backStorico = backFunc;
	var lbl1ForNoServberP = null;
	var lbl2ForNoServberP = null;
	var lbl3ForNoServberP = (pid == null) ? 'SI' : 'DEV';
	if (tipo == "Costo") {
		lbl1ForNoServberP = null;
		param1 = InterfaceEnergyHome.ATTR_ID_COST;
	} else if (tipo == "Produzione") {
		lbl1ForNoServberP = 'Production';
		param1 = InterfaceEnergyHome.ATTR_ID_PRODUCTION;
	} else {
		lbl1ForNoServberP = 'Energy';
		param1 = InterfaceEnergyHome.ATTR_ID_CONSUMPTION;
	}

	if (intervallo == 0) {
		lbl2ForNoServberP = 'DAY';
		param2 = InterfaceEnergyHome.HOUR;
		paramTr = Tracing.QT_IERI;
	} else if (intervallo == 3) {
		lbl2ForNoServberP = 'YEAR';
		param2 = InterfaceEnergyHome.MONTH;
		paramTr = Tracing.QT_ANNO;
	} else {
		param2 = InterfaceEnergyHome.DAY;
		if (intervallo == 1) {
			lbl2ForNoServberP = 'WEEK';
			paramTr = Tracing.QT_SETT;
		} else {
			lbl2ForNoServberP = 'MONTH';
			paramTr = Tracing.QT_MESE;
		}
	}
	if (InterfaceEnergyHome.bindBackend) {
		try {
			InterfaceEnergyHome.objService.getAttributeData(InterfaceEnergyHome.BackStorico, pid, param1, dataInizio.getTime(),
					dataFine.getTime(), param2, true, InterfaceEnergyHome.DELTA);
		} catch (err) {
			console.log("ERRORE! => ");
			console.log(err);
			InterfaceEnergyHome.BackStorico(null, err);
		}
	}
}

// solo per catch eccezione
InterfaceEnergyHome.BackSendGuiLog = function(result, err) {
}

// solo se non in demo o simulazione
InterfaceEnergyHome.SendGuiLog = function(logText) {
	if (InterfaceEnergyHome.bindBackend) {
		try {
			InterfaceEnergyHome.objService.sendGuiLog(InterfaceEnergyHome.BackSendGuiLog, logText);
		} catch (err) {
			console.log("ERRORE! => ");
			console.log(err);
			// console.log(80, InterfaceEnergyHome.MODULE, "SendGuiLog: " +
			// logText);
		}
	}
}

/**
 * Create dummy versions of the GreenAtHomeService, used when the noservevr mode
 * is used
 */
InterfaceEnergyHome.bindFakeFunctions = function() {

	/** Data from fake_data.js */
	if (InterfaceEnergyHome.objService == undefined) {
		InterfaceEnergyHome.objService = {};
	}

	var service = InterfaceEnergyHome.objService;

	if (!InterfaceEnergyHome.bindBackend) {
		service.getLocations = function() {
			var deferred = new $.Deferred();
			var promise = deferred.promise();
			deferred.resolve(fakeValues.locations);
			return promise;
		}

		service.getCategories = function() {
			var deferred = new $.Deferred();
			var promise = deferred.promise();
			deferred.resolve([]);
			return promise;
		}

		service.getAppliancesConfigurationsDemo = function() {
			var deferred = new $.Deferred();
			var promise = deferred.promise();
			deferred.resolve(fakeValues.devices);
			return promise;
		};

		service.currentTimeMillis = function() {
			var deferred = new $.Deferred();
			var promise = deferred.promise();
			deferred.resolve(new Date().getTime());
			return promise;
		};

		service.getCategoriesWithPid = function(pid) {
			var deferred = new $.Deferred();
			var promise = deferred.promise();
			deferred.resolve(fakeValues.categoriesWithPid);
			return promise;
		};

		service.getDeviceClusters = function(pid) {
			var deferred = new $.Deferred();
			var promise = deferred.promise();

			var device = fakeValues.getFakeDeviceValueByPid(pid);
			if (device != null) {
				deferred.resolve(device.clusters);
			} else {

				deferred.resolve(null);
			}
			return promise;
		};

		service.updateAppliance = function(info) {
			var deferred = new $.Deferred();
			var promise = deferred.promise();
			var device = fakeValues.getFakeDeviceValueByPid(info.map['appliance.pid']);
			if (device != null) {
				for (field in info.map) {
					device[field] = info.map[field];
				}

				setTimeout(function() {
					deferred.resolve(true);
				}, 1000);
			} else {
				setTimeout(function() {
					deferred.resolve(false);
				}, 1000);
			}
			return promise;
		};

		service.setDeviceState = function(pid, state) {
			var deferred = new $.Deferred();
			var promise = deferred.promise();
			var device = fakeValues.getFakeDeviceValueByPid(pid);
			if (device != null) {
				device.device_state = state;
				setTimeout(function() {
					deferred.resolve(true);
				}, 1000);
			} else {
				setTimeout(function() {
					deferred.resolve(false);
				}, 1000);
			}
			return promise;
		};

		service.toggleAwayState = function(pid) {
			var deferred = new $.Deferred();
			var promise = deferred.promise();
			var device = fakeValues.getFakeDeviceValueByPid(pid);
			if (device != null) {
				device.awayState = true;
				setTimeout(function() {
					deferred.resolve(true);
				}, 1000);
			} else {
				setTimeout(function() {
					deferred.resolve(false);
				}, 1000);
			}
			return promise;
		};

		service.colorControlMoveToColorHS = function(pid, hue, saturation, level, transitionTime) {
			var deferred = new $.Deferred();
			var promise = deferred.promise();
			var device = fakeValues.getFakeDeviceValueByPid(pid);
			if (device != null) {
				setTimeout(function() {
					deferred.resolve(true);
				}, 1000);

			} else {
				deferred.resolve(false);
			}
			return promise;
		};

		var hue = 10;

		service.colorControlGetColorHSL = function(pid) {
			var deferred = new $.Deferred();
			var promise = deferred.promise();
			var device = fakeValues.getFakeDeviceValueByPid(pid);
			if (device != null) {
				setTimeout(function() {
					deferred.resolve({
						hue : hue++,
						saturation : 50,
						level : 100,
					});
				}, 1000);

			} else {
				deferred.resolve(null);
			}
			return promise;
		};

		service.levelControlExecMoveToLevelWithOnOff = function(pid, intensity, time) {
			var deferred = new $.Deferred();
			var promise = deferred.promise();
			var device = fakeValues.getFakeDeviceValueByPid(pid);
			if (device != null) {
				setTimeout(function() {
					deferred.resolve(true);
				}, 1000);
			} else {
				setTimeout(function() {
					deferred.resolve(false);
				}, 1000);
			}
			return promise;
		};
	}

	if (InterfaceEnergyHome.simulateMeasures) {
		service.getHapConnectionId = function() {
			var deferred = new $.Deferred();
			var promise = deferred.promise();
			deferred.resolve("0005");
			return promise;
		};

		service.getAttribute = function(attributeName) {
			var deferred = new $.Deferred();
			var promise = deferred.promise();

			var attributeValue = {};

			if (attributeName == InterfaceEnergyHome.attrs.ATTR_TOTAL_POWER) {
				// in the simulation the power is incremented by 200 W every
				// time is read and the upper limit is the max power of the main
				// meter.
				attributeValue = fakeValues.consumption;
			} else if (attributeName == InterfaceEnergyHome.attrs.ATTR_PEAK_PRODUCED_POWER) {
				attributeValue = fakeValues.production;
			} else if (attributeName == InterfaceEnergyHome.attrs.ATTR_INST_POWER_LIMIT) {
				attributeValue.value = "3000";
			} else if (attributeName == InterfaceEnergyHome.attrs.ATTR_PRODUCTION) {
				/**
				 * TODO: in the original implementation, if a Production Smart
				 * info is configured in the system it uses it, otherwise
				 * fallback to fakeValues.noServerCustomDevice
				 */
				devices = fakeValues.noServerCustomDevice;

				if (devices.length > 0) {
					$.each(devices, function(i, device) {
						appType = device[InterfaceEnergyHome.ATTR_APP_TYPE];
						appCategory = device[InterfaceEnergyHome.ATTR_APP_CATEGORY];
						if (appType == InterfaceEnergyHome.SMARTINFO_APP_TYPE) {
							if (appCategory == "12") {
								attributeValue.value = device["potenza"];
							}
						}
					});
				}
			} else {
				console.log("NYI: getAttribute for attribute: " + attributeName);
				attributeValue.value = "NYI";
			}
			deferred.resolve(attributeValue);
			return promise;
		};

		service.getAttributeData = function() {
			/*
			 * the getAttributeData method is overloaded so it may have 6 or 7
			 * parameters. With 7 parameters we have to return a list, with 6 a
			 * map.
			 */

			var i = 0;

			var pid;

			if (arguments.length == 7) {
				pid = arguments[i++];
			}

			var attributeName = arguments[i++];
			var startTime = arguments[i++];
			var endTime = arguments[i++];
			var period = arguments[i++];
			var bool = arguments[i++];
			var delta = arguments[i++];

			attributeName, startTime, endTime, period, bool, delta

			var deferred = new $.Deferred();
			var promise = deferred.promise();

			if (bool != true) {
				deferred.fail("only bool true is accepted");
				return promise;
			}

			if (pid === undefined) {
				// pid undefined, it means that we have to return a map.
				console.log("ERROR: unsupported when pid undefined");
				return;
			}

			/*
			 * In order to select the right array where to get the measurements
			 * an index name is created
			 */

			var smartInfoOrDevice = (pid == null) ? 'SI' : 'DEV';
			var attribute;

			switch (attributeName) {
			case InterfaceEnergyHome.attrs.ATTR_CONSUMPTION:
				attribute = "Energy";
				break;

			case InterfaceEnergyHome.attrs.ATTR_COST:
				attribute = null;
				break;

			case InterfaceEnergyHome.attrs.ATTR_PRODUCTION:
				attribute = "Production";
				break;

			default:
				console.log("What I have to do?");
			}

			switch (period) {
			case InterfaceEnergyHome.HOUR:
				indexName = "DAY";
				break;

			case InterfaceEnergyHome.DAY:
				indexName = "MONTH";
				break;

			case InterfaceEnergyHome.MONTH:
				indexName = "YEAR";
				break;
			}

			fakeElementIndex = smartInfoOrDevice + attribute + indexName;

			var data = fakeData.Storico[fakeElementIndex];
			deferred.resolve(data);
			return promise;

			if (attributeName == InterfaceEnergyHome.attrs.ATTR_CONSUMPTION) {
				if (pid === undefined) {
					// pid undefined, it means that we have to return a map.
					console.log("unsupported when pid undefined");
				} else {

					var indexName;

					if (period == InterfaceEnergyHome.HOUR) {
						indexName = 'DAY';

						/*
						 * FIXME: check that start starts from the beginning of
						 * the day
						 */

						// returns the data
						deferred.resolve([ 0, 1, 2, 3, 4, 5, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0 ]);
					} else if (period == InterfaceEnergyHome.DAY) {
						indexName = 'MONTH';
						if (pid == null) {

							if (startTime == endTime) {
								deferred.resolve(fakeValues.todayConsumption);
							} else {
								/**
								 * This is probably the request for the pie
								 * data.
								 */
								deferred.resolve(fakeValues.consumptionDistribution);
							}
						}
					} else if (period == InterfaceEnergyHome.MONTH) {
						indexName = 'YEAR';
					}
				}
			} else if (attributeName == InterfaceEnergyHome.attrs.ATTR_COST) {
				console.log("NYI: getAttributeData with ATTR_COST");
				deferred.resolve(null);
			} else {
				console.log("NYI: getAttributeData with " + attributeName);
				deferred.resolve(null);
			}
			return promise;
		}

		service.getForecast = function(appliancePid, attributeName, epoch, resolution) {
			var deferred = new $.Deferred();
			var promise = deferred.promise();

			/*
			 * we need to return the forecast for the specified attribute. In
			 * Energy at Home currently only a null applicancePid may be
			 * specified.
			 */

			if (appliancePid != null) {
				deferred.fail();
				return promise;
			}

			if (attributeName == InterfaceEnergyHome.attrs.ATTR_CONSUMPTION) {
				if (resolution == InterfaceEnergyHome.DAY) {
					deferred.resolve(fakeValues.dayConsumptionForecast);
				} else if (resolution == InterfaceEnergyHome.WEEK) {
					deferred.resolve(fakeValues.weekConsumptionForecast);
				} else if (resolution == InterfaceEnergyHome.MONTH) {
					// month forecast
					deferred.resolve(fakeValues.monthConsumptionForecast);
				}
			} else {
				console.log("NYI: getForecast with attribute " + attributeName);
				deferred.resolve(null);
			}

			return promise;
		}
	}
}

startsWith = function(s, prefix) {
	return s.slice(0, prefix.length) == prefix;
}

InterfaceEnergyHome.fetchFakeValues = function() {

	var urlFake = "/fakevalues";
	$.ajax({
		url : urlFake,
		type : 'GET'
	}).done(function(data) {
		InterfaceEnergyHome.parseFakeValues(data);
	});
}

InterfaceEnergyHome.parseFakeValues = function(data) {

	fakeData.data = data;
	$.each(data, function(name, value) {
		if (startsWith(name, 'CustomDevice')) {
			var i = name.substring(12, 13);
			var field = name.substring(14);
			if (fakeData.noServerCustomDevice[i] == null) {
				// create the entry
				fakeData.noServerCustomDevice[i] = {
					'appliance.pid' : "app-" + i + ".pid",
					'ah.app.type' : null,
					'ah.category.pid' : null,
					'connessione' : null,
					'consumo' : null,
					'icona' : null,
					'location' : null,
					'nome' : null,
					'potenza' : null,
					'stato' : null
				};
			}

			if (field == potenza) {
				// this is an attribute value
				fakeData.noServerCustomDevice[i]['device_value']
			} else {
				fakeData.noServerCustomDevice[i][field] = value;
			}
		} else if (name.substring(0) == 'EnergiaProdottaGiornalieroSimul') {
			fakeData.energiaProdotta = value.split(" , ").map(function(item) {
				return parseInt(item, 10);
			});
		} else if (name.substring(0) == 'EnergiaConsumataGiornalieroSimul') {
			fakeData.energiaConsumata = value.split(" , ").map(function(item) {
				return parseInt(item, 10);
			});
		} else if (name.substring(0) == 'ConsumoMedio') {
			fakeData.ConsumoMedio = value.split(" , ").map(function(item) {
				return parseInt(item, 10);
			});
		} else if (name.substring(0) == 'PrevisioneEnergiaProdottaGiornalieroSimul') {
			fakeData.previsioneEnergiaProdotta = value.split(" , ").map(function(item) {
				return parseInt(item, 10);
			});
		} else if (name.substring(0) == 'ProdottaMedio') {
			fakeData.prodottaMedio = value.split(" , ").map(function(item) {
				return parseInt(item, 10);
			});
		} else if (name.substring(0) == 'ProdottaMedioSettimanale') {
			fakeData.ProdottaMedioSettimanale = value.split(" , ").map(function(item) {
				return parseInt(item, 10);
			});
		} else if (name.substring(0) == 'percIAC') {
			fakeData.IAC[0] = parseFloat(value, 10);
		} else if (name.substring(0) == 'Forecast') {
			fakeData.Forecast[0] = parseInt(value, 10);
		} else if (name.substring(0) == 'MoltForCost') {
			fakeData.MoltForCost[0] = parseFloat(value, 10);
		} else if (name.substring(0) == 'SuddivisioneConsumi') {
			fakeData.SuddivisioneConsumi = {};
			for (var i = 0; i < value; i++) {

				pid = data["SuddivisioneConsumi" + i + "_el"];
				values = data["SuddivisioneConsumi" + i + "_val"];

				values = values.split(' , ').map(function(item) {
					return parseInt(item, 10);
				});

				fakeData.SuddivisioneConsumi[pid] = values;
			}
		} else if (name.substring(0, 2) == 'SI') {
			fakeData.Storico[name] = data[name].split(' , ').map(function(item) {
				return parseInt(item, 10);
			});
		} else if (name.substring(0, 4) == 'DEVE') {
			fakeData.Storico[name] = data[name].split(' , ').map(function(item) {
				return parseInt(item, 10);
			});
		}
	});
}

var fakeData = {
	"data" : null,
	"noServerCustomDevice" : [],
	"energiaProdotta" : [],
	"energiaConsumata" : [],
	"previsioneEnergiaProdotta" : [],
	"prodottaMedio" : [],
	"ProdottaMedioSettimanale" : [],
	"ConsumoMedio" : [],
	"IAC" : [],
	"Forecast" : [],
	"MoltForCost" : [],
	"Storico" : {}
}

var fakeValuesOffline = {
	"ActualDate" : "1409578040000",
	"ConsumoMedio" : "85 , 85 , 88 , 89 , 93 , 93 , 90 , 1032 , 810 , 960 , 623 , 1625 , 1960 , 892 , 1250 , 901 , 821 , 1535 , 1643 , 2681 , 1652 , 332 , 310 , 78",
	"ConsumoMedioSettimanale" : "585 , 585 , 888 , 589 , 593 , 593 , 590",
	"ConsumoOdiernoSimul" : "82 , 88 , 83 , 89 , 983 , 93 , 90 , 812 , 910 , 1060 , 973 , 1625 , 2360 , 1492 , 1450 , 801 , 921 , 1565 , 1643 , 2681 , 1652 , 332 , 310 , 78",
	"CustomDevice0_ah.app.type" : "org.energy_home.jemma.ah.zigbee.whitegood",
	"CustomDevice0_ah.category.pid" : "38",
	"CustomDevice0_connessione" : "connection",
	"CustomDevice0_consumo" : "88235",
	"CustomDevice0_icona" : "forno",
	"CustomDevice0_location" : "location",
	"CustomDevice0_nome" : "Forno",
	"CustomDevice0_potenza" : "1000",
	"CustomDevice0_stato" : "1",
	"CustomDevice1_ah.app.type" : "org.energy_home.jemma.ah.zigbee.whitegood",
	"CustomDevice1_ah.category.pid" : "11",
	"CustomDevice1_connessione" : "connection",
	"CustomDevice1_consumo" : "55314",
	"CustomDevice1_icona" : "lvb2",
	"CustomDevice1_location" : "location",
	"CustomDevice1_nome" : "Lavatrice",
	"CustomDevice1_potenza" : "600",
	"CustomDevice1_stato" : "1",
	"CustomDevice2_ah.app.type" : "org.energy_home.jemma.ah.zigbee.whitegood",
	"CustomDevice2_ah.category.pid" : "8",
	"CustomDevice2_connessione" : "connection",
	"CustomDevice2_consumo" : "25988",
	"CustomDevice2_icona" : "frigorifero",
	"CustomDevice2_location" : "location",
	"CustomDevice2_nome" : "Frigorifero",
	"CustomDevice2_potenza" : "400",
	"CustomDevice2_stato" : "1",
	"CustomDevice3_ah.app.type" : "org.energy_home.jemma.ah.zigbee.smartplug",
	"CustomDevice3_ah.category.pid" : "4",
	"CustomDevice3_connessione" : "connection",
	"CustomDevice3_consumo" : "15000",
	"CustomDevice3_icona" : "tv",
	"CustomDevice3_location" : "location",
	"CustomDevice3_nome" : "Televisore",
	"CustomDevice3_potenza" : "150",
	"CustomDevice3_stato" : "1",
	"CustomDevice4_ah.app.type" : "org.energy_home.jemma.ah.zigbee.smartplug",
	"CustomDevice4_ah.category.pid" : "13",
	"CustomDevice4_connessione" : "connection",
	"CustomDevice4_consumo" : "10000",
	"CustomDevice4_icona" : "plug",
	"CustomDevice4_location" : "location",
	"CustomDevice4_nome" : "plug",
	"CustomDevice4_potenza" : "100",
	"CustomDevice4_stato" : "1",
	"CustomDevice5_ah.app.type" : "org.energy_home.jemma.ah.zigbee.metering",
	"CustomDevice5_ah.category.pid" : "12",
	"CustomDevice5_connessione" : "connection",
	"CustomDevice5_consumo" : "300000",
	"CustomDevice5_icona" : "plug",
	"CustomDevice5_location" : "location",
	"CustomDevice5_nome" : "SmartInfo",
	"CustomDevice5_potenza" : "153",
	"CustomDevice5_stato" : "1",
	"CustomDevice6_ah.app.type" : "org.energy_home.jemma.ah.zigbee.metering",
	"CustomDevice6_ah.category.pid" : "14",
	"CustomDevice6_connessione" : "connection",
	"CustomDevice6_consumo" : "300000",
	"CustomDevice6_icona" : "plug",
	"CustomDevice6_location" : "location",
	"CustomDevice6_nome" : "SmartInfoProd",
	"CustomDevice6_potenza" : "123",
	"CustomDevice6_stato" : "1",
	"DEVEnergyDAY" : "0 , 18 , 23 , 89 , 83 , 93 , 90 , 712 , 310 , 560 , 900 , 1025 , 260 , 1092 , 145 , 801 , 21 , 1265 , 1443 , 1681 , 1052 , 332 , 10 , 0",
	"DEVEnergyMONTH" : "175 , 569 , 0 , 652 , 566 , 600 , 400 , 0 , 240 , 506 , 475 , 0 , 340 , 96 , 415 , 0 , 0 , 352 , 566 , 0 , 400 , 503 , 0 , 506 , 475 , 0 , 340 , 0 , 0 , 340 , 506",
	"DEVEnergyWEEK" : "1033 , 240 , 2096 , 1785 , 2033 , 1240 , 1096",
	"DEVEnergyYEAR" : "2537 , 1108 , 2306 , 2269 , 2537 , 2108 , 2206 , 5569 , 2337 , 2108 , 2306 , 2569",
	"EnergiaConsumataGiornalieroSimul" : "85 , 84 , 88 , 89 , 193 , 93 , 209 , 1132 , 1210 , 160 , 720 , 1325 , 1360 , 1292 , 1450 , 1400 , 1421 , 2535 , 1643 , 2181 , 1352 , 2332 , 789 , 178",
	"EnergiaProdottaGiornalieroSimul" : "0 , 0 , 0 , 0 , 0 , 0 , 5 , 7 , 19 , 42 , 78 , 160 , 200 , 250 , 100 , 120 , 63 , 25 , 5 , 3 , 0 , 0 , 0 , 0",
	"Forecast" : "11",
	"MoltForCost" : "0.2",
	"percIAC" : "0.8",
	"PrevisioneEnergiaProdottaGiornalieroSimul" : "0 , 0 , 0 , 0 , 0 , 0 , 90 , 150 , 210 , 450 , 760 , 1800 , 2000 , 2600 , 1100 , 990 , 530 , 200 , 110 , 10 , 0 , 0 , 0 , 0",
	"ProdottaMedio" : "0 , 0 , 0 , 0 , 0 , 0 , 1 , 7 , 19 , 42 , 78 , 90 , 120 , 150 , 90 , 70 , 43 , 26 , 6 , 1 , 0 , 0 , 0 , 0",
	"ProdottaMedioSettimanale" : "285 , 385 , 488 , 289 , 293 , 193 , 90",
	"service.pid" : "jemma.osgi.ah.fakevalues",
	"SIEnergyDAY" : "82 , 88 , 83 , 89 , 983 , 93 , 90 , 812 , 910 , 1060 , 973 , 1625 , 2360 , 1492 , 1450 , 801 , 921 , 1565 , 1643 , 2681 , 1652 , 332 , 310 , 78",
	"SIEnergyMONTH" : "4175 , 3569 , 2569 , 3652 , 4566 , 5600 , 4500 , 5033 , 3240 , 5096 , 4785 , 5033 , 3240 , 5096 , 4175 , 3569 , 2569 , 3652 , 4566 , 5600 , 4500 , 5033 , 3240 , 5096 , 4785 , 5033 , 3240 , 5096 , 5033 , 3240 , 5096",
	"SIEnergyWEEK" : "5033 , 3240 , 5096 , 4785 , 5033 , 3240 , 5096",
	"SIEnergyYEAR" : "25337 , 11008 , 22306 , 22569 , 25337 , 21008 , 22306 , 15569 , 25337 , 21008 , 22306 , 28569",
	"SIProductionDAY" : "0 , 0 , 0 , 0 , 0 , 0 , 1 , 7 , 19 , 42 , 78 , 160 , 200 , 250 , 190 , 120 , 63 , 26 , 6 , 3 , 0 , 0 , 0 , 0",
	"SIProductionMONTH" : "1285 , 1385 , 1488 , 1289 , 1293 , 1193 , 190 , 2185 , 1385 , 1488 , 1289 , 1293 , 1193 , 190 , 1285 , 1385 , 1488 , 2189 , 1293 , 1193 , 290 , 2185 , 3185 , 1488 , 1289 , 2193 , 1193 , 910 , 1488 , 1289 , 1293",
	"SIProductionWEEK" : "1285 , 1385 , 1488 , 1289 , 1293 , 1193 , 1290",
	"SIProductionYEAR" : "11612 , 10415 , 12000 , 13000 , 14000 , 15000 , 17000 , 16000 , 13000 , 12000 , 11000 , 1800",
	"SuddivisioneConsumi" : "7",
	"SuddivisioneConsumi0_el" : "ah.app.3521399293210525833-8",
	"SuddivisioneConsumi0_val" : "10 , 10 , 10 , 10 , 10 , 20 , 45 , 456 , 85 , 145 , 2000 , 145 , 2563 , 1256 , 2563 , 1452 , 658 , 856 , 456 , 10 , 10 , 1235 , 2541 , 51",
	"SuddivisioneConsumi1_el" : "ah.app.3521399293210525895-8",
	"SuddivisioneConsumi1_val" : "10 , 0 , 10 , 0 , 10 , 10 , 10 , 56 , 80 , 45 , 1500 , 140 , 563 , 1200 , 2063 , 1052 , 58 , 800 , 400 , 0 , 10 , 1035 , 500 , 51",
	"SuddivisioneConsumi2_el" : "ah.app.3521399293210525813-8",
	"SuddivisioneConsumi2_val" : "0 , 10 , 0 , 10 , 0 , 10 , 35 , 400 , 5 , 100 , 500 , 5 , 2000 , 56 , 500 , 400 , 600 , 50 , 56 , 10 , 0 , 200 , 2041 , 00",
	"SuddivisioneConsumi3_el" : "ah.app.1111111111111111111-1",
	"SuddivisioneConsumi3_val" : "0 , 0 , 0 , 0 , 0 , 0 , 0 , 0 , 0 , 0 , 0 , 0 , 0 , 0 , 0 , 0 , 0 , 0 , 0 , 0 , 0 , 0 , 0 , 0",
	"SuddivisioneConsumi4_el" : "ah.app.1111111111111111111-1",
	"SuddivisioneConsumi4_val" : "0 , 0 , 0 , 0 , 0 , 0 , 0 , 0 , 0 , 0 , 0 , 0 , 0 , 0 , 0 , 0 , 0 , 0 , 0 , 0 , 0 , 0 , 0 , 0",
	"SuddivisioneConsumi5_el" : "ah.app.1111111111111111111-1",
	"SuddivisioneConsumi5_val" : "0 , 0 , 0 , 0 , 0 , 0 , 0 , 0 , 0 , 0 , 0 , 0 , 0 , 0 , 0 , 0 , 0 , 0 , 0 , 0 , 0 , 0 , 0 , 0",
	"SuddivisioneConsumi6_el" : "ah.app.1111111111111111111-1",
	"SuddivisioneConsumi6_val" : "0 , 0 , 0 , 0 , 0 , 0 , 0 , 0 , 0 , 0 , 0 , 0 , 0 , 0 , 0 , 0 , 0 , 0 , 0 , 0 , 0 , 0 , 0 , 0"
}
