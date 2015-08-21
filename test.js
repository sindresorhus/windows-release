'use strict';
var test = require('ava');
var winRelease = require('./');

test(function (t) {
	t.assert(winRelease('5.1.2600') === 'XP');
	t.assert(winRelease('10.0.10240') === '10');
	t.end();
});
