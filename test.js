import test from 'ava';
import m from '.';

// Test using versions strings sourced from https://www.gaijin.at/en/lstwinver.php

test('Windows 95 versions are correctly matched', t => {
	const expected = '95';
	const versions = ['4.00.950', '4.00.1111', '4.03.1212', '4.03.1214'];
	versions.forEach(version => t.is(m(version), expected));
});

test('Windows 98 versions are correctly matched', t => {
	const expected = '98';
	const versions = ['4.10.1998', '4.10.2222'];
	versions.forEach(version => t.is(m(version), expected));
});

test('Windows ME versions are correctly matched', t => {
	const expected = 'ME';
	const versions = ['4.90.2476', '4.90.3000'];
	versions.forEach(version => t.is(m(version), expected));
});

test('Windows 2000 versions are correctly matched', t => {
	const expected = '2000';
	const versions = ['5.0.2031', '5.0.2128', '5.0.2183', '5.0.2195'];
	versions.forEach(version => t.is(m(version), expected));
});

test('Windows XP versions are correctly matched', t => {
	const expected = 'XP';
	const versions = ['5.1.2505', '5.1.2600', '5.1.2600.1105', '5.1.2600.2180'];
	versions.forEach(version => t.is(m(version), expected));
});

test('Windows Server 2003 versions are correctly matched', t => {
	const expected = 'Server 2003';
	const versions = ['5.2.3541', '5.2.3590', '5.2.3660', '5.2.3718', '5.2.3763', '5.2.3790', '5.2.3790.1180', '5.2.3790.1218'];
	versions.forEach(version => t.is(m(version), expected));
});

test('Windows Vista versions are correctly matched', t => {
	const expected = 'Vista';
	const versions = [
		'6.0.5270',
		'6.0.5308',
		'6.0.5342',
		'6.0.5365',
		'6.0.5381',
		'6.0.5384',
		'6.0.5456',
		'6.0.5472',
		'6.0.5536',
		'6.0.5600.16384',
		'6.0.5700',
		'6.0.5728',
		'6.0.5744.16384',
		'6.0.5808',
		'6.0.5824',
		'6.0.5840',
		'6.0.6000.16386',
		'6.0.6000',
		'6.0.6002'
	];
	versions.forEach(version => t.is(m(version), expected));
});

test('Windows 7 versions are correctly matched', t => {
	const expected = '7';
	const versions = ['6.1.7600.16385', '6.1.7600', '6.1.7601'];
	versions.forEach(version => t.is(m(version), expected));
});

test('Windows 8 versions are correctly matched', t => {
	const expected = '8';
	const versions = ['6.2.9200', '6.2.10211'];
	versions.forEach(version => t.is(m(version), expected));
});

test('Windows 8.1 versions are correctly matched', t => {
	const expected = '8.1';
	const versions = ['6.3.9200', '6.3.9600'];
	versions.forEach(version => t.is(m(version), expected));
});

test('Windows 10 versions are correctly matched', t => {
	const expected = '10';
	const versions = ['10.0.10240', '10.0.10586', '10.0.14393'];
	versions.forEach(version => t.is(m(version), expected));
});
