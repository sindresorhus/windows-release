import test from 'ava';
import { windowsRelease, errors, readProductName } from './index';

const {
	invalidReleaseFormat,
	majorVersionTooOld,
	invalidMajorVersion,
	unknownMinorVersion,
	ambigiousRelease
} = errors;

const {
	releaseArgRequired: releaseArgRequiredNonWindows,
	ambigiousRelease: ambigiousReleaseNonWindows
} = errors.nonWindows;

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

test(invalidMajorVersion(), async t => {
	await t.throwsAsync(() => windowsRelease('7.0'), { message: invalidMajorVersion() });
});

test("'5.0' -> '2000'", async t => {
	t.is(await windowsRelease('5.0'), '2000');
});

test("'5.1' -> 'XP'", async t => {
	t.is(await windowsRelease('5.1'), 'XP');
});

test("'5.2' -> 'XP' || 'Server 2003'", async t => {
	if (process.platform === 'win32') {
		try {
			const name = await windowsRelease('5.2');
			t.truthy(name === 'XP' || name === 'Server 2003');
		} catch (error) {
			const productName = await readProductName();
			t.is(error.message, ambigiousRelease('5.2', productName, 'XP', 'Server 2003'));
		}
	} else {
		await t.throwsAsync(() => windowsRelease('5.2'), {
			message: ambigiousReleaseNonWindows('5.2', 'XP', 'Server 2003')
		});
	}
});

test(unknownMinorVersion(5, 3), async t => {
	await t.throwsAsync(() => windowsRelease('5.3'), { message: unknownMinorVersion(5, 3) });
});

// TODO: write remaining tests
