'use strict';
var test = require('ava');
var winRelease = require('./');

test(function (t) {
	t.assert(winRelease('5.1.2600') === 'XP');
	t.end();
});
