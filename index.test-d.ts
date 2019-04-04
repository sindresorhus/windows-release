import {expectType} from 'tsd';
import windowsRelease = require('.');

expectType<string>(windowsRelease());
expectType<string>(windowsRelease('5.1.2600'));
