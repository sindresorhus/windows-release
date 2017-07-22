/* eslint-disable quote-props */

'use strict';
const os = require('os');
const execa = require('execa');

// Reference: https://www.gaijin.at/en/lstwinver.php
const nameMap = {
	'10.0': '10',
	'6.3': '8.1',
	'6.2': '8',
	'6.1': '7',
	'6.0': 'Vista',
	'5.2': 'Server 2003',
	'5.1': 'XP',
	'5.0': '2000',
	'4.9': 'ME',
	'4.1': '98',
	'4.0': '95'
};

module.exports = release => {
	const verRe = /\d+\.\d+/;
	const version = verRe.exec(release || os.release());

	if (release && !version) {
		throw new Error('`release` argument doesn\'t match `n.n`');
	}

	const ver = (version || [])[0];

	// Server 2008, 2012 and 2016 version are ambiguous with desktop release versions
	if (!release && ['6.1', '6.2', '6.3', '10.0'].indexOf(ver) !== -1) {
		const stdout = execa.sync('wmic', ['os', 'get', 'Caption']).stdout || '';
		const year = (stdout.match(/2008|2012|2016/) || [])[0];
		if (year) {
			return `Server ${year}`;
		}
	}

	return nameMap[ver];
};
