'use strict';
const childProcess = require('child_process');
const path = require('path');
const os = require('os');
const util = require('util');

const systemRoot = process.env.SystemRoot || 'C:\\Windows';
const reg = path.join(systemRoot, 'System32', 'reg.exe');

const execRegistrySync = (query, key) => childProcess.execFileSync(reg, ['query', query, '/v', key]).toString();
const execRegistry = (query, key) => util.promisify(childProcess.execFile)(reg, ['query', query, '/v', key]).then(({stdout}) => stdout);

const currentVersion = 'HKEY_LOCAL_MACHINE\\SOFTWARE\\Microsoft\\Windows NT\\CurrentVersion';

const windowsRelease = async () => {
	if (process.platform !== 'win32') {
		throw new Error(`platform \`${process.platform}\` is not supported`);
	}

	const stdout = await execRegistry(currentVersion, 'ProductName');
	const productNameRegex = /^\s+ProductName\s+REG_SZ\s+(.+)$/;
	const productNameLine = stdout
		.split('\r\n')
		.find(line => productNameRegex.test(line));
	if (productNameLine === undefined) {
		throw new Error('registry query did not include ProductName');
	}

	const productName = productNameRegex.exec(productNameLine)[1];

	// Windows 10 Pro
	const desktopName = /Windows (\d+)/.exec(productName);
	if (desktopName !== null) {
		return desktopName[1];
	}

	// Windows Server 2016 Datacenter
	const serverName = /Windows (Server \d+)/.exec(productName);
	if (serverName !== null) {
		return serverName[1];
	}

	throw new Error(`ProductName \`${productName}\` did not include Windows name`);
};

const windowsReleaseSync = () => {
	if (process.platform !== 'win32') {
		throw new Error(`platform \`${process.platform}\` is not supported`);
	}

	const stdout = execRegistrySync(currentVersion, 'ProductName');
	const productNameRegex = /^\s+ProductName\s+REG_SZ\s+(.+)$/;
	const productNameLine = stdout
		.split('\r\n')
		.find(line => productNameRegex.test(line));
	if (productNameLine === undefined) {
		throw new Error('registry query did not include ProductName');
	}

	const productName = productNameRegex.exec(productNameLine)[1];

	// Windows 10 Pro
	const desktopName = /Windows (\d+)/.exec(productName);
	if (desktopName !== null) {
		return desktopName[1];
	}

	// Windows Server 2016 Datacenter
	const serverName = /Windows (Server \d+)/.exec(productName);
	if (serverName !== null) {
		return serverName[1];
	}

	throw new Error(`ProductName \`${productName}\` did not include Windows name`);
};

module.exports = windowsRelease;
module.exports.sync = windowsReleaseSync;

const isServer = async () => {
	if (process.platform !== 'win32') {
		throw new Error(`platform \`${process.platform}\` is not supported`);
	}

	const stdout = await execRegistry(currentVersion, 'InstallationType');
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

const isServerSync = () => {
	if (process.platform !== 'win32') {
		throw new Error(`platform \`${process.platform}\` is not supported`);
	}

	const stdout = execRegistrySync(currentVersion, 'InstallationType');
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

module.exports.isServer = isServer;
module.exports.isServerSync = isServerSync;

const clientSync = release => {
	if (!release) {
		if (process.platform === 'win32') {
			release = os.release();
		} else {
			throw new Error('`release` argument must be provided on non-Windows platforms');
		}
	}

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

	// TODO: if major version is less, throw unsupported
	// TODO: if major version is equal but minor is different, throw unsupported
	// TODO: if major is higher, run fallback

	if (!names.has(version)) {
		throw new Error(`version \`${version}\` is not supported`);
	}

	return names.get(version);
};

module.exports.client = async release => clientSync(release);
module.exports.clientSync = clientSync;

module.exports.server = async _ => {};
module.exports.serverSync = _ => {};
