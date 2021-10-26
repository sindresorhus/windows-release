import os from 'node:os';
import execa from 'execa';

// Reference: https://www.gaijin.at/en/lstwinver.php
const names = new Map([
	['11.0', '11'],
	['10.0', '10'],
	['6.3', '8.1'],
	['6.2', '8'],
	['6.1', '7'],
	['6.0', 'Vista'],
	['5.2', 'Server 2003'],
	['5.1', 'XP'],
	['5.0', '2000'],
	['4.9', 'ME'],
	['4.1', '98'],
	['4.0', '95'],
]);

export default function windowsRelease(release) {
	const version = /\d+\.\d/.exec(release || os.release());

	if (release && !version) {
		throw new Error('`release` argument doesn\'t match `n.n`');
	}

	let ver = (version || [])[0];

	// Server 2008, 2012, 2016, 2019 and 2022 versions are ambiguous with desktop versions and must be detected at runtime.
	// If `release` is omitted or we're on a Windows system, and the version number is an ambiguous version
	// then use `wmic` to get the OS caption: https://msdn.microsoft.com/en-us/library/aa394531(v=vs.85).aspx
	// If `wmic` is obsolete (later versions of Windows 10 as well as Windows 11), use PowerShell instead.
	// Try PowerShell with `Get-CimInstance` (more future proof) first, else use `Get-WmiObject`.
	// If the resulting caption contains the year 2008, 2012, 2016, 2019 or 2022, it is a server version, so return a server OS name.
	// Since both Windows 10 and Windows 11 use the same version number (10.0), a check for Windows 11 is done.
	let stdout;
	let win11;
	if ((!release || release === os.release()) && ['6.1', '6.2', '6.3', '10.0'].includes(ver)) {
		try {
			stdout = execa.sync('wmic', ['os', 'get', 'Caption']).stdout || '';
		} catch {
			try {
				stdout = execa.sync('powershell', ['(Get-CimInstance -ClassName Win32_OperatingSystem).Caption']).stdout || '';
			} catch {
				stdout = execa.sync('powershell', ['(Get-WmiObject -ClassName Win32_OperatingSystem).Caption']).stdout || '';
			}
		}

		const year = (stdout.match(/2008|2012|2016|2019|2022/) || [])[0];
		// Check to see if we run Windows 11
		win11 = (stdout.match(/Windows 11/) || [])[0];

		if (year) {
			return `Server ${year}`;
		}
	}

	// Windows 11 check, only needed if we use the `release* argument.
	if (release && ver === '10.0' && release.split('.').slice(2)[0].startsWith('2')) {
		win11 = 'Windows 11';
	}

	if (win11) {
		ver = '11.0';
	}

	return names.get(ver);
}
