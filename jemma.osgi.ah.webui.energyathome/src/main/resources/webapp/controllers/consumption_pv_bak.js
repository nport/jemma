mainApp.controller('consumption_pv', function($scope) {

	$scope.todayConsumption = "N/A";
	$scope.todayProduction = "N/A";

	console.log("entering consumption_pv controller");
	CostiConsumi.init($scope);
});

var potenza = {
	value : null
};

var consumoMaxValue = 0;
var consumoMaxIcon;
var consumoMaxNome;

var CostiConsumi = {

};

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

	CostiConsumi.getDeviceInfos($scope);
	CostiConsumi.GetDatiConsumiCC($scope);
	CostiConsumi.GetConsumoMedioCC($scope);

	// dati da mostrare nel cruscotto
	CostiConsumi.getTodayConsumption($scope);
	CostiConsumi.getTodayProduction($scope);
	CostiConsumi.GetConsumoPrevistoCC($scope);
	CostiConsumi.GetConsumoMediaWeek($scope);
	CostiConsumi.getForecast($scope);

	CostiConsumi.GestIndicatoriCC($scope);
	CostiConsumi.getCostoOdierno($scope);

	/* Download the RSS feed if there is a connection to the server */
	if (InterfaceEnergyHome.mode == 0 || InterfaceEnergyHome.visError != InterfaceEnergyHome.ERR_CONN_SERVER) {
		CostiConsumi.InitfeedSim();
	} else {
		var script = document.createElement("script");
		script.src = "https://www.google.com/jsapi?callback=CostiConsumi.loadFeed";
		script.type = "text/javascript";
		document.body.appendChild(script);
	}
}

CostiConsumi.GestIndicatoriCC = function() {
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

CostiConsumi.ExitConsumi = function() {

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

	CostiConsumi.consumoGiornaliero = null;
	CostiConsumi.suddivisioneCostiRender = false;

	if (chartPie != null)
		chartPie.destroy();

	Main.ResetError();
}

CostiConsumi.getDeviceInfos = function() {
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

					CostiConsumi.SmartInfo = deviceInfo;

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
						value.list[0].value.value = val;
					}

					if (deviceInfo != undefined) {
						if (pid != undefined) {
							CostiConsumi.listaElettr[pid] = deviceInfo;
						}
					}
				}
			});

			try {
				CostiConsumi.DatiMaxElettr();
			} catch (e) {
				console.log("eccezione in DatMaxElettr: " + e.message);
			}

			CostiConsumi.SetConsumoImgCC();
		});
	} catch (err) {
		console.log("ERRORE:");
		console.log(err);
		InterfaceEnergyHome.GestErrorEH("Dispositivi", err);
	}
}

CostiConsumi.DatiMaxElettr = function() {
	// eventuale trascodifica dato cerco l'elettrodomestico con consumo
	// istantaneo maggiore, escluso smart info
	var listaFiltrata = $.map(CostiConsumi.listaElettr, function(elettro, index) {

		var appCategory = elettro[InterfaceEnergyHome.ATTR_APP_CATEGORY];

		if (elettro[InterfaceEnergyHome.ATTR_APP_AVAIL] == 2) {
			if ((appCategory != "44") && (appCategory != "40") && (appCategory != "45") && (appCategory != "36")
					&& (appCategory != "41") && (appCategory != "35") && (appCategory != "34"))
				return elettro;
		}
	});

	listaFiltrata.sort(function(a, b) {

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

	CostiConsumi.maxConsumoElettr = listaFiltrata[0];
	CostiConsumi.VisConsumoMaggiore();
}

// visualizza elettrodomestico che in questo momento sta consumando di piu'
CostiConsumi.VisConsumoMaggiore = function() {

	if (CostiConsumi.maxConsumoElettr != null) {

		if (CostiConsumi.maxConsumoElettr[InterfaceEnergyHome.ATTR_APP_VALUE].list[0].value.value == 0) {
			$("#DettaglioConsumoMaggiore").html("<span id='MsgConsumoMaggiore'></span>");
			$("#MsgConsumoMaggiore").text(Msg.home["maxDisp0"]);
		} else {
			$("#DettaglioConsumoMaggiore").html("<span id='TestoConsumoMaggiore'></span><img id='ConsumoMaggioreImg' src=''>");

			// metto immagine del device che sta consumando di piu'
			$("#ConsumoMaggioreImg").attr("src",
					DefinePath.imgDispPath + CostiConsumi.maxConsumoElettr[InterfaceEnergyHome.ATTR_APP_ICON]);
			// il consumo e' in watt
			$("#TestoConsumoMaggiore").text(
					CostiConsumi.maxConsumoElettr[InterfaceEnergyHome.ATTR_APP_NAME] + " ("
							+ Math.round(CostiConsumi.maxConsumoElettr[InterfaceEnergyHome.ATTR_APP_VALUE].list[0].value.value)
							+ " Wh)");
			if (CostiConsumi.dimMaxDispImg == -1) {
				// wDiv = $("#ConsumoMaggioreImg").width();
				// hDiv = $("#ConsumoMaggioreImg").height();

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

	}

	if (!CostiConsumi.suddivisioneCostiRender) {
		CostiConsumi.GetSuddivisioneConsumi();
	}
}

/*******************************************************************************
 * sezione consumi
 ******************************************************************************/
CostiConsumi.GetDatiConsumiCC = function($scope) {
	Main.ResetError();

	start = new Date(Main.dataAttuale.getTime());
	start.setHours(0);
	end = Main.dataAttuale.getTime();

	try {
		var p = InterfaceEnergyHome.objService.getAttributeData(InterfaceEnergyHome.PID_TOTALE, InterfaceEnergyHome.CONSUMO, start
				.getTime(), end, InterfaceEnergyHome.HOUR, true, InterfaceEnergyHome.DELTA);
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
	var start = Main.dataAttuale.getTime();
	var indConsumoOdierno = 0;
	var attuale, oraAttuale, minAttuale, consumo, val, consumoLista;

	try {
		var p = InterfaceEnergyHome.objService.getAttributeData(CostiConsumi.SmartInfo["appliance.pid"],
				InterfaceEnergyHome.CONSUMO, start, start, InterfaceEnergyHome.DAY, true, InterfaceEnergyHome.DELTA);

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

	var start = Main.dataAttuale.getTime();
	try {
		var p = InterfaceEnergyHome.objService.getAttributeData(InterfaceEnergyHome.ALL_PID, InterfaceEnergyHome.PRODUZIONE, start, start,
				InterfaceEnergyHome.DAY, true, InterfaceEnergyHome.DELTA);
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
	// in js we start from 1
	var weekDay = Main.dataAttuale.getDay() + 1;

	try {
		var p = InterfaceEnergyHome.objService.getWeekDayAverage(InterfaceEnergyHome.PID_TOTALE, InterfaceEnergyHome.CONSUMO,
				weekDay);
		p.done(function(result) {
			if ((err == null) && (result != null)) {
				CostiConsumi.consumoMedio = result.list;
			}
		});

	} catch (err) {
		console.log("ERRORE:");
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

	var start = Main.dataAttuale.getTime();

	if (InterfaceEnergyHome.mode > 1) {
		// solo se anche piattaforma
		try {
			InterfaceEnergyHome.objService.getForecast(CostiConsumi.DatiConsumoPrevistoCbCC, InterfaceEnergyHome.PID_TOTALE,
					InterfaceEnergyHome.CONSUMO, start, InterfaceEnergyHome.MONTH);
		} catch (err) {
			InterfaceEnergyHome.GestErrorEH("GetConsumoPrevistoCC", err);
		}
	} else {
		// per test
		// InterfaceEnergyHome.objService.getPropConfiguration(CostiConsumi.DatiConsumoPrevistoCbCC,
		// "EnergiaConsumataGiornalieroSimul");
		CostiConsumi.DatiConsumoPrevistoCbCC(fakeValues.energiaConsumata, null);
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

	if (InterfaceEnergyHome.mode > 1) {
		// solo se anche piattaforma
		try {
			var start = Main.dataAttuale.getTime();
			InterfaceEnergyHome.objService.getForecast(CostiConsumi.getCostoPrevisto, InterfaceEnergyHome.PID_TOTALE,
					InterfaceEnergyHome.PRODUZIONE, start, InterfaceEnergyHome.MONTH);
		} catch (err) {
			InterfaceEnergyHome.GestErrorEH("GetConsumoPrevistoCC", err);
		}
	} else {
		// InterfaceEnergyHome.objService.getPropConfiguration(CostiConsumi.getCostoPrevisto,
		// "Forecast");
		CostiConsumi.getCostoPrevisto(fakeValues.Forecast, null);
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

/*******************************************************************************
 * sezione grafico a torta
 ******************************************************************************/
CostiConsumi.GetSuddivisioneConsumi = function($scope) {

	var myDate = new Date(Main.dataAttuale.getTime());
	myDate.setDate(myDate.getDate() - 30);// Mi sposto indietro di 30 giorni.
	var start = new Date(myDate.getTime());
	var end = new Date(Main.dataAttuale.getTime());

	CostiConsumi.suddivisioneCostiRender = true;

	try {
		InterfaceEnergyHome.objService.getAttributeData(CostiConsumi.DatiSuddivisioneConsumiCb, InterfaceEnergyHome.CONSUMO, start
				.getTime(), end.getTime(), InterfaceEnergyHome.DAY, true, InterfaceEnergyHome.DELTA);
		hideSpinner();
	} catch (err) {
		InterfaceEnergyHome.GestErrorEH("GetSuddivisioneConsumi", err);
	}
}

CostiConsumi.DatiSuddivisioneConsumiCb = function(result, err) {

	var listaConsumi = new Array();
	var consumiTotale = 0;
	var altriConsumi = 0;
	var ConsumiSmartinfo = 0;
	var controlSumListaConsumi = 0;

	var retVal = null;
	if (err != null) {
		InterfaceEnergyHome.GestErrorEH("DatiSuddivisioneConsumiCb", err);
	}

	if (CostiConsumi.listaElettr == null || Object.keys(CostiConsumi.listaElettr).length == 0) {
		// Questa parte disegna il grafico con i dati presi dal file
		// noserver.properties ...
		// InterfaceEnergyHome.objService.getNoServerCustomDevice(CostiConsumi.GraphNoServerCustomDevice);
		CostiConsumi.GraphNoServerCustomDevice(fakeValues.noServerCustomDevice, null);
	} else {
		if (result != null) {
			// DT
			if ((InterfaceEnergyHome.mode == -1) || (InterfaceEnergyHome.mode == -2)) {
				$.each(CostiConsumi.listaElettr, function(indexResult, element) {
					if (!result.map[indexResult]) {
						result.map[indexResult] = {
							'javaClass' : "java.util.ArrayList",
							'list' : [ 0, 10, 0, 10, 0, 10, 10, 10, 56, 80, 45, 1500, 140, 563, 1200, 2063, 1052, 58, 800, 400, 0,
									10, 1035, 500, 51 ]
						};
					}
				});
			}

			/*
			 * Creo l'array di coppie nome-costo, escludendo lo smartInfo e
			 * calcolando il costo totale
			 */
			$
					.each(
							result.map,
							function(indexResult, element) {

								if ((CostiConsumi.SmartInfo == null)
										|| ((CostiConsumi.SmartInfo != null) && (indexResult != CostiConsumi.SmartInfo[InterfaceEnergyHome.ATTR_APP_PID]))) {

									if (CostiConsumi.listaElettr[indexResult]) {
										if ((CostiConsumi.listaElettr[indexResult][InterfaceEnergyHome.ATTR_APP_CATEGORY] != "44")
												&& (CostiConsumi.listaElettr[indexResult][InterfaceEnergyHome.ATTR_APP_CATEGORY] != "40")
												&& (CostiConsumi.listaElettr[indexResult][InterfaceEnergyHome.ATTR_APP_CATEGORY] != "45")
												&& (CostiConsumi.listaElettr[indexResult][InterfaceEnergyHome.ATTR_APP_CATEGORY] != "36")
												&& (CostiConsumi.listaElettr[indexResult][InterfaceEnergyHome.ATTR_APP_CATEGORY] != "41")
												&& (CostiConsumi.listaElettr[indexResult][InterfaceEnergyHome.ATTR_APP_CATEGORY] != "35")
												&& (CostiConsumi.listaElettr[indexResult][InterfaceEnergyHome.ATTR_APP_CATEGORY] != "34")) {
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
												listaConsumi.push(new Array(
														CostiConsumi.listaElettr[indexResult][InterfaceEnergyHome.ATTR_APP_NAME],
														sum));
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
				chartPie = new Highcharts.Chart({
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
				$("#DettaglioSuddivisioneCosti").html(
						"<div id='SuddivisioneCostiVuoto'>" + Msg.home["suddivisioneVuoto"] + "</div>");
			}
		} else {
			$("#Grafico").show();
			$("#GraficoConsumoOdierno").hide();
			$("#DettaglioSuddivisioneCosti").show();
			$("#DettaglioSuddivisioneCosti").html("<div id='SuddivisioneCostiVuoto'>" + Msg.home["suddivisioneVuoto"] + "</div>");
		}
	}
}

CostiConsumi.GraphNoServerCustomDevice = function(res, err) {
	if (!err) {
		if (res.list.length > 0) {

			var consumoTot = 0;
			var consumoSmartInfo = 0;
			var listaConsumi = new Array();

			res.list.forEach(function(device) {
				// Considera tutti i device tranne lo smartinfo di produzione
				// ...
				if (device["map"][InterfaceEnergyHome.ATTR_APP_CATEGORY] != "14") {
					var nome = device["map"]["nome"];
					var consumo = parseInt(device["map"]["consumo"]);
					var icon = device["map"]["icon"];

					// Considera tutti i device tranne lo smartinfo ...
					if (device["map"][InterfaceEnergyHome.ATTR_APP_CATEGORY] != "12") {
						listaConsumi.push(new Array(nome, consumo));
						consumoTot += consumo;
						if (consumo > consumoMaxValue) {
							// Questi dati servono per visualizzare
							// l'elettrodomestico
							// che consuma di più ...
							consumoMaxNome = nome;
							consumoMaxValue = consumo;
							consumoMaxIcon = icon + ".png";
						}
					}

					if (device["map"][InterfaceEnergyHome.ATTR_APP_CATEGORY] == "12") {
						consumoSmartInfo = consumo;
					}
				}
			});

			var altriConsumi = consumoSmartInfo - consumoTot;
			if (altriConsumi > 0) {
				listaConsumi.push(new Array("Altro", altriConsumi));
			} else {
				altriConsumi = 50000;
				listaConsumi.push(new Array("Altro", altriConsumi));
				consumoSmartInfo = consumoTot + altriConsumi;
			}

			$("#Grafico").show();
			$("#GraficoConsumoOdierno").hide();
			$("#DettaglioSuddivisioneCosti").show();

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
			chartPie = new Highcharts.Chart({
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

			// Visualizza l'elettrodomestico simulato con il maggiore consumo
			// ...
			CostiConsumi.VisMaxConsumoNoServer();
		}
	}
}

// Visualizza l'elettrodomestico simulato con il maggiore consumo ...
CostiConsumi.VisMaxConsumoNoServer = function() {

	$("#DettaglioConsumoMaggiore")
			.html(
					"<table><tr><td><img id='ConsumoMaggioreImg' align='center' src=''></td><td><span id='TestoConsumoMaggiore'></span></td></tr></table>");

	// metto immagine del device che sta consumando di piu'
	$("#ConsumoMaggioreImg").attr("src", DefinePath.imgDispPath + consumoMaxIcon);
	// il consumo e' in watt
	$("#TestoConsumoMaggiore").html(consumoMaxNome + "<br/> (" + Math.round(consumoMaxValue / 1000) + " kWh)");
}

/** Funzione lanciata al caricamento dello script google per gli RSS * */
CostiConsumi.loadFeed = function() {
	google.load("feeds", "1", {
		"callback" : CostiConsumi.launchFeed
	});
}

CostiConsumi.launchFeed = function() {
	CostiConsumi.Initfeed(0);
}

/*******************************************************************************
 * gestisce il caricamento degli RSS feed nell'array CostiConsumi.notizie
 ******************************************************************************/
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

/*******************************************************************************
 * gestisce la simulazione degli RSS feed nel div Suggerimenti
 ******************************************************************************/
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

/*******************************************************************************
 * avvia le richieste per i costi
 ******************************************************************************/
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

CostiConsumi.getCostoOdierno = function() {

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
 * Ottengo il consumo medio giornaliero dell'ultima settimana
 */
CostiConsumi.GetConsumoMediaWeek = function() {

	var myDate = new Date(Main.dataAttuale.getTime());
	myDate.setDate(myDate.getDate() - 7);// Mi sposto indietro di 7 giorni.
	var start = new Date(myDate.getTime());
	var end = new Date(Main.dataAttuale.getTime());

	if (InterfaceEnergyHome.mode > 1) {
		// solo se anche piattaforma
		try {
			InterfaceEnergyHome.objService.getAttributeData(CostiConsumi.DatiConsumoMediaWeekCb, InterfaceEnergyHome.PID_TOTALE,
					InterfaceEnergyHome.CONSUMO, start.getTime(), end.getTime(), InterfaceEnergyHome.DAY, true,
					InterfaceEnergyHome.DELTA);
		} catch (err) {
			InterfaceEnergyHome.GestErrorEH("BackConsumoMediaWeek", err);
		}
	} else {
		// per test
		// InterfaceEnergyHome.objService.getPropConfiguration(CostiConsumi.DatiConsumoMediaWeekCb,
		// "EnergiaConsumataGiornalieroSimul");
		CostiConsumi.DatiConsumoMediaWeekCb(fakeValues.energiaConsumata, null);
	}
};

CostiConsumi.DatiConsumoMediaWeekCb = function(result, err) {

	var txt = Msg.home["datoNonDisponibile"];

	if (err != null) {
		InterfaceEnergyHome.GestErrorEH("DatiConsumoPrevistoCb", err);
	}

	if (result != null) {

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

	} else {
		$("#DettaglioCostoConsumoMediaWeek b").html(txt);
	}

	try {
		var myDate = new Date(Main.dataAttuale.getTime());
		myDate.setDate(myDate.getDate() - 7);// Mi sposto indietro di 7
		// giorni.
		var start = new Date(myDate.getTime());
		var end = new Date(Main.dataAttuale.getTime());

		InterfaceEnergyHome.objService.getAttributeData(CostiConsumi.DatiProduzioneMediaWeekCb, InterfaceEnergyHome.PID_TOTALE,
				InterfaceEnergyHome.PRODUZIONE, start.getTime(), end.getTime(), InterfaceEnergyHome.DAY, true,
				InterfaceEnergyHome.DELTA);
	} catch (err) {
		InterfaceEnergyHome.GestErrorEH("BackConsumoMediaWeek", err);
	}

};

CostiConsumi.DatiProduzioneMediaWeekCb = function(result, err) {
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
};