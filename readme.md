# windows-release [![Build Status](https://travis-ci.org/sindresorhus/windows-release.svg?branch=master)](https://travis-ci.org/sindresorhus/windows-release)

> Get the name of a Windows version from the release number: `5.1.2600` → `XP`


## Install

```
$ npm install windows-release
```


## Usage

```js
const os = require('os');
const windowsRelease = require('windows-release');

(async () => {
  // On a Windows XP system
  await windowsRelease();
  //=> 'XP'

  os.release();
  //=> '5.1.2600'

  await windowsRelease(os.release());
  //=> 'XP'

  // On a Windows 10 desktop client
  await windowsRelease('10.0')
  //=> '10'

  // On a Windows 10 server (Server 2016)
  await windowsRelease('10.0')
  //=> 'Server 2016'
});
```


## API

### windowsRelease([release])

Returns a `Promise` for the release name.

### windowsRelease.sync([release])

Returns the release name.

#### release

Type: `string`

By default, the current OS is used, but you can supply a custom release number, which is the output of [`os.release()`](https://nodejs.org/api/os.html#os_os_release).

## Related

- [os-name](https://github.com/sindresorhus/os-name) - Get the name of the current operating system
- [macos-release](https://github.com/sindresorhus/macos-release) - Get the name and version of a macOS release from the Darwin version
- [is-windows-server](https://github.com/MarkTiedemann/is-windows-server) - Binary to distinguish between Windows and Windows Server releases

## License

MIT © [Sindre Sorhus](https://sindresorhus.com)
