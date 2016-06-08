/* 
 * leggo la data da AG la prima volta e memorizzo la differenza rispetto all'ora di sistema. 
 * Poi ogni minuto leggo l'ora di sistema e aggiungo la differenza 
 */
var GestDate = {
	initCallback : null,
	cb : null,
	date : null,
	timerDate : null,
	DSTMarzo : false,
	DSTOttobre : false
}

GestDate.init = function() {
	GestDate.initDate();
}

GestDate.setUpdateCallback = function(cb) {
	GestDate.cb = cb;
}

/*
 * la prima volta legge l'ora attuale. Poi imposta un timer che ogni minuto va a
 * rileggerlo se non funziona prendo l'ora di sistema, per adesso
 */
GestDate.initDate = function() {
	dstdate = new Date(2012, 2, 31, 0, 1);
	tmpday = dstdate.getDay();
	dstdate.setDate(dstdate.getDate() - tmpday);
	GestDate.DSTMarzoDate = dstdate.toLocaleDateString();

	dstdate = new Date(2012, 9, 31, 0, 1);
	tmpday = dstdate.getDay();
	dstdate.setDate(dstdate.getDate() - tmpday);
	GestDate.DSTOttobreDate = dstdate.toLocaleDateString();

	var p = InterfaceEnergyHome.objService.currentTimeMillis();
	p.done(function(date) {
		GestDate.setDate(date);
	});
}

GestDate.getDate = function() {
	// FIXME: to avoid to ask for the current date before it has been
	// initialized by reading it from the gateway.
	if (GestDate.date == null) {
		GestDate.date = new Date();
	}
	return GestDate.date;
}

GestDate.setDate = function(epoch) {
	if (epoch == null) {
		epoch = 0;
	}
	GestDate.date = new Date(epoch);
	if (GestDate.timerDate == null) {
		if (GestDate.date.toLocaleDateString() == GestDate.DSTMarzoDate)
			GestDate.DSTMarzo = true;
		if (GestDate.date.toLocaleDateString() == GestDate.DSTOttobreDate)
			GestDate.DSTOttobre = true;
		GestDate.timerDate = setInterval("GestDate.updateDate()", 60000);

		if (GestDate.cb != null) {
			GestDate.cb(GestDate.date);
		}
	}
}

/**
 * Chiede l'ora al backend e lo fa ogni 60 secondi.
 */
GestDate.updateDate = function() {

	var p = InterfaceEnergyHome.objService.currentTimeMillis();
	p.done(function(date) {
		GestDate.setDate(date);
	});

	if (GestDate.cb != null) {
		GestDate.cb(GestDate.date);
	}
}
