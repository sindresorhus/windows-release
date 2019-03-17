import {expectType} from 'tsd-check';
import windowsRelease from '.';

expectType<string>(windowsRelease());
expectType<string>(windowsRelease('5.1.2600'));
