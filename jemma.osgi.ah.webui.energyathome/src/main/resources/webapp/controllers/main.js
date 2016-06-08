/*
 * This is the main controller. It handles the mainpage of the Energy@Home GUI.
 */

var translation = {
	menu : {
		"home" : "Home",
		"configurations" : "Configurazioni",
		"community" : "Community",
		"infotrial" : "Tutto sul trial",
		"costs" : "Costi",
		"consumption" : "Consumi",
		"photovoltaic" : "Fotovoltaico",
		"devices" : "Dispositivi",
		"storico" : "Storico",
		"forum" : "Forum",
		"confSched" : "Schedulazione",
		"confDisp" : "Dispositivi",
		"confUtente" : "Utente",
		"confImpost" : "Impostazioni",
		"contacts" : "Contatti",
		"tariff" : "Tariffa",
		"survey" : "Questionari",
		"information" : "Informazioni",
		"report" : "Report",
		"registration" : "Gestione Registrazione",
		"overload" : "Gestione Sovraccarico",
		"deviceName" : "Nome Dispositivo",
		"insertDeviceName" : "Inserisci nome dispositivo",
		"location" : "Ubicazione",
		"insertLocation" : "Inserisci Ubicazione",
		"ok" : "OK",
		"cancel" : "Annulla",
		"deviceInfo" : "Informazioni Dispositivo",
		"remove" : "Rimuovi",
		"category" : "Categoria",
		"deviceInfo" : "Configurazione dispositivo",
		"identify" : "Identifica",
		"pid" : "PID",
		"technology" : "Technology",
		"physicalID" : "ID",
		"icon" : "Icona",
		"applianceType" : "Tipo dispositvo"
	},
	"home" : {
		labelCodiceUtente : "CODICE_UTENTE",
		"day" : "Giorno",
		"month" : "Mese",
		"week" : "Settimana",
		"year" : "Anno",
		"period" : "Periodo",
		"device" : "Dispositivo",
		"spesaMensile" : "spesaMensile",
		"howMuchConsumption" : "Quanto Stai Consumando",
		"howMuchCost" : "Quanto Stai Spendendo",
		"consumptionHowIsGoingToday" : "Come stai andando",
		"howMuchCost" : "Quanto Stai Spendendo",
		"consumptionToday" : "Consumi di oggi",
		"consumptionMonthForecast" : "Previsto per il mese",
		"consumptionTodayGraph" : "Quanta energia hai usato oggi",
		"mostDemanding" : "Consumo maggiore",
		"currentProduction" : "Produzione Attuale",
		"injectedToGrid" : "Immissione in rete",
		"consumptionsSummary" : "Riepilogo consumi",
		"devicesConsumption" : "Consumo dispositivi",
		"otherConsumption" : "Altri consumi",
		"totalConsumption" : "Consumo totale",
		"clickOnDevice" : "Fai click su un dispositivo per vederne qui i dettagli",
		"consumptionSummary" : "Sintesi consumi",
		"costSummary" : "Sintesi costi",
		"todayConsumption" : "Energia usata oggi",
		"monthConsumptionForecast" : "Previsioni mese",
		"weekAverageConsumption" : "Media settimanale",
		"todayCost" : "Costi di oggi",
		"monthCostForecast" : "Previsioni costi mese",
		"weekAverageCost" : "Media costi settimanali",
		"currentConsumption" : "Consumi attuali",
		total : "Totale",
		"consumption" : "Consumo",
		"deviceState" : "Stato dispositivo",
		"location" : "ubicazione",
		"Location" : "Ubicazione",
		"lightIntensity" : "Intensità luminosa",
		update : "Aggiorna",
		"color" : "Colore",
		"state" : "Stato",
		"away" : "Fuori Casa",
		"targetTemperature" : "Temperatura richiesta",
		"temperature" : "Temperatura",
		"humidity" : "Umidità",
		"lightIntensitySlider" : "Regola intensità luminosa",
		yes : "SI",
		no : "NO"
	},
	"attributes" : {
		"temperature" : "Temperatura",
		"humididy" : "Umidità",
	}
};

var model = {
	"dettaglioCostoConsumoPrevisto" : "200",
	"dettaglioCostoConsumoOdierno" : "300",
	"consumoAttuale" : "0.014 KWh"
}

/**
 * This controller take care of managing the main frame.
 */

mainApp.controller('main', function($scope, $location) {
	console.log("controller ready");
	$scope.userId = "";
	$scope.time = "";
	$scope.date = "";
	$scope.translation = translation;
	$scope.model = model;
	$scope.location = $location;

	/*
	 * tipo contatore (0 = 0kw, 1 = 1kW, 2 = 2kW, 3 = 3kW, 4 = 4kW, 5 = 5kW, 6 =
	 * 6kW, 11 = 11kW)
	 */
	$scope.consumptionMeterLimit = null;

	/*
	 * tipo contatore (0 = 3kW, 1 = 4.5kW, 2 = 6kW)
	 */
	$scope.productionMeterLimit = null;
	$scope.secretPassPhrase = "289quaoj0u823qejiak289uq3089sfoswfrwefij489fjqepiadmk";

	/**
	 * true if Photovoltaic mode is enabled. In this mode the web gui changes
	 * aspect.
	 */
	$scope.isPhotovoltaic = false;

	Main.onLoad($scope);

	console.log("activated main controller");
});

var Main = {
	timerTimeout : null,
	/* FIXME: remove it and put a method!!! */
	enablePV : false,
	topic : 'jemma/energyathome/event/*'
}

Main.queryPVInfo = function($scope) {

	if ($scope.isPhotovoltaic == null) {

		try {
			var p = InterfaceEnergyHome.objService.getAttribute(InterfaceEnergyHome.attrs.ATTR_PEAK_PRODUCED_POWER);
			p.done(function(attribute) {
				// FIXME: here it should enable the PV.
				console.log("Peak limit: " + attribute.value);
			});
		} catch (err) {
			InterfaceEnergyHome.GestErrorEH("IdUtenteCb", err);
		}
	} else {
		if ($scope.isPhotovoltaic) {
			// Peak Power Photovoltaic (0 if the photovoltaic is not present)
			var p = InterfaceEnergyHome.objService.getAttribute(InterfaceEnergyHome.ATTR_PEAK_PRODUCED_POWER);
			p.done(function(attribute) {
				Main.contatoreProd = 0;

				var value;

				if (attribute == null) {
					value = Define.home["contatoreProdDefault"];
					Main.contatoreProd = 2;
				}

				var tipoContatoreProd = Define.home['tipoContatoreProd'];
				/*
				 * converto valore massimo contatore in indice 0:2 per gli array
				 * per la definizione dei limiti
				 */
				for (i = 0; i < tipoContatoreProd.length; i++) {
					if (tipoContatoreProd[i] == value) {
						// registro l'indice dell'array
						Main.contatoreProd = i;
					}
				}
			});
		} else {
			// Power Limit Contatore
			var p = InterfaceEnergyHome.objService.getAttribute(InterfaceEnergyHome.attrs.ATTR_INST_POWER_LIMIT);
			p.done(function(attributeValue) {
				if (attributeValue == null) {
					$scope.consumptionMeterLimit = Define.home["contatoreReteDefault"];
				} else {
					$scope.consumptionMeterLimit = attributeValue.value;
				}
			});
		}
	}
}

/**
 * Initialize the application.
 */
Main.init = function($scope) {
	/*
	 * The following callback is called each time the time changes. This
	 * callback must be set before initializing the GestDate module.
	 */
	GestDate.setUpdateCallback(function(date) {
		$scope.date = Utils.FormatDate(date, 2);
		$scope.time = Utils.FormatDate(date, 3);
		$scope.$apply();
	});

	GestDate.init();

	Tracing.Init(Tracing.HOME, navigator.userAgent);

	try {
		var promise = InterfaceEnergyHome.objService.getHapConnectionId();
		promise.done(function(userId) {
			$scope.userId = userId;
			$scope.hagId = 'hag-' + $scope.userId;
			$scope.$apply();

		}).fail(function(e) {
			$scope.userId = "??";
			$scope.$apply();
		}).always(function() {
		});
	} catch (e) {
		console.log("exception in Main.init(): " + e.message);
	}

	Main.queryPVInfo($scope);
}

Main.onLoad = function($scope) {

	$(document).ready(
			function() {
				console.log("document ready");

				$(document).keydown(
						function(event) {
							if (event.ctrlKey == true
									&& (event.which == '61' || event.which == '107' || event.which == '173' || event.which == '109'
											|| event.which == '187' || event.which == '189')) {
								alert('disabling zooming');
								event.preventDefault();
								// 107 Num Key +
								// 109 Num Key -
								// 173 Min Key hyphen/underscor Hey
								// 61 Plus key +/=
							}
						});

				$(window).bind('mousewheel DOMMouseScroll', function(event) {
					if (event.ctrlKey == true) {
						// this disables zooming
						event.preventDefault();
					}
				});

				var mode = ($scope.location.search()).mode;

				if ((mode != null) && (mode != "")) {
					if (mode == "simul") {
						InterfaceEnergyHome.setMode(0);
					} else if (mode == "demo") {
						InterfaceEnergyHome.setMode(1);
					} else if (mode == "cost") {
						InterfaceEnergyHome.setMode(3);
					} else if ((mode == "noserver") || (mode == "nodata")) {
						InterfaceEnergyHome.setMode(-1);
					} else if (mode == "noservernodev") {
						InterfaceEnergyHome.setMode(-2);
					} else {
						InterfaceEnergyHome.setMode(2)
					}
				} else {
					InterfaceEnergyHome.setMode(2);
				}

				InterfaceEnergyHome.init();

				Main.applianceServiceInit = setInterval(function() {
					if (InterfaceEnergyHome.objService == null) {
						InterfaceEnergyHome.init();
					} else {
						clearInterval(Main.applianceServiceInit);
						Main.init($scope);
					}
				}, 4000);

				source = new EventSource("sse" + '/' + Main.topic);

				source.onmessage = function(event) {
					if (event.data != undefined) {
						var data = JSON.parse(event.data);
						var topics = data['event.topics'];
						if (topics == 'jemma/energyathome/event/attribute') {
							// console.log(data.appliancePid + ": attribute " +
							// event.data);
						} else if (topics == 'jemma/energyathome/event/device') {
							// console.log(data.deviceInfo.appliancePid + ":
							// device " + event.data);
						}
					}
				};
			});
}

Main.exit = function($scope) {
	if (GestDate.timerDate != null)
		clearInterval(GestDate.timerDate);

	Tracing.Trace(null, Tracing.OUT, null, null);
	Tracing.Trace(Tracing.HOME, Tracing.OUT, null, null);
}

Main.ResetError = function() {
	$("#ErrorMsgDIV").text("");
}

// Visualizzo messaggio di errore
Main.VisError = function(err) {
	var oldTxt = $("#ErrorMsgDIV").text();

	// Visualizzo il nuovo messaggio di errore solo se non � giˆ presente
	if ((Msg.visErr[err] != oldTxt) && (oldTxt.indexOf(Msg.visErr[err]) < 0)) {
		$("#ErrorMsgDIV").html(oldTxt + ' <br /> ' + Msg.visErr[err]);
	}
}
