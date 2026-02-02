import os from 'node:os';
import {spawnSync} from 'node:child_process';
import {executePowerShellSync} from 'powershell-utils';

// Reference: https://www.gaijin.at/en/lstwinver.php
// Windows 11 reference: https://docs.microsoft.com/en-us/windows/release-health/windows11-release-information
const names = new Map([
	['10.0.2', '11'], // It's unclear whether future Windows 11 versions will use this version scheme: https://github.com/sindresorhus/windows-release/pull/26/files#r744945281
	['10.0', '10'],
	['6.3', '8.1'],
	['6.2', '8'],
	['6.1', '7'],
	['6.0', 'Vista'],
	['5.2', 'Server 2003'],
	['5.1', 'XP'],
	['5.0', '2000'],
	['4.90', 'ME'],
	['4.10', '98'],
	['4.03', '95'],
	['4.00', '95'],
]);

export default function windowsRelease(release) {
	const versionMatch = /(\d+\.\d+)(?:\.(\d+))?/.exec(release || os.release());

	if (release && !versionMatch) {
		throw new Error('`release` argument doesn\'t match `n.n`');
	}

	let version = versionMatch[1] ?? '';
	const build = versionMatch[2] ?? '';

	// Server 2008, 2012, 2016, and 2019 versions are ambiguous with desktop versions and must be detected at runtime.
	// If `release` is omitted or we're on a Windows system, and the version number is an ambiguous version
	// then query the registry for the product name (always in English, no elevation required, works in restricted environments like Azure App Service).
	// If the product name contains the year 2008, 2012, 2016, 2019, 2022, or 2025, it is a server version, so return a server OS name.
	if ((!release || release === os.release()) && ['6.1', '6.2', '6.3', '10.0'].includes(version)) {
		try {
			const stdout = spawnSync('reg', ['query', String.raw`HKLM\SOFTWARE\Microsoft\Windows NT\CurrentVersion`, '/v', 'ProductName'], {encoding: 'utf8'}).stdout
				|| executePowerShellSync('(Get-CimInstance -ClassName Win32_OperatingSystem).caption');

			const year = (stdout.match(/2008|2012|2016|2019|2022|2025/) || [])[0];

			if (year) {
				return `Server ${year}`;
			}
		} catch {}
	}

	// Windows 11 and Windows 10 build number validation for version 10.0
	if (version === '10.0' && build) {
		const buildNumber = Number.parseInt(build, 10);

		if (buildNumber >= 22_000 && buildNumber <= 30_000) {
			// Windows 11: build 22000 to 30000 (reasonable upper bound for future versions)
			version = '10.0.2';
		} else if (buildNumber >= 10_240 && buildNumber <= 19_045) {
			// Windows 10: build 10240 to 19045 - keep version as '10.0'
		} else {
			// Invalid build number - return undefined
			return undefined;
		}
	}

	return names.get(version);
}
