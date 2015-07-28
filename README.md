![](https://yabumi.cc/14ecf8c4f119f2be2933bd85.svg)

# Chinachu Air

Most lovely Linux DVR Platform in Japan.
<https://chinachu.moe/>

[![npm version][npm-img]][npm-url]
[![Linux Build][travis-img]][travis-url]
[![Dependency Status][dep-img]][dep-url]
[![devDependency Status][devdep-img]][devdep-url]

[![tip for next commit][tip-img]][tip-url]

[Chinachu “Air” Release Information](https://github.com/kanreisa/Chinachu/wiki/Air)

## Features

* **New** Real-time Web Universal App
* **New** REST API Server
* **New** CLI
* UPnP AV Server
* Multi [Mirakurun](https://github.com/kanreisa/Mirakurun) (Network Tuner) Support
* Multi Storage Support
* [Chinachu Cloud](https://cc.chinachu.moe/) Support

## Requirements

* Linux - x86 / x64
  - Debian / CentOS / Gentoo
  - sysvinit / OpenRC / systemd
* [Node.js](nodejs.org/) `>=0.12.7`
* [Mirakurun](https://github.com/kanreisa/Mirakurun)
* Chrome / Firefox / Edge

## Warnings

* **Don't** expose port 20772 on the internet, not even with NAPT.
* **Don't** share your Chinachu outside your household.

## Installation

```
sudo npm install -g --unsafe chinachu
```
This is all. Yes, magic.

* Web App will launched automatically. - http:// _server-ipv4-local-addr_ :20772/

## CLI

### Administration

#### Config

```
chinachu config [server|operator|mirakuruns]
```
Typically, don't need edit this.

* Also you can config on Web App.
* see: [wiki/Configuration](https://github.com/kanreisa/Chinachu/wiki/Configuration)

#### Log Stream

```
chinachu log [server|operator]
```

#### Service Management

```
chinachu [status|start|stop|restart]
```

## Contributing

### Report an Issue

* https://github.com/kanreisa/Chinachu/issues

When reporting an issue we also need as much information about your environment
that you can include. We never know what information will be pertinent when
trying narrow down the issue. Please include least the following information:

* Version of Chinachu: `sudo npm list -g chinachu`
* Version of Mirakurun: `sudo npm list -g mirakurun`
* Platform you're running on (Debian wheezy, CentOS 7.1, ...)
* Architecture you're running on (x86 or x64)

**Please note: ARM architectures currently not supported.**

### Development

#### Pull Request

Please PR to the [devel-air](https://github.com/kanreisa/Chinachu/tree/devel-air) branch.
Please don't PR to the master branch.

#### Build

```
npm install
npm run tsd-install
npm run build
```

#### Install

```
sudo npm install . -g --unsafe
```

## License

[Apache License, Version 2.0](LICENSE)

**Commercial Support** is provided by [Pixely LLC](https://pixely.jp/).
Please don't hesitate to contact: contact at pixely.jp (EN/JP)

[npm-img]: https://img.shields.io/npm/v/chinachu.svg?style=flat-square
[npm-url]: https://npmjs.org/package/chinachu
[travis-img]: https://img.shields.io/travis/kanreisa/Chinachu.svg?style=flat-square
[travis-url]: https://travis-ci.org/kanreisa/Chinachu
[dep-img]: https://david-dm.org/kanreisa/Chinachu.svg?style=flat-square
[dep-url]: https://david-dm.org/kanreisa/Chinachu
[devdep-img]: https://david-dm.org/kanreisa/Chinachu/dev-status.svg?style=flat-square
[devdep-url]: https://david-dm.org/kanreisa/Chinachu#info=devDependencies
[tip-img]: http://tip4commit.com/projects/689.svg
[tip-url]: http://tip4commit.com/projects/689
