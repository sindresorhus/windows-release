import {expectType} from 'tsd';
import windowsRelease from './index.js';

expectType<string>(windowsRelease());
expectType<string>(windowsRelease('5.1.2600'));
