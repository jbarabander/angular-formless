function removeValidators (control, formlessInstance, formlessSchema) {
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
		delete control.$validator[validatorName];
	});
}

module.exports = removeValidators;