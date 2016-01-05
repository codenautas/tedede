# tedede
TDD

![designing](https://img.shields.io/badge/stability-designing-red.svg)
[![npm-version](https://img.shields.io/npm/v/tedede.svg)](https://npmjs.org/package/tedede)
[![downloads](https://img.shields.io/npm/dm/tedede.svg)](https://npmjs.org/package/tedede)
[![build](https://img.shields.io/travis/codenautas/tedede/master.svg)](https://travis-ci.org/codenautas/tedede)
[![coverage](https://img.shields.io/coveralls/codenautas/tedede/master.svg)](https://coveralls.io/r/codenautas/tedede)
[![climate](https://img.shields.io/codeclimate/github/codenautas/tedede.svg)](https://codeclimate.com/github/codenautas/tedede)
[![dependencies](https://img.shields.io/david/codenautas/tedede.svg)](https://david-dm.org/codenautas/tedede)
[![qa-control](http://codenautas.com/github/codenautas/tedede.svg)](http://codenautas.com/github/codenautas/tedede)



language: ![English](https://raw.githubusercontent.com/codenautas/multilang/master/img/lang-en.png)
also available in:
[![Spanish](https://raw.githubusercontent.com/codenautas/multilang/master/img/lang-es.png)](LEEME.md)


## Install


```sh
$ npm install -g tedede
```


## Usage (command-line)


```sh
$ pwd
/home/user/npm-packages/this-module
```


```sh
$ tedede --list-langs
Available languages: en es

$ tedede .
Done without warnings!
```


## Usage (code)


```js
var qaControl = require('tedede');

qaControl.controlProject('./path/to/my/project').then(function(warnings){
    console.log(warnings);
});

```

## License

[MIT](LICENSE)

----------------


