function addValidators (control, formlessInstance, formlessSchema) {
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

module.exports = addValidators;