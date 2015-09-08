'use strict';
var test = require('ava');
var winRelease = require('./');

test(function (t) {
	t.is(winRelease('5.1.2600'), 'XP');
	t.is(winRelease('10.0.10240'), '10');
	t.end();
});
