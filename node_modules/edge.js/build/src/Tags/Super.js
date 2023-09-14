"use strict";
/*
 * edge
 *
 * (c) Harminder Virk <virk@adonisjs.com>
 *
 * For the full copyright and license information, please view the LICENSE
 * file that was distributed with this source code.
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.superTag = void 0;
const edge_error_1 = require("edge-error");
/**
 * Super tag is used inside sections to inherit the parent section
 * content.
 *
 * The implementation of super tag is handled by the compiler itself, but we need
 * the tag to exists, so that the lexer can parse it as a tag.
 */
exports.superTag = {
    block: false,
    seekable: false,
    tagName: 'super',
    compile(_, __, token) {
        throw new edge_error_1.EdgeError('@super tag must appear as top level tag inside the @section tag', 'E_ORPHAN_SUPER_TAG', {
            line: token.loc.start.line,
            col: token.loc.start.col,
            filename: token.filename,
        });
    },
};
