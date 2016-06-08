var fakeValues = {};

fakeValues.MIN_DAY = 60 * 24;
// utente
fakeValues.userId = '0006';

// Perc IAC
fakeValues.PERCIAC2 = [ 20, 20, 20, 20, 20, 5 ];
fakeValues.PERCIAC = [ 10, 10, 10, 10, 10, 5 ];
// costi
fakeValues.CostoOdierno = [
		{
			"list" : [ 0.01, 0.01, 0.01, 0.01, 0.01, 0.02, 0.1, 0.24, 0.13, 0.03, 0.02, 0.03, 0.1, 0.13, 0.17, 0.14, 0.15, 0.18,
					0.21, 0.23, 0.21, 0.09, 0.08, 0.01 ]
		},
		{
			"list" : [ 0.01, 0.01, 0.01, 0.01, 0.01, 0.02, 0.2, 0.23, 0.13, 0.04, 0.02, 0.03, 0.11, 0.13, 0.17, 0.14, 0.15, 0.18,
					0.21, 0.23, 0.21, 0.09, 0.08, 0.01 ]
		},
		{
			"list" : [ 0.01, 0.01, 0.01, 0.01, 0.01, 0.01, 0.1, 0.22, 0.13, 0.03, 0.01, 0.01, 0.09, 0.13, 0.17, 0.13, 0.15, 0.18,
					0.21, 0.23, 0.21, 0.09, 0.08, 0.01 ]
		} ];
fakeValues.indCostoOdierno = 0;
fakeValues.CostoMedio = {
	"list" : [ 0.01, 0.01, 0.01, 0.01, 0.01, 0.02, 0.1, 0.14, 0.13, 0.03, 0.02, 0.03, 0.1, 0.13, 0.17, 0.14, 0.15, 0.18, 0.21,
			0.23, 0.21, 0.09, 0.08, 0.01 ]
};
fakeValues.CostoPrevisto = 39.5;
fakeValues.CostoGiornaliero = {
	"list" : [ 0.01, 0.01, 0.01, 0.01, 0.01, 0.02, 0.1, 0.14, 0.13, 0.03, 0.02, 0.03, 0.1, 0.13, 0.17, 0.14, 0.15, 0.18, 0.21,
			0.23, 0.21, 0.09, 0.08, 0.01 ]
};
// formato dati da verificare
fakeValues.costDistribution = {
	"map" : {
		"1" : {
			"list" : [ 2.571 ]
		},
		"0" : {
			"list" : [ 17.571 ]
		},
		"2" : {
			"list" : [ 39.571 ]
		},
		"6" : {
			"list" : [ 124.571 ]
		},
		"3" : {
			"list" : [ 0 ]
		},
		"7" : {
			"list" : [ 139.571 ]
		},
		"8" : {
			"list" : [ 224.571 ]
		}
	}
};

fakeValues.consumptionDistribution = {
	"map" : {
		"1" : {
			"list" : [ 440 ]
		},
		"0" : {
			"list" : [ 153256 ]
		},
		"2" : {
			"list" : [ 8056 ]
		},
		"6" : {
			"list" : [ 24057 ]
		},
		"3" : {
			"list" : [ 0 ]
		},
		"7" : {
			"list" : [ 30957 ]
		},
		"8" : {
			"list" : [ 40057 ]
		}
	}
};

// consumo
fakeValues.ConsumoOdierno = [ {
	"list" : [ 82, 88, 83, 89, 983, 93, 90, 512, 210, 160, 173, 125, 360, 492, 450, 401, 421, 565, 643, 681, 652, 332, 310, 78 ]
}, {
	"list" : [ 85, 85, 88, 89, 93, 93, 90, 432, 210, 160, 123, 125, 360, 492, 450, 401, 421, 635, 643, 681, 652, 332, 310, 78 ]
}, {
	"list" : [ 80, 85, 82, 89, 93, 93, 90, 412, 210, 160, 103, 125, 360, 492, 450, 401, 421, 515, 643, 681, 652, 332, 310, 78 ]
} ];
fakeValues.indConsumoOdierno = 0;
var ConsumoMedio = {
	"list" : [ 85, 85, 88, 89, 93, 93, 90, 632, 210, 160, 123, 125, 360, 492, 450, 401, 421, 535, 643, 681, 652, 332, 310, 78 ]
};

fakeValues.monthConsumptionForecast = 219300;
fakeValues.weekConsumptionForecast = 400;
fakeValues.dayConsumptionForecast = 5;

fakeValues.todayConsumption = {
	"list" : [ 85, 85, 88, 89, 93, 93, 209, 1132, 1210, 160, 720, 2325, 3360, 2492, 450, 400, 1421, 535, 1643, 2181, 3352, 332,
			789, 78 ]
};
fakeValues.EnergiaProdottaGiornalieroSimul = {
	"list" : [ null, null, null, null, null, null, 5, 72, 193, 420, 780, 1600, 2000, 2000, 2000, 1200, 634, 256, 65, 13, null,
			null, null, null ]
};
fakeValues.EnergiaVendutaGiornalieroSimul = {
	"list" : [ null, null, null, null, null, null, null, null, null, 260, 60, null, null, null, 1550, 800, null, null, null, null,
			null, null, null, null ]
};
// TODO: check merge, the variable below was not present in 3.3.0
fakeValues.PrevisioneEnergiaProdotta = [ 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.123, 0.245, 0.600, 1.224, 1.490, 1.586, 1.401,
		1.172, 0.819, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0 ];
fakeValues.ConsumoMedioSettimanale = {
	"list" : [ 85, 85, 88, 89, 93, 93, 90 ]
};
fakeValues.todayForecast = [ 0, 0, 0, 0, 0, 0, 0.1, 0.2, 0.5, 0.8, 1.3, 1.6, 2, 1.8, 1.7, 1.3, 1, 0.5, 0.3, 0, 0, 0, 0 ];

fakeValues.consumption = {
	"value" : 1400
};

fakeValues.production = {
	"value" : 1400
};

// storico
fakeValues.StoricoElettr = [ {
	"nome" : "Washing M.",
	"id" : "id1",
	"perc" : 16
}, {
	"nome" : "Fridge",
	"id" : "id2",
	"perc" : 36
}, {
	"nome" : "PC Zone",
	"id" : "id3",
	"perc" : 10
}, {
	"nome" : "Oven",
	"id" : "id4",
	"perc" : 11
} ];

fakeValues.StoricoCostoI = {
	"list" : [ 0.01, 0.01, 0.01, 0.01, 0.07, 0.04, 0.02, 0.03, 0.11, 0.13, 0.17, 0.12, 0.34, null, null, null, null, null, null,
			null, null, null, null, null ]
};
fakeValues.StoricoConsumoI = {
	"list" : [ 88, 85, 88, 89, 250, 110, 98, 120, 360, 450, 650, 420, 1100, null, null, null, null, null, null, null, null, null,
			null, null ]
};
fakeValues.StoricoProduzioneI = {
	"list" : [ 0, 0, 0, 0, 0, 0, 0, 0, 0, 45, 650, 1200, 2400, null, null, null, null, null, null, null, null, null, null, null ]
};
fakeValues.StoricoCostoS = {
	"list" : [ 2.0, 2.4, 2.1, 0.5, null, null, null ]
};
fakeValues.StoricoConsumoS = {
	"list" : [ 4476, 4558, 8100, 1100, null, null, null ]
};
fakeValues.StoricoProduzioneS = {
	"list" : [ 2234, 2500, 3400, 4000, null, null, null ]
};
fakeValues.StoricoCostoM = {
	"list" : [ 2.0, 2.4, 2.1, 2, 3, 2.4, 2.3, 1.4, 2.2, 2.4, 2.8, 1.6, 2.1, 2.2, 2, 2.1, 2.5, 2.6, 1.6, 1.6, null, null, null,
			null, null, null, null, null, null, null, null ]
};
fakeValues.StoricoConsumoM = {
	"list" : [ 6400, 6400, 8100, 6400, 7200, 6400, 6900, 4900, 6500, 7200, 6700, 6500, 5600, 6400, 6900, 4400, 6900, 7200, 8000,
			5600, null, null, null, null, null, null, null, null, null, null, null ]
};
fakeValues.StoricoProduzioneM = {
	"list" : [ 3200, 3300, 3200, 4500, 3200, 4400, 1900, 2900, 3500, 4200, 4700, 4500, 4600, 400, 5900, 4400, 2900, 4200, 1000,
			600, null, null, null, null, null, null, null, null, null, null, null ]
};
fakeValues.StoricoCostoA = {
	"list" : [ 30.2, 32.5, 33, 34.2, 33.4, 26.0, null, null, null, null, null, null ]
};
fakeValues.StoricoConsumoA = {
	"list" : [ 167000, 141000, 186900, 205000, 165000, 110000, null, null, null, null, null, null ]
};
fakeValues.StoricoProduzioneA = {
	"list" : [ 127000, 101000, 146900, 185000, 105000, 10000, null, null, null, null, null, null ]
};

fakeValues.indLista = 0;

fakeValues.SuggerimentiIt = [ "Lava a basse temperature", "Usa di piu' la lavatrice in fascia serale",
		"Sfrutta la capienza massima del cestello", "Spegni il forno prima del termine della cottura",
		"Non aprire il forno nel preriscaldamento", "Non introdurre cibi caldi in frigo",
		"Regola il termostato del frigo dai 4 gradi in su", "Spegni il condizionatore <br>un'ora prima di uscire dal locale" ];
fakeValues.SuggerimentiEn = [ "Wash at low temperatures", "Use more the washing machine in the evening",
		"Exploits the maximum capacity <br>of the washing machine basket", "Turn off the oven <br>before the end of cooking",
		"Don't open the oven during the preheating", "Don't put hot food in the fridge",
		"Adjust the thermostat of the <br>refrigerator from 4 degrees up",
		"Turn off your air-conditioner <br>an hour before you leave the room" ];

fakeValues.locations = [ {
	"name" : "Bedroom",
	"iconName" : "bedroom.png",
	"pid" : "5"
}, {
	"name" : "Lab",
	"iconName" : "laboratory.png",
	"pid" : "7"
}, {
	"name" : "Bathroom",
	"iconName" : "bathroom.png",
	"pid" : "4"
}, {
	"name" : "Hall",
	"iconName" : "hall.png",
	"pid" : "8"
}, {
	"name" : "Garden",
	"iconName" : "garden.png",
	"pid" : "3"
}, {
	"name" : "Living Room",
	"iconName" : "livingroom.png",
	"pid" : "6"
}, {
	"name" : "Other",
	"iconName" : "other.png",
	"pid" : "0"
}, {
	"name" : "Studio",
	"iconName" : "studio.png",
	"pid" : "2"
}, {
	"name" : "Kitchen",
	"iconName" : "kitchen.png",
	"pid" : "1"
}, {
	"name" : "Corridor",
	"iconName" : "corridor.png",
	"pid" : "9"
} ];

fakeValues.categoriesWithPid =

[ {
	"icon" : "other.png",
	"name" : "Other",
	"pid" : "1"
}, {
	"icon" : "lamp.png",
	"name" : "Lamp",
	"pid" : "2"
}, {
	"icon" : "water_heater.png",
	"name" : "Water Heater",
	"pid" : "3"
}, {
	"icon" : "tv.png",
	"name" : "TV",
	"pid" : "4"
}, {
	"icon" : "pc.png",
	"name" : "PC",
	"pid" : "5"
}, {
	"icon" : "oven.png",
	"name" : "Oven",
	"pid" : "6"
}, {
	"icon" : "iron.png",
	"name" : "Iron",
	"pid" : "7"
}, {
	"icon" : "refrigerator.png",
	"name" : "Refrigerator",
	"pid" : "8"
}, {
	"icon" : "dish_washer.png",
	"name" : "Dish Washer",
	"pid" : "9"
}, {
	"icon" : "air_conditioner.png",
	"name" : "Air Conditioner",
	"pid" : "10"
}, {
	"icon" : "washing_machine.png",
	"name" : "Washing Machine",
	"pid" : "11"
}, {
	"icon" : "meter.png",
	"name" : "Meter",
	"pid" : "12"
}, {
	"icon" : "jolly_smart_plug.png",
	"name" : "Jolly Smart Plug",
	"pid" : "13"
}, {
	"icon" : "production_meter.png",
	"name" : "Production Meter",
	"pid" : "14"
}, {
	"icon" : "secondary_meter.png",
	"name" : "Secondary Meter",
	"pid" : "15"
}, {
	"icon" : "printer.png",
	"name" : "Printer",
	"pid" : "16"
}, {
	"icon" : "modem-router.png",
	"name" : "Modem-Router",
	"pid" : "17"
}, {
	"icon" : "decoder-recorder-player.png",
	"name" : "Decoder-Recorder-Player",
	"pid" : "18"
}, {
	"icon" : "home_theatre-stereo.png",
	"name" : "Home Theatre-Stereo",
	"pid" : "19"
}, {
	"icon" : "play_station.png",
	"name" : "Play Station",
	"pid" : "20"
}, {
	"icon" : "media_center.png",
	"name" : "Media Center",
	"pid" : "21"
}, {
	"icon" : "freezer.png",
	"name" : "Freezer",
	"pid" : "22"
}, {
	"icon" : "washer_dryer.png",
	"name" : "Washer Dryer",
	"pid" : "23"
}, {
	"icon" : "vacuum_cleaner.png",
	"name" : "Vacuum Cleaner",
	"pid" : "24"
}, {
	"icon" : "hair_dryer.png",
	"name" : "Hair Dryer",
	"pid" : "25"
}, {
	"icon" : "bread_machine.png",
	"name" : "Bread Machine",
	"pid" : "26"
}, {
	"icon" : "coffee_machine.png",
	"name" : "Coffee Machine",
	"pid" : "27"
}, {
	"icon" : "toaster.png",
	"name" : "Toaster",
	"pid" : "28"
}, {
	"icon" : "food_robot.png",
	"name" : "Food Robot",
	"pid" : "29"
}, {
	"icon" : "water_purifier.png",
	"name" : "Water Purifier",
	"pid" : "30"
}, {
	"icon" : "hob.png",
	"name" : "Hob",
	"pid" : "31"
}, {
	"icon" : "electric_heater.png",
	"name" : "Electric Heater",
	"pid" : "32"
}, {
	"icon" : "swimming_pool_pump.png",
	"name" : "Swimming pool pump",
	"pid" : "33"
}, {
	"icon" : "lamp.png",
	"name" : "MAC lamp",
	"pid" : "34"
}, {
	"icon" : "lamp.png",
	"name" : "Philps lamp",
	"pid" : "35"
}, {
	"icon" : "thermostat.png",
	"name" : "Centralite Thermostat",
	"pid" : "36"
}, {
	"icon" : "whaser_dryer.png",
	"name" : "Indesit Whashing Machine",
	"pid" : "37"
}, {
	"icon" : "oven.png",
	"name" : "Indesit Oven",
	"pid" : "38"
}, {
	"icon" : "freezer.png",
	"name" : "Indesit Fridge",
	"pid" : "39"
}, {
	"icon" : "other.png",
	"name" : "Door Lock",
	"pid" : "40"
}, {
	"icon" : "thermostat.png",
	"name" : "Reloc Temperature Sensor",
	"pid" : "41"
}, {
	"icon" : "other.png",
	"name" : "Ubisys Drimmer Switch",
	"pid" : "42"
}, {
	"icon" : "other.png",
	"name" : "Ubisys Dimmable Light",
	"pid" : "43"
}, {
	"icon" : "other.png",
	"name" : "Window Covering",
	"pid" : "44"
}, {
	"icon" : "other.png",
	"name" : "Window Covering Controller",
	"pid" : "45"
}, {
	"icon" : "dishwasher.png",
	"name" : "Indesit Dish Washer",
	"pid" : "46"
}, {
	"icon" : "nestTh.png",
	"name" : "Nest Thermostat",
	"pid" : "47"
} ];

fakeValues.nest1 = {
	"appliance.pid" : "ah.app.02AA01AC101403WP",
	"ah.category.pid" : "47",
	"ah.location.pid" : "1",
	"ah.app.type" : "org.energy_home.jemma.ah.nest.thermostat",
	"ah.icon" : "nestTh.png",
	"ah.app.name" : "Nest Thermostat 1",
	"ah.app.eps.types" : [ "ah.ep.common", "ah.ep.nest.thermostat" ],
	"availability" : 2,
	"device_value" : [ {
		"name" : "LocalHumidity",
		"value" : {
			"timestamp" : 1452910473745,
			"value" : 11,
		}
	}, {
		"name" : "Temperature",
		"value" : {
			"timestamp" : 1452910473745,
			"value" : 26.18
		}
	}, {
		"name" : "TargetTemperature",
		"value" : {
			"timestamp" : 1452910473745,
			"value" : 22.5,

		}
	}, {
		"name" : "AwayState",
		"value" : {
			"timestamp" : 1452910473745,
			"value" : false,
		}
	} ]
};

fakeValues.indesitWashingMachine = {
	"appliance.pid" : "app.pid.indesitWM1",
	"ah.app.name" : "Indesit",
	"ah.app.type" : "com.indesit.ah.app.whitegood",
	"device_state_avail" : "true",
	"ah.category.pid" : "37",
	"ah.location.pid" : "2",
	"ah.icon" : "lvb1.png",
	"availability" : 2,
	"device_state" : 1,
	"device_value" : [ {
		"name" : "IstantaneousDemands",
		"value" : {
			"timestamp" : 1452446292324,
			"value" : 26
		}
	} ]

};

fakeValues.smartInfo = {
	"appliance.pid" : "app.pid.smartInfo1",
	"ah.app.name" : "SmartInfo",
	"ah.app.type" : "it.telecomitalia.ah.zigbee.metering",
	"ah.category.pid" : "12",
	"ah.location.pid" : "3",
	"ah.icon" : "plug.png",
	"availability" : 2,
	"device_state" : 4,
	"device_state_avail" : "false",
	"device_value" : [ {
		"name" : "IstantaneousDemands",
		"value" : {
			"timestamp" : 1452446292324,
			"value" : 26
		}
	} ]
};

fakeValues.doorLock1 = {
	"appliance.pid" : "app.pid.doorLock1",
	"ah.app.name" : "DoorLock1",
	"ah.app.type" : "it.telecomitalia.ah.zigbee.security.doorlock",
	"ah.category.pid" : "40",
	"ah.location.pid" : "5",
	"ah.icon" : "doorlock.png",
	"availability" : 2,
	"device_state" : 4,
	"device_state_avail" : "false",
	"device_value" : [ {
		"name" : "LockState",
		"value" : {
			"timestamp" : 1452446292324,
			"value" : true
		}
	} ]
};

fakeValues.smartPlug1 = {
	"appliance.pid" : "app.pid.smartPlug1",
	"ah.app.name" : "SmartPlug1",
	"ah.app.type" : "it.telecomitalia.ah.zigbee.metering",
	"ah.category.pid" : "12",
	"ah.location.pid" : "3",
	"ah.icon" : "plug.png",
	"availability" : 2,
	"device_state" : 4,
	"device_state_avail" : "false",
	"device_value" : [ {
		"name" : "OnOff",
		"value" : {
			"timestamp" : 1426004605466,
			"value" : true
		}
	}, {
		"name" : "IstantaneousDemands",
		"value" : {
			"timestamp" : 1452446292324,
			"value" : 26
		}
	} ]

};

fakeValues.hue1 = {
	"appliance.pid" : "app.pid.hue1",
	"ah.app.name" : "Lampada",
	"ah.app.type" : "ah.app.lamp",
	"device_state_avail" : "true",
	"ah.category.pid" : "35",
	"ah.location.pid" : "1",
	"ah.icon" : "lampada.png",
	"availability" : 2,
	"device_state" : 1,
	"device_value" : [ {
		"name" : "OnOff",
		"value" : {
			"timestamp" : 1426004605466,
			"value" : true,
		},

	}, {
		"name" : "CurrentLevel",
		"value" : {
			"timestamp" : 1426004605466,
			"value" : 200
		}

	} ],
	clusters : {
		1 : [ "org.energy_home.jemma.ah.cluster.zigbee.general.LevelControlServer",
				"org.energy_home.jemma.ah.cluster.zigbee.general.dimmablelight",
				"org.energy_home.jemma.ah.cluster.zigbee.zll.ColorControlServer" ]
	}
};

fakeValues.hue2 = {
	"appliance.pid" : "app.pid.hue2",
	"ah.app.name" : "Lampada4",
	"ah.app.type" : "org.energy_home.jemma.ah.zigbee.ColorLight",
	"device_state_avail" : "true",
	"ah.category.pid" : "35",
	"ah.location.pid" : "1",
	"ah.icon" : "lampada.png",
	"availability" : 2,
	"device_state" : 1,
	"ah.app.eps.types" : [ "ah.ep.common", "ah.ep.zigbee.ColorLight", "ah.ep.zigbee.OnOff" ],
	"device_value" : [ {
		"name" : "OnOff",
		"value" : {
			"timestamp" : 1426004605466,
			"value" : true,
		}
	}, {
		"name" : "CurrentLevel",
		"value" : {
			"timestamp" : 1426004605466,
			"value" : 200
		}
	} ],
	clusters : {
		1 : [ "org.energy_home.jemma.ah.cluster.zigbee.general.LevelControlServer",
				"org.energy_home.jemma.ah.cluster.zigbee.general.dimmablelight",
				"org.energy_home.jemma.ah.cluster.zigbee.zll.ColorControlServer" ]
	}
};

fakeValues.devices = [ fakeValues.nest1, fakeValues.doorLock1, fakeValues.smartPlug1, fakeValues.smartInfo, fakeValues.indesitWashingMachine,
		fakeValues.hue2 ];

fakeValues.feedReports = {
	DatiSim : [
			/* Utilizzo elettrodomestico */
			[ "<p style='color:green;'>Ad oggi 40 min</p>", "<p style='color:green;'>50 min</p>",
					"<p style='color:green;'>100 &euro;</p> " ],
			/* Consumi Fissi */
			[
					"<img src='./Resources/Images/trofeo_primo_.png' alt='Primo in classifica' title='Bravo sei 1&#176; in classifica continua cos&#237;!' />",
					"<p style='color:green;'>80 mW</p>", "<p style='color:green;'>30 &euro;</p>" ],
			/* Fascia verde */
			[
					"<img src='./Resources/Images/MedagliaArgento_.png' alt='Secondo in classifica' title='Sei 2&#176; in classifica !' />",
					"<p style='color:green;'>60%</p>", "<p style='color:green;'>1000 mila &euro; </p>" ],

			[ "<img src='./Resources/Images/cucchiaio_legno_.png' alt='Ultimo in classifica' title='Sei ultimo in classifica' />",
					"<p style='color:green;'>Ad oggi 15 Kg</p>", "<p style='color:green;'>200 Kg</p> " ] ],
	consumiFissi : "100 mW",
	consumoAnno : "70% ",
	standBy : "30 &euro;",
	C02 : "20 kg",
	Eldo : "20 min"

}
// TODO: check merge, simulation date was different in 3.3.0, below old
// value commented
// var DataSim = new Date (2012,3,25,12,56);
var DataSim = new Date(2012, 2, 25, 22, 56);

fakeValues.feedAdvices = [
		{
			description : "Sale al 20,3% la percentuale di elettricit&agrave; convertita da ogni singola cella fotovoltaica. E ora la primatista Suntech punta al",
			link : "http://gogreen.virgilio.it/news/green-design/fotovoltaico-pannello-record-efficienza_6276.html?pmk=rss",
			title : "Fotovoltaico: ecci il pannello con il record di efficienza"
		},
		{
			description : "Un volumetto scaricabile online ricco di consigli utili per risparmiare dai 700 ai 1000 euro all'anno in bolletta con piccoli ...",
			link : "http://gogreen.virgilio.it/news/green-trends/eco-risparmio-arriva-manuale-ridurre-costi-acqua-luce-gas_6274.html?pmk=rss",
			title : "Eco risparmio: arriva il manuale per ridurre i costi di acqua, luce e gas"
		},
		{
			description : "In piazza le associazioni delle rinnovabili. hanno chiesto al governo, come un appello pubblicato sui giornali, di rivedere il ...",
			link : "http://gogreen.virgilio.it/news/green-economy/rinnovabili-mobilitazione-durera_6273.html?pmk=rss",
			title : "Rinnovabili, la mobilitazione partita da Roma e sui giornali durer&agrave;"
		},
		{
			description : "L'appuntamento &egrave; il 28 aprile alle 15 presso i Fori Imperiali. L'obiettivo finale &egrave; quello di ottenere pi&ugrave; sicurezza per i ...",
			link : "http://gogreen.virgilio.it/eventi/salvaciclisti_6272.html?pmk=rss",
			title : "Salvaciclisti"
		},
		{
			description : "A ridosso della decisione itaiana di prorogare o meno la sospensione dell'impiego di alcuni tipi di agrofarmaci, si pubblica la ...",
			link : "http://gogreen.virgilio.it/news/ambiente-energia/pesticidi-api-governo-decide-sospensioni_6271.html?pmk=rss",
			title : "Pesticidi e api: il governo decide sulla sospensione degli agrofarmaci"
		},
		{
			description : "Estrarre lo shale gas, grande alternativa al petrolio in questa fase in cui il prezzo del barile &egrave; caro, genera piccoli sismi ...",
			link : "http://gogreen.virgilio.it/news/ambiente-energia/terremoti-locali-estrazione-scisto_6270.html?pmk=rss",
			title : "Terremoti: a generare quelli locali &egrave; pure l'estrazione dello scisto"
		},
		{
			description : "Confermato il taglio degli incentivi del 32-36% e il registro obbligatorio per gli impianti di potenza superiore ai 12 ...",
			link : "http://gogreen.virgilio.it/news/ambiente-energia/quinto-conto-energia-testo-decreto.html?pmk=rss",
			title : "Quinto conto energia, il testo del decreto"
		},
		{
			description : "Lanciata dalla Philips Usa, fa luce per 60 watt consumando da 10 e tende a durare due decadi. Il prodotto rivoluzionario ...",
			link : "http://gogreen.virgilio.it/news/green-design/lampadina-eco-rivoluzionaria-dura-20-anni-costa-46-euro_6267.html?pmk=rss",
			title : "Lampadina eco: dura 20 anni e consuma poco, ma per ora costa 46 euro"
		},
		{
			description : "A fronte di una sensibile contrazione del mercato dell'automotive - soprattutto nel comparto delle auto di lusso - aumentano ...",
			link : "http://gogreen.virgilio.it/news/ambiente-energia/ferrari-maserati-garage-25mln-italiani-bici.html?pmk=rss",
			title : "Ferrari e Maserati in garage e 25mln di italiani passano alla bici"
		},
		{
			description : "Il ministro dell'ambiente ha presentato il piano nazionale antiemissioni di Co2. Carbon tax, 55%, smart grid e smart cities tra ...",
			link : "http://gogreen.virgilio.it/news/green-economy/bonus-55-esteso-2020-piano-clini-presentato-cipe_6263.html?pmk=rss",
			title : "Bonus 55% esteso al 2020. Ecco il piano di Clini presentato al Cipe"
		}, ];

var updateFakeDeviceValueByNameAndPid = function(valueName, pid, newValue) {
	var appliances = AppliancesConfigurationFake;
	for (var i = 0; i < appliances.length; i++) {
		if (appliances[i].map["appliance.pid"] == pid) {
			var values = appliances[i].map.device_value.list;
			for (var j = 0; j < values.length; j++) {
				if (values[j].name == valueName) {
					values[j].value.value = newValue;
					values[j].timestamp = new Date().getTime();
					console.debug(getFakeDeviceValueByPID(pid));
				}
			}
		}
	}
}

fakeValues.updateFakeDeviceConsumptionByPid = function(pid, consumption) {
	var oldConsumption = 0;

	var appliances = AppliancesConfigurationFake.result.list;
	for (var i = 0; i < appliances.length; i++) {
		if (appliances[i].map["appliance.pid"] == pid) {
			var values = appliances[i].map.device_value.list;
			for (var j = 0; j < values.length; j++) {
				if (values[j].name == "IstantaneousDemands") {
					oldConsumption = values[j].value.value;
					values[j].value.value = consumption;
					values[j].timestamp = new Date().getTime();
					console.debug(getFakeDeviceValueByPID(pid));
				}
			}
		}
	}

	// now update Smart Info device and fake values from configAdmin (only
	// works at runtime)
	for (var i = 0; i < appliances.length; i++) {
		if (appliances[i].map["ah.category.pid"] == "12") {
			var values = appliances[i].map.device_value.list;
			for (var j = 0; j < values.length; j++) {
				if (values[j].name == "IstantaneousDemands") {
					values[j].value.value += (consumption - oldConsumption);
					values[j].timestamp = new Date().getTime();
					console.debug(getFakeDeviceValueByPID(pid));
				}
			}
		}
	}

	$.each(fakeValues.noServerCustomDevice.list, function(indice, elettrodom) {
		if (elettrodom["map"][InterfaceEnergyHome.ATTR_APP_TYPE] == InterfaceEnergyHome.SMARTINFO_APP_TYPE) {
			if (elettrodom["map"][InterfaceEnergyHome.ATTR_APP_CATEGORY] == "12") {
				elettrodom["map"]["potenza"] = parseInt(elettrodom["map"]["potenza"]) + (consumption - oldConsumption);
			}
		}
	});
}

fakeValues.getFakeDeviceValueByPid = function(pid) {
	var devices = fakeValues.devices;
	for (var i = 0; i < devices.length; i++) {
		if (devices[i]["appliance.pid"] == pid) {
			return devices[i];
		}
	}
}
