import test from 'ava';
import m from '.';

test(t => {
	t.is(m('5.1.2600'), 'XP');
	t.is(m('10.0.10240'), '10');
});
