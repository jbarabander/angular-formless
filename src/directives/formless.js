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
		require: ['?form'],
		link: function (scope, element, attr, form) {
			var originalAddControl = form.$addControl;
			var originalRemoveControl = form.$removeControl;
			form.$addControl = function (control) {
				try {
					formlessAddValidators(control, scope.formlessInstance, scope.formlessSchema);
				} catch (e) {
					console.error('Failed to instatiate Formless controls');
					console.error(e);
				}
				originalAddControl(control);
			}

			form.$removeControl = function (control) {
				try {
					// my additions
				} catch (e) {
					console.error('Failed to remove Formless controls');
					console.error(e);
				}
				originalRemoveControl(control);
			}
		}
	};
}

function formlessAddValidators (control, formlessInstance, formlessSchema) {
	var propName = control.formlessName ? control.formlessName : control.$name;
	var currValidatorsArr = Array.isArray(formlessSchema[propName]) ? formlessSchema[propName] : [formlessSchema[propName]];
	if (!currValidatorsArr) {
		return;
	}

	currValidatorsArr.map(function (validatorObj) {
		return formlessInstance._parseValidatorObj(validatorObj);
	}).forEach(function (filledValidatorObj) {
		var validatorName = filledValidatorObj.validator.name;
		control.$validators[validatorName] = function (modelValue, viewValue) {
			var subModel = {};
			var subSchema = {};
			subModel[propName] = viewValue;
			subSchema[propName] = filledValidatorObj;
			return formlessInstance.compareSyncOnly(subModel, subSchema).passed;
		}
	});
}

formlessDirective.$inject = ['FormlessFactory', '$timeout'];