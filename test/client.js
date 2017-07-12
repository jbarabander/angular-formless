(function () {
    angular.module('formless-test', ['formless']);
    angular.module('formless-test').directive('testForm', function () {
        return {
            restrict: 'E',
            template: `
            <form name="fakeForm" formless schema="schema" formless-instance="formlessInstance">
                <div>
                    <div><label>Is Number</label></div>
                    <input type="number" name="testInput1" ng-model="testInput1" />
                    <div ng-show="fakeForm.testInput1.$error.formlessIsNumber">This is not a number</div>
                </div>
                <div ng-if="showDate">
                    <div><label>Is Date</label></div>
                    <input type="text" name="testInput2" ng-model="testInput2" />
                    <div ng-show="fakeForm.testInput2.$error.formlessIsDate">This is not a date</div>
                </div>
                <button ng-click="toggleDate()">Toggle Date</button>
                <pre>{{fakeForm | json}}</pre>
            </form>
            `,
            link: function (scope, element, attr) {
                scope.formlessInstance = new Formless();
                scope.showDate = true;
                scope.schema = {
                    testInput1: 'formlessIsNumber',
                    testInput2: 'formlessIsDate'
                }
                scope.toggleDate = function () {
                    scope.showDate = !scope.showDate;
                }
            }
        }
    })
})()