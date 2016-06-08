angular.module('prova', [ 'uiSwitch' ])

.directive('combined', function() {
	return {
		restrict : 'AE',
		replace : true,
		transclude : true,
		scope : {
			switch1 : true
		},
		template : '<switch name="switch" ng-model="switch1" ng-change="changedSwitch1"></switch>'
	}
});