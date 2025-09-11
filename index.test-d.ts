import {expectType} from 'tsd';
import windowsRelease from './index.js';

expectType<string | undefined>(windowsRelease());
expectType<string | undefined>(windowsRelease('5.1.2600'));
