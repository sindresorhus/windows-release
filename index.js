'use strict';
const childProcess = require('child_process');
const path = require('path');
const os = require('os');

const execRegistry = (query, key) => new Promise((resolve, reject) => {
	const systemRoot = process.env.SystemRoot || 'C:\\Windows';
	const reg = path.join(systemRoot, 'System32', 'reg.exe');
	childProcess.execFile(reg, ['query', query, '/v', key], (error, stdout) =>
		error ? reject(error) : resolve(stdout)
	);
});

module.exports = async () => {
	if (process.platform !== 'win32') {
		throw new Error(`platform \`${process.platform}\` is not supported`);
	}

	const stdout = await execRegistry(
		'HKEY_LOCAL_MACHINE\\SOFTWARE\\Microsoft\\Windows NT\\CurrentVersion',
		'ProductName'
	);
	const productNameRegex = /^\s+ProductName\s+REG_SZ\s+(.+)$/;
	const productNameLine = stdout
		.split('\r\n')
		.find(line => productNameRegex.test(line));
	if (productNameLine === undefined) {
		throw new Error('registry query did not include ProductName');
	}

	const productName = productNameRegex.exec(productNameLine)[1];

	// Windows 10 Pro
	const desktopName = /Windows \d+/.exec(productName);
	if (desktopName !== null) {
		return desktopName[0];
	}

	// Windows Server 2016 Datacenter
	const serverName = /Windows Server \d+/.exec(productName);
	if (serverName !== null) {
		return serverName[0];
	}

	throw new Error('ProductName did not include Windows name');
};

module.exports.isServer = async () => {
	if (process.platform !== 'win32') {
		throw new Error(`platform \`${process.platform}\` is not supported`);
	}

	const stdout = await execRegistry(
		'HKEY_LOCAL_MACHINE\\SOFTWARE\\Microsoft\\Windows NT\\CurrentVersion',
		'InstallationType'
	);
	const installationTypeRegex = /^\s+InstallationType\s+REG_SZ\s+(.+)$/;
	const installationTypeLine = stdout
		.split('\r\n')
		.find(line => installationTypeRegex.test(line));
	if (installationTypeLine === undefined) {
		throw new Error('registry query did not include InstallationType');
	}

	const installationType = installationTypeRegex.exec(installationTypeLine)[1];
	return installationType !== 'Client';
};

module.exports.sync = (release = os.release()) => {
	const regexArray = /\d+\.\d+/.exec(release);
	if (regexArray === null) {
		throw new Error('`release` argument doesn\'t match `n.n`');
	}

	const [version] = regexArray;

	// https://en.wikipedia.org/wiki/List_of_Microsoft_Windows_versions
	const names = new Map([
		['10.0', '10'],
		['6.3', '8.1'],
		['6.2', '8'],
		['6.1', '7'],
		['6.0', 'Vista'],
		['5.2', 'XP'],
		['5.1', 'XP'],
		['5.0', '2000']
	]);
	if (!names.has(version)) {
		throw new Error(`version \`${version}\` is not supported`);
	}

	return names.get(version);
};
