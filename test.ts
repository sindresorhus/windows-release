import test, { ExecutionContext } from 'ava';
import { windowsRelease, _errors, _readName } from './index';

const {
	invalidReleaseFormat,
	majorVersionTooOld,
	invalidMajorVersion,
	unknownMinorVersion,
	ambigiousRelease
} = _errors;

const {
	releaseArgRequired: releaseArgRequiredNonWindows,
	ambigiousRelease: ambigiousReleaseNonWindows,
	majorVersionTooNew: majorVersionTooNewNonWindows
} = _errors.nonWindows;

test(releaseArgRequiredNonWindows(), async t => {
	if (process.platform !== 'win32') {
		await t.throwsAsync(() => windowsRelease(), { message: releaseArgRequiredNonWindows() });
	} else t.pass();
});

test(invalidReleaseFormat('a'), async t => {
	await t.throwsAsync(() => windowsRelease('a'), { message: invalidReleaseFormat('a') });
});

test(majorVersionTooOld(), async t => {
	await t.throwsAsync(() => windowsRelease('4.0'), { message: majorVersionTooOld() });
});

test("'5.0' -> '2000'", async t => {
	t.is(await windowsRelease('5.0'), '2000');
});

test("'5.1' -> 'XP'", async t => {
	t.is(await windowsRelease('5.1'), 'XP');
});

test("'5.2' -> 'XP' || 'Server 2003'", async t => {
	await testDistinguish(t, '5.2', 'XP', 'Server 2003');
});

test(unknownMinorVersion(5, 3), async t => {
	await t.throwsAsync(() => windowsRelease('5.3'), { message: unknownMinorVersion(5, 3) });
});

test("'6.0' -> 'Vista' || 'Server 2008'", async t => {
	await testDistinguish(t, '6.0', 'Vista', 'Server 2008');
});

test("'6.1' -> '7' || 'Server 2008'", async t => {
	await testDistinguish(t, '6.1', '7', 'Server 2008');
});

test("'6.2' -> '8' || 'Server 2012'", async t => {
	await testDistinguish(t, '6.2', '8', 'Server 2012');
});

test("'6.3' -> '8.1' || 'Server 2012'", async t => {
	await testDistinguish(t, '6.3', '8.1', 'Server 2012');
});

test(unknownMinorVersion(6, 4), async t => {
	await t.throwsAsync(() => windowsRelease('6.4'), { message: unknownMinorVersion(6, 4) });
});

test(invalidMajorVersion(), async t => {
	await t.throwsAsync(() => windowsRelease('7.0'), { message: invalidMajorVersion() });
});

// TODO: Test Windows 10

test(majorVersionTooNewNonWindows(), async t => {
	if (process.platform !== 'win32') {
		await t.throwsAsync(() => windowsRelease('99.99'), { message: majorVersionTooNewNonWindows() });
	} else t.pass();
});

async function testDistinguish(t: ExecutionContext, release: string, ...allowedNames: string[]) {
	if (process.platform === 'win32') {
		try {
			const name = await windowsRelease(release);
			t.truthy(allowedNames.includes(name));
		} catch (error) {
			const actualName = await _readName(release);
			t.is(error.message, ambigiousRelease(release, actualName, ...allowedNames));
		}
	} else {
		await t.throwsAsync(() => windowsRelease(release), {
			message: ambigiousReleaseNonWindows(release, ...allowedNames)
		});
	}
}
