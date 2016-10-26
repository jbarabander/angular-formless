var difference = require('lodash.difference');
var addValidators = require('../utilities/addValidators');
// var removeValidators = require('../utilities/removeValidators');

function formlessDirective () {
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
							addValidators(control, scope.formlessInstance, scope.schema);
							control.$validate();
						});
					});
				}
			}
		},
	};
}

module.exports = formlessDirective;
