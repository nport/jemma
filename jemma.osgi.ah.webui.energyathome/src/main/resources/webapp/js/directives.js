var jemmaModule = angular.module("jemma", [ 'ngRoute', 'ui.chart', 'ui.bootstrap-slider' ]);

jemmaModule.directive('dynamic', function($compile) {
	return {
		replace : true,
		link : function(scope, ele, attrs) {
			scope.$watch(attrs.dynamic, function(html) {
				if (!html) {
					return;
				}
				ele.html((typeof (html) === 'string') ? html : html.data);
				$compile(ele.contents())(scope);
			});
		}
	};
});

jemmaModule.directive('jqSpeedometer', function() {
	return {
		restrict : 'AE',
		scope : {
			'value' : '=',
			'max' : '='
		},
		link : function(scope, element, attrs, ngModelCtrl) {
			console.log("called link function of speedometer");
			$(element).speedometer({
				value : scope.value,
				max : scope.max,
				granularity : 10,
				panel : attrs.panel,
				gauge : attrs.gauge,
				url : attrs.url,
			});

			scope.$watch('value', function(newValue) {
				console.log("received attribute: " + newValue);
				$(element).speedometer("value", newValue, "kW");
			});

			scope.$watch('max', function(newValue) {
				console.log("received attribute: " + newValue);
				// $(element).speedometer("max", newValue, "kW");
			});
		}
	}
});

jemmaModule.directive('jqGauge', [ function() {
	return {
		restrict : 'A',
		scope : {
			'model' : '='
		},
		link : function(scope, elem, attrs) {
			$(elem).gauge({
				value : scope.model,
				color : attrs.color,
				lock : true,
				max : attrs.max,
			});
			scope.$watch('model', function(newVal) {
				$(elem).gauge('value', newVal);
			});
		}
	};
} ]);

/**
 * <div jq-slider model="sliderValue" min="25" max="75" step="5"></div>
 */

jemmaModule.directive('jqSlider', [ function() {
	return {
		restrict : 'A',
		scope : {
			'model' : '='
		},
		link : function(scope, elem, attrs) {
			$(elem).slider({
				value : +scope.model,
				min : +attrs.min,
				max : +attrs.max,
				step : +attrs.step,
				slide : function(event, ui) {
					$scope.apply(function() {
						scope.model = ui.value;
					});
				}
			});
			scope.$watch('model', function(newVal) {
				$slider.slider('value', newVal);
			});
		}
	};
} ]);

jemmaModule.directive('ehSwitchOrig', function() {
	return {
		restrict : 'AE',
		replace : true,
		transclude : true,
		template : function(element, attrs) {
			var html = '';
			html += '<span';
			html += ' class="switch' + (attrs.class ? ' ' + attrs.class : '') + '"';
			html += attrs.ngModel ? ' ng-click="' + attrs.disabled + ' ? ' + attrs.ngModel + ' : ' + attrs.ngModel + '=!'
					+ attrs.ngModel + (attrs.ngChange ? '; ' + attrs.ngChange + '()"' : '"') : '';
			html += ' ng-class="{ checked:' + attrs.ngModel + ', disabled:' + attrs.disabled + ' }"';
			html += '>';
			html += '<small></small>';
			html += '<input type="checkbox"';
			html += attrs.id ? ' id="' + attrs.id + '"' : '';
			html += attrs.name ? ' name="' + attrs.name + '"' : '';
			html += attrs.ngModel ? ' ng-model="' + attrs.ngModel + '"' : '';
			html += ' style="display:none" />';
			/*
			 * adding new container for switch text
			 */
			html += '<span class="switch-text">';

			/*
			 * switch text on value set by user in directive html markup
			 */
			html += attrs.on ? '<span class="on">' + attrs.on + '</span>' : '';
			/*
			 * switch text off value set by user in directive html markup
			 */
			html += attrs.off ? '<span class="off">' + attrs.off + '</span>' : ' ';
			html += '</span>';
			return html;
		}
	}
});

jemmaModule.directive('ehSwitch', function() {
	return {
		restrict : 'AE',
		replace : true,
		transclude : true,
		template : function(element, attrs) {

			var clazz = attrs.class ? ' ' + attrs.class : '' + '"';

			var html;
			html = '<span class="switch" ng-class="{ checked:' + attrs.ngModel + ', disabled:' + attrs.disabled + ' }">';
			html += '<small></small>';
			html += '<input type="checkbox"';
			html += attrs.id ? ' id="' + attrs.id + '"' : '';
			html += attrs.name ? ' name="' + attrs.name + '"' : '';
			html += attrs.ngModel ? ' ng-model="' + attrs.ngModel + '"' : '';
			html += ' style="display:none" />';
			/*
			 * adding new container for switch text
			 */
			html += '<span class="switch-text">';

			/*
			 * switch text on value set by user in directive html markup
			 */
			html += attrs.on ? '<span class="on">' + attrs.on + '</span>' : '';
			/*
			 * switch text off value set by user in directive html markup
			 */
			html += attrs.off ? '<span class="off">' + attrs.off + '</span>' : ' ';
			html += '</span>';
			return html;
		}
	}
});

jemmaModule.directive("ehGenericDevice", GenericDeviceDirective);
jemmaModule.directive("ehGenericDeviceDetails", GenericDeviceDetailsDirective);
jemmaModule.directive("ehEmptyDeviceDetails", EmptyDeviceDetails);

function EmptyDeviceDetails() {

	return {
		restrict : 'EC',
		replace : true,
		template : '<div class="view"><div class="header"><div class="titolo">{{translation.home.clickOnDevice}}</div></div></div>',
		link : link
	};

	function link(scope, element, attrs) {
	}
}

function GenericDeviceDirective() {

	return {
		restrict : 'EC',
		replace : true,
		templateUrl : 'views/deviceTemplate.html',
		link : link
	};

	function link(scope, element, attrs) {
	}
}

function GenericDeviceDetailsDirective() {

	return {
		restrict : 'EC',
		replace : true,
		scope : {
			device : '=ngModel',
			translation : '=',
		},
		templateUrl : 'views/deviceDetailsTemplate.html',
		link : link
	};

	function link(scope, element, attrs) {

		var btnOnOff = element.find("#btnOnOff");

		var options = element.find("#options");

		btnOnOff.on("click", function(event) {
			event.preventDefault();

			var device = scope.device;
			if (!ifUtils.isConnected(device)) {
				return;
			}

			// var btn = $("#Interfaccia").find("#btnOnOff");
			addSpinner("#Interfaccia", "#0a0a0a");

			if (btnOnOff.hasClass("ON")) {
				btnOnOff.removeClass("ON").addClass("OFF");
			} else if (btnOnOff.hasClass("OFF")) {
				btnOnOff.removeClass("OFF").addClass("ON");
			} else {

			}

			var onOff = ifUtils.getAttribute(device, "OnOff");

			if (onOff == true || onOff == false) {
				var p = InterfaceEnergyHome.objService.setDeviceState(device.id, onOff ? 0 : 1);
				p.done(function(result) {
					if (result != null && result == true) {
						removeSpinner("#Interfaccia");
						scope.$apply(function() {
							ifUtils.setAttribute(device, "OnOff", !onOff);
						});
					}
				}).fail(function(e) {
					console.log(device.nome + ": getAttribute() failed");
					removeSpinner("#Interfaccia");
				});
			}
		});

		options.on("click", function(event) {
			scope.$apply(function() {
				scope.devices.deviceInfo = angular.copy(scope.device);
				$('#modalDevice').modal('show');
			});
		});
	}
}

jemmaModule.directive("ehColorpicker", ['$parse', EhColorpickerDirective ]);
function EhColorpickerDirective($parse) {
	return {
		restrict : 'AE',
		replace : true,
		template : '<div><input class="slider-input" type="text" style="width:100%" /></div>',
		require : 'ngModel',
		scope : {
			value : "=",
			ngModel : '=',
			ngDisabled : '=',
			range : '=',
			sliderid : '=',
			scale : '=',
			focus : '=',
			formatter : '&',
			onStart : '&',
			onStop : '&',
			onSlide : '&'
		},
		link : link
	};

	function link($scope, element, attrs, ngModelCtrl, $compile) {
		var $colorpicker = $.farbtastic(element);

		var fn = $parse(attrs["onStop"]);

		$colorpicker.linkTo(function(chosenColor) {
			/**
			 * Called every time the user drags the mouse pointer on the color
			 * control. We just refresh the gui
			 */

			var HSV = {
				h : $colorpicker.hsl[0] * 360,
				s : $colorpicker.hsl[1],
				v : $colorpicker.hsl[2]
			};

			ngModelCtrl.$setViewValue(HSV);
		});

		$colorpicker.onStart(function() {
			// this.isBusy = true;
		});

		$colorpicker.onStop(function() {

			/**
			 * Called when the user releases the mouse button on a specific
			 * color.
			 */
			this.isBusy = false;

			level = $("#sliderLevel").slider("option", "value");

			var HSV = {
				h : $colorpicker.hsl[0] * 360,
				s : $colorpicker.hsl[1],
				v : $colorpicker.hsl[2]
			};

			if ($scope.onStop) {

				$scope.$apply(function() {
					fn($scope.$parent, {
						$event : HSV,
						value : HSV
					});
				});
			}
		});

		$scope.$watch('model', function(newVal) {
			// $colorpicker.slider('value', newVal);
		});
	}
}

jemmaModule.directive("ehSlider", EhSliderDirective);

function EhSliderDirective() {
	return {
		restrict : 'A',
		scope : {
			'model' : '='
		},
		link : link
	};

	function link(scope, elem, attrs) {
		var $slider = $(elem);
		$slider.slider({
			range : "min",
			value : +scope.model,
			min : +attrs.min,
			max : +attrs.max,
			slide : function(event, ui) {
				if (!attrs.onstop) {
					scope.$apply(function() {
						scope.model = ui.value;
					});
				}
			},

			stop : function(event, ui) {
				if (attrs.onstop) {
					scope.$apply(function() {
						scope.model = ui.value;
					});
				}
			}
		});

		$slider.slider("enable");
		scope.$watch('model', function(newVal) {
			$slider.slider('value', newVal);
		});
	}
}

//
//
// function EhOnOff() {
// return {
// restrict : "EA",
// scope : false,
// template : `<div class="form-control btnToggle right NP"></div>`
// };
// }
//
// function EhOnOff1() {
// return {
// restrict : "EA",
// scope : false,
// template : '<div class="onoffswitch"><input type="checkbox"
// name="onoffswitch" class="onoffswitch-checkbox" id="myonoffswitch"
// checked><label class="onoffswitch-label" for="myonoffswitch"><span
// class="onoffswitch-inner">OFF</span><span
// class="onoffswitch-switch"></span></label></div>'
// };
// }
//
//
//
//

