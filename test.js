import test from 'ava';
import m from './';

test(t => {
	t.is(m('5.1.2600'), 'XP');
	t.is(m('10.0.10240'), '10');
	t.is(m('10.0.14393', true), 'Windows 10 (1607), Windows Server 2016');
	t.is(m('10.0.10240', true), 'Windows 10');
});
