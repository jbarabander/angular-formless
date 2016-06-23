var angular = require('angular');

angular.module('formless', [])
.directive('formless', formlessDirective);

function formlessDirective ($document, FormlessFactory) {
	return {
		restrict: 'A',
		scope: {
			formlessInstance: '='
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
			var _internalHash = {}
			ngModelElementsWithFormlessNames.forEach(function (element) {
				_internalHash[element.attr('formlessName')] = element.controller('ngModel');
			});

			scope.grabValidators = function (actualHash, controller) {
				var validationKeys = Object.keys(controller.$validators);
				validationKeys.forEach(function (element) {
					var actualValidator = controller.$validators[element]
					scope.formlessInstance.register(element, function (modelValue) {
						return actualValidator(modelValue, modelValue)
					})
				})
				return validationKeys.map(function (element) {
					return {validator: element}
				})
			}
			// check into each functions ngModel controller for validators
			// register these validators with the instance and add those results to formlessInstance
		}
	};
}

formlessDirective.$inject = ['$document', 'FormlessFactory'];
