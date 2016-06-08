mainApp.controller('consumption', function($scope) {
	console.log("activated consumption controller");
	
	CostiConsumi.init();
});

var potenza = {
	value : null
};

var CostiConsumi = {
	MODULE : "CostiConsumi",
	CONSUMI : 1,
	COSTI : 2,
	FOTOVOLTAICO : 3,
	listaElettr : {}, // lista degli elettrodomestici per avere l'associazione
	// id:nome per la torta
	SmartInfo : null,
	CostoSmartinfo : null,
	notizie : null,
	notizieid : 0,
	mode : 2,

	// consumo
	consumoOdierno : 0,
	consumoMedio : null,
	consumoPrevMese : null,
	consumoGiornaliero : null,
	timerConsumi : null,
	TIMER_UPDATE_CONSUMI : 600000, // Ogni 10'
	potenzaAttuale : {},
	timerPotenza : null,
	TIMER_UPDATE_POWER_METER : 5000, // Ogni 5"
	timerBlink : null,
	TIMER_BLINK : 500, // Ogni mezzo secondo
	TIMER_SEMAPHORO : 5000, // Ogni mezzo secondo

	// costi
	costoOdierno : null,
	costoMedio : null,
	costoPrevMese : null,
	costoGiornaliero : null,
	suddivisioneCosti : null,
	timerCosti : null,
	TIMER_UPDATE_COSTI : 300000, // 5 minuti
	TIMER_UPDATE_PIE : 3000000, // Ogni mezz'ora
	TIMER_UPDATE_MIDDLE_VALUE : 3000000, // Ogni mezz'ora
	indicatoreImgSotto : Define.home["termSfondo"],
	indicatoreImgSopra : Define.home["termSopra"],
	imgChat : Define.home["iconaSugg"],
	tariffaImg : null,
	leftTariffaPos : 0,
	costoOdiernoImg : [ Define.home["costoVerde"], Define.home["costoGiallo"],
			Define.home["costoRosso"], Define.home["costoGrigio"] ],
	costoOdiernoMsg : [ Msg.home["costoVerde"], Msg.home["costoGiallo"],
			Msg.home["costoRosso"], Msg.home["costoVuoto"] ],

	hIndicatore : null,
	timerPowerMeter : null,
	dimConsumoImg : -1,
	leftConsumoImg : -1,
	topConsumoImg : -1,
	dimCostoImg : -1,
	leftCostoImg : -1,
	topCostoImg : -1,
	dimMaxDispImg : -1,
	maxConsumoElettr : null,

	dataInizio : -1,
	dataFine : -1,
	pathImgPower : DefinePath.imgPowerMeterPath,

	stackSemaphoro : [ [], [], [] ],
	flagSemaphoro : true
}

/* Inizializza la schermata secondo i consumi o i costi */
CostiConsumi.init = function() {

	indicatoreTermometro = 'images/termometro_sopra.png';
	CostiConsumi.notizie = new Array();

	$("#backNews").button({
		text : false,
		icons : {
			primary : "ui-icon-seek-prev"
		}
	});

	$("#nextNews").button({
		text : false,
		icons : {
			primary : "ui-icon-seek-next"
		}
	});

	$('#indicatoreConsumi').gauge({
		max : 2.0
	});

	maxCont = Define.home["limContatore"][Main.contatore];

	$('#meterPotenza').speedometer({
		max : maxCont
	});

	var hDiv = $("#ConsumoAttualeMeter").height();
	if ((hDiv == null) || (hDiv <= 0)) {
		hDiv == 157;
		$("#ConsumoAttualeMeter").height(hDiv);
	}
	$("#ConsumoAttualeMeter").width(hDiv);

	Menu.OnClickMainMenu(0);
}

CostiConsumi.GestConsumi = function() {
	if (CostiConsumi.timerPotenza == null) {
		CostiConsumi.GetDatiPotenza();
	}

	if (CostiConsumi.consumoGiornaliero == null) {
		CostiConsumi.GetDatiConsumi();
	} else {
		var html = ":<br><br>";

		if (CostiConsumi.consumoOdierno != null) {
			html += CostiConsumi.consumoOdierno + "KWh";
		} else {
			html += Msg.home["datoNonDisponibile"];
		}

		$("#DettaglioCostoConsumoOdierno b").html(html);

		if (CostiConsumi.consumoPrevisto != null) {
			html += CostiConsumi.consumoPrevisto + "KWh";
		} else {
			html += Msg.home["datoNonDisponibile"];
		}
		$("#DettaglioCostoConsumoPrevisto b").html(html);
	}

	if (Main.env == 0) {
		console.log('CostiConsumi1.js', 'GestConsumi', 'Esco!');
	}
}

CostiConsumi.ExitConsumi = function() {

	if (CostiConsumi.timerPotenza != null) {
		clearInterval(CostiConsumi.timerPotenza);
		CostiConsumi.timerPotenza = null;
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

	CostiConsumi.consumoGiornaliero = 0;

	Main.ResetError();
}

CostiConsumi.GetDatiPotenza = function() {
	// non tolgo togliere messaggio errore da piattaforma
	if (InterfaceEnergyHome.visError != InterfaceEnergyHome.ERR_CONN_SERVER) {
		Main.ResetError();
	}
	if (InterfaceEnergyHome.mode > 0) {
		try {
			InterfaceEnergyHome.objService.getAttribute(
					CostiConsumi.DatiPotenzaAttuale, "TotalPower");
		} catch (err) {
			// if (Main.env == 0) console.log('exception in CostiConsumi1.js -
			// in CostiConsumi.GetDatiPotenza method: ', err);
			InterfaceEnergyHome.GestErrorEH("GetDatiPotenza", err);
		}
	} else {
		// per test
		if (CostiConsumi.potenzaAttuale.value == null) {
			CostiConsumi.potenzaAttuale.value = 0;
		}
		CostiConsumi.potenzaAttuale.value += 200;
		if (CostiConsumi.potenzaAttuale.value > (Define.home["tipoContatore"][Main.contatore] + 2000)) {
			CostiConsumi.potenzaAttuale.value = 0;
		}
		CostiConsumi.DatiPotenzaAttuale(CostiConsumi.potenzaAttuale, null);
	}
}

CostiConsumi.DatiPotenzaAttuale = function(result, err) {
	if (err != null) {
		InterfaceEnergyHome.GestErrorEH("DatiPotenzaAttuale", err);
	} else if (result != null) {
		CostiConsumi.potenzaAttuale.value = result.value;
	} else {
		CostiConsumi.potenzaAttuale.value = null;
	}
	CostiConsumi.SetConsumoImg();
}

CostiConsumi.GetElettrodomestici = function() {
	if (InterfaceEnergyHome.mode > 0) {
		try {
			InterfaceEnergyHome.objService
					.getAppliancesConfigurationsDemo(CostiConsumi.DatiElettrodomesticiCB);
		} catch (err) {
			InterfaceEnergyHome.GestErrorEH("GetMaxElettr", err);
		}
	} else {
		// per test
		var val;
		var indLista = 0;
		if (indLista == 0) {
			val = ListaElettr1;
			indLista = 1;
		} else {
			val = ListaElettr1;
			indLista = 0;
		}
		CostiConsumi.DatiElettrodomesticiCB(val, null);
	}

	if (Main.env == 0)
		console.log('CostiConsumi1.js', 'GetElettrodomestici', 'Esco!');
}

CostiConsumi.DatiElettrodomesticiCB = function(result, err) {
	if (Main.env == 0)
		console.log('CostiConsumi1.js', 'DatiElettrodomesticiCB', 'Entro!');
	if (err != null) {
		InterfaceEnergyHome.GestErrorEH("DatiElettrodomestici", err);
	}
	if ((err == null) && (result != null)) {
		$
				.each(
						result,
						function(indice, elettrodom) {
							if (elettrodom["map"][InterfaceEnergyHome.ATTR_APP_TYPE] == InterfaceEnergyHome.SMARTINFO_APP_TYPE) {
								if (elettrodom["map"][InterfaceEnergyHome.ATTR_APP_VALUE] == undefined) {
									elettrodom["map"][InterfaceEnergyHome.ATTR_APP_VALUE] = {
										list : new Array()
									};
									elettrodom["map"][InterfaceEnergyHome.ATTR_APP_VALUE].list
											.push({
												value : {
													value : 0
												}
											});
								} else {
									var val = parseFloat(elettrodom["map"][InterfaceEnergyHome.ATTR_APP_VALUE].list[0].value.value);
									elettrodom["map"][InterfaceEnergyHome.ATTR_APP_VALUE].list[0].value.value = val;
								}
								CostiConsumi.SmartInfo = elettrodom["map"];
								Main.appIdSmartInfo = elettrodom["map"][InterfaceEnergyHome.ATTR_APP_PID];
							} else {
								if (elettrodom["map"][InterfaceEnergyHome.ATTR_APP_VALUE] == undefined) {
									elettrodom["map"][InterfaceEnergyHome.ATTR_APP_VALUE] = {
										list : new Array()
									};
									elettrodom["map"][InterfaceEnergyHome.ATTR_APP_VALUE].list
											.push({
												value : {
													value : 0
												}
											});
								} else {
									var val = parseFloat(elettrodom["map"][InterfaceEnergyHome.ATTR_APP_VALUE].list[0].value.value);
									elettrodom["map"][InterfaceEnergyHome.ATTR_APP_VALUE].list[0].value.value = val;
								}
								CostiConsumi.listaElettr[elettrodom["map"][InterfaceEnergyHome.ATTR_APP_PID]] = elettrodom["map"];
							}
						});
	}

	CostiConsumi.DatiMaxElettr();
}

CostiConsumi.DatiMaxElettr = function() {
	if (Main.env == 0)
		console.log('CostiConsumi1.js', 'DatiMaxElettr', 'Entro!');

	// eventuale trascodifica dato cerco l'elettrodomestico con consumo
	// istantaneo maggiore, escluso smart info
	var listaFiltrata = $
			.map(
					CostiConsumi.listaElettr,
					function(elettro, index) {
						if (elettro[InterfaceEnergyHome.ATTR_APP_AVAIL] == 2) {
							if ((elettro[InterfaceEnergyHome.ATTR_APP_CATEGORY] != "44")
									&& (elettro[InterfaceEnergyHome.ATTR_APP_CATEGORY] != "40")
									&& (elettro[InterfaceEnergyHome.ATTR_APP_CATEGORY] != "45")
									&& (elettro[InterfaceEnergyHome.ATTR_APP_CATEGORY] != "36")
									&& (elettro[InterfaceEnergyHome.ATTR_APP_CATEGORY] != "41")
									&& (elettro[InterfaceEnergyHome.ATTR_APP_CATEGORY] != "35")
									&& (elettro[InterfaceEnergyHome.ATTR_APP_CATEGORY] != "34"))
								return elettro;
						}
					});
	listaFiltrata
			.sort(function(a, b) {
				// var firstElettrConsumo =
				// a[InterfaceEnergyHome.ATTR_APP_VALUE].list[0].value.value;
				// var secondElettrConsumo =
				// b[InterfaceEnergyHome.ATTR_APP_VALUE].list[0].value.value;

				var firstElettrConsumo = 0;
				var secondElettrConsumo = 0;

				// Se uno dei due elettrodomestici in sort � una lavatrice
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
						firstElettrConsumo = (firstElettrConsumo < 1) ? 0
								: firstElettrConsumo;
					}
					if (b[InterfaceEnergyHome.ATTR_APP_TYPE] == InterfaceEnergyHome.WHITEGOOD_APP_TYPE) {
						secondElettrConsumo = (secondElettrConsumo < 1) ? 0
								: secondElettrConsumo;
					}
					return secondElettrConsumo - firstElettrConsumo;
				} else {
					return 0;
				}
			})
	CostiConsumi.maxConsumoElettr = listaFiltrata[0];
	CostiConsumi.VisConsumoMaggiore();
}

// visualizza elettrodomestico che in questo momento sta consumando di piu'
CostiConsumi.VisConsumoMaggiore = function() {
	if (Main.env == 0)
		console.log('CostiConsumi1.js', 'VisConsumoMaggiore', 'Entro!');

	if (CostiConsumi.maxConsumoElettr != null) {
		if (CostiConsumi.maxConsumoElettr[InterfaceEnergyHome.ATTR_APP_VALUE].list[0].value.value == 0) {
			$("#DettaglioConsumoMaggiore").html(
					"<span id='MsgConsumoMaggiore'></span>");
			$("#MsgConsumoMaggiore").text(Msg.home["maxDisp0"]);
		} else {
			$("#DettaglioConsumoMaggiore")
					.html(
							"<span id='TestoConsumoMaggiore'></span><img id='ConsumoMaggioreImg' src=''>");

			// metto immagine del device che sta consumando di piu'
			$("#ConsumoMaggioreImg")
					.attr(
							"src",
							DefinePath.imgDispPath
									+ CostiConsumi.maxConsumoElettr[InterfaceEnergyHome.ATTR_APP_ICON]);
			// il consumo e' in watt
			$("#TestoConsumoMaggiore")
					.text(
							CostiConsumi.maxConsumoElettr[InterfaceEnergyHome.ATTR_APP_NAME]
									+ " ("
									+ Math
											.round(CostiConsumi.maxConsumoElettr[InterfaceEnergyHome.ATTR_APP_VALUE].list[0].value.value)
									+ " W)");
			if (CostiConsumi.dimMaxDispImg == -1) {
				wDiv = $("#ConsumoMaggioreImg").width();
				hDiv = $("#ConsumoMaggioreImg").height();

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
		$("#DettaglioConsumoMaggiore").html(
				"<span id='MsgConsumoMaggiore'></span>");
		$("#MsgConsumoMaggiore").text(Msg.home["noMaxDisp"]);
	}

	// CostiConsumi.pushSemaphoro('CostiConsumi.GetElettrodomestici', 1);
	// CostiConsumi.trueFlagSemaphoro();
	if (Main.env == 0)
		console.log('CostiConsumi1.js', 'VisConsumoMaggiore', 'Esco!');
}

CostiConsumi.GetDatiConsumi = function() {
	Main.ResetError();

	start = new Date(Main.dataAttuale.getTime());
	start.setHours(0);
	end = Main.dataAttuale.getTime();

	if (InterfaceEnergyHome.mode > 1) {
		// solo se anche piattaforma
		try {
			InterfaceEnergyHome.objService.getAttributeData(
					CostiConsumi.DatiConsumoGiornalieroCb,
					InterfaceEnergyHome.PID_TOTALE,
					InterfaceEnergyHome.CONSUMO, start.getTime(), end,
					InterfaceEnergyHome.HOUR, true, InterfaceEnergyHome.DELTA);
		} catch (err) {
			InterfaceEnergyHome.GestErrorEH("GetDatiConsumoGiornaliero", err);
		}
	} else {
		// per test, copio per il numero ore attuale
		hours = Main.dataAttuale.getHours();
		val = ConsumoGiornaliero;
		val.list = val.list.slice(0, hours);

		CostiConsumi.DatiConsumoGiornalieroCb(val, null);
	}
	if (Main.env == 0)
		console.log('CostiConsumi1.js', 'GetDatiConsumi', 'Esco!');
}

CostiConsumi.DatiConsumoGiornalieroCb = function(result, err) {
	if (Main.env == 0)
		console.log('CostiConsumi1.js', 'DatiConsumoGiornalieroCb', 'Entro!');
	if (err != null) {
		InterfaceEnergyHome.GestErrorEH("DatiConsumoGiornaliero", err);
	}
	// CostiConsumi.consumoGiornaliero = null;
	if ((err == null) && (result != null)) {
		CostiConsumi.consumoGiornaliero = result.list;
	} else {
		CostiConsumi.consumoGiornaliero = [ 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0,
				0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0 ];
	}
	if (Main.env == 0)
		console.log('CostiConsumi.consumoGiornaliero',
				CostiConsumi.consumoGiornaliero);

	hideSpinner();
	CostiConsumi.VisGrafico();
	CostiConsumi.VisIndicatoreConsumi();

	// CostiConsumi.pushSemaphoro('CostiConsumi.GetDatiConsumi', 1);
	// CostiConsumi.trueFlagSemaphoro();
	showSpinner();
	CostiConsumi.GetConsumoOdierno();
	if (Main.env == 0)
		console.log('CostiConsumi1.js', 'DatiConsumoGiornalieroCb', 'Esco!');
}

CostiConsumi.VisGrafico = function() {
	if (Main.env == 0)
		console.log('CostiConsumi1.js', 'VisGrafico', 'Entro!');
	if (Main.env == 0)
		console.log('CostiConsumi.consumoGiornaliero',
				CostiConsumi.consumoGiornaliero);

	var dataY;
	if (CostiConsumi.consumoGiornaliero != null) {
		dataY = CostiConsumi.consumoGiornaliero.slice(0);
	}
	if (Main.env == 0)
		console.log('dataY', dataY);

	if (dataY) {
		$.each(dataY, function(index, dato) {
			dataY[index] = dato / 1000;
		});
	}
	var cat = null;

	if (GestDate.DSTMarzo) {
		cat = [ 0, 1, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18,
				19, 20, 21, 22, 23 ]
	} else if (GestDate.DSTOttobre) {
		cat = [ 0, 1, 2, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16,
				17, 18, 19, 20, 21, 22, 23 ];
	}

	Highcharts.setOptions({
		colors : [ "#0B0B96", '#50B432', '#ED561B', '#DDDF00', '#24CBE5',
				'#64E572', '#FF9655', '#FFF263', '#6AF9C4' ]
	});
	chart = new Highcharts.Chart({
		chart : {
			renderTo : 'DettaglioGraficoConsumoOdierno',
			type : 'column',
			spacingBottom : 10,
			style : {
				fontSize : '1.0em'
			},
			plotBackgroundColor : '#ECECEC ',
			plotShadow : true,
			plotBorderWidth : 1

		},
		credits : false,
		title : {
			text : Msg.home["consumoOdierno"],
			margin : 30,
			style : {
				fontFamily : 'Arial,sans-serif',
				fontWeight : "bold",
				color : '#202020',
				fontSize : "1.0em"
			}
		},
		xAxis : {
			tickInterval : 2,
			min : 0,
			max : GestDate.DSTOttobre ? 24 : 23,
			title : {
				align : 'high',
				offset : 0,
				text : 'H',
				rotation : 0,
				offset : 15,
				style : {
					color : "black"
				}
			},
			categories : cat
		},
		yAxis : {
			min : 0,
			title : {
				align : 'high',
				offset : 0,
				text : ' KWh',
				rotation : 0,
				y : -10,
				style : {
					color : "black"
				}
			},
			labels : {
				formatter : function() {
					return Highcharts.numberFormat(this.value, 2);
				}
			}
		},
		legend : {
			enabled : false
		},
		tooltip : {
			formatter : function() {
				return 'Consumo : <b>' + Highcharts.numberFormat(this.y, 1)
						+ ' KWh</b><br/>' + 'alle ore: ' + this.x + ':00';
			}
		},
		series : [ {
			name : 'Population',
			data : dataY
		} ],
		plotOptions : {
			column : {
				borderWidth : 0,
				color : "#0B0B96",
				pointPadding : 0,
				groupPadding : 0.1
			}
		}
	});
	if (Main.env == 0)
		console.log('CostiConsumi1.js', 'VisGrafico', 'Esco!');
}

CostiConsumi.GetConsumoOdierno = function() {
	if (Main.env == 0)
		console.log('CostiConsumi1.js', 'GetConsumoOdierno', 'Entro!');
	var start = Main.dataAttuale.getTime();
	var indConsumoOdierno = 0;
	var attuale, oraAttuale, minAttuale, consumo, val, consumoLista;

	if (InterfaceEnergyHome.mode > 1) {
		// solo se anche piattaforma
		try {
			var res = InterfaceEnergyHome.objService.getAttributeData(
					CostiConsumi.DatiConsumoOdiernoCb,
					InterfaceEnergyHome.PID_TOTALE,
					InterfaceEnergyHome.CONSUMO, start, start,
					InterfaceEnergyHome.DAY, true, InterfaceEnergyHome.DELTA);
		} catch (err) {
			InterfaceEnergyHome.GestErrorEH("GetConsumoOdierno", err);
		}
	} else {
		// per test
		indConsumoOdierno += 1;
		if (indConsumoOdierno == ConsumoOdierno.length) {
			indConsumoOdierno = 0;
		}
		consumoLista = ConsumoOdierno[indConsumoOdierno];

		// prendo percentuale del costo in base all'ora
		attuale = GestDate.GetActualDate();
		oraAttuale = attuale.getHours();
		minAttuale = attuale.getMinutes();
		consumo = 0;
		for (var i = 0; i < oraAttuale; i++) {
			consumo += consumoLista.list[i];
		}
		// aggiungo percentuale in base ai minuti dell'ora attuale
		consumo += consumoLista.list[oraAttuale] * (minAttuale / 60);
		val = {
			"list" : [ consumo ]
		};
		CostiConsumi.DatiConsumoOdiernoCb(val, null);
	}

	if (Main.env == 0)
		console.log('CostiConsumi1.js', 'GetConsumoOdierno', 'Esco!');
}

CostiConsumi.DatiConsumoOdiernoCb = function(result, err) {
	if (Main.env == 0)
		console.log('CostiConsumi1.js', 'DatiConsumoOdiernoCb', 'Entro!');

	if (err != null) {
		InterfaceEnergyHome.GestErrorEH("DatiConsumoOdiernoCb", err);
	}
	var html = ":<br><br>";
	if (result) {

		if (result.list[0] != null) {
			CostiConsumi.consumoOdierno = (result.list[0] / 1000).toFixed(1);
			html += CostiConsumi.consumoOdierno + " KWh";
		} else {
			CostiConsumi.consumoOdierno = 0;
			html += Msg.home["datoNonDisponibile"];
		}
	} else {
		CostiConsumi.consumoOdierno = 0;
		html += Msg.home["datoNonDisponibile"];
	}

	$("#DettaglioCostoConsumoOdierno b").html(html);

	CostiConsumi.GetConsumoMedio();
}

CostiConsumi.GetConsumoMedio = function() {
	if (Main.env == 0)
		console.log('CostiConsumi1.js', 'GetConsumoMedio', 'Entro!');

	var weekDay = Main.dataAttuale.getDay() + 1; // js comincia da 0, java da
	// 1
	if (InterfaceEnergyHome.mode > 1) {
		// solo se anche piattaforma
		try {
			InterfaceEnergyHome.objService.getWeekDayAverage(
					CostiConsumi.DatiConsumoMedioCb,
					InterfaceEnergyHome.PID_TOTALE,
					InterfaceEnergyHome.CONSUMO, weekDay);
		} catch (err) {
			InterfaceEnergyHome.GestErrorEH("GetConsumoMedio", err);
		}
	} else {
		// per test
		var val = ConsumoMedio;
		CostiConsumi.DatiConsumoMedioCb(val, null);
	}
	if (Main.env == 0)
		console.log('CostiConsumi1.js', 'GetConsumoMedio', 'Esco!');
}

CostiConsumi.DatiConsumoMedioCb = function(result, err) {
	if (err != null)
		InterfaceEnergyHome.GestErrorEH("DatiConsumoMedio", err);

	if ((err == null) && (result != null)) {
		CostiConsumi.consumoMedio = result.list;
	} else {
		CostiConsumi.consumoMedio = [ 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0,
				0, 0, 0, 0, 0, 0, 0, 0, 0, 0 ];
	}

	CostiConsumi.VisIndicatoreConsumi();
	CostiConsumi.GetConsumoPrevisto();
}

CostiConsumi.VisIndicatoreConsumi = function() {
	if (Main.env == 0)
		console.log('CostiConsumi1.js', 'VisIndicatoreConsumi', 'Entro!');

	var arrayMedio = new Array();
	if (CostiConsumi.consumoGiornaliero && CostiConsumi.consumoMedio) {
		arrayMedio = CostiConsumi.consumoMedio.slice(0,
				CostiConsumi.consumoGiornaliero.length);
	}

	var perc = 0;
	var Totodierno = null;
	var Totmedio = null;

	if ((CostiConsumi.consumoMedio != null)
			&& (CostiConsumi.consumoGiornaliero != null)
			&& (CostiConsumi.consumoOdierno != null)) {
		Totodierno = 0;
		Totmedio = 0;

		$.each(CostiConsumi.consumoGiornaliero, function(index, consumo) {
			if (consumo != null) {
				Totodierno += consumo;
				Totmedio += arrayMedio[index];
			}
		});

		if (Main.env == 0)
			console.log('Totodierno', Totodierno);
		if (Main.env == 0)
			console.log('Totmedio', Totmedio);

		if (Totodierno != null && Totmedio > 0) {
			// perc = Totodierno * 1000 / Totmedio;
			perc = Totodierno / Totmedio;
			if (perc > 2) {
				perc = 2;
			}
			if (Main.env == 0)
				console.log('perc', perc);
		}
		$('#indicatoreConsumi').gauge("value", perc);
	}
}

CostiConsumi.GetConsumoPrevisto = function() {
	if (Main.env == 0)
		console.log('CostiConsumi1.js', 'GetConsumoPrevisto', 'Entro!');

	var start = Main.dataAttuale.getTime();

	if (InterfaceEnergyHome.mode > 1) {
		// solo se anche piattaforma
		try {
			InterfaceEnergyHome.objService.getForecast(
					CostiConsumi.DatiConsumoPrevistoCb,
					InterfaceEnergyHome.PID_TOTALE,
					InterfaceEnergyHome.CONSUMO, start,
					InterfaceEnergyHome.MONTH);
		} catch (err) {
			InterfaceEnergyHome.GestErrorEH("GetConsumoPrevisto", err);
		}
	} else {
		// per test
		var val = ConsumoPrevisto;
		CostiConsumi.DatiConsumoPrevistoCb(val, null);
	}

	if (Main.env == 0)
		console.log('CostiConsumi1.js', 'GetConsumoPrevisto', 'Esco!');
}

CostiConsumi.DatiConsumoPrevistoCb = function(result, err) {
	var txt;
	// CostiConsumi.popSemaphoro('CostiConsumi.GetConsumoPrevisto', 1);

	if (err != null) {
		InterfaceEnergyHome.GestErrorEH("DatiConsumoPrevisto", err);
	}

	if ((err == null) && (result != null)) {
		CostiConsumi.consumoPrevisto = Math.round(result / 1000); // da w a kW
		txt = Math.round(CostiConsumi.consumoPrevisto) + " KWh";
	} else {
		CostiConsumi.consumoPrevisto = null;
		txt = Msg.home["datoNonDisponibile"];
	}

	var html = ":<br><br>" + txt;
	$("#DettaglioCostoConsumoPrevisto b").html(html);

	hideSpinner();
	$("#CostiConsumi").css("z-index", "10");

	/* Verifico la connessione al server e carico gli RSS feed */
	if (InterfaceEnergyHome.mode == 0
			|| InterfaceEnergyHome.visError == InterfaceEnergyHome.ERR_CONN_SERVER) {
		CostiConsumi.InitfeedSim();
	} else {
		var script = document.createElement("script");
		script.src = "https://www.google.com/jsapi?callback=CostiConsumi.loadFeed";
		script.type = "text/javascript";
		document.body.appendChild(script);
	}

	if (CostiConsumi.timerPotenza == null) {
		CostiConsumi.timerPotenza = setInterval(
				"CostiConsumi.GetDatiPotenza()",
				CostiConsumi.TIMER_UPDATE_POWER_METER);
	}
}

CostiConsumi.SetConsumoImg = function() {

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
			CostiConsumi.timerBlink = setInterval("CostiConsumi.BlinkVal()",
					CostiConsumi.TIMER_BLINK);
		}
	} else {
		clearInterval(CostiConsumi.timerBlink);
		CostiConsumi.timerBlink = null;
		$("#ValConsumoAttuale").css("color", "black");
		$("#ValConsumoAttuale").removeClass("invisibleDiv");
	}

	$('#ConsumoAttualeMeter').speedometer("value", val, "kW");
	CostiConsumi.GetElettrodomestici();

	if (Main.env == 0)
		console.log('CostiConsumi1.js', 'SetConsumoImg', 'Esco!');
}

CostiConsumi.BlinkVal = function() {
	$("#ValConsumoAttuale").toggleClass("invisibleDiv");
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

	/* Se i feed sono gi� stati caricati non viene inoltrata un altra richiesta */
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
			feed = new google.feeds.Feed(
					"http://energyhomenews.wordpress.com/feed/ ");
			break;
		}
		case 1: {
			feed = new google.feeds.Feed(
					"http://www.rsspect.com/rss/energyathome.xml ");
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
		feed
				.load(function(result) {
					if (!result.error) {
						/*
						 * salvo i feed nella variabile CostiConsumi.notizie la
						 * prima news � selezionata random, dalla seconda in poi
						 * vengono inserite nello stesso ordine con cui vengono
						 * ricevute
						 */
						var randIndex = Math.floor(Math.random()
								* result.feed.entries.length);
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
					 * Se ho caricato il primo canale allora chiamo la funzione
					 * per caricare il secondo
					 */
					if (channel == 0) {
						CostiConsumi.Initfeed(1);
					} else {
						/*
						 * se ho caricato il secondo canale, nascondo lo spinner
						 * e carico i feed nell'html
						 */
						hideSpinner();
						CostiConsumi.caricafeed();

						$("#backNews")
								.click(
										function() {
											CostiConsumi.notizieid = CostiConsumi.notizieid - 2;
											if (CostiConsumi.notizieid < 0) {
												CostiConsumi.notizieid = CostiConsumi.notizie.length - 2;
											}
											CostiConsumi.caricafeed();
										});

						$("#nextNews")
								.click(
										function() {
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

	altezza_news = Math.floor(($("#InfoFeedDettaglio").height() - 1 - (Math
			.floor($("#InfoFeedDettaglio").width() * 0.01) * 2)) / 2);

	$("#PrimaNews").css("height", altezza_news);
	$("#SecondaNews").css("height", altezza_news);

	$("#PrimaNews .titoloNews .ellipsis_text").html(
			CostiConsumi.notizie[CostiConsumi.notizieid]["title"]);
	$("#PrimaNews a").attr("href",
			CostiConsumi.notizie[CostiConsumi.notizieid]["link"]);
	$("#PrimaNews .dettaglioNews .ellipsis_text ").html(
			CostiConsumi.notizie[CostiConsumi.notizieid]["description"]);

	$("#SecondaNews .titoloNews .ellipsis_text").html(
			CostiConsumi.notizie[CostiConsumi.notizieid + 1]["title"]);
	$("#SecondaNews a").attr("href",
			CostiConsumi.notizie[CostiConsumi.notizieid + 1]["link"]);
	$("#SecondaNews .dettaglioNews .ellipsis_text").html(
			CostiConsumi.notizie[CostiConsumi.notizieid + 1]["description"]);

	var diffContenitore_Notizie = $("#InfoFeedDettaglio").outerHeight(true)
			- 68 - ((Math.floor($("InfoFeedDettaglio").width() * 0.01)) * 5);

	if (diffContenitore_Notizie < 0) {
		$("#SecondaNews").remove();
		$("#PrimaNews").css("position", "absolute").css("top", "25%").css(
				"border", "0px");
	}

	$(".titoloNews").ThreeDots({
		max_rows : 1
	});
	$(".dettaglioNews").ThreeDots();

}

/*******************************************************************************
 * gestisce la simulazione degli RSS feed nel div Suggerimenti
 ******************************************************************************/

CostiConsumi.InitfeedSim = function() {
	var NotizieSimul;

	CostiConsumi.notizie = NotizieSimul;
	CostiConsumi.caricafeed();
	hideSpinner();
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
}
