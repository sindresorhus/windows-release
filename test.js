import test from 'ava';
import m from '.';

test('async', async t => {
	if (process.platform === 'win32') {
		if (await m.isServer()) {
			t.regex(await m(), /^Server \d+$/);
		} else {
			t.regex(await m(), /^\d+$/);
		}
	} else {
		await t.throwsAsync(m);
	}
});

test('sync', t => {
	if (process.platform === 'win32') {
		t.regex(m.sync(), /^\d+$/);
	} else {
		t.throws(() => m.sync());
	}

	t.is(m.sync('10.0'), '10');
	t.is(m.sync('10.0.1'), '10');
	t.throws(() => m.sync('0.0'));
});
