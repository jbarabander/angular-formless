var angular = require('angular');

angular.module('formless', [])
.directive('formless', formlessDirective);

function formlessDirective (FormlessFactory, $timeout) {
	return {
		restrict: 'A',
		scope: {
			formlessInstance: '=',
			schema: '='
		},
		link: function (scope, element, attr) {
			// lets go and get all the child elements who have ng-model on them
			var ngModelElements = [].slice.call(element[0].querySelectorAll('[ng-model]'), 0).map(function (el) {
				return angular.element(el);
			});
			var ngModelElementsWithFormlessNames = ngModelElements.filter(function (el) {
				return !!el.attr('formlessName');
			});

			if (!scope.formlessInstance.fields) {
				scope.formlessInstance.fields = {}
			}
			var _internalHash = {};
			ngModelElementsWithFormlessNames.forEach(function (element) {
				var ngModelController = element.controller('ngModel');
				_internalHash[element.attr('formlessName')] = grabValidators(ngModelController);
				registerValidators(scope.formlessInstance, ngModelController);
			});

			function registerValidators (formlessInstance, controller) {
				var validationKeys = grabValidators(controller);
				validationKeys.forEach(function (element) {
					var actualValidator = controller.$validators[element];
					formlessInstance.register(element, function (modelValue) {
						return actualValidator(modelValue, modelValue);
					});
				});
			}

			function grabValidators (controller) {
				return Object.keys(controller.$validators);
			}
			// check into each functions ngModel controller for validators
			// register these validators with the instance and add those results to formlessInstance
		}
	};
}

formlessDirective.$inject = ['FormlessFactory', '$timeout'];
