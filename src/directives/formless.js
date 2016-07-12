var angular = require('angular');

angular.module('formless', [])
.directive('formless', formlessDirective);

function formlessDirective ($timeout) {
	return {
		restrict: 'A',
		scope: {
			formlessInstance: '=',
			schema: '='
		},
		require: '?form',
		compile: function () {
			return {
				pre: function (scope, element, attr, form) {
					var originalAddControl = form.$addControl;
					var originalRemoveControl = form.$removeControl;
					form.$addControl = function (control) {
						try {
							$timeout(function () {
								formlessAddValidators(control, scope.formlessInstance, scope.schema);
								control.$validate();
							})
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
			}
		}
	};
}

function formlessAddValidators (control, formlessInstance, formlessSchema) {
	var propName = control.formlessName ? control.formlessName : control.$name;
	var currSchemaProp = formlessSchema[propName];
	if (!currSchemaProp) {
		return;
	}
	var currValidatorsArr = Array.isArray(currSchemaProp) ? currSchemaProp : [currSchemaProp];
	if (!currValidatorsArr) {
		return;
	}
	console.log(currValidatorsArr)
	currValidatorsArr.map(function (validatorObj) {
		return formlessInstance._parseValidatorObj(validatorObj);
	}).forEach(function (filledValidatorObj) {
		var validatorName = filledValidatorObj.validator.name;
		control.$validators[validatorName] = function (modelValue, viewValue) {
			var subModel = {};
			var subSchema = {};
			subModel[propName] = viewValue;
			subSchema[propName] = filledValidatorObj;
			var valResult = formlessInstance.compareSyncOnly(subModel, subSchema);
			return formlessInstance.compareSyncOnly(subModel, subSchema)[propName].passed;
		}
	});
}

formlessDirective.$inject = ['$timeout'];