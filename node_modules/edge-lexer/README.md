# edge-lexer
> Generate tokens by parsing a raw edge markup file

[![gh-workflow-image]][gh-workflow-url] [![npm-image]][npm-url] ![][typescript-image] [![license-image]][license-url] [![synk-image]][synk-url]

Edge lexer produces a list of `tokens` by scanning for [Edge whitelisted syntax](https://github.com/edge-js/syntax).

This module is a blend of a `lexer` and an `AST generator`, since Edge doesn't need a pure [lexer](https://en.wikipedia.org/wiki/Lexical_analysis) that scans for each character. Edge markup is written within other markup languages like **HTML** or **Markdown** and walking over each character is waste of resources.

Instead, this module starts by detecting for the [Edge whitelisted syntax](https://github.com/edge-js/syntax) and then starts the lexical analysis within the detected markup.

<!-- START doctoc generated TOC please keep comment here to allow auto update -->
<!-- DON'T EDIT THIS SECTION, INSTEAD RE-RUN doctoc TO UPDATE -->
## Table of contents

- [Table of contents](#table-of-contents)
- [Highlights](#highlights)
- [Performance](#performance)
- [Usage](#usage)
- [Pre-processing lines](#pre-processing-lines)
- [Terms used](#terms-used)
- [Tokens](#tokens)
		- [Tag Token](#tag-token)
		- [Escaped Tag Token](#escaped-tag-token)
		- [Raw Token](#raw-token)
		- [Comment Token](#comment-token)
		- [NewLine Token](#newline-token)
		- [Mustache Token](#mustache-token)
		- [Safe Mustache Token](#safe-mustache-token)
		- [Escaped Mustache Token](#escaped-mustache-token)
		- [Escaped Safe Mustache Token](#escaped-safe-mustache-token)
- [Properties](#properties)
		- [BlockProp](#blockprop)
		- [Prop](#prop)
- [Mustache expressions](#mustache-expressions)
- [Errors](#errors)
- [Example](#example)
- [Raised exceptions](#raised-exceptions)
- [Maintainers](#maintainers)

<!-- END doctoc generated TOC please keep comment here to allow auto update -->

## Highlights

- Zero dependencies (Actually one dependency that is also to standardize edge errors).
- Just uses one regex statement. That also tested against [safe-regex](https://github.com/substack/safe-regex) for ReDOS
- Allows multiline expressions
- Collects line and columns for accurate stack traces.
- Detects for unclosed tags.
- Detects for unwrapped expressions and raises appropriate errors.

---

## Performance

Following measures are taken to keep the analysis performant.

1. Only analyse markup that is detected as Edge whitelisted syntax.
2. Only analyse `tags`, that are passed to the tokenizer. Which means even if the syntax for tags is whitelisted, the tokeniser will analyse them if they are used by your app.
3. Do not analyse Javascript expression and leave that for [edge-parser](https://github.com/edge-js/parser).
4. Only uses one Regular expression.

---

## Usage

```js
import { Tokenizer } from 'edge-lexer'

const template = `Hello {{ username }}`
const tags = {
  if: {
    block: true,
    seekable: true,
  },
}

// Filename is required to add it to error messages
const options = {
  filename: 'welcome.edge',
}

const tokenizer = new Tokenizer(template, tags, options)

tokenizer.parse()
console.log(tokenizer.tokens)
```

---

## Pre-processing lines

You can also pre-process lines before the tokenizer tokenizes them.

```ts
const options = {
  filename: 'welcome.edge',
  onLine: (line: string) => {
    // transform here and return new string value
    return line
  },
}

const tokenizer = new Tokenizer(template, {}, options)
```

---

## Terms used

This guide makes use of the following terms to identify core pieces of the tokenizer.

| Term                  | Token Type     | Description                                                                                           |
| --------------------- | -------------- | ----------------------------------------------------------------------------------------------------- |
| Tag                   | tag            | Tags are used to define logical blocks in the template engine. For example `if tag` or `include tag`. |
| Escaped Tag           | e\_\_tag       | Escaped tag, Edge will not evaluate it at runtime.                                                    |
| Mustache              | mustache       | Javascript expression wrapped in curly braces. `{{ }}`                                                |
| Safe Mustache         | s\_\_mustache  | Safe mustache, that doesn't escape the output `{{{ }}}`                                               |
| Escaped Mustache      | e\_\_mustache  | Mustache tag that is escaped                                                                          |
| Escaped Safe Mustache | es\_\_mustache | Safe Mustache tag that is escaped                                                                     |
| Raw                   | raw            | A raw string, which has no meaning for the template engine                                            |
| NewLine               | newline        | Newline                                                                                               |
| Comment               | comment        | Edge specific comment block. This will be ripped off in the output.                                   |

---

## Tokens

Following is the list of Nodes returned by the tokenizer.

#### Tag Token

```js
{
  type: 'tag'
  filename: 'eval.edge',
  loc: {
    start: {
      line: 1,
      col: 4
    },
    end: {
      line: 1,
      col: 13
    }
  },
  properties: BlockProp,
  children: []
}
```

#### Escaped Tag Token

```diff
{
- type: 'tag',
+ type: 'e__tag',
  filename: 'eval.edge',
  loc: {
    start: {
      line: 1,
      col: 4
    },
    end: {
      line: 1,
      col: 13
    }
  },
  properties: BlockProp,
  children: []
}
```

#### Raw Token

```js
{
  type: 'raw',
  filename: 'eval.edge',
  line: number,
  value: string
}
```

#### Comment Token

```js
{
  type: 'comment',
  filename: 'eval.edge',
  line: number,
  value: string
}
```

#### NewLine Token

```js
{
  type: 'newline',
  line: number
}
```

#### Mustache Token

```js
{
  type: 'mustache',
  filename: 'eval.edge',
  loc: {
    start: {
      line: 1,
      col: 4
    },
    end: {
      line: 1,
      col: 13
    }
  },
  properties: Prop
}
```

#### Safe Mustache Token

```diff
{
- type: 'mustache',
+ type: 's__mustache',
  filename: 'eval.edge',
  loc: {
    start: {
      line: 1,
      col: 4
    },
    end: {
      line: 1,
      col: 13
    }
  },
  properties: Prop
}
```

#### Escaped Mustache Token

```diff
{
- type: 'mustache',
+ type: 'e__mustache',
  filename: 'eval.edge',
  loc: {
    start: {
      line: 1,
      col: 4
    },
    end: {
      line: 1,
      col: 13
    }
  },
  properties: Prop
}
```

#### Escaped Safe Mustache Token

```diff
{
- type: 'mustache',
+ type: 'es__mustache',
  filename: 'eval.edge',
  loc: {
    start: {
      line: 1,
      col: 4
    },
    end: {
      line: 1,
      col: 13
    }
  },
  properties: Prop
}
```

| Key        | Value  | Description                                                                     |
| ---------- | ------ | ------------------------------------------------------------------------------- |
| type       | string | The type of node determines the behavior of node                                |
| loc        | object | `loc` is only present for tags and mustache tokens                              |
| line       | number | `line` is not present for tags and mustache tokens                              |
| properties | Prop   | Meta data for the node. See [Properties](#properties) to more info              |
| value      | string | If token is a raw or comment token, then value is the string in the source file |
| children   | array  | Array of recursive nodes. Only exists, when token is a tag                      |

---

## Properties

The properties `Prop` is used to define meta data for a given Node. Nodes like `raw`, `comment` and `newline`, doesn't need any metadata.

#### BlockProp

The block prop is used by the `Block` node. The only difference from the regular `Prop` is the addition of `selfclosed` attribute.

```js
{
  name: string
  jsArg: string,
  selfclosed: boolean
}
```

#### Prop

```js
{
  jsArg: string,
}
```

| Key        | Description                                                                                                   |
| ---------- | ------------------------------------------------------------------------------------------------------------- |
| jsArg      | The `jsArg` is the Javascript expression to evaluate. Whitespaces and newlines are preserved inside the jsArg |
| selfclosed | Whether or not the tag was `selfclosed` during usage.                                                         |

---

## Mustache expressions

For mustache nodes props, the `name` is the type of mustache expressions. The lexer supports 4 mustache expressions.

**mustache**

```
{{ username }}
```

**e\_\_mustache (Escaped mustache)**

The following expression is ignored by edge. Helpful when you want this expression to be parsed by a frontend template engine

```
@{{ username }}
```

**s\_\_mustache (Safe mustache)**

The following expression output is considered HTML safe.

```
{{{ '<p> Hello world </p>' }}}
```

**es\_\_mustache (Escaped safe mustache)**

```
@{{{ '<p> Not touched </p>' }}}
```

---

## Errors

Errors raised by the `lexer` are always an instance of [edge-error](https://github.com/edge-js/error) and will contain following properties.

```js
error.message
error.line
error.col
error.filename
error.code
```

---

## Example

```html
{{-- Show username when exists --}} @if(username) {{-- Wrap inside h2 --}}
<h2>Hello {{ username }}</h2>
@endif
```

The output of the above text will be

```json
[
  {
    "type": "comment",
    "filename": "eval.edge",
    "value": " Show username when exists ",
    "loc": {
      "start": {
        "line": 1,
        "col": 4
      },
      "end": {
        "line": 1,
        "col": 35
      }
    }
  },
  {
    "type": "tag",
    "filename": "eval.edge",
    "properties": {
      "name": "if",
      "jsArg": "username",
      "selfclosed": false
    },
    "loc": {
      "start": {
        "line": 2,
        "col": 4
      },
      "end": {
        "line": 2,
        "col": 13
      }
    },
    "children": [
      {
        "type": "newline",
        "filename": "eval.edge",
        "line": 2
      },
      {
        "type": "comment",
        "filename": "eval.edge",
        "value": " Wrap inside h2 ",
        "loc": {
          "start": {
            "line": 3,
            "col": 4
          },
          "end": {
            "line": 3,
            "col": 24
          }
        }
      },
      {
        "type": "newline",
        "filename": "eval.edge",
        "line": 3
      },
      {
        "type": "raw",
        "value": "<h2> Hello ",
        "filename": "eval.edge",
        "line": 4
      },
      {
        "type": "mustache",
        "filename": "eval.edge",
        "properties": {
          "jsArg": " username "
        },
        "loc": {
          "start": {
            "line": 4,
            "col": 13
          },
          "end": {
            "line": 4,
            "col": 25
          }
        }
      },
      {
        "type": "raw",
        "value": " </h2>",
        "filename": "eval.edge",
        "line": 4
      }
    ]
  }
]
```

## Raised exceptions

Following the links to documented error codes raised by the lexer.

- [E_CANNOT_SEEK_STATEMENT](errors/E_CANNOT_SEEK_STATEMENT.md)
- [E_UNCLOSED_CURLY_BRACE](errors/E_UNCLOSED_CURLY_BRACE.md)
- [E_UNCLOSED_PAREN](errors/E_UNCLOSED_PAREN.md)
- [E_UNCLOSED_TAG](errors/E_UNCLOSED_TAG.md)
- [E_UNOPENED_PAREN](errors/E_UNOPENED_PAREN.md)

## Maintainers

[Harminder virk](https://github.com/sponsors/thetutlage)

[gh-workflow-image]: https://img.shields.io/github/workflow/status/edge-js/lexer/test?style=for-the-badge
[gh-workflow-url]: https://github.com/edge-js/lexer/actions/workflows/test.yml "Github action"

[npm-image]: https://img.shields.io/npm/v/edge-lexer.svg?style=for-the-badge&logo=npm
[npm-url]: https://npmjs.org/package/edge-lexer 'npm'

[typescript-image]: https://img.shields.io/badge/Typescript-294E80.svg?style=for-the-badge&logo=typescript

[license-url]: LICENSE.md
[license-image]: https://img.shields.io/github/license/edge-js/lexer?style=for-the-badge

[synk-image]: https://img.shields.io/snyk/vulnerabilities/github/edge-js/lexer?label=Synk%20Vulnerabilities&style=for-the-badge
[synk-url]: https://snyk.io/test/github/edge-js/lexer?targetFile=package.json "synk"
