# object-inspect
> Fork of [object-inspect](https://github.com/inspect-js/object-inspect) to add support for newlines, indentation and slight modifications to the output.

Convert Javascript datatypes to their string representation. Handles every in-built data type including.

- Objects
- Arrays
- BigInt
- Symbols
- Map/WeakMap
- Set/WeakSet
- Date
- RegExp
- Object literals
- Classes
- String
- Boolean
- Number
- Null
- Undefined
- Error
- Buffer

> **This module will be re-written from scratch soon. So please, do not send any PR's for improvements. However, feel free to report issues and they will be picked up during re-write**.

## Installation

Install the package from npm registry as follows

```sh
npm install @poppinss/object-inspect
```

## Usage

```js
const { inspect } = require('@poppinss/inspect')
inspect({ foo: 'bar', bar: 'baz' })
```

## Pretty print to HTML

```js
const { stringify } = require('@poppinss/inspect')
stringify.html({ foo: 'bar', bar: 'baz' })
```

## Credits

To the original [object-inspect](https://github.com/inspect-js/object-inspect) package. 90% of the code is still the same, we have just made opinionated changes to suit it better to our needs.

I didn't created a PR for the original package, since the modifications are very specific to serve our use case.

# License
MIT
