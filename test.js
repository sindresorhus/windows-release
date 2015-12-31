import test from 'ava';
import fn from './';

test(t => {
	t.is(fn('5.1.2600'), 'XP');
	t.is(fn('10.0.10240'), '10');
});
