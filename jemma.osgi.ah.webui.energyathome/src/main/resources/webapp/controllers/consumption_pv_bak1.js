mainApp.controller('consumption_pv', function($scope) {

	// instantaneous total power consumption
	$scope.consumption = "N.D";

	// istantaneous total power production
	$scope.production = "N.D";

	// power to the grid
	$scope.toGrid = "N.D";

	// Weekly self consumption index in %
	$scope.weeklySelfConsumption = "N.D.";

	$scope.todayConsumption = "N.D.";
	$scope.monthConsumptionForecast = "N.D.";
	$scope.weeklyAverageConsumption = "N.D.";

	$scope.todayCost = "N.D.";
	$scope.monthCostForecast = "N.D.";
	$scope.weeklyAverageCost = "N.D.";

	// in %
	$scope.costTrendToday = "N.D."
	$scope.consumptionTrendToday = "N.D."

	$scope.todayProduction = "N/A";

	$scope.devices = {};
	$scope.smartInfo = null;

	$scope.costsPie = [ [ [ 'Heavy Industry', 12 ], [ 'Retail', 9 ], [ 'Light Industry', 14 ], [ 'Out of home', 16 ],
			[ 'Commuting', 7 ], [ 'Orientation', 9 ] ] ];

	$scope.costsPieOptions = {
		seriesDefaults : {
			// Make this a pie chart.
			renderer : jQuery.jqplot.PieRenderer,
			rendererOptions : {
				// Put data labels on the pie slices.
				// By default, labels show the percentage of the slice.
				showDataLabels : true
			}
		},
		legend : {
			show : true,
			location : 'e'
		}
	};

	console.log("entering consumption_pv controller");
	CostiConsumi.init($scope);

	$scope.$on('$destroy', function deactivate() {
		console.log("deactivating consumption_pv controller");
		// CostiConsumi.exit($scope);
	});
});

var potenza = {
	value : null
};

var consumoMaxValue = 0;
var consumoMaxIcon;
var consumoMaxNome;

var CostiConsumi = {};

CostiConsumi.init = function($scope) {
	if (InterfaceEnergyHome.objService == null) {
		CostiConsumi.applianceServiceInit = setInterval(function() {
			if (InterfaceEnergyHome.objService != null) {
				clearInterval(CostiConsumi.applianceServiceInit);
				console.log("bound service in CostiConsumi");
				CostiConsumi.update($scope);
			}

		}, 4000);
	} else {
		CostiConsumi.update($scope);
	}
}

CostiConsumi.update = function($scope) {

	if (CostiConsumi.update.$scope != undefined) {
		$scope = CostiConsumi.update.$scope;
	}
	if ($scope == undefined) {
		console.log("please set $scope");
		return;
	}
	CostiConsumi.update.$scope = $scope;

	CostiConsumi.updateDeviceInfos($scope); // TESTED
	CostiConsumi.updateTodayConsumption($scope); // TESTED
	CostiConsumi.GetConsumoMedioCC($scope);

	// updates information that goes on the page
	// CostiConsumi.GetConsumoPrevistoCC($scope);
	CostiConsumi.GetConsumoMediaWeek($scope);
	// CostiConsumi.getForecast($scope);

	// CostiConsumi.GestIndicatoriCC($scope);
	// CostiConsumi.getCostoOdierno($scope);

	/* Download the RSS feed if there is a connection to the server */
	if (InterfaceEnergyHome.mode == 0 || InterfaceEnergyHome.visError != InterfaceEnergyHome.ERR_CONN_SERVER) {
		// CostiConsumi.InitfeedSim();
	} else {
		// var script = document.createElement("script");
		// script.src =
		// "https://www.google.com/jsapi?callback=CostiConsumi.loadFeed";
		// script.type = "text/javascript";
		// document.body.appendChild(script);
	}
}

CostiConsumi.GestIndicatoriCC = function($scope) {
	if (CostiConsumi.consumoGiornaliero != null && CostiConsumi.consumoMedio != null) {

		clearInterval(CostiConsumi.timerIndicatoriCC);
		CostiConsumi.timerIndicatoriCC = null;

		CostiConsumi.VisIndicatoreConsumiCC();
		CostiConsumi.VisIndicatoreCostiCC();
	} else {
		if (CostiConsumi.timerIndicatoriCC == null)
			CostiConsumi.timerIndicatoriCC = setInterval(CostiConsumi.GestIndicatoriCC, 500);
	}
}

CostiConsumi.exit = function($scope) {

	if (CostiConsumi.timerPotenzaCC != null) {
		clearInterval(CostiConsumi.timerPotenzaCC);
		CostiConsumi.timerPotenzaCC = null;
	}
	if (CostiConsumi.timerPowerMeter != null) {
		clearInterval(CostiConsumi.timerPowerMeter);
		CostiConsumi.timerPowerMeter = null;
	}
	if (CostiConsumi.timerConsumi != null) {
		clearInterval(CostiConsumi.timerConsumi);
		CostiConsumi.timerConsumi = null;
	}
	if (CostiConsumi.timerBlink != null) {
		clearInterval(CostiConsumi.timerBlink);
		CostiConsumi.timerBlink = null;
	}

	if (chartPie != null)
		chartPie.destroy();

	Main.ResetError();
}

CostiConsumi.getDeviceInfos = function($scope) {
	var nullValue = {
		value : {
			value : 0
		}
	};

	try {
		var p = InterfaceEnergyHome.objService.getAppliancesConfigurationsDemo();
		p.done(function(result) {

			$.each(result.list, function(indice, elettrodom) {

				var deviceInfo = elettrodom["map"];
				var appType = deviceInfo[InterfaceEnergyHome.ATTR_APP_TYPE];
				var value = deviceInfo[InterfaceEnergyHome.ATTR_APP_VALUE];
				var pid = deviceInfo[InterfaceEnergyHome.ATTR_APP_PID];

				if (appType == InterfaceEnergyHome.SMARTINFO_APP_TYPE) {
					if (value == undefined) {
						value = {
							list : new Array()
						};
						value.list.push(nullValue);
					} else {
						var val = parseFloat(value.list[0].value.value);
						value.list[0].value.value = val;
					}

					$scope.smartInfo = deviceInfo;

					Main.appIdSmartInfo = pid;
				} else {
					if (value == undefined) {
						value = {
							list : new Array()
						};
						value.list.push(nullValue);
					} else {
						var val = 0;
						if (value.list.length > 0) {
							val = parseFloat(value.list[0].value.value);
						} else {
							value.list[0] = nullValue;
						}

						// FIXME: ?????
						value.list[0].value.value = val;
					}

					if (deviceInfo != undefined) {
						if (pid != undefined) {
							$scope.devices[pid] = deviceInfo;
						}
					}
				}
			});

			try {
				mostPowerDemandingDevice = CostiConsumi.maxPowerDemandingDevice($scope.devices);
				CostiConsumi.updateMostDemandingDevice(mostPowerDemandingDevice);
			} catch (e) {
				console.log("exception in maxPowerDemandingDevice: " + e.message);
			}

			CostiConsumi.SetConsumoImgCC($scope);
		});
	} catch (err) {
		console.log("ERRORE:");
		console.log(err);
		InterfaceEnergyHome.GestErrorEH("Dispositivi", err);
	}
}

/**
 * Determine which is the most instantaneous power demanding device. Any
 * SmartInfo device or any device that doesn't measure the power must be
 * filtered out. The device category is used to determine the device type.
 * 
 * FIXME: the device category is selected by the user, so it should not be used
 * for this purpose.
 */

CostiConsumi.maxPowerDemandingDevice = function(devices) {
	var filteredDevicesList = $.map(devices, function(device, index) {

		var appCategory = device[InterfaceEnergyHome.ATTR_APP_CATEGORY];
		if (device[InterfaceEnergyHome.ATTR_APP_AVAIL] == 2) {
			if (isPowerSink(appCategory)) {
				return device;
			}
		}
	});

	filteredDevicesList.sort(function(a, b) {

		var firstElettrConsumo = 0;
		var secondElettrConsumo = 0;

		// Se uno dei due elettrodomestici in sort è una lavatrice
		// (whitegood) e il consumo � sotto a 1W, normalizzo a 0
		var aRslt = false;
		var bRslt = false;

		for (var iCounter = 0; iCounter < a[InterfaceEnergyHome.ATTR_APP_VALUE].list.length; iCounter++) {
			if (a[InterfaceEnergyHome.ATTR_APP_VALUE].list[iCounter].name == "IstantaneousDemands") {
				aRslt = true;
				firstElettrConsumo = a[InterfaceEnergyHome.ATTR_APP_VALUE].list[iCounter].value.value;
			}
		}
		for (var jCounter = 0; jCounter < b[InterfaceEnergyHome.ATTR_APP_VALUE].list.length; jCounter++) {
			if (b[InterfaceEnergyHome.ATTR_APP_VALUE].list[jCounter].name == "IstantaneousDemands") {
				bRslt = true;
				secondElettrConsumo = b[InterfaceEnergyHome.ATTR_APP_VALUE].list[jCounter].value.value;
			}
		}
		if ((aRslt) && (bRslt)) {
			if (a[InterfaceEnergyHome.ATTR_APP_TYPE] == InterfaceEnergyHome.WHITEGOOD_APP_TYPE) {
				firstElettrConsumo = (firstElettrConsumo < 1) ? 0 : firstElettrConsumo;
			}
			if (b[InterfaceEnergyHome.ATTR_APP_TYPE] == InterfaceEnergyHome.WHITEGOOD_APP_TYPE) {
				secondElettrConsumo = (secondElettrConsumo < 1) ? 0 : secondElettrConsumo;
			}
			return secondElettrConsumo - firstElettrConsumo;
		} else {
			return 0;
		}
	});

	if (filteredDevicesList.length > 0) {
		return filteredDevicesList[0];
	} else {
		return null;
	}
}

/**
 * Fill the gui with the data related to the most demanding device.
 */
CostiConsumi.updateMostDemandingDevice = function(device) {

	if (device != null) {
		// TODO: remove info

		if (device[InterfaceEnergyHome.ATTR_APP_VALUE].list[0].value.value == 0) {
			$("#DettaglioConsumoMaggiore").html("<span id='MsgConsumoMaggiore'></span>");
			$("#MsgConsumoMaggiore").text(Msg.home["maxDisp0"]);
		} else {
			$("#DettaglioConsumoMaggiore").html("<span id='TestoConsumoMaggiore'></span><img id='ConsumoMaggioreImg' src=''>");

			// metto immagine del device che sta consumando di piu'
			$("#ConsumoMaggioreImg").attr("src", DefinePath.imgDispPath + device[InterfaceEnergyHome.ATTR_APP_ICON]);
			// il consumo e' in watt
			$("#TestoConsumoMaggiore").text(
					device[InterfaceEnergyHome.ATTR_APP_NAME] + " ("
							+ Math.round(device[InterfaceEnergyHome.ATTR_APP_VALUE].list[0].value.value) + " Wh)");
			if (CostiConsumi.dimMaxDispImg == -1) {
				var wDiv = 90;
				var hDiv = 90;

				// imposto dimensioni e offset img in px
				if (wDiv > hDiv) {
					CostiConsumi.dimMaxDispImg = (hDiv * 0.9);
				} else {
					CostiConsumi.dimMaxDispImg = (wDiv * 0.9);
				}
			}

			$("#ConsumoMaggioreImg").width(CostiConsumi.dimMaxDispImg);
			$("#ConsumoMaggioreImg").height(CostiConsumi.dimMaxDispImg);
		}
	} else {
		// TODO: remove the div or write that there are no devices that are most
		// demanding
	}

	// FIXME: va qui?????
	if (!CostiConsumi.suddivisioneCostiRender) {
		CostiConsumi.GetSuddivisioneConsumi();
	}
}

CostiConsumi.getConsumptionData = function($scope) {
	Main.ResetError();

	var start = GestDate.getDate();
	var end = start;

	if (start == null) {
		console.log("consumption_pv: start date is undefined");
		return;
	}

	// start points to the 00:00 of the current day.
	start.setHours(0);

	try {
		var p = getAttributeDataProduzione(InterfaceEnergyHome.ALL_PID, start.getTime(), end.getTime(), InterfaceEnergyHome.HOUR);
		p.done(function(result) {
			CostiConsumi.consumoGiornaliero = result.list;
		});
	} catch (err) {
		console.log("ERRORE:");
		console.log(err);
		InterfaceEnergyHome.GestErrorEH("Dispositivi", err);
	}
}

CostiConsumi.getTodayConsumption = function($scope) {
	var start = GestDate.getDate();

	if (start == null) {
		console.log("consumption_pv: start date is undefined");
		return;
	}

	var indConsumoOdierno = 0;
	var attuale, oraAttuale, minAttuale, consumo, val, consumoLista;

	// FIXME: consider the case: Smart Info not present.

	var smartInfoPid = $scope.smartInfo == null ? null : $scope.smartInfo["appliance.pid"];

	try {
		var p = getAttributeDataConsumo(smartInfoPid, start.getTime(), start.getTime(), InterfaceEnergyHome.DAY);
		p.done(function(result) {

			if (result.list[0] != null) {
				var todayConsumption = (result.list[0] / 1000).toFixed(1);
				if (todayConsumption < 0) {
					todayConsumption = 0;
				}
				$scope.todayConsumption = todayConsumption;
			}
		});
	} catch (err) {
		console.log("ERRORE:");
		console.log(err);
		InterfaceEnergyHome.GestErrorEH("getTodayConsumption", err);
	}
}

CostiConsumi.getTodayProduction = function($scope) {

	var start = GestDate.getDate();

	if (start == null) {
		console.log("consumption_pv: start date is undefined");
		return;
	}

	try {

		var p = getAttributeDataProduzione(InterfaceEnergyHome.ALL_PID, start.getTime(), start.getTime(), InterfaceEnergyHome.DAY);
		p.done(function(result) {
			var todayProduction = 0;
			if (result.list[0] != null && $scope.todayConsumption != null) {
				todayProdution = result.list[0] / 1000;
				$scope.todayConsumption = ($scope.todayConsumption - todayProduction).toFixed(1);
				if ($scope.todayConsumption < 0) {
					$scope.todayConsumption = 0;
				}
			}
			$scope.todayProduction = todayProduction;
		});
	} catch (err) {
		console.log("ERRORE:");
		console.log(err);
		InterfaceEnergyHome.GestErrorEH("getTodayProduction", err);
	}

};

CostiConsumi.GetConsumoMedioCC = function($scope) {
	date = GestDate.getDate();

	if (date == null) {
		console.log("consumption_pv: date is still undefined in the system");
		return;
	}

	// in js we start from 1
	var weekDay = date.getDay() + 1;

	try {
		var p = InterfaceEnergyHome.objService.getWeekDayAverage(InterfaceEnergyHome.ALL_PID, InterfaceEnergyHome.CONSUMO, weekDay);
		p.done(function(result) {
			if ((err == null) && (result != null)) {
				CostiConsumi.consumoMedio = result.list;
			}
		});

	} catch (err) {
		console.log(err);
		InterfaceEnergyHome.GestErrorEH("Dispositivi", err);
	}
};

CostiConsumi.VisIndicatoreConsumiCC = function($scope) {

	var arrayMedio = new Array();
	if (CostiConsumi.consumoGiornaliero && CostiConsumi.consumoMedio) {
		arrayMedio = CostiConsumi.consumoMedio.slice(0, CostiConsumi.consumoGiornaliero.length);
	}

	var perc = 1;
	var Totodierno = 0;
	var Totmedio = 0;
	if ((CostiConsumi.consumoMedio != null) && (CostiConsumi.consumoGiornaliero != null)) {
		Totodierno = 0;
		Totmedio = 0;

		$.each(CostiConsumi.consumoGiornaliero, function(index, consumo) {
			if (consumo != null) {
				var tmpConsumo = consumo * 1;
				var tmpMedio = arrayMedio[index] * 1;
				Totodierno += tmpConsumo;
				Totmedio += tmpMedio;
			}
		});
		if (Totodierno != null && Totmedio > 0) {
			perc = Totodierno / Totmedio;

			if (perc > 2) {
				perc = 2;
			}
		}
		$('#ConsumoIndicatoreImg').gaugePV("value", perc);
	}
}

CostiConsumi.VisIndicatoreCostiCC = function($scope) {

	var arrayMedio = new Array();
	if (CostiConsumi.consumoGiornaliero && CostiConsumi.consumoMedio) {
		arrayMedio = CostiConsumi.consumoMedio.slice(0, CostiConsumi.consumoGiornaliero.length);
	}

	var perc = 1;
	var Totodierno = 0;
	var Totmedio = 0;
	if ((CostiConsumi.consumoMedio != null) && (CostiConsumi.consumoGiornaliero != null) && (CostiConsumi.prodOdierno != null)) {
		Totodierno = 0;
		Totmedio = 0;

		$.each(CostiConsumi.consumoGiornaliero, function(index, consumo) {
			if (consumo != null) {
				var tmpConsumo = consumo * 1;
				var tmpMedio = arrayMedio[index] * 1;
				Totodierno += tmpConsumo;
				Totmedio += tmpMedio;
			}
		});
		if (Totodierno != null && Totmedio > 0) {
			perc = (Totodierno - (CostiConsumi.prodOdierno * 1000)) / Totmedio;

			if (perc > 2) {
				perc = 2;
			}
		}
		$('#CostoIndicatoreImg').gaugePV("value", perc);
	}
}

CostiConsumi.GetConsumoPrevistoCC = function($scope) {

	var start = GestDate.getDate();

	if (start == null) {
		console.log("consumption_pv: date is still undefined in the system");
		return;
	}

	// FIXME: add promise

	try {
		InterfaceEnergyHome.objService.getForecast(CostiConsumi.DatiConsumoPrevistoCbCC, InterfaceEnergyHome.ALL_PID,
				InterfaceEnergyHome.CONSUMO, start, InterfaceEnergyHome.MONTH);
	} catch (err) {
		InterfaceEnergyHome.GestErrorEH("GetConsumoPrevistoCC", err);
	}

}

CostiConsumi.DatiConsumoPrevistoCbCC = function(result, err) {
	var txt;

	if (err != null) {
		InterfaceEnergyHome.GestErrorEH("DatiConsumoPrevistoCbCC", err);
	}

	// test
	if ((InterfaceEnergyHome.mode == -1) || (InterfaceEnergyHome.mode == -2)) {
		// result = result.list[0];
		var tmpResult = 0;
		$.each(result.list, function(index, element) {
			element = Math.floor(element);
			if (element != null) {
				tmpResult += element;
			}
		});
		result = tmpResult * 30;
	}

	if ((err == null) && (result != null)) {
		CostiConsumi.consumoPrevisto = Math.round(result / 1000); // da w a kW
		txt = Math.round(CostiConsumi.consumoPrevisto) + " kWh";
		// $("#DettaglioCostoConsumoPrevisto").html('');
		// $("#DettaglioCostoConsumoPrevisto").html(Msg.home["consumoPrevisto"]
		// + ": <b>" + txt + "</b>");
		$("#DettaglioCostoConsumoPrevisto b").html(txt);
	} else {
		// inserisco il dato fake
		CostiConsumi.consumoPrevisto = 0;
		// $("#DettaglioCostoConsumoPrevisto").html('');
		$("#DettaglioCostoConsumoPrevisto b").css("style='color:#605f61';").html("N/D");
		// $("#DettaglioCostoConsumoPrevisto").html(Msg.home["consumoPrevisto"]
		// + ": <b style='color:#605f61;'> N.D.</b>");
	}

	$("#CostiConsumi").css("z-index", "10");
}

CostiConsumi.getForecast = function($scope) {
	// FIXME: promise
	try {
		var start = Main.dataAttuale.getTime();
		InterfaceEnergyHome.objService.getForecast(CostiConsumi.getCostoPrevisto, InterfaceEnergyHome.ALL_PID,
				InterfaceEnergyHome.PRODUZIONE, start, InterfaceEnergyHome.MONTH);
	} catch (err) {
		InterfaceEnergyHome.GestErrorEH("GetConsumoPrevistoCC", err);
	}

}

CostiConsumi.SetConsumoImgCC = function($scope) {

	$("#ValConsumoAttuale").html('');
	if (CostiConsumi.potenzaAttuale.value == null) {
		val = 0;
		$("#ValConsumoAttuale").html(Msg.home["datoNonDisponibile"]);
	} else {
		val = CostiConsumi.potenzaAttuale.value;
		$("#ValConsumoAttuale").html((val / 1000.0).toFixed(3) + " kW");
	}

	val = val / 1000.0;

	// segnalo sovraccarico (zona gialla) e sovraccarico grave(zona rossa) dello
	// speedometer
	if (val > Define.home["contatoreOk"][Main.contatore]) {
		if (val > Define.home["contatoreWarn"][Main.contatore]) {
			$("#ValConsumoAttuale").css("color", "red");
		} else {
			$("#ValConsumoAttuale").css("color", "orange");
		}

		if (CostiConsumi.timerBlink == null) {
			$("#ValConsumoAttuale").addClass("invisibleDiv")
			CostiConsumi.timerBlink = setInterval(CostiConsumi.BlinkVal, CostiConsumi.TIMER_BLINK);
		}
	} else {
		clearInterval(CostiConsumi.timerBlink);
		CostiConsumi.timerBlink = null;
		$("#ValConsumoAttuale").css("color", "black");
		$("#ValConsumoAttuale").removeClass("invisibleDiv");
	}

	$('#ConsumoAttualeMeter').speedometer("valueCons", val, "kW");

	// imposto timer aggiornamento potenza e max elettrodomestico
	if (CostiConsumi.timerPotenzaCC == null) {
		CostiConsumi.timerPotenzaCC = setInterval(CostiConsumi.getDeviceInfos, CostiConsumi.TIMER_UPDATE_POWER_METER);
	}
}

CostiConsumi.BlinkVal = function() {
	$("#ValConsumoAttuale").toggleClass("invisibleDiv");
}

CostiConsumi.getConsumptionPie = function($scope) {

	var myDate = new Date(Main.dataAttuale.getTime());
	myDate.setDate(myDate.getDate() - 30);// Mi sposto indietro di 30 giorni.
	var start = new Date(myDate.getTime());
	var end = new Date(Main.dataAttuale.getTime());

	CostiConsumi.suddivisioneCostiRender = true;

	try {
		p = InterfaceEnergyHome.objService.getAttributeData(InterfaceEnergyHome.CONSUMO, start.getTime(), end.getTime(),
				InterfaceEnergyHome.DAY, true, InterfaceEnergyHome.DELTA);
		p.done(function(result) {
			processPieData($scope, result);
		});

	} catch (err) {
		console.log(err);
		InterfaceEnergyHome.GestErrorEH("getConsumptionPie", err);
	}
}

CostiConsumi.isPowerSink = function(appCategory) {
	// FIXME: add NEST???
	if ((appCategory != "44") && (appCategory != "40") && (appCategory != "45") && (appCategory != "36") && (appCategory != "41")
			&& (appCategory != "35") && (appCategory != "34")) {
		return true;
	}
}

CostiConsumi.processPieData = function($scope, result) {

	var listaConsumi = new Array();
	var consumiTotale = 0;
	var altriConsumi = 0;
	var ConsumiSmartinfo = 0;
	var controlSumListaConsumi = 0;

	var retVal = null;

	/*
	 * Creo l'array di coppie nome-costo, escludendo lo smartInfo e calcolando
	 * il costo totale
	 */
	$.each(result.map, function(indexResult, element) {
		var device = $scope.devices[indexResult];

		if (($scope.smartInfo == null)
				|| (($scope.smartInfo != null) && (indexResult != $scope.smartInfo[InterfaceEnergyHome.ATTR_APP_PID]))) {

			if (device) {
				appCategory = device[InterfaceEnergyHome.ATTR_APP_CATEGORY];
				if (isPowerSink(appCategory)) {
					if (element.list.length > 0) {
						var sum = 0;
						for (var i = 0; i < element.list.length; i++) {
							var value = element.list[i];
							if (value != null) {
								sum += value;
							}
						}
						consumiTotale += sum;
						if (sum > 0) {
							controlSumListaConsumi++;
						}
						listaConsumi.push(new Array(device[InterfaceEnergyHome.ATTR_APP_NAME], sum));
					}
				}
			}
		} else {
			var sumSmartInfo = 0;
			for (var i = 0; i < element.list.length; i++) {
				var vSmartInfo = element.list[i];
				if (vSmartInfo != null) {
					sumSmartInfo += vSmartInfo;
				}
			}
			ConsumiSmartinfo += sumSmartInfo;
		}
	});

	if (ConsumiSmartinfo) {
		altriConsumi = ConsumiSmartinfo - consumiTotale;
	}

	if ((altriConsumi == 0) && ((InterfaceEnergyHome.mode == -1) || (InterfaceEnergyHome.mode == -2))) {
		altriConsumi = Math.floor(consumiTotale / 6);
		controlSumListaConsumi++;
		listaConsumi.push(new Array(Msg.home["altro"], altriConsumi));
	} else {
		controlSumListaConsumi++;
		listaConsumi.push(new Array(Msg.home["altro"], altriConsumi));
	}

	if (controlSumListaConsumi == 0) {
		// Se tutti gli elementi inseriti in listaConsumi hanno valore
		// 0, non mostro il grafico.
		listaConsumi = new Array();
	}

	$("#Grafico").show();
	$("#GraficoConsumoOdierno").hide();
	$("#DettaglioSuddivisioneCosti").show();

	if (listaConsumi.length > 0) {
		// Radialize the colors
		CostiConsumi.renderPieGraph = true;
		Highcharts.getOptions().colors = $.map(Highcharts.getOptions().colors, function(color) {
			return {
				radialGradient : {
					cx : 0.5,
					cy : 0.3,
					r : 0.7
				},
				stops : [ [ 0, color ], [ 1, Highcharts.Color(color).brighten(-0.3).get('rgb') ] ]
			};
		});

		// Build the chart
		chartPie = new Highcharts.Chart(
				{
					chart : {
						renderTo : 'DettaglioSuddivisioneCosti',
						events : {
							load : function(event) {
								hideSpinner();
							}
						},
						plotBackgroundColor : null,
						plotBorderWidth : null,
						plotShadow : false
					},
					colors : [ '#9ba4f9', '#003f8f', '#5362f5', '#00868f', '#8de2ff', '#06f1ff', '#00cfdc', '#005b79', '#0032c6',
							'#0095c6' ],
					title : {
						text : ""
					},
					tooltip : {
						formatter : function() {
							return '<b>' + this.point.name + '</b>: ' + Math.floor(this.percentage) + ' % - '
									+ Math.floor(this.y / 1000) + ' kWh ';
						}
					},
					plotOptions : {
						pie : {
							allowPointSelect : true,
							cursor : 'pointer',
							dataLabels : {
								enabled : true,
								color : '#000',
								connectorColor : '#000',
								formatter : function() {
									return '<b>' + this.point.name + '</b>:<br />' + Math.floor(this.percentage) + ' %';
								},
								overflow : 'justify',
								distance : 9,
								rotation : 0,
								style : {
									color : '#333333',
									fontSize : '9pt',
									padding : '5px'
								}
							}
						}
					},
					credits : false,
					series : [ {
						type : 'pie',
						name : 'Lista dei consumi',
						data : listaConsumi
					} ]
				});
		hideSpinner();
	} else {
		$("#Grafico").show();
		$("#GraficoConsumoOdierno").hide();
		$("#DettaglioSuddivisioneCosti").show();
		$("#DettaglioSuddivisioneCosti").html("<div id='SuddivisioneCostiVuoto'>" + Msg.home["suddivisioneVuoto"] + "</div>");
	}

}

CostiConsumi.getMoltForCost = function(result, err) {
	var txt;
	if (err != null) {
		InterfaceEnergyHome.GestErrorEH("getCostoPrevisto", err);
	}

	if (result != null) {
		CostiConsumi.MOLTFORCOST = result.list[0] * 1;
	}

	CostiConsumi.getCostoOdierno();
}

CostiConsumi.getTodayCost = function() {

	var txt;
	if (CostiConsumi.consumoOdierno != null) {
		if (CostiConsumi.prodOdierno != null) {
			CostiConsumi.costoOdierno = (CostiConsumi.consumoOdierno - CostiConsumi.prodOdierno) * CostiConsumi.MOLTFORCOST;
		} else {
			CostiConsumi.costoOdierno = CostiConsumi.consumoOdierno * CostiConsumi.MOLTFORCOST;
		}
		if (CostiConsumi.costoOdierno < 0)
			CostiConsumi.costoOdierno = 0;
		if (isNaN(CostiConsumi.costoOdierno))
			txt = Msg.home["datoNonDisponibile"];
		else
			txt = (CostiConsumi.costoOdierno).toFixed(2) + " €";
	} else {
		txt = Msg.home["datoNonDisponibile"];
	}

	$("#DettaglioCostiOdierno b").html(txt);
};

CostiConsumi.getCostoPrevisto = function(result, err) {

	var txt;
	if (err != null) {
		InterfaceEnergyHome.GestErrorEH("getCostoPrevisto", err);
	}

	if (result != null) {
		CostiConsumi.prodPrevMese = result.list[0] * 1;
		if (CostiConsumi.consumoPrevisto != null) {
			if (CostiConsumi.prodPrevMese != null) {
				CostiConsumi.costoPrevMese = (CostiConsumi.consumoPrevisto - CostiConsumi.prodPrevMese) * CostiConsumi.MOLTFORCOST;
				if (CostiConsumi.costoPrevMese < 0)
					CostiConsumi.costoPrevMese = 0;
			} else {
				CostiConsumi.costoPrevMese = CostiConsumi.consumoPrevisto * CostiConsumi.MOLTFORCOST;
			}
			if (isNaN(CostiConsumi.costoPrevMese))
				txt = Msg.home["datoNonDisponibile"];
			else
				txt = (CostiConsumi.costoPrevMese).toFixed(2) + " €";
		} else {
			txt = Msg.home["datoNonDisponibile"];
		}

		$("#DettaglioCostiPrevisto b").html(txt);
	} else {
		txt = Msg.home["datoNonDisponibile"];
		$("#DettaglioCostiPrevisto b").html(txt);
	}
};

CostiConsumi.getCostoMediaWeek = function() {

	var txt;
	if (CostiConsumi.consumoMediaWeek != null) {
		if (CostiConsumi.prodMediaWeek != null) {
			CostiConsumi.costoMediaWeek = (CostiConsumi.consumoMediaWeek - CostiConsumi.prodMediaWeek) * CostiConsumi.MOLTFORCOST;
			if (CostiConsumi.costoMediaWeek < 0)
				CostiConsumi.costoMediaWeek = 0;
			CostiConsumi.costoMediaWeek = (CostiConsumi.consumoMediaWeek - CostiConsumi.prodMediaWeek) * CostiConsumi.MOLTFORCOST;
		} else {
			CostiConsumi.costoMediaWeek = CostiConsumi.consumoMediaWeek * CostiConsumi.MOLTFORCOST;
		}
		if (isNaN(CostiConsumi.costoMediaWeek))
			txt = Msg.home["datoNonDisponibile"];
		else
			txt = (CostiConsumi.costoMediaWeek).toFixed(2) + " €";
	} else {
		txt = Msg.home["datoNonDisponibile"];
	}
	$("#DettaglioCostiMediaWeek b").html(txt);
};

/**
 * Get the average daily consumption of the last week
 */
CostiConsumi.GetConsumoMediaWeek = function() {

	var today = GestDate.getDate();
	var oneWeekAgo = today;

	// back of 7 days
	oneWeekBefore.setDate(today - 7);

	var startTime = oneWeekAgo.getTime();
	var endTime = today.getTime();

	try {
		var p = getAttributeDataConsumo(InterfaceEnergyHome.ALL_PID, start.getTime(), end.getTime(), InterfaceEnergyHome.DAY);

		p.done(function(result) {

			var txt = Msg.home["datoNonDisponibile"];

			var consumi_array = result.list;
			var consumi_count = 0;
			var consumo_somma = 0;
			for (var i = 0; i < consumi_array.length; i++) {
				consumi_array[i] = consumi_array[i] * 1;
				if (consumi_array[i] != null) {
					consumo_somma += consumi_array[i];
					consumi_count++;
				}
			}
			CostiConsumi.consumoMediaWeek = (consumo_somma / consumi_count) / 1000;
			if (CostiConsumi.consumoMediaWeek < 0)
				CostiConsumi.consumoMediaWeek = 0;

			if (isNaN(CostiConsumi.consumoMediaWeek))
				txt = Msg.home["datoNonDisponibile"];
			else
				txt = (CostiConsumi.consumoMediaWeek).toFixed(1) + " kWh";
		});
	} catch (err) {
		console.log(err);
		InterfaceEnergyHome.GestErrorEH("getTodayProduction", err);
	}

	try {
		var myDate = new Date(Main.dataAttuale.getTime());
		myDate.setDate(myDate.getDate() - 7);// Mi sposto indietro di 7
		// giorni.
		var start = new Date(myDate.getTime());
		var end = new Date(Main.dataAttuale.getTime());

		var p = getAttributeDataProduzione(InterfaceEnergyHome.ALL_PID, start.getTime(), end.getTime(), InterfaceEnergyHome.DAY);
		p.done(function(result) {
			var isNull = false;
			var txt;
			if (result != null) {
				var prod_array = result.list;
				var prod_count = 0;
				var prod_somma = 0;
				for (var i = 0; i < prod_array.length; i++) {
					prod_array[i] = prod_array[i] * 1;
					if (prod_array[i] != null) {
						prod_somma += prod_array[i];
						prod_count++;
					}
				}
				CostiConsumi.prodMediaWeek = (prod_somma / prod_count) / 1000;

				if (!isNaN(CostiConsumi.prodMediaWeek) && !isNaN(CostiConsumi.consumoMediaWeek)) {
					CostiConsumi.consumoMediaWeek -= CostiConsumi.prodMediaWeek;
					if (CostiConsumi.consumoMediaWeek < 0)
						CostiConsumi.consumoMediaWeek = 0;
				}
				if (isNaN(CostiConsumi.consumoMediaWeek)) {
					isNull = true;
					txt = Msg.home["datoNonDisponibile"];
				} else
					txt = (CostiConsumi.consumoMediaWeek).toFixed(2) + " kWh";
			} else {
				isNull = true;
				txt = Msg.home["datoNonDisponibile"];
			}
			if (isNull) { // metto dato fake
				CostiConsumi.consumoMediaWeek = 4.8;
				$("#DettaglioCostoConsumoMediaWeek b").css("style='color:#605f61;'").html(CostiConsumi.consumoMediaWeek + " KWh");
			} else {
				$("#DettaglioCostoConsumoMediaWeek b").html(txt);
			}

			CostiConsumi.getCostoMediaWeek();
		});
	} catch (err) {
		console.log(err);
		InterfaceEnergyHome.GestErrorEH("getAttributeData", err);
	}
};

CostiConsumi.getAttributeDataConsumption = function(pid, startTime, endTime, resolution)
{
	return InterfaceEnergyHome.objService.getAttributeData(pid, InterfacciaEnergyHome.CONSUMO, start, end, resolution, true,
			InterfaceEnergyHome.DELTA);
}

CostiConsumi.getAttributeDataProduzione = function(pid, startTime, endTime, resolution)
{
	return InterfaceEnergyHome.objService.getAttributeData(pid, InterfacciaEnergyHome.PRODUZIONE, start, end, resolution, true,
			InterfaceEnergyHome.DELTA);
}

/**
 * Feeds Management
 * 
 * FIXME: most of the code here should be moved in a lib.
 */

CostiConsumi.Initfeed = function(channel) {
	var feed;

	/* Se i feed sono giˆ stati caricati non viene inoltrata un altra richiesta */
	if (channel == 0 && CostiConsumi.notizie.length != 0) {
		CostiConsumi.caricafeed();
	} else {
		/*
		 * Questa funzione viene richiamata un numero di volte pari al numero di
		 * canali che si vuole caricare e qui si differenzia il feed da caricare
		 * in base al canale
		 */
		switch (channel) {
		case 0: {
			feed = new google.feeds.Feed("http://energyhomenews.wordpress.com/feed/ ");
			break;
		}
		case 1: {
			feed = new google.feeds.Feed("http://www.rsspect.com/rss/energyathome.xml ");
			break;
		}
		default:
			break;
		}
		feed.setNumEntries(10);

		/*
		 * Una volta settato il canale si caricano i feed e viene chiamata una
		 * funzione di callbak una volta caricati
		 */
		feed.load(function(result) {

			if (!result.error) {
				/*
				 * salvo i feed nella variabile CostiConsumi.notizie la prima
				 * news � selezionata random, dalla seconda in poi vengono
				 * inserite nello stesso ordine con cui vengono ricevute
				 */
				var randIndex = Math.floor((Math.random() * result.feed.entries.length));
				var entryRand = result.feed.entries[randIndex];
				var itemRand = {
					title : entryRand.title,
					link : entryRand.link,
					description : entryRand.contentSnippet
				}
				CostiConsumi.notizie.push(itemRand);

				for (var i = 0; i < result.feed.entries.length; i++) {
					if (i != randIndex) {
						var entry = result.feed.entries[i];
						var item = {
							title : entry.title,
							link : entry.link,
							description : entry.contentSnippet
						}
						CostiConsumi.notizie.push(item);
					}
				}
			}
			/*
			 * Se ho caricato il primo canale allora chiamo la funzione per
			 * caricare il secondo
			 */
			if (channel == 0) {
				CostiConsumi.Initfeed(1);
			} else {
				/*
				 * se ho caricato il secondo canale e carico i feed nell'html
				 */
				CostiConsumi.caricafeed();

				$("#backNews").click(function() {
					CostiConsumi.notizieid = CostiConsumi.notizieid - 2;
					if (CostiConsumi.notizieid < 0) {
						CostiConsumi.notizieid = CostiConsumi.notizie.length - 2;
					}
					CostiConsumi.caricafeed();
				});

				$("#nextNews").click(function() {
					CostiConsumi.notizieid = CostiConsumi.notizieid + 2;
					if (CostiConsumi.notizieid >= CostiConsumi.notizie.length) {
						CostiConsumi.notizieid = 0;
					}
					CostiConsumi.caricafeed();
				});
			}

		});
	}
}

/* Funziona che visualizza gli RSS feed contenuti nella variabile notizie */
CostiConsumi.caricafeed = function() {

	$(".dettaglioNews,.titoloNews").removeAttr("threedots");
	$(".threedots_ellipsis").remove();

	altezza_news = Math
			.floor(($("#InfoFeedDettaglio").height() - 1 - (Math.floor($("#InfoFeedDettaglio").width() * 0.01) * 2)) / 2);

	$("#PrimaNews").css("height", altezza_news);
	$("#SecondaNews").css("height", altezza_news);

	$("#PrimaNews .titoloNews .ellipsis_text").html(CostiConsumi.notizie[CostiConsumi.notizieid]["title"]);
	$("#PrimaNews a").attr("href", CostiConsumi.notizie[CostiConsumi.notizieid]["link"]);
	$("#PrimaNews .dettaglioNews .ellipsis_text ").html(CostiConsumi.notizie[CostiConsumi.notizieid]["description"]);

	$("#SecondaNews .titoloNews .ellipsis_text").html(CostiConsumi.notizie[CostiConsumi.notizieid + 1]["title"]);
	$("#SecondaNews a").attr("href", CostiConsumi.notizie[CostiConsumi.notizieid + 1]["link"]);
	$("#SecondaNews .dettaglioNews .ellipsis_text").html(CostiConsumi.notizie[CostiConsumi.notizieid + 1]["description"]);

	var diffContenitore_Notizie = $("#InfoFeedDettaglio").outerHeight(true) - 68
			- ((Math.floor($("InfoFeedDettaglio").width() * 0.01)) * 5);

	if (diffContenitore_Notizie < 0) {
		$("#SecondaNews").remove();
		$("#PrimaNews").css("position", "absolute").css("top", "25%").css("border", "0px");
	}

	$(".titoloNews").ThreeDots({
		max_rows : 1
	});
	$(".dettaglioNews").ThreeDots();

	$("#InfoFeedTitolo").show();
}

CostiConsumi.InitfeedSim = function() {
	if (typeof NotizieSimul !== 'undefined') {
		CostiConsumi.notizie = NotizieSimul;
	}

	CostiConsumi.caricafeed();
	$("#backNews").click(function() {
		CostiConsumi.notizieid = CostiConsumi.notizieid - 2;
		if (CostiConsumi.notizieid < 0)
			CostiConsumi.notizieid = 8;

		CostiConsumi.caricafeed();
	});

	$("#nextNews").click(function() {
		CostiConsumi.notizieid = CostiConsumi.notizieid + 2;
		if (CostiConsumi.notizieid >= 10)
			CostiConsumi.notizieid = 0;

		CostiConsumi.caricafeed();
	});

};

/** Funzione lanciata al caricamento dello script google per gli RSS * */
CostiConsumi.loadFeed = function() {
	google.load("feeds", "1", {
		"callback" : CostiConsumi.launchFeed
	});
}

CostiConsumi.launchFeed = function() {
	CostiConsumi.Initfeed(0);
}
