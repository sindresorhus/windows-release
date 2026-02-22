import childProcess from 'node:child_process';
import {syncBuiltinESMExports} from 'node:module';
import os from 'node:os';
import test from 'ava';

let mockedModuleCounter = 0;

async function importWindowsReleaseWithMocks(t, {release, spawnSync, execFileSync}) {
	const originalRelease = os.release;
	const originalExecFileSync = childProcess.execFileSync;
	const originalSpawnSync = childProcess.spawnSync;

	const restore = () => {
		os.release = originalRelease;
		childProcess.execFileSync = originalExecFileSync;
		childProcess.spawnSync = originalSpawnSync;
		syncBuiltinESMExports();
	};

	t.teardown(() => {
		restore();
	});

	os.release = () => release;
	childProcess.execFileSync = execFileSync;
	childProcess.spawnSync = spawnSync;
	syncBuiltinESMExports();

	const module = await import(`./index.js?test-server-detection=${mockedModuleCounter}`);
	mockedModuleCounter++;
	return module.default;
}

test.serial('falls back to ProductName when InstallationType query fails', async t => {
	const windowsReleaseWithMockedDependencies = await importWindowsReleaseWithMocks(t, {
		release: '10.0.26100',
		execFileSync() {
			throw new Error('PowerShell unavailable');
		},
		spawnSync(command, arguments_) {
			if (command !== 'reg') {
				return {stdout: undefined};
			}

			const argumentString = arguments_.join(' ');

			if (argumentString.includes('InstallationType')) {
				return {stdout: undefined};
			}

			if (argumentString.includes('ProductName')) {
				return {stdout: 'ProductName    REG_SZ    Windows Server 2025 Datacenter'};
			}

			return {stdout: undefined};
		},
	});

	t.is(windowsReleaseWithMockedDependencies(), 'Server 2025');
});

test.serial('returns desktop release when InstallationType indicates client', async t => {
	let powerShellInvocationCount = 0;
	let productNameQueryCount = 0;

	const windowsReleaseWithMockedDependencies = await importWindowsReleaseWithMocks(t, {
		release: '10.0.26100',
		execFileSync() {
			powerShellInvocationCount++;
			throw new Error('PowerShell should not be called for client installation');
		},
		spawnSync(command, arguments_) {
			if (command !== 'reg') {
				return {stdout: undefined};
			}

			const argumentString = arguments_.join(' ');

			if (argumentString.includes('InstallationType')) {
				return {stdout: 'InstallationType    REG_SZ    Client'};
			}

			if (argumentString.includes('ProductName')) {
				productNameQueryCount++;
			}

			return {stdout: undefined};
		},
	});

	t.is(windowsReleaseWithMockedDependencies(), '11');
	t.is(powerShellInvocationCount, 0);
	t.is(productNameQueryCount, 0);
});

test.serial('uses CIM caption when InstallationType query fails', async t => {
	let productNameQueryCount = 0;

	const windowsReleaseWithMockedDependencies = await importWindowsReleaseWithMocks(t, {
		release: '10.0.26100',
		execFileSync() {
			return 'Microsoft Windows Server 2022 Standard';
		},
		spawnSync(command, arguments_) {
			if (command !== 'reg') {
				return {stdout: undefined};
			}

			const argumentString = arguments_.join(' ');

			if (argumentString.includes('InstallationType')) {
				return {stdout: undefined};
			}

			if (argumentString.includes('ProductName')) {
				productNameQueryCount++;
				return {stdout: 'ProductName    REG_SZ    Windows Server 2025 Datacenter'};
			}

			return {stdout: undefined};
		},
	});

	t.is(windowsReleaseWithMockedDependencies(), 'Server 2022');
	t.is(productNameQueryCount, 0);
});

test.serial('returns desktop release when no server year is detected', async t => {
	const windowsReleaseWithMockedDependencies = await importWindowsReleaseWithMocks(t, {
		release: '10.0.26100',
		execFileSync() {
			throw new Error('PowerShell unavailable');
		},
		spawnSync(command, arguments_) {
			if (command !== 'reg') {
				return {stdout: undefined};
			}

			const argumentString = arguments_.join(' ');

			if (argumentString.includes('InstallationType')) {
				return {stdout: undefined};
			}

			if (argumentString.includes('ProductName')) {
				return {stdout: 'ProductName    REG_SZ    Windows 11 Pro'};
			}

			return {stdout: undefined};
		},
	});

	t.is(windowsReleaseWithMockedDependencies(), '11');
});
