/**
 * This is the AngularJS controller used for the consumption, cost,
 * consumption_pv, photovoltaic
 */

mainApp.controller('monitor', function($scope) {

	console.log("entering monitor controller");

	// instantaneous total power consumption
	$scope.consumption = "N.D";

	// istantaneous total power production
	$scope.production = "N.D";

	// power to the grid
	$scope.toGrid = "N.D.";

	$scope.todayConsumption = "N.D.";
	$scope.monthConsumptionForecast = "N.D.";
	$scope.weekAverageConsumption = "N.D.";

	$scope.todayCost = "N.D.";
	$scope.monthCostForecast = "N.D.";
	$scope.weekAverageCost = "N.D.";

	// Weekly self consumption index in %
	$scope.weeklySelfConsumption = "N.D.";

	// in %
	$scope.costTrendToday = "N.D."
	$scope.consumptionTrendToday = "N.D."
	$scope.todayProduction = "N/A";
	$scope.consumptionDistributionData;
	$scope.todayConsumptionData;

	$scope.devices = {};
	$scope.smartInfo = null;
	
	$scope.mostDemandingDevice = {};
	$scope.mostDemandingDevice["measure"] = {};
	$scope.mostDemandingDevice.view = {};
	$scope.mostDemandingDevice.view.icon = "";
	$scope.mostDemandingDevice.view.measureName = "";
	$scope.mostDemandingDevice.view.measureValue = "";
	$scope.mostDemandingDevice.view.state = "--";

	$scope.costDistributionPie = [ [ [ 'Heavy Industry', 12 ], [ 'Retail', 9 ], [ 'Light Industry', 14 ], [ 'Out of home', 16 ],
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

	CostiConsumi.init($scope);

	$scope.$on('$destroy', function deactivate() {
		console.log("deactivating consumption_pv controller");
		// CostiConsumi.exit($scope);
	});

	$scope.$watch('consumptionDistributionData', function(newValue, oldValue) {
		// here we have to update the pie
		console.log("changed consumptionDistributionData");
		// displayConsumptionDistributionPie("pippo", newValue);

		CostiConsumi.displayConsumptionDistributionPie('consumptionTodayGraph', $scope.costDistributionPie);
	});

	$scope.$watch('todayConsumptionData', function(newValue, oldValue) {
		// here we have to update the chart
		console.log("changed todayConsumptionData");
		CostiConsumi.displayHistogram('consumptionTodayGraph', "QUANTA ENERGIA HAI USATO OGGI", newValue);
	});

	$scope.$watch('consumption', function(newValue, oldValue) {
		console.log("changed consumption to " + newValue);
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

CostiConsumi.update = function($scope) {

	if (CostiConsumi.update.$scope != undefined) {
		$scope = CostiConsumi.update.$scope;
	}
	if ($scope == undefined) {
		console.log("please set $scope");
		return;
	}
	CostiConsumi.update.$scope = $scope;

	var photovoltaic = false;
	var costView = false;

	CostiConsumi.updateDeviceInfos($scope);
	CostiConsumi.updateConsumption($scope);
	CostiConsumi.updateTodayConsumption($scope);
	CostiConsumi.updateMonthConsumptionForecast($scope);
	CostiConsumi.updateTodayConsumptionData($scope);

	if (photovoltaic) {
		CostiConsumi.updateProduction($scope);
		CostiConsumi.updateToGrid($scope);
		CostiConsumi.updateWeekAverageConsumption($scope);
		if (costView) {

		} else {
			CostiConsumi.updateConsumptionDistributionData($scope);
		}
	}

	if (costView) {
		CostiConsumi.updateTodayCost($scope);
		CostiConsumi.updateMonthCostForecast($scope);
		CostiConsumi.updateWeekAverageCost($scope);
	}
}

CostiConsumi.updateDeviceInfos = function($scope) {
	var nullValue = {
		value : {
			value : 0
		}
	};

	try {
		var p = InterfaceEnergyHome.objService.getAppliancesConfigurationsDemo();
		p.done(function(result) {

			$.each(result, function(indice, deviceInfo) {
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
				mostPowerDemandingDevice = CostiConsumi.getMaxPowerDemandingDevice($scope.devices);
			} catch (e) {
				console.log("exception in maxPowerDemandingDevice: " + e.message);
			}
		});
	} catch (e) {
		console.log("exception: " + e);
	}
}

/**
 * Read the instantaneous consumption.
 */
CostiConsumi.updateConsumption = function($scope) {
	try {
		var p = InterfaceEnergyHome.objService.getAttribute(InterfaceEnergyHome.attrs.ATTR_TOTAL_POWER);
		p.done(function(result) {
			$scope.$apply(function() {
				$scope.consumption = result.value;
			});
		});

	} catch (e) {
		console.log("exception: " + e);
	}
}

/**
 * Read the instantaneous production from photovoltaic panels.
 */
CostiConsumi.updateProduction = function($scope) {
	try {
		var p = InterfaceEnergyHome.objService.getAttribute(InterfaceEnergyHome.attrs.ATTR_PRODUCED_POWER);
		p.done(function(result) {
			$scope.production = result.value;
		});
	} catch (e) {
		console.log("exception: " + e);
	}
}

/**
 * Read currently power flowing back to the grid from the system
 */
CostiConsumi.updateToGrid = function($scope) {
	try {
		// TODO: implement it
		$scope.toGrid = 10;
	} catch (e) {
		console.log("exception: " + e);
	}
}

/**
 * Gets and updates today's consumption
 */
CostiConsumi.updateTodayConsumption = function($scope) {
	var start = GestDate.getDate();
	if (start == null) {
		console.log("consumption_pv: start date is undefined");
		return;
	}

	try {
		var p = CostiConsumi.getAttributeDataConsumption(InterfaceEnergyHome.ALL_PID, start.getTime(), start.getTime(),
				InterfaceEnergyHome.DAY);
		p.done(function(result) {
			if (result.list[0] != null) {
				var todayConsumption = (result.list[0] / 1000).toFixed(1);
				if (todayConsumption < 0) {
					todayConsumption = 0;
				}
				$scope.todayConsumption = todayConsumption;
			}
		});
	} catch (e) {
		console.log("exception: " + e);
	}
}

/**
 * Gets and updates moth's consumption forecast
 */
CostiConsumi.updateMonthConsumptionForecast = function($scope) {
	var start = GestDate.getDate();
	if (start == null) {
		console.log("consumption_pv: start date is undefined");
		return;
	}

	try {
		var p = InterfaceEnergyHome.objService.getForecast(InterfaceEnergyHome.ALL_PID, InterfaceEnergyHome.attrs.ATTR_CONSUMPTION,
				start.getTime(), InterfaceEnergyHome.MONTH);
		p.done(function(result) {
			// convert to kWh
			var value = Math.round(result / 1000);
			$scope.monthConsumptionForecast = value;
		});
	} catch (e) {
		console.log("exception: " + e);
	}
}

/**
 * Gets and updates the week average consumption.
 */
CostiConsumi.updateWeekAverageConsumption = function($scope) {
	var now = GestDate.getDate();
	if (now == null) {
		console.log("consumption_pv: current date is undefined");
		return;
	}

	start = now;

	// back of 7 days.
	start.setDate(now.getDate() - 7);

	try {
		var p = InterfaceEnergyHome.objService.getForecast(InterfaceEnergyHome.ALL_PID, InterfaceEnergyHome.attrs.ATTR_CONSUMPTION,
				start.getTime(), now.getTime(), InterfaceEnergyHome.MONTH);
		p.done(function(result) {
			var tmp = 0;
			$.each(result.list, function(value, element) {
				value = Math.floor(value);
				if (value != null) {
					tmp += value;
				}
			});

			$scope.weekAverageConsumption = (tmp * 7) / 1000;
		});
	} catch (e) {
		console.log("exception: " + e);
	}
}

/**
 * Updates the daily consumption data (the series used to plot the histogram)
 */

CostiConsumi.updateTodayConsumptionData = function($scope) {
	var now = GestDate.getDate();
	if (now == null) {
		console.log("consumption_pv: current date is undefined");
		return;
	}

	var start = new Date(now);

	// back to the beginning of today
	start.setHours(0);

	try {
		p = CostiConsumi.getAttributeDataConsumption(InterfaceEnergyHome.ALL_PID, start.getTime(), now.getTime(),
				InterfaceEnergyHome.HOUR);
		p.done(function(result) {
			$scope.todayConsumptionData = result;
			$scope.$apply();
		});
	} catch (e) {
		console.log("exception in updateTodayConsumptionData(): " + e);
	}
}

CostiConsumi.updateConsumptionDistributionData = function($scope) {
	var now = GestDate.getDate();
	if (now == null) {
		console.log("consumption_pv: current date is undefined");
		return;
	}

	var start = new Date(now);

	// back of 30 days.
	start.setDate(now.getDate() - 30);

	try {
		p = InterfaceEnergyHome.objService.getAttributeData(InterfaceEnergyHome.attrs.ATTR_CONSUMPTION, start.getTime(), now
				.getTime(), InterfaceEnergyHome.DAY, true, InterfaceEnergyHome.DELTA);
		p.done(function(result) {
			CostiConsumi.processPieData($scope, result);
		});

	} catch (e) {
		console.log("exception in updateConsumptionDistributionData(): " + e);
	}
}

/**
 * Gets and updates today's cost
 */
CostiConsumi.updateTodayCost = function($scope) {
	var start = GestDate.getDate();
	if (start == null) {
		console.log("consumption_pv: start date is undefined");
		return;
	}

	try {
		$scope.todayCost = "NYI";
	} catch (e) {
		console.log("exception: " + e);
	}
}

/**
 * Gets and updates moth's consumption forecast
 */
CostiConsumi.updateMonthCostForecast = function($scope) {
	var start = GestDate.getDate();
	if (start == null) {
		console.log("consumption_pv: start date is undefined");
		return;
	}

	try {
		var p = InterfaceEnergyHome.objService.getForecast(InterfaceEnergyHome.ALL_PID, InterfaceEnergyHome.attrs.ATTR_COST, start
				.getTime(), InterfaceEnergyHome.MONTH);
		p.done(function(monthCostForecast) {
			// return value is a float
			if (monthCostForecast != null) {
				$scope.monthCostForecast = monthCostForecast;
			} else {
				$scope.monthCostForecast = "N.D";
			}
		});
	} catch (e) {
		console.log("exception: " + e);
	}
}

/**
 * Gets and updates today's cost
 */
CostiConsumi.updateWeekAverageCost = function($scope) {
	var start = GestDate.getDate();
	if (start == null) {
		console.log("consumption_pv: start date is undefined");
		return;
	}

	try {
		$scope.todayWeekAverageCost = "NYI: todayWeekAverageCost";
	} catch (e) {
		console.log("exception: " + e);
	}
}

/**
 * Given the data series got from the backend extract the relevant data and
 * create a new data series suitable to be visualized on the Pie.
 */

CostiConsumi.processPieData = function($scope, result) {

	var consumptionList = [];

	// consumption of all the power sink devices
	var totalConsumption = 0;

	/*
	 * consumption of all the power sink devices that doesn't have an integrated
	 * meter.
	 */
	var otherConsumption = 0;

	// consumption measured by the smart info.
	var smartInfoConsumption;

	if (result == null) {
		// FIXME: what to do here??
	}

	/*
	 * Calculates the sum of the consumption in the period for each device.
	 */
	$.each(result, function(pid, deviceData) {
		// find a match in the current devices list
		var device = $scope.devices[pid];

		if (($scope.smartInfo != null) && (pid == $scope.smartInfo[InterfaceEnergyHome.ATTR_APP_PID])) {
			// the device is the currently configured smart info.

			var total = 0;
			for (var i = 0; i < deviceData.list.length; i++) {
				if (deviceData.list[i] != null) {
					total += deviceData.list[i];
				}
			}

			smartInfoConsumption = total;
		} else if (device != undefined) {
			appCategory = device[InterfaceEnergyHome.ATTR_APP_CATEGORY];
			appName = device[InterfaceEnergyHome.ATTR_APP_NAME];

			if (CostiConsumi.isPowerSink(appCategory)) {
				var total = 0;
				for (var i = 0; i < deviceData.list.length; i++) {
					if (deviceData.list[i] != null) {
						total += deviceData.list[i];
					}
				}
				consumptionList.push([ appName, total ]);
				totalConsumption += total;
			}
		}
	});

	if (smartInfoConsumption != undefined) {
		otherConsumption = smartInfoTotalConsumption - totalConsumption;
	}

	$scope.consumptionDistributionData = consumptionList;
}

CostiConsumi.getAttributeDataConsumption = function(pid, startTime, endTime, resolution) {
	return InterfaceEnergyHome.objService.getAttributeData(pid, InterfaceEnergyHome.attrs.ATTR_CONSUMPTION, startTime, endTime,
			resolution, true, InterfaceEnergyHome.DELTA);
}

CostiConsumi.getAttributeDataProduzione = function(pid, startTime, endTime, resolution) {
	return InterfaceEnergyHome.objService.getAttributeData(pid, InterfaceEnergyHome.attrs.ATTR_PRODUZIONE, startTime, endTime,
			resolution, true, InterfaceEnergyHome.DELTA);
}

/**
 * Display the distribution of the today consumption in a Pie diagram
 */
CostiConsumi.displayConsumptionDistributionPie = function(elemId, data) {

	if (data.length > 0) {
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
						renderTo : elemId,
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
						data : data
					} ]
				});
	}
}

CostiConsumi.displayHistogram = function(elemId, title, data) {

	var dataY;
	if (data != null) {
		dataY = data.slice(0);
	}

	if (dataY) {
		$.each(dataY, function(index, dato) {
			dataY[index] = dato / 1000;
		});
	}
	var cat = null;

	if (GestDate.DSTMarzo) {
		cat = [ 0, 1, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20, 21, 22, 23 ]
	} else if (GestDate.DSTOttobre) {
		cat = [ 0, 1, 2, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20, 21, 22, 23 ];
	}

	Highcharts.setOptions({
		colors : [ "#0B0B96", '#50B432', '#ED561B', '#DDDF00', '#24CBE5', '#64E572', '#FF9655', '#FFF263', '#6AF9C4' ]
	});

	chart = new Highcharts.Chart({
		chart : {
			renderTo : elemId,
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
			text : title,
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
				return 'Consumo : <b>' + Highcharts.numberFormat(this.y, 1) + ' KWh</b><br/>' + 'alle ore: ' + this.x + ':00';
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
}

/**
 * UTILITY FUNCTIONS
 */

/**
 * Determine which is the most instantaneous power demanding device. Any
 * SmartInfo device or any device that doesn't measure the power must be
 * filtered out. The device category is used to determine the device type.
 * 
 * FIXME: the device category is selected by the user, so it should not be used
 * for this purpose.
 */

CostiConsumi.getMaxPowerDemandingDevice = function(devices) {
	var filteredDevicesList = $.map(devices, function(device, index) {

		var appCategory = device[InterfaceEnergyHome.ATTR_APP_CATEGORY];
		if (device[InterfaceEnergyHome.ATTR_APP_AVAIL] == 2) {
			if (CostiConsumi.isPowerSink(appCategory)) {
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

		for (var iCounter = 0; iCounter < a[InterfaceEnergyHome.ATTR_APP_VALUE].length; iCounter++) {
			if (a[InterfaceEnergyHome.ATTR_APP_VALUE][iCounter].name == "IstantaneousDemands") {
				aRslt = true;
				firstElettrConsumo = a[InterfaceEnergyHome.ATTR_APP_VALUE][iCounter].value.value;
			}
		}
		for (var jCounter = 0; jCounter < b[InterfaceEnergyHome.ATTR_APP_VALUE].length; jCounter++) {
			if (b[InterfaceEnergyHome.ATTR_APP_VALUE][jCounter].name == "IstantaneousDemands") {
				bRslt = true;
				secondElettrConsumo = b[InterfaceEnergyHome.ATTR_APP_VALUE][jCounter].value.value;
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
 * The following function returns true if the category represents a device that
 * is also a metering device.
 * 
 * FIXME: the implementation of the GUI must get rid of this function.
 */

CostiConsumi.isPowerSink = function(appCategory) {
	if ((appCategory != "44") && (appCategory != "40") && (appCategory != "45") && (appCategory != "36") && (appCategory != "41")
			&& (appCategory != "35") && (appCategory != "34") && (appCategory != "47")) {
		return true;
	}
}