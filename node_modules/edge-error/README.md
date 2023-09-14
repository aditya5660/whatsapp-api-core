# edge-error
> Create errors with custom stack trace pointing to a ".edge" file

[![github-actions-image]][github-actions-url] [![npm-image]][npm-url] [![license-image]][license-url] [![typescript-image]][typescript-url]

The package extends the native Error class and adds support for pushing an error stack frame pointing to a ".edge" template file.

## Usage
Install the package from the npm packages registry.

```bash
npm i edge-error

# yarn
yarn add edge-error
```

Then use it as follows

```js
import { EdgeError } from 'edge-error'

throw new EdgeError('message', 'status', {
  line: 1,
  col: 2,
  filename: 'absolute/path/to/index.edge'
})
```

[github-actions-image]: https://img.shields.io/github/workflow/status/edge-js/error/test?style=for-the-badge
[github-actions-url]: https://github.com/edge-js/error/actions/workflows/test.yml "github-actions"

[npm-image]: https://img.shields.io/npm/v/edge-error.svg?style=for-the-badge&logo=npm
[npm-url]: https://npmjs.org/package/edge-error "npm"

[license-image]: https://img.shields.io/npm/l/edge-error?color=blueviolet&style=for-the-badge
[license-url]: LICENSE.md "license"

[typescript-image]: https://img.shields.io/badge/Typescript-294E80.svg?style=for-the-badge&logo=typescript
[typescript-url]:  "typescript"
