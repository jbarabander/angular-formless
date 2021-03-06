var difference = require('lodash.difference');
var Formless = require('Formless');
function formlessDirective ($timeout) {
	return {
		restrict: 'A',
		scope: {
			formlessInstance: '=',
			schema: '='
		},
		require: '?form',
		link: {
				pre: function (scope, element, attrs, form) {
					scope.controls = [];
					scope.subModel = {};
					var originalAddControl = form.$addControl.bind(form);
					var originalRemoveControl = form.$removeControl.bind(form);

					form.$addControl = function (control) {
						try {
							scope.controls.push(control);
						} catch (e) {
							console.error('Failed to instatiate Formless controls');
							console.error(e);
						}
						originalAddControl(control);
					}

					form.$removeControl = function (control) {
						try {
							var indexOfControl = scope.controls.indexOf(control);
							scope.controls.splice(indexOfControl, 1);
						} catch (e) {
							console.error('Failed to remove Formless controls');
							console.error(e);
						}
						originalRemoveControl(control);
					}
				},
				post: function (scope, el, attrs, form) {
					var unWatchers = {};
					var internalFormless;
					var defaultFormlessInstance = new Formless();
					scope.setInternalFormless = function (formlessInstanceVal) {
						internalFormless = formlessInstanceVal || defaultFormlessInstance;
						if (attrs.$attr.formlessInstance === 'formless-instance') {
							scope.formlessInstance = internalFormless;
						}
					};
					scope.updateAndValidateControls = function(controls) {
						scope.setInternalFormless(scope.formlessInstance);
						scope.updateWatchersAndSubModel();
						controls.forEach(function (control) {
							formlessAddValidators(control, internalFormless, scope.schema, scope.subModel);
							control.$validate();
						});
					}
					scope.updateWatchersAndSubModel = function () {
						if (!scope.schema || !form) {
							return;
						}
						angular.forEach(scope.subModel, function (control, key) {
							if (!form[key]) {
								delete scope.subModel[key];
								unWatchers[key]();
								delete unWatchers[key];
							}
						});
						angular.forEach(form.$$controls, function (control) {
							var propName = control.formlessName ? control.formlessName : control.$name;
							if (!unWatchers[propName]) {
								// these are about as efficient as watchers can be. 
								// Simple equality watchers that are removed the instant the control is.
								var unWatch = scope.$watch(function () {
									if (form[propName]) {
										return form[propName].$modelValue;
									}
								}, function (newValue) {
									scope.subModel[propName] = newValue;
								})
								unWatchers[propName] = unWatch;
							}
						})
					}
					scope.$watchCollection('controls', function (newControls, oldControls) {
						var addedControls = difference(newControls, oldControls);
						scope.updateAndValidateControls(addedControls)
					});
					$timeout(() => {
						scope.updateAndValidateControls(scope.controls);
					});
				}
			}
	};
}

function formlessAddValidators (control, formlessInstance, formlessSchema, subModel) {
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
			var subSchema = {};
			const localSubModel = Object.assign({}, subModel);
			localSubModel[propName] = modelValue;
			subSchema[propName] = filledValidatorObj;
			return formlessInstance.compareSyncOnly(localSubModel, subSchema)[propName].passed;
		}
	});
}

formlessDirective.$inject = ['$timeout'];

module.exports = formlessDirective;
