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
		if (m.isServerSync()) {
			t.regex(m.sync(), /^Server \d+$/);
		} else {
			t.regex(m.sync(), /^\d+$/);
		}
	} else {
		t.throws(m);
	}
});

test('client', async t => {
	if (process.platform === 'win32') {
		t.regex(await m.client(), /^\d+$/);
	} else {
		await t.throwsAsync(m.client);
	}

	t.is(await m.client('10.0'), '10');
	t.is(await m.client('10.0.1'), '10');
	await t.throwsAsync(() => m.client('0.0'));
});

test('clientSync', t => {
	if (process.platform === 'win32') {
		t.regex(m.clientSync(), /^\d+$/);
	} else {
		t.throws(() => m.clientSync());
	}

	t.is(m.clientSync('10.0'), '10');
	t.is(m.clientSync('10.0.1'), '10');
	t.throws(() => m.clientSync('0.0'));
});
