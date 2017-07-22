'use strict';
var os = require('os');
var semver = require('semver');

var fullNameMap = {
 '6.1.7600': 'Windows 7',
 '6.1.7601': 'Windows 7, SP1',
 '6.1.7600.16385': 'Windows Server 2008 R2',
 '6.1.7601': 'Windows Server 2008 R2, SP1',
 '6.1.8400': 'Windows Home Server 2011',
 '6.2.9200': 'Windows 8, Windows Server 2012',
 '6.3.9200': 'Windows 8.1, Windows Server 2012 R2',
 '6.3.9600': 'Windows 8.1, Update 1',
 '10.0.10240': 'Windows 10',
 '10.0.10586': 'Windows 10 (1511)',
 '10.0.14393': 'Windows 10 (1607), Windows Server 2016',
};

var nameMap = {
	'10.0': '10',
	'6.3': '8.1',
	'6.2': '8',
	'6.1': '7',
	'6.0': 'Vista',
	'5.1': 'XP',
	'5.0': '2000',
	'4.9': 'ME',
	'4.1': '98',
	'4.0': '95'
};

module.exports = function (release, fullName) {
	if (fullName) {
		return fullNameMap[release || os.release()];
	}
	var verRe = /\d+\.\d+/;
	var version = verRe.exec(release || os.release());

	// workaround for Windows 10 on node < 3.1.0
	if (!release && process.platform === 'win32' &&
		semver.satisfies(process.version, '>=0.12.0 <3.1.0')) {
		try {
			version = verRe.exec(String(require('child_process').execSync('ver.exe', {timeout: 2000})));
		} catch (err) {}
	}

	if (release && !version) {
		throw new Error('`release` argument doesn\'t match `n.n`');
	}

	return nameMap[(version || [])[0]];
};
