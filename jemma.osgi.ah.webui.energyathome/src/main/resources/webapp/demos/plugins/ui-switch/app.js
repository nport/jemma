angular.module('app', [ 'uiSwitch' ])

.controller('MyController', MyController);

function MyController($scope) {
	this.enabled = true;
	this.onOff = true;
	this.yesNo = true;
	this.disabled = true;

	$scope.changeCallback = function() {
		console.log('This is the state of my model ' + $scope.enabled);
	};
};
