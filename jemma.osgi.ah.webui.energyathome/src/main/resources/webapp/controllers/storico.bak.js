mainApp.controller('historicaldata', function($scope) {

	console.log("entering historydata controller");

	$scope.devices = null;

	$scopeisPowerSink = function(device) {
		HistoricalData.isPowerSink(device);
	}

	/**
	 * The pid of the currently selected device pid
	 */
	$scope.currentDevicePid;

	/**
	 * The period of time (DAY, MONTH, YEAR) selected by the user.
	 */
	$scope.currentPeriod = null;
	startPeriodDate = null;
	$scope.endPeriodDate = null;

	/**
	 * The chartType can be COST_AND_CONSUMPTION or ONLY_CONSUMPTION
	 */
	$scope.chartType = HistoricalData.ONLY_CONSUMPTION;

	/*
	 * The date when the application started to work. By default we put 0.
	 */
	$scope.installationDate = new Date(0);

	if (InterfaceEnergyHome.objService == null) {
		HistoricalData.applianceServiceInit = setInterval(function() {
			if (InterfaceEnergyHome.objService != null) {
				clearInterval(HistoricalData.applianceServiceInit);
				console.log("bound service in HistoricalData");
				HistoricalData.update($scope);
			}

		}, 4000);
	} else {
		HistoricalData.update($scope);
	}

	if (false) {

		$("input[name='period']").click(function() {
			var period = parseInt($("input[type=radio][name='period']:checked").val());
			console.log("changed period to " + period);
			HistoricalData.selectPeriod($scope, period);
		});

		$scope.$watch('devices', function(newValue, oldValue) {
			// here we have to update the the list for selecting devices
			console.log("changed devices");
			HistoricalData.updateDeviceSelectionRadioGroup("#storicoDeviceNames", newValue);

			// initalizes the event handler for the device selector.
			$("input[name='device']").click(function() {
				var pid = $("input[type=radio][name='device']:checked").val();
				$scope.currentDevicePid = pid;
				$scope.$apply();
			});
		});
	}

	$scope.$watch('currentPeriod', function(newValue, oldValue) {
		console.log("changed currentPeriod to " + newValue);
		var period = parseInt(newValue);
		HistoricalData.selectPeriod($scope, period);
	});

	$scope.$watch('endPeriodDate', function(newValue, oldValue) {
		console.log("changed endPeriodDate to " + newValue);
		HistoricalData.getDataSeries($scope, InterfaceEnergyHome.attrs.ATTR_CONSUMPTION);
	});

	$scope.$watch('startPeriodDate', function(newValue, oldValue) {
		console.log("changed startPeriodDate to " + newValue);
		HistoricalData.getDataSeries($scope, InterfaceEnergyHome.attrs.ATTR_CONSUMPTION);
	});

	$scope.$watch('currentDevicePid', function(newValue, oldValue) {
		console.log("changed decurrentDevicePid to " + newValue);
		HistoricalData.getDataSeries($scope, InterfaceEnergyHome.attrs.ATTR_CONSUMPTION);
	});

});

var HistoricalData = {
	DAY : 0,
	WEEK : 1,
	MONTH : 2,
	YEAR : 3,

	applianceServiceInit : null,

	tipoUltimoPeriodo : null,
	periodoScelto : null,
	dispositivoScelto : null,
	datiCostoNulli : false,
	datiConsumoNulli : false,
	enableResize : true,
	datiCosto : null,
	datiConsumo : null,
	datiProduzione : null,
	titoloGraph : null,

	COST_AND_CONSUMPTION : 0,
	ONLY_CONSUMPTION : 1,

	LIMITALERTGIORNO : 24,
	LIMITALERTSETTIMANA : 7,
	LIMITALERTMESE : 31,
	LIMITALERTANNO : 12,
	LIMITPARAM : 0.3

};

var Storico = {};

HistoricalData.update = function($scope) {
	if (HistoricalData.update.$scope != undefined) {
		$scope = HistoricalData.update.$scope;
	}
	if ($scope == undefined) {
		console.log("please set $scope");
		return;
	}
	HistoricalData.update.$scope = $scope;
	HistoricalData.updateDeviceInfos($scope);
}

HistoricalData.updateDeviceInfos = function($scope) {

	try {
		var p = InterfaceEnergyHome.objService.getAppliancesConfigurationsDemo();
		p.done(function(result) {
			$scope.devices = HistoricalData.normalizeAndFilterDeviceInfos(result);
		});
	} catch (e) {
		console.log("exception: " + e);
	}
}

/**
 * Create a list of the devices removing those devices that are not measuring
 * power and therefore does not make sense to have them here.
 */

HistoricalData.normalizeAndFilterDeviceInfos = function(devices) {
	var result = {};
	$.each(devices, function(i, device) {
		if (HistoricalData.isPowerSink(device)) {
			result[device[InterfaceEnergyHome.ATTR_APP_PID]] = device;
		}
	});
	return result;
}

/**
 * Updates the list of devices in the radio button group
 */

// FIXME: remove this function NOT USED ANYMORE
HistoricalData.updateDeviceSelectionRadioGroup = function(elemId, devices) {
	if (devices == null) {
		// removes any child of elemId
		$(elemId).empty();
		return;
	}

	$(elemId).empty();

	// TODO: internationalization of "Total"

	// add the total element
	HistoricalData.createDeviceSelectionRadioItem(elemId, "total", "Total");

	$.each(devices, function(pid, device) {
		if (HistoricalData.isPowerSink(device)) {
			var name = device[InterfaceEnergyHome.ATTR_APP_NAME];
			var pid = device[InterfaceEnergyHome.ATTR_APP_PID];
			HistoricalData.createDeviceSelectionRadioItem(elemId, pid, name);
		}
	});
}

// FIXME: remove this function NOT USED ANYMORE
HistoricalData.createDeviceSelectionRadioItem = function(elemId, id, label) {
	// add a radio button element
	var inputEl = $('<input>').attr("type", "radio").attr("name", "device").val(id);
	var labelEl = $('<label>');
	labelEl.append(inputEl).append(label);
	var divRadio = $('<div>').addClass('radio').append(labelEl);
	$(elemId).append(divRadio);
}

/*
 * se cambio in breve tempo sia periodo che dispositivo (o che date con le
 * frecce) potrei lanciare una chiamata prima che sia finita quella precedente
 * bisogna vedere cosa succede cambio le date in base al periodo precedente e al
 * tipo di periodo scelto non devo mettere ora 23 nel caso di richiesta di
 * giorno perche' quando c'e' l'ora legale altrimenti passo al giorno dopo
 */

HistoricalData.selectPeriod = function($scope, period) {

	var nowDate = GestDate.getDate();
	var yesterday = new Date(nowDate.getTime());
	yesterday.setDate(yesterday.getDate() - 1);
	yesterday.setHours(0);
	yesterday.setMinutes(0);
	yesterday.setSeconds(0);
	yesterday.setMilliseconds(0);

	var startPeriodDate = $scope.startPeriodDate;
	var endPeriodDate = $scope.endPeriodDate;

	if (startPeriodDate == null) {
		startPeriodDate = new Date(nowDate.getTime());
		endPeriodDate = new Date(nowDate.getTime());
	}

	switch (period) {
	case HistoricalData.DAY:
		// prendo sempre l'ultimo giorno del periodo attualmente
		// visualizzato
		// a meno che il giorno non sia maggiore di yesterday

		if (endPeriodDate.getTime() >= yesterday.getTime()) {
			// prendo yesterday
			endPeriodDate = new Date(yesterday.getTime());
			endPeriodDate.setDate(endPeriodDate.getDate() - 1);
		}
		endPeriodDate.setHours(23);
		endPeriodDate.setMinutes(59);
		startPeriodDate = new Date(endPeriodDate.getTime());
		startPeriodDate.setHours(0);
		startPeriodDate.setMinutes(0);
		break;

	case HistoricalData.WEEK:
		if ((endPeriodDate.getTime()) >= yesterday.getTime()) {
			endPeriodDate = new Date(yesterday.getTime());
		}
		endPeriodDate.setHours(12);
		day = endPeriodDate.getDay();

		// se domenica resta giorno finale della settimana
		if (day != 0) {
			// ultimo giorno = differenza tra domenica e il giorno in
			// questione
			endPeriodDate.setDate(endPeriodDate.getDate() + (7 - day));
		}

		startPeriodDate = new Date(endPeriodDate.getTime());
		startPeriodDate.setDate(startPeriodDate.getDate() - 6);
		startPeriodDate.setHours(0);
		endPeriodDate.setHours(12);
		break;

	case HistoricalData.MONTH:
		if (Storico.tipoUltimoPeriodo == Storico.ANNO) {
			// prendo dicembre o ultimo mese
			startPeriodDate = new Date(endPeriodDate.getTime());
			startPeriodDate.setMonth(11);
			startPeriodDate.setDate(1);
			startPeriodDate.setHours(0);
			startPeriodDate.setMinutes(0);
		} else {
			// prendo il mese in cui cade l'ultimo giorno selezionato
			startPeriodDate = new Date(endPeriodDate.getTime());
			startPeriodDate.setDate(1); // primo giorno del mese
		}
		if (startPeriodDate.getTime() > nowDate.getTime()) {
			startPeriodDate = new Date(nowDate.getTime());
			startPeriodDate.setDate(1);
		}

		endPeriodDate = new Date(startPeriodDate.getTime());
		endPeriodDate.setMonth(endPeriodDate.getMonth() + 1);
		endPeriodDate.setDate(endPeriodDate.getDate() - 1);
		startPeriodDate.setHours(0);
		endPeriodDate.setHours(12);
		break;

	case HistoricalData.YEAR:
		/*
		 * get always the last day of the current year
		 */
		startPeriodDate = new Date(endPeriodDate.getFullYear(), 0, 1);
		endPeriodDate = new Date(startPeriodDate.getFullYear() + 1, 0, 1);
		break;

	}

	// controllo di non superare i limiti temporali
	if (startPeriodDate.getTime() < $scope.installationDate.getTime()) {
		$("#previousPeriod").hide();
	}

	// data fine <= yesterday
	yesterday = new Date(nowDate);
	yesterday.setHours(0);
	yesterday.setMinutes(0);
	yesterday.setSeconds(0);
	yesterday.setMilliseconds(0);
	if ((endPeriodDate.getTime()) >= yesterday.getTime()) {
		$("#nextPeriod").hide();
	}

	$scope.startPeriodDate = startPeriodDate;
	$scope.endPeriodDate = endPeriodDate;
	// $scope.$apply();
}

/**
 * Calculates the range of dates of the previous period of the same type of the
 * current one. Updates also the arrows.
 */
HistoricalData.moveToPreviousPeriod = function($scope) {

	switch ($scope.currentPeriod) {
	case HistoricalData.DAY:
		$scope.startPeriodDate.setDate($scope.startPeriodDate - 1);
		$scope.endPeriodDate.setDate($scope.endPeriodDate.getDate() - 1);
		break;

	case HistoricalData.WEEK:
		$scope.startPeriodDate.setDate($scope.startPeriodDate.getDate() - 7);
		$scope.endPeriodDate.setDate($scope.endPeriodDate.getDate() - 7);
		break;

	case HistoricalData.MONTH:
		$scope.startPeriodDate.setMonth($scope.startPeriodDate.getMonth() - 1);
		$scope.endPeriodDate = new Date($scope.endPeriodDate.getFullYear(), $scope.endPeriodDate.getMonth(), 0, 12, 0, 0);
		break;

	case HistoricalData.YEAR:
		$scope.startPeriodDate.setFullYear($scope.startPeriodDate.getFullYear() - 1);
		// ultimo giorno dell'anno precedente
		$scope.endPeriodDate.setFullYear($scope.endPeriodDate.getFullYear() - 1);
		$scope.endPeriodDate.setMonth(11);
		$scope.endPeriodDate.setDate(31);
		break;
	}

	$("#nextPeriod").show();
	// se data inizio e' prima data possibile nascondo freccia precedente
	if ($scope.startPeriodDate.getTime() <= Storico.installationDate.getTime()) {
		$("#previousPeriod").hide();
	} else {
		$("#previousPeriod").show();
	}

	$scope.$apply();
}

HistoricalData.moveToNextPeriod = function($scope) {
	switch ($scope.currentPeriod) {

	case HistoricalData.DAY:
		$scope.startPeriodDate.setDate($scope.startPeriodDate.getDate() + 1);
		$scope.endPeriodDate.setDate($scope.endPeriodDate.getDate() + 1);
		break;

	case HistoricalData.WEEK:
		$scope.startPeriodDate.setDate($scope.startPeriodDate.getDate() + 7);
		$scope.endPeriodDate.setDate($scope.endPeriodDate.getDate() + 7);
		break;

	case HistoricalData.MONTH:
		$scope.startPeriodDate.setMonth($scope.startPeriodDate.getMonth() + 1);
		$scope.endPeriodDate = new Date($scope.endPeriodDate.getFullYear(), $scope.endPeriodDate.getMonth() + 2, 0, 12, 59, 59);
		break;

	case HistoricalData.YEAR:
		$scope.startPeriodDate.setFullYear($scope.startPeriodDate.getFullYear() + 1);
		$scope.endPeriodDate.setFullYear($scope.endPeriodDate.getFullYear() + 1);
		break;
	}

	$("#previousPeriod").show();

	yesterday = new Date(GestDate.GetActualDate().getTime());
	yesterday.setHours(0);
	yesterday.setMinutes(0);
	yesterday.setSeconds(0);
	yesterday.setMilliseconds(0);

	if (($scope.endPeriodDate.getTime()) >= yesterday.getTime()) {
		$("#nextPeriod").hide();
	} else {
		$("#nextPeriod").show();
	}
}

HistoricalData.exit = function() {
	// hideSpinner();
	Main.ResetError();
	Storico.datiCosto = null;
	Storico.datiConsumo = null;
	if (Storico.enableResize) {
		$(window).unbind('resize', Storico.ResizePlot);
	}

	InterfaceEnergyHome.Abort();
	$("#Content").hide();
}

HistoricalData.getDataSeries = function($scope, attributeName) {

	if ($scope.currentPeriod == null) {
		return;
	}

	var period = parseInt($scope.currentPeriod);

	// FIXME: handle week!
	if ($scope.endPeriodDate == null) {
		return;
	}

	if ($scope.startPeriodDate == null) {
		return;
	}

	if ($scope.currentDevicePid === undefined) {
		return;
	}

	var resolution;

	if (period == HistoricalData.DAY) {
		resolution = InterfaceEnergyHome.HOUR;
	} else if (period == 3) {
		resolution = InterfaceEnergyHome.MONTH;
	} else {
		resolution = InterfaceEnergyHome.DAY;
	}

	var p = InterfaceEnergyHome.objService.getAttributeData($scope.currentDevicePid, attributeName, $scope.startPeriodDate,
			$scope.endPeriodDate, resolution, true, InterfaceEnergyHome.DELTA);
	p.done(function(result) {
		console.log("received data");
		if (result == null) {
			return;
		}
		HistoricalData.displayData($scope, null, $scope.currentDevicePid, result, period);
	});
}

/**
 * The following function will display the passed data in a graphical format.
 * The displayType parameter specifies which information to show. If 1 only the
 * consumption are shown, if 0 both the cost and the consumption are shown.
 * 
 * The period parameter tells the period the data refers to: DAY, MONTH, YEAR
 */

HistoricalData.displayData = function($scope, displayType, appliancePid, consumptionData, period) {

	var nowDate = GestDate.getDate();
	var divGraphId = "historicalViewGraph";

	var tickers = new Array();
	// var max;
	var maxConsumo = 0;
	var maxCosto = 0;
	var yOffset = 0;
	// Variabile che mi serve per capire se sto analizzando i dati del giorno
	// corrente oppure no
	var limitOdierno = null;

	var cat = new Array();
	var daysOfWeek = Msg.daysOfWeek;
	var titleXAxis = "";

	$("#" + divGraphId).empty();
	$("#LabelStoricokWh").hide();
	$("#LabelStoricoEuro").hide();

	// the epoch of now
	var nowTime = GestDate.getDate().getTime();
	var valTicker = new Date($scope.startPeriodDate.getTime());

	valTicker.setHours(0);
	valTicker.setMinutes(0);
	valTicker.setSeconds(0);

	var startPeriodDate = $scope.startPeriodDate;
	var endPeriodDate = $scope.endPeriodDate;

	var chartTitle;
	var graphLabelXAxes;

	if (period == HistoricalData.DAY) {
		graphLabelXAxes = Msg.home["oraLabelStorico"];

		chartTitle = Msg.home["giornoGrafStorico"] + ": " + startPeriodDate.getDate() + "  "
				+ Msg.mesiAbbrev[startPeriodDate.getMonth()].toUpperCase() + " " + startPeriodDate.getFullYear() + "  -  "
				+ Msg.home["dispGrafStorico"];

		var timeToDay = Math.round(nowDate.getFullYear().toString() + nowDate.getMonth().toString() + nowDate.getDate().toString());
		var timeValTicker = Math.round(valTicker.getFullYear().toString() + valTicker.getMonth().toString()
				+ valTicker.getDate().toString());

		if (timeToDay == timeValTicker) {
			limitOdierno = nowDate.getHours();
		} else {
			limitOdierno = null;
		}
	} else if (period == HistoricalData.YEAR) {
		chartTitle = Msg.home["daGrafStorico"] + " " + Msg.mesiAbbrev[startPeriodDate.getMonth()].toUpperCase() + " "
				+ startPeriodDate.getFullYear() + " " + Msg.home["aGrafStorico"] + " "
				+ Msg.mesiAbbrev[endPeriodDate.getMonth()].toUpperCase() + " " + endPeriodDate.getFullYear() + "  -  "
				+ Msg.home["dispGrafStorico"];
		graphLabelXAxes = Msg.home["meseLabelStorico"];

		if ((startPeriodDate.getFullYear() == nowDate.getFullYear()) && (nowDate.getFullYear() == endPeriodDate.getFullYear())) {
			limitOdierno = nowDate.getMonth() + 1;
		} else {
			limitOdierno = null;
		}
	} else {
		chartTitle = Msg.home["daGrafStorico"] + " " + startPeriodDate.getDate() + " "
				+ Msg.mesiAbbrev[startPeriodDate.getMonth()].toUpperCase() + " " + startPeriodDate.getFullYear() + " "
				+ Msg.home["aGrafStorico"] + " " + endPeriodDate.getDate() + " "
				+ Msg.mesiAbbrev[endPeriodDate.getMonth()].toUpperCase() + " " + endPeriodDate.getFullYear() + "  -  "
				+ Msg.home["dispGrafStorico"];

		graphLabelXAxes = Msg.home["giornoLabelStorico"];

		if ($scope.currentPeriod == HistoricalData.MONTH) {
			if ((startPeriodDate.getTime() < nowDate.getTime()) && (nowDate.getTime() < endPeriodDate.getTime())) {
				limitOdierno = nowDate.getDate();
			} else {
				limitOdierno = null;
			}
		} else {
			if ((startPeriodDate.getTime() < nowDate.getTime()) && (nowDate.getTime() < endPeriodDate.getTime())) {
				limitOdierno = nowDate.getDay();
			} else {
				limitOdierno = null;
			}
		}
	}

	/*
	 * adds at the end of the graph heading the name of the meesure or of the
	 * appliance shown.
	 */

	var applianceName;
	if ($scope.currentDevicePid != null) {
		if ($scope.currentDevicePid == "total") {
			applianceName = Msg.home["tuttiStorico"];
		} else {
			applianceName = $scope.devices[$scope.currentDevicePid][InterfaceEnergyHome.ATTR_APP_NAME];
		}

		// adds the appliancve name to the end of the title
		chartTitle += ": " + applianceName;
	}

	if (consumptionData == null) {
		/*
		 * if no data is available just shows the title.
		 */
		$("#MsgStorico").hide();
		$("#" + divGraphId).html("<div>" + chartTitle + "</div>" + "<div>" + Msg.home["noGrafStorico"] + "</div>");
		hideSpinner();
		return;
	}

	var series1;
	var series2;

	// duplicate array
	series1 = consumptionData.slice(0);

	// the second series shown is selected according to some configurations
	if (Main.enablePV) {
		if (Storico.datiProduzione != null) {
			series2 = productionData.slice(0);
		}
	} else {
		if (Storico.datiCosto != null) {
			series2 = costData.slice(0);
		}
	}

	var nullSamplesSeries1;
	var nullSamplesSeries2;

	var nullSamplesSeries1 = jQuery.grep(series1, function(sample) {
		return (sample != null);
	});

	if (series2 != null) {
		nullSamplesSeries2 = jQuery.grep(series2, function(sample) {
			return (sample != null);
		});
	}

	/*
	 * creo array con i dati e creo le label per i tickers controllo se i dati
	 * sono nei limiti altrimenti li sposto (massimo valore + 5%) se dato nullo
	 * lo segnalo (lo ignoro se prima della data di installazione o da oggi in
	 * poi)
	 */

	tickRotationAngle = -45;

	for (i = 0; i < series1.length; i++) {
		// se uno dei 2 e' null metto a null anche l'altro
		if ((series1[i] == null) && (limitOdierno) && (i < limitOdierno)) {
			series1[i] = 0;
			if (HistoricalData.DateIsValid(valTicker, $scope.currentPeriod)) {
				Storico.datiConsumoNulli = true;
			}
		} else {
			if ((limitOdierno) && (i >= limitOdierno)) {
				series1[i] = 0;
			} else {
				var controllo = series1[i] / 10;
				if (controllo > maxConsumo) {
					maxConsumo = controllo;
				}

				// from Wh to kWh
				series1[i] = Utils.RoundTo(series1[i] / 1000, 2);
			}
		}

		if (($scope.chartType == HistoricalData.COST_AND_CONSUMPTION) && (series2 != null)) {
			if ((series2[i] == null) && (limitOdierno) && (i < limitOdierno)) {
				series2[i] = 0;
				if (HistoricalData.DateIsValid(valTicker, $scope.currentPeriod)) {
					Storico.datiCostoNulli = true;
				}
			} else {
				if ((limitOdierno) && (i >= limitOdierno)) {
					series2[i] = 0;
				} else {

					if (!Main.enablePV) {
						// three decimal digits
						series2[i] = Utils.RoundTo(series2[i], 3);
						if (series2[i] > maxCosto) {
							maxCosto = series2[i];
						}
					}

					if (Main.enablePV) {
						// from Watts to kW
						series2[i] = Utils.RoundTo(series2[i] / 1000, 2);
					}
				}
			}
		}

		/*
		 * creates the label array for the X axis ticker
		 */
		if ($scope.currentPeriod == HistoricalData.DAY) {
			var hour = valTicker.getHours() + i;
			cat.push(hour.toString());
			yOffset = 20;
			titleXAxis = Msg.storico[0];
		} else if ($scope.currentPeriod == HistoricalData.WEEK) {
			var day = valTicker.getDate();
			var month = valTicker.getMonth();
			valTicker.setDate(valTicker.getDate() + 1);
			cat.push(daysOfWeek[i] + "<br />(" + day + "-" + Msg.mesiCompleto[month] + ")");
			yOffset = 17;
			titleXAxis = Msg.storico[1];
		} else if ($scope.currentPeriod == HistoricalData.MONTH) {
			tickers[i] = valTicker.getDate() + "-" + (valTicker.getMonth() + 1);
			cat.push(valTicker.getDate() + " - " + (valTicker.getMonth() + 1));
			yOffset = 30;
			valTicker.setDate(valTicker.getDate() + 1);
			titleXAxis = Msg.storico[2];
		} else {
			cat.push(Msg.mesiAbbrev[valTicker.getMonth()] + "-" + (valTicker.getFullYear() - 2000));
			valTicker.setMonth(valTicker.getMonth() + 1);
			yOffset = 30;
			titleXAxis = Msg.storico[3];
		}
	}

	maxConsumo = Math.ceil(maxConsumo) / 100;
	maxConsumo = maxConsumo.toFixed(2);

	if ($scope.chartType == HistoricalData.COST_AND_CONSUMPTION) {
		$("#LabelStoricokWh").show();
		$("#LabelStoricoEuro").show();
	} else {
		$("#LabelStoricoEuro").hide();
		$("#LabelStoricokWh").show();
	}

	/*
	 * Calcolo il valore del 30% (considerando anche se stiamo visualizzando i
	 * dati del giorno corrente, a quel punto si calcola il 30% delle
	 * ore/giorni/mesi che sono effettivamente trascorsi)
	 */
	var limitAlertMsg = 0;

	var startDateToday = HistoricalData.isSameDay(startPeriodDate, nowDate);

	switch ($scope.currentPeriod) {
	case HistoricalData.DAY:
		limitAlertMsg = Storico._setLimitAlertMsg(nowDate.getHours(), Storico.LIMITALERTGIORNO, nowDate);
		break;

	case HistoricalData.WEEK:
		limitAlertMsg = Storico._setLimitAlertMsg(nowDate.getDay(), Storico.LIMITALERTSETTIMANA, nowDate);
		break;

	case HistoricalData.MONTH:
		limitAlertMsg = Storico._setLimitAlertMsg(nowDate.getDate(), Storico.LIMITALERTMESE, nowDate);
		break;

	case Storico.ANNO:
		limitAlertMsg = Storico._setLimitAlertMsg(nowDate.getMonth() + 1, Storico.LIMITALERTANNO, nowDate);
		break;

	default:
		break;
	}

	if (nullSamplesSeries1.length < limitAlertMsg) {
		Storico.datiConsumoNulli = true;
	}

	if (series2 != null) {
		if (costiNullGrep.length < limitAlertMsg) {
			Storico.datiCostoNulli = true;
		}
	}
	// handle Daylight Saving Time
	if (GestDate.DSTMarzo || GestDate.DSTOttobre) {
		var numero_ore = series1.length;
		if (numero_ore != 24) {

			switch (numero_ore) {

			case 23:
				tickers.splice(2, 1);
				tickers.push("23");
				break;

			case 25:
				tickers.pop();
				tickers.splice(2, 0, "2");
				break;

			default:
				break;
			}
		}
	}

	Highcharts.setOptions({
		colors : [ 'blue', "#21e700", '#ED561B', '#DDDF00', '#24CBE5', '#64E572', '#FF9655', '#FFF263', '#6AF9C4' ]
	});

	var chartConfig = {
		chart : {
			renderTo : divGraphId,
			events : {
				load : function(event) {
					hideSpinner();
				}
			},
			type : 'column'
		},
		title : {
			text : chartTitle,
			textAlign : 'left',
			show : true
		},
		subtitle : {
			text : ''
		},
		credits : false,
		xAxis : {
			labels : {
				rotation : tickRotationAngle,
				align : 'center',
				style : {
					font : 'normal 10px Verdana, sans-serif'
				},
				y : yOffset
			},
			tickInterval : 1,
			ticks : tickers,
			title : {
				align : 'middle',
				text : titleXAxis,
				rotation : 0,
				offset : 45,
				style : {
					color : "black"
				}
			},
			categories : cat
		},
		legend : {
			layout : 'vertical',
			backgroundColor : '#FFFFFF',
			align : 'left',
			verticalAlign : 'top',
			x : 100,
			y : 20,
			floating : true,
			shadow : true
		},
		plotOptions : {
			column : {
				pointPadding : 0.2,
				borderWidth : 0
			}
		},
	};

	var displaySeries1 = true;
	var displaySeries2 = true;

	series2 = series1.slice(0);

	if (Main.enablePV) {
		if ($scope.currentDevicePid == null || $scope.currentDevicePid == 0) {
			var displaySeries2 = true;
		}
	}

	chartConfig.yAxis = [];
	chartConfig.series = [];

	if (displaySeries1) {

		var titleYAxisSeries1 = Msg.titleGraphStorico[0];

		/* add the Y axis */
		chartConfig.yAxis.push({
			min : 0,
			title : {
				text : titleYAxisSeries1,
				style : {
					color : 'blue'
				}
			},
			labels : {
				formatter : function() {
					return this.value + 'KWh';
				},
				style : {
					color : 'blue'
				}
			}
		});

		chartConfig.series.push({
			name : titleYAxisSeries1,
			data : series1
		});

		chartConfig.tooltip = {
			formatter : function() {
				return '' + this.x + ': ' + Math.round(this.y * 1000) / 1000 + ' KWh';
			}
		};
	}

	if (displaySeries2) {
		var titleYAxisSeries2 = Msg.titleGraphStorico[1];

		chartConfig.yAxis.push({
			gridLineWidth : 1,
			min : 0,
			title : {
				text : titleYAxisSeries2,
				style : {
					color : 'green'
				}
			},
			labels : {
				formatter : function() {
					return this.value + ' KWh';
				},
				style : {
					color : 'green'
				}
			},
			opposite : true
		});

		chartConfig.series.push({
			name : titleYAxisSeries2,
			data : series2
		});
	}

	chartConfig.tooltip = {
		formatter : function() {
			return '' + this.x + ': ' + Math.round(this.y * 1000) / 1000 + (this.series.name == 'Costi' ? ' Euro' : ' KWh');
		}
	};

	var graficoStorico = new Highcharts.Chart(chartConfig);

	if (HistoricalData.isSameDay($scope.startPeriodDate, HistoricalData.installationDate)) {
		$("#MsgStorico").hide();
	} else if ((HistoricalData.datiCostoNulli) || (HistoricalData.datiConsumoNulli)) {
		$("#MsgStorico").show();
	} else {
		$("#MsgStorico").hide();
	}
}

Storico._setLimitAlertMsg = function(limitToDay, LimitOtherDay, nowDate) {

	var limitAlertMsg, isToDayToDay;
	switch (LimitOtherDay) {
	case Storico.LIMITALERTGIORNO:
		isToDayToDay = (startPeriodDate.getDate() == nowDate.getDate()) && (startPeriodDate.getMonth() == nowDate.getMonth())
				&& (startPeriodDate.getFullYear() == nowDate.getFullYear());
		break;
	case Storico.LIMITALERTSETTIMANA:
		if ((startPeriodDate.getTime() < nowDate.getTime()) && (nowDate.getTime() < endPeriodDate.getTime())) {
			isToDayToDay = true;
		} else {
			isToDayToDay = false;
		}
		break;

	case Storico.LIMITALERTMESE:
		if ((startPeriodDate.getTime() < nowDate.getTime()) && (nowDate.getTime() < endPeriodDate.getTime())) {
			isToDayToDay = true;
		} else {
			isToDayToDay = false;
		}
		break;

	case Storico.LIMITALERTANNO:
		if ((startPeriodDate.getFullYear() == nowDate.getFullYear()) && (nowDate.getFullYear() == endPeriodDate.getFullYear())) {
			isToDayToDay = true;
		} else {
			isToDayToDay = false;
		}
		break;
	}

	if (isToDayToDay) {
		var tmpValue = limitToDay * Storico.LIMITPARAM;
		limitAlertMsg = (limitToDay - tmpValue);
	} else {
		var tmpValue = LimitOtherDay * Storico.LIMITPARAM;
		limitAlertMsg = (LimitOtherDay - tmpValue);
	}
	return Math.round(limitAlertMsg);
}

// controllo se la data specificata rientra tra la data di installazione e
// quella attuale
HistoricalData.DateIsValid = function(valDate, periodo) {
	// nel caso di giorno tengo conto dell'ora, altrimenti no
	if (periodo == HistoricalData.DAY) {
		ora = new Date(GestDate.GetActualDate().getTime());
		var a = new Date(valDate.getTime());

		a.setMinutes(0); // fine dell'ora attuale
		// controllo per data di installazione
		a.setHours(a.getHours() + 1);
		if (a.getTime() < Storico.installationDate.getTime())
			return false;
		// controllo per ora attuale
		// aumento ancora di 1 perche' potrie avere dati incompleti per le
		// ultime 2 ore
		a.setHours(a.getHours() + 1);
		if (a.getTime() > ora)
			return false;

		return true;
	} else {
		// nel caso di giorno il giorno di installazione e quello attuale
		// possono avere
		// dati nulli e non devo segnalare errore
		tmpI = new Date(valDate.getTime());
		tmpI.setHours(0);
		if (tmpI.getTime() < Storico.installationDate.getTime())
			return false;
		tmpI.setDate(tmpI.getDate() + 1);
		domani = new Date(GestDate.GetActualDate().getTime());
		domani.setDate(domani.getDate() + 1);
		domani.setHours(0);
		domani.setMinutes(0);
		if (tmpI.getTime() < domani.getTime())
			return true;
	}
	return false;
}

/**
 * Returns true if the passed Date objects belongs to the same day.
 */

HistoricalData.isSameDay = function(date1, date2) {
	if (date1 == null || date2 == null) {
		return false;
	}
	return (date1.getDate() == date2.getDate() && date1.getMonth() == date2.getMonth() && date1.getFullYear() == date2
			.getFullYear());
}

/**
 * The following function returns true if the device is also a metering device.
 * The device parameter must contain the structure returned by the gateway.
 * 
 * FIXME: the implementation of the GUI must get rid of this function.
 */

HistoricalData.isPowerSink = function(device) {
	var appCategory = device[InterfaceEnergyHome.ATTR_APP_CATEGORY];

	if ((appCategory != "44") && (appCategory != "40") && (appCategory != "45") && (appCategory != "36") && (appCategory != "41")
			&& (appCategory != "35") && (appCategory != "34") && (appCategory != "47")) {
		return true;
	}
}
