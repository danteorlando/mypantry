(function() {
    'use strict';

    var app = angular.module('app');

    app.filter('convertToDecimal', function ($filter) {
        return function (input) {
            //if (isNaN(input)) return input;
            //return Math.round(input * 10) / 10;
            var a = input.split(' ');
            //alert(a.length)
            var arr = input.split('/');
            //alert(arr[0]);
            //alert(arr[1]);
            return arr[0] / arr[1];
        };
    });

    app.filter('convertToFraction', function ($filter) {
        return function (input) {
            var x = new Fraction(input);
            input = x.toFraction(true); // String "1 22/25"
            return input;
        };
    });

})();