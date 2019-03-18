import * as os from 'os';
import * as path from 'path';
import * as util from 'util';
import * as childProcess from 'child_process';

export const errors = {
	nonWindows: {
		releaseArgRequired: () => `argument 'release' is required on non-Windows platforms`,
		majorVersionTooNew: () =>
			`major versions newer than '10' (Windows 10, Windows Server 2019) are not supported on non-Windows platforms`,
		ambigiousRelease: (release: string, ...allowedNames: string[]) =>
			`release '${release}' is ambigious (could be ${allowedNames
				.map(x => `'${x}'`)
				.join(', or ')}) and cannot be distinguished on non-Windows platform`
	},
	invalidReleaseFormat: (release: string) => `release '${release}' does not match '/\\d+\\.\\d+/'`,
	invalidMajorVersion: () =>
		`'7', '8', and '9' are not valid major versions (they were skipped between Windows 8.1 -> '6' and Windows 10 -> '10')`,
	unknownMinorVersion: (major: number, minor: number) =>
		`minor version '${minor}' does not exist for major version '${major}'`,
	ambigiousRelease: (release: string, actualName: string, ...allowedNames: string[]) =>
		`release '${release}' is ambigious (could be ${allowedNames
			.map(x => `'${x}'`)
			.join(', or ')}) and cannot be distinguished on '${actualName}'`,
	majorVersionTooOld: () => `major versions older than '5' (Windows 2000) are not supported`
};

export async function windowsRelease(release?: string) {
	if (release === undefined) {
		if (process.platform === 'win32') release = os.release();
		else throw new Error(errors.nonWindows.releaseArgRequired());
	} else if (/\d+\.\d+/.exec(release) === null)
		throw new Error(errors.invalidReleaseFormat(release));

	const [major, minor] = release!.split('.').map(x => parseInt(x, 10));
	if (major < 5) throw new Error(errors.majorVersionTooOld());
	else if (major === 5) {
		if (minor === 0) return '2000';
		else if (minor === 1) return 'XP';
		else if (minor === 2) return await distinguishRelease(release, 'XP', 'Server 2003');
		else throw new Error(errors.unknownMinorVersion(major, minor));
	} else if (major === 6) {
		if (minor === 0) return await distinguishRelease(release, 'Vista', 'Server 2008');
		else if (minor === 1) return await distinguishRelease(release, '7', 'Server 2008');
		else if (minor === 2) return await distinguishRelease(release, '8', 'Server 2012');
		else if (minor === 3) return await distinguishRelease(release, '8.1', 'Server 2012');
		else throw new Error(errors.unknownMinorVersion(major, minor));
	} else if ([7, 8, 9].includes(major)) throw new Error(errors.invalidMajorVersion());
	else if (process.platform === 'win32') return await readName(release);
	else throw new Error(errors.nonWindows.majorVersionTooNew());
}

export async function distinguishRelease(release: string, ...allowedNames: string[]) {
	if (process.platform === 'win32') return await readName(release, ...allowedNames);
	else throw new Error(errors.nonWindows.ambigiousRelease(release, ...allowedNames));
}

export async function readProductName() {
	const systemRoot = process.env.SystemRoot || 'C:\\Windows';
	const reg = path.join(systemRoot, 'System32', 'reg.exe');

	const query = 'HKEY_LOCAL_MACHINE\\SOFTWARE\\Microsoft\\Windows NT\\CurrentVersion';
	const args = ['query', query, '/v', 'ProductName'];

	const execFile = util.promisify(childProcess.execFile);
	const { stdout } = await execFile(reg, args);

	const productNameRegex = /^\s+ProductName\s+REG_SZ\s+(.+)$/;
	const productNameLine = stdout.split('\r\n').find(line => productNameRegex.test(line));
	if (productNameLine === undefined) {
		// TODO: Cleanup error messsage
		throw new Error('registry query did not include ProductName');
	}

	return productNameRegex.exec(productNameLine)![1];
}

export async function readName(release: string, ...allowedNames: string[]) {
	const productName = await readProductName();

	if (allowedNames !== undefined) {
		for (const allowedName of allowedNames)
			if (productName.includes(allowedName)) return allowedName;
		throw new Error(errors.ambigiousRelease(release, productName, ...allowedNames));
	}

	// TODO: Cleanup product name -> version name

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

	throw new Error(`ProductName \`${productName}\` did not include name`);
}
