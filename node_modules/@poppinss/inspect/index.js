/*
 * @poppinss/inspect
 *
 * (c) Harminder Virk <virk@adonisjs.com>
 *
 * For the full copyright and license information, please view the LICENSE
 * file that was distributed with this source code.
*/

const PrettyPrintHtml = require('./src/PrettyPrintHtml');

module.exports = {
  inspect: require('./src/inspect'),
  string: {
    html: (value) => new PrettyPrintHtml().print(value)
  },
}
