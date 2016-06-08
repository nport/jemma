mainApp.controller('HistoricalDataController', HistoricalDataController)

function HistoricalDataController($scope) {

	console.log("entering historydata controller");

	var _this = this;

	this.$scope = $scope;

	this.devices = null;

	/**
	 * The pid of the currently selected device pid
	 */
	this.currentAppliancePid;

	/**
	 * The period of time (DAY, MONTH, YEAR) selected by the user.
	 */
	this.currentPeriod = null;
	this.startPeriodDate = null;
	this.endPeriodDate = null;

	/**
	 * The chartType can be COST_AND_CONSUMPTION or ONLY_CONSUMPTION
	 */
	this.chartType = this.ONLY_CONSUMPTION;

	this.DAY = 0;
	this.WEEK = 1;
	this.MONTH = 2;
	this.YEAR = 3;

	applianceServiceInit = null;

	tipoUltimoPeriodo = null;
	periodoScelto = null;
	dispositivoScelto = null;
	datiCostoNulli = false;
	datiConsumoNulli = false;
	enableResize = true;
	datiCosto = null;
	datiConsumo = null;
	datiProduzione = null;
	titoloGraph = null;

	COST_AND_CONSUMPTION = 0;
	ONLY_CONSUMPTION = 1;

	LIMITALERTGIORNO = 24;
	LIMITALERTSETTIMANA = 7;
	LIMITALERTMESE = 31;
	LIMITALERTANNO = 12;
	LIMITPARAM = 0.3;

	/*
	 * The date when the application started to work. By default we put 0.
	 */
	this.installationDate = new Date(0);

	if (InterfaceEnergyHome.objService == null) {
		this.applianceServiceInit = setInterval(function() {
			if (InterfaceEnergyHome.objService != null) {
				clearInterval(_this.applianceServiceInit);
				console.log("bound service in HistoricalData");
				_this.update();
			}

		}, 4000);
	} else {
		this.update();
	}

	// FIXME: if the historical data is bound with a directive, probably we
	// don't need this!
	this.$scope.$watch('history.currentPeriod', function(newValue, oldValue) {
		console.log("changed currentPeriod to " + newValue);
		var period = parseInt(newValue);
		_this.selectPeriod(period);
	});

	this.$scope.$watch('history.endPeriodDate', function(newValue, oldValue) {
		console.log("changed endPeriodDate to " + newValue);
		_this.getDataSeries(InterfaceEnergyHome.attrs.ATTR_CONSUMPTION);
	});

	this.$scope.$watch('history.startPeriodDate', function(newValue, oldValue) {
		console.log("changed startPeriodDate to " + newValue);
		_this.getDataSeries(InterfaceEnergyHome.attrs.ATTR_CONSUMPTION);
	});

	// FIXME: replace with some directives in the html file
	this.$scope.$watch('history.currentAppliancePid', function(newValue, oldValue) {
		console.log("changed currentAppliancePid to " + newValue);
		_this.getDataSeries(InterfaceEnergyHome.attrs.ATTR_CONSUMPTION);
	});
}

var Storico = {};

HistoricalDataController.prototype.update = function() {
	this.updateDeviceInfos();
}

HistoricalDataController.prototype.updateDeviceInfos = function() {

	var _this = this;

	try {
		var p = InterfaceEnergyHome.objService.getAppliancesConfigurationsDemo();
		p.done(function(result) {
			//_this.$scope.$apply(function() {
				_this.devices = _this.normalizeAndFilterDeviceInfos(result);
			//});
		});
	} catch (e) {
		console.log("exception: " + e);
	}
}

/**
 * Create a list of the devices removing those devices that are not measuring
 * power and therefore does not make sense to have them here.
 */

HistoricalDataController.prototype.normalizeAndFilterDeviceInfos = function(devices) {
	var _this = this;

	var result = {};
	$.each(devices, function(i, device) {
		if (_this.isPowerSink(device)) {
			result[device[InterfaceEnergyHome.ATTR_APP_PID]] = device;
		}
	});
	return result;
}

/*
 * se cambio in breve tempo sia periodo che dispositivo (o che date con le
 * frecce) potrei lanciare una chiamata prima che sia finita quella precedente
 * bisogna vedere cosa succede cambio le date in base al periodo precedente e al
 * tipo di periodo scelto non devo mettere ora 23 nel caso di richiesta di
 * giorno perche' quando c'e' l'ora legale altrimenti passo al giorno dopo
 */

HistoricalDataController.prototype.selectPeriod = function(period) {

	var nowDate = GestDate.getDate();
	var yesterday = new Date(nowDate.getTime());
	yesterday.setDate(yesterday.getDate() - 1);
	yesterday.setHours(0);
	yesterday.setMinutes(0);
	yesterday.setSeconds(0);
	yesterday.setMilliseconds(0);

	var startPeriodDate = this.startPeriodDate;
	var endPeriodDate = this.endPeriodDate;

	if (startPeriodDate == null) {
		startPeriodDate = new Date(nowDate.getTime());
		endPeriodDate = new Date(nowDate.getTime());
	}

	switch (period) {
	case this.DAY:
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

	case this.WEEK:
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

	case this.MONTH:
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

	case this.YEAR:
		/*
		 * get always the last day of the current year
		 */
		startPeriodDate = new Date(endPeriodDate.getFullYear(), 0, 1);
		endPeriodDate = new Date(startPeriodDate.getFullYear() + 1, 0, 1);
		break;

	}

	// controllo di non superare i limiti temporali
	if (startPeriodDate.getTime() < this.installationDate.getTime()) {
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

	this.startPeriodDate = startPeriodDate;
	this.endPeriodDate = endPeriodDate;
}

/**
 * Calculates the range of dates of the previous period of the same type of the
 * current one. Updates also the arrows.
 */
HistoricalDataController.prototype.moveToPreviousPeriod = function() {

	switch ($scope.currentPeriod) {
	case this.DAY:
		this.startPeriodDate.setDate(this.startPeriodDate - 1);
		this.endPeriodDate.setDate(this.endPeriodDate.getDate() - 1);
		break;

	case this.WEEK:
		this.startPeriodDate.setDate(this.startPeriodDate.getDate() - 7);
		this.endPeriodDate.setDate(this.endPeriodDate.getDate() - 7);
		break;

	case this.MONTH:
		this.startPeriodDate.setMonth(this.startPeriodDate.getMonth() - 1);
		this.endPeriodDate = new Date(this.endPeriodDate.getFullYear(), this.endPeriodDate.getMonth(), 0, 12, 0, 0);
		break;

	case this.YEAR:
		this.startPeriodDate.setFullYear(this.startPeriodDate.getFullYear() - 1);
		// ultimo giorno dell'anno precedente
		this.endPeriodDate.setFullYear(this.endPeriodDate.getFullYear() - 1);
		this.endPeriodDate.setMonth(11);
		this.endPeriodDate.setDate(31);
		break;
	}

	$("#nextPeriod").show();
	// se data inizio e' prima data possibile nascondo freccia precedente
	if (this.startPeriodDate.getTime() <= Storico.installationDate.getTime()) {
		$("#previousPeriod").hide();
	} else {
		$("#previousPeriod").show();
	}

	this.$scope.$apply();
}

HistoricalDataController.prototype.moveToNextPeriod = function() {
	switch (this.currentPeriod) {

	case this.DAY:
		$scope.startPeriodDate.setDate(this.startPeriodDate.getDate() + 1);
		this.endPeriodDate.setDate(this.endPeriodDate.getDate() + 1);
		break;

	case this.WEEK:
		this.startPeriodDate.setDate(this.startPeriodDate.getDate() + 7);
		this.endPeriodDate.setDate($scope.endPeriodDate.getDate() + 7);
		break;

	case this.MONTH:
		this.startPeriodDate.setMonth(this.startPeriodDate.getMonth() + 1);

		this.endPeriodDate = new Date(this.endPeriodDate.getFullYear(), this.endPeriodDate.getMonth() + 2, 0, 12, 59, 59);
		break;

	case this.YEAR:
		this.startPeriodDate.setFullYear(this.startPeriodDate.getFullYear() + 1);
		this.endPeriodDate.setFullYear(this.endPeriodDate.getFullYear() + 1);
		break;
	}

	$("#previousPeriod").show();

	yesterday = new Date(GestDate.GetActualDate().getTime());
	yesterday.setHours(0);
	yesterday.setMinutes(0);
	yesterday.setSeconds(0);
	yesterday.setMilliseconds(0);

	if ((this.endPeriodDate.getTime()) >= yesterday.getTime()) {
		$("#nextPeriod").hide();
	} else {
		$("#nextPeriod").show();
	}
}

HistoricalDataController.prototype.exit = function() {
	// hideSpinner();
	Main.ResetError();
	this.datiCosto = null;
	this.datiConsumo = null;
	if (this.enableResize) {
		$(window).unbind('resize', Storico.ResizePlot);
	}

	InterfaceEnergyHome.Abort();
	$("#Content").hide();
}

HistoricalDataController.prototype.getDataSeries = function(attributeName) {

	var _this = this;

	if (this.currentPeriod == null) {
		return;
	}

	var period = parseInt(this.currentPeriod);

	// FIXME: handle week!
	if (this.endPeriodDate == null) {
		return;
	}

	if (this.startPeriodDate == null) {
		return;
	}

	if (this.currentAppliancePid === undefined) {
		return;
	}

	var resolution;

	if (period == this.DAY) {
		resolution = InterfaceEnergyHome.HOUR;
	} else if (period == 3) {
		resolution = InterfaceEnergyHome.MONTH;
	} else {
		resolution = InterfaceEnergyHome.DAY;
	}

	var p = InterfaceEnergyHome.objService.getAttributeData(this.currentAppliancePid, attributeName, this.startPeriodDate,
			this.endPeriodDate, resolution, true, InterfaceEnergyHome.DELTA);
	p.done(function(result) {
		console.log("received data");
		if (result == null) {
			return;
		}
		_this.displayData(null, _this.currentAppliancePid, result, period);
	});
}

/**
 * The following function will display the passed data in a graphical format.
 * The displayType parameter specifies which information to show. If 1 only the
 * consumption are shown, if 0 both the cost and the consumption are shown.
 * 
 * The period parameter tells the period the data refers to: DAY, MONTH, YEAR
 */

// TODO: move it in a directive!!
HistoricalDataController.prototype.displayData = function(displayType, appliancePid, consumptionData, period) {

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
	var valTicker = new Date(this.startPeriodDate.getTime());

	valTicker.setHours(0);
	valTicker.setMinutes(0);
	valTicker.setSeconds(0);

	var startPeriodDate = this.startPeriodDate;
	var endPeriodDate = this.endPeriodDate;

	var chartTitle;
	var graphLabelXAxes;

	if (period == this.DAY) {
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
	} else if (period == this.YEAR) {
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

		if (this.currentPeriod == this.MONTH) {
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
	if (this.currentAppliancePid != null) {
		if (this.currentAppliancePid == "total") {
			applianceName = Msg.home["tuttiStorico"];
		} else {
			applianceName = this.devices[this.currentAppliancePid][InterfaceEnergyHome.ATTR_APP_NAME];
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
			if (this.DateIsValid(valTicker, this.currentPeriod)) {
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

		if ((this.chartType == this.COST_AND_CONSUMPTION) && (series2 != null)) {
			if ((series2[i] == null) && (limitOdierno) && (i < limitOdierno)) {
				series2[i] = 0;
				if (this.DateIsValid(valTicker, this.currentPeriod)) {
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
		if (this.currentPeriod == this.DAY) {
			var hour = valTicker.getHours() + i;
			cat.push(hour.toString());
			yOffset = 20;
			titleXAxis = Msg.storico[0];
		} else if (this.currentPeriod == this.WEEK) {
			var day = valTicker.getDate();
			var month = valTicker.getMonth();
			valTicker.setDate(valTicker.getDate() + 1);
			cat.push(daysOfWeek[i] + "<br />(" + day + "-" + Msg.mesiCompleto[month] + ")");
			yOffset = 17;
			titleXAxis = Msg.storico[1];
		} else if (this.currentPeriod == this.MONTH) {
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

	if (this.chartType == this.COST_AND_CONSUMPTION) {
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

	var startDateToday = this.isSameDay(startPeriodDate, nowDate);

	switch (this.currentPeriod) {
	case this.DAY:
		limitAlertMsg = Storico._setLimitAlertMsg(nowDate.getHours(), Storico.LIMITALERTGIORNO, nowDate);
		break;

	case this.WEEK:
		limitAlertMsg = Storico._setLimitAlertMsg(nowDate.getDay(), Storico.LIMITALERTSETTIMANA, nowDate);
		break;

	case this.MONTH:
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
		if (this.currentAppliancePid == null || this.currentAppliancePid == 0) {
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

	if (this.isSameDay(this.startPeriodDate, this.installationDate)) {
		$("#MsgStorico").hide();
	} else if ((this.datiCostoNulli) || (this.datiConsumoNulli)) {
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
HistoricalDataController.prototype.DateIsValid = function(valDate, periodo) {
	// nel caso di giorno tengo conto dell'ora, altrimenti no
	if (periodo == this.DAY) {
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

HistoricalDataController.prototype.isSameDay = function(date1, date2) {
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

HistoricalDataController.prototype.isPowerSink = function(device) {
	var appCategory = device[InterfaceEnergyHome.ATTR_APP_CATEGORY];

	if ((appCategory != "44") && (appCategory != "40") && (appCategory != "45") && (appCategory != "36") && (appCategory != "41")
			&& (appCategory != "35") && (appCategory != "34") && (appCategory != "47")) {
		return true;
	}
}
