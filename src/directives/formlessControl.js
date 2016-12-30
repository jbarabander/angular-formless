var angular = require('angular');

angular.module('formless', [])
.directive('formlessControl', formlessDirective);

function formlessControlDirective ($parse) {
	return {
		restrict: 'A',
		scope: {},
		require: ['?ngModel', '^formless'],
		link: function (scope, element, attr, ngModel, formless) {
			var formlessInstance = formless.formlessInstance;
			var formlessSchema = formless.formlessSchema;
			var individualValidation = formless.formlessSchema[attr.$attr.name];
			if (!individualValidation) {
				return;
			}

			var validators = Array.isArray(individualValidation) ? individualValidation : [individualValidation];

			validators.forEach(function (element) {
				var validatorObj = formlessInstance._parseValidatorObj(element);
				ngModel.$validators[validatorObj.validator.name] = function (modelValue) {
					var params = validatorObj.validator.params ? validatorObj.validator.params : [];
					if(validatorObj.validator.param !== undefined && validatorObj.validator.param !== null) {
						params.unshift(validatorObj.validator.param);
					}
					params.unshift(modelValue);
					return validatorObj.validator.validateProp.apply(validatorObj.validator, params);
				}
			});
		}
	};
}

formlessControlDirective.$inject = ['$parse'];
