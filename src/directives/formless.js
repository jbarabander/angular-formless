var difference = require('lodash.difference');

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
					scope.controls = []
					var originalAddControl = form.$addControl;
					var originalRemoveControl = form.$removeControl;
					form.$addControl = function (control) {
						try {
							scope.controls.push(control);
							// $timeout(function () {
							// 	formlessAddValidators(control, scope.formlessInstance, scope.schema);
							// 	control.$validate();
							// })
						} catch (e) {
							console.error('Failed to instatiate Formless controls');
							console.error(e);
						}
						originalAddControl(control);
					}

					form.$removeControl = function (control) {
						var indexOfControl = scope.controls.indexOf(control)
						scope.controls.splice(indexOfControl, 1)
						try {
							// my additions
						} catch (e) {
							console.error('Failed to remove Formless controls');
							console.error(e);
						}
						originalRemoveControl(control);
					}
				},
				post: function (scope) {
					scope.$watchCollection('controls', function (newControls, oldControls) {
						var addedControls = difference(newControls, oldControls);
						var removedControls = difference(oldControls, newControls);
						addedControls.forEach(function (control) {
							formlessAddValidators(control, scope.formlessInstance, scope.schema);
							control.$validate();
						});
					});
				}
			}
		},
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

module.exports = formlessDirective;
