'use strict';
const childProcess = require('child_process');
const path = require('path');
const os = require('os');
const mem = require('mem');

// Reference:
// - https://www.gaijin.at/en/lstwinver.php
// - https://docs.microsoft.com/en-us/windows/desktop/api/winnt/ns-winnt-_osversioninfoexa#remarks

const nonAmbiguousNames = new Map([
	['5.2', 'Server 2003'],
	['5.1', 'XP'],
	['5.0', '2000'],
	['4.9', 'ME'],
	['4.1', '98'],
	['4.0', '95']
]);

const clientNames = new Map([
	['10.0', '10'],
	['6.3', '8.1'],
	['6.2', '8'],
	['6.1', '7'],
	['6.0', 'Vista']
]);

const serverNames = new Map([
	['10.0', 'Server 2016'],
	['6.3', 'Server 2012'],
	['6.2', 'Server 2012'],
	['6.1', 'Server 2008'],
	['6.0', 'Server 2008']
]);

module.exports = mem(release => {
	const version = /\d+\.\d/.exec(release || os.release());

	if (release && !version) {
		return Promise.reject(new Error('`release` argument doesn\'t match `n.n`'));
	}

	const ver = (version || [])[0];

	if (nonAmbiguousNames.has(ver)) {
		return Promise.resolve(nonAmbiguousNames.get(ver));
	}

	return new Promise(resolve => {
		const isServerExe = path.join(__dirname, 'is-windows-server.exe');
		childProcess.execFile(isServerExe, {encoding: 'utf-8'}, (_, isServer) => {
			resolve(isServer === 'true' ? serverNames.get(ver) : clientNames.get(ver));
		});
	});
});

module.exports.sync = mem(release => {
	const version = /\d+\.\d/.exec(release || os.release());

	if (release && !version) {
		throw new Error('`release` argument doesn\'t match `n.n`');
	}

	const ver = (version || [])[0];

	if (nonAmbiguousNames.has(ver)) {
		return nonAmbiguousNames.get(ver);
	}

	const isServerExe = path.join(__dirname, 'is-windows-server.exe');
	const isServer = childProcess.execFileSync(isServerExe).toString('utf-8');
	if (isServer === 'true') {
		return serverNames.get(ver);
	}

	return clientNames.get(ver);
});
