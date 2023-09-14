/*
 * edge
 *
 * (c) Harminder Virk <virk@adonisjs.com>
 *
 * For the full copyright and license information, please view the LICENSE
 * file that was distributed with this source code.
*/

/**
 * Pretty prints an Object with colors and formatting. Code is copied from
 * https://www.npmjs.com/package/pretty-print-json package and then tweaked
 * to fit our use cases.
 */

const inspect = require('./inspect');

const styles = {
  string: 'color: rgb(173, 219, 103);',
  key: 'color: rgb(127, 219, 202);',
  boolean: 'color: rgb(247, 140, 108);',
  number: 'color: rgb(199, 146, 234);',
  bigInt: 'color: rgb(199, 146, 234);',
  set: 'color: rgb(255, 203, 139);',
  map: 'color: rgb(255, 203, 139);',
  symbol: 'color: rgb(255, 203, 139);',
  null: 'color: rgb(255, 203, 139);',
  function: 'color: rgb(255, 203, 139);',
  regex: 'color: rgb(255, 86, 86);',
  error: 'color: rgb(255, 86, 86);',
  weakMap: 'color: #f8f8f8;',
  weakSet: 'color: #f8f8f8;',
  circular: 'color: #f8f8f8;',
  'undefined': 'color: #999;',
  pre: `
    padding: 30px 25px;
    background-color: rgb(6, 21, 38);
    color: rgb(214, 222, 235);
    border-radius: 6px;
    font-size: 14px;
    overflow: auto;
    white-space: pre;
    word-spacing: normal;
    word-break: normal;
    word-wrap: normal;
    tab-size: 4;
    line-height: 1.4;
    text-align: left;
  `,
  code: `font-family: JetBrains Mono, Menlo, Monaco, monospace;`
}

module.exports = class PrettyPrint {
  /**
   * Return a boolean telling if the variable name is a
   * standard global
   */
  isStandardGlobal (name) {
    return ['inspect', 'truncate', 'excerpt', 'safe'].includes(name);
  }

  /**
   * Encode html
   */
  encodeHTML (value) {
    return value
      .replace(/&/g, '&amp;')
      .replace(/\\"/g, '&bsol;&quot;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;');
  }

  /**
   * Build HTML value of the key
   */
  buildValueHtml (value) {
    let type = 'number';

    if (value.startsWith('"[Function')) {
      type = 'function';
      value = value.substring(1, value.length - 1);
    } else if (value === '"undefined"') {
      type = 'undefined';
      value = 'undefined';
    } else if (value === '"[Circular]"') {
      type = 'circular';
      value = '[Circular]';
    } else if (value === '"WeakSet {?}"') {
      type = 'weakSet';
      value = 'WeakSet {?}';
    } else if (value === '"WeakMap {?}"') {
      type = 'weakMap';
      value = 'WeakMap {?}';
    } else if (value.startsWith('"Symbol')) {
      type = 'symbol';
      value = value.substring(1, value.length - 1);
    } else if (value.startsWith('"Error')) {
      type = 'error';
      value = value.substring(1, value.length - 1).replace('Error ', '');
    } else if (value.startsWith('"RegExp')) {
      type = 'regex';
      value = value.substring(1, value.length - 1).replace('RegExp ', '');
    } else if (value.endsWith('n"')) {
      type = 'bigInt';
      value = value.substring(1, value.length - 1);
    } else if (value.startsWith('"Set(')) {
      type = 'set';
      const parts = value.split(') [')
      if (parts.length === 2) {
        const prefix = `<span style="${styles.undefined}">${parts[0].substr(1)})</span>`;
        const values = `<span style="${styles.set}">[${parts[1].slice(0, -1)}</span>`;
        return `${prefix} ${values}`;
      }
    } else if (value.startsWith('"Map(')) {
      type = 'set';
      const parts = value.split(') [')
      if (parts.length === 2) {
        const prefix = `<span style="${styles.undefined}">${parts[0].substr(1)})</span>`;
        const values = `<span style="${styles.map}">[${parts[1].slice(0, -1)}</span>`;
        return `${prefix} ${values}`;
      }
    } else if (value === '"<empty item>"') {
      type = 'undefined';
      value = '<empty item>';
    } else if (/^"/.test(value)) {
      type = 'string';
      value = value.substring(1, value.length - 1);
    } else if (['true', 'false'].includes(value)) {
      type = 'boolean';
    } else if (value === 'null') {
      type = 'null';
    }
    return `<span style="${styles[type]}">${this.encodeHTML(value)}</span>`;
  }

  /**
   * Build individual lines inside JSON
   */
  replacer (_, p1, p2, p3, p4) {
    const part = { indent: p1, key: p2, value: p3, end: p4 };
    const findNameRegex = /(.*)(): /;
    const indentHtml = part.indent || '';
    const keyName = part.key && part.key.replace(findNameRegex, '$1$2');
    const keyHtml = part.key ? `<span style="${styles.key}">${keyName}</span>: ` : '';
    const valueHtml = part.value ? this.buildValueHtml(part.value) : '';
    let endHtml = part.end || '';
    return indentHtml + keyHtml + valueHtml + endHtml;
  }

  processJson (value) {
    const jsonLineRegex = /^( *)("[^"]+": )?("[^"].*"|[\w.+-]*)?([{}[\],]*)?$/mg;
    return value.replace(jsonLineRegex, this.replacer.bind(this));
  }

  /**
   * Pretty print by converting the value to JSON string first
   */
  print (value) {
    const json = inspect(value);
    return `<pre style="${styles.pre}"><code style="${styles.code}">${this.processJson(json)}</code></pre>`;
  }
}
