var mainApp = angular.module("mainApp", [ 'ngRoute', 'ui.chart', 'jemma', 'ui.bootstrap' ]);

useAngular = true;

mainApp.config(function($routeProvider) {
	$routeProvider.when('/devices', {
		templateUrl : 'views/devices.html',
		controller : 'DevicesController as devices'
	}).when('/consumption', {
		templateUrl : 'views/consumption.html'
	}).when('/costs', {
		templateUrl : 'views/costs.html'
	}).when('/historical', {
		templateUrl : 'views/storico.html',
		controller: "HistoricalDataController as history"
	}).when('/consumption_pv', {
		templateUrl : 'views/consumption_pv.html'
	}).when('/photovoltaic', {
		templateUrl : 'views/photovoltaic.html'
	}).when('/1box', {
		templateUrl : 'views/1box.html'
	}).when('/2boxes', {
		templateUrl : 'views/2boxes.html'
	}).when('/3boxes', {
		templateUrl : 'views/3boxes.html'
	}).when('/3boxes_4inner', {
		templateUrl : 'views/3boxes_4inner.html'
	}).when('/report', {
		templateUrl : 'views/report.html'
	}).when('/community', {
		templateUrl : 'views/community.html'
	}).when('/registration', {
		templateUrl : 'views/registration.html'
	}).when('/configuration', {
		templateUrl : 'views/configuration.html'
	}).otherwise({
		redirectTo : '/consumption'
	});
});


useAngularForDetails = true;

