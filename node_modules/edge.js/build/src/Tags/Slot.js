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
exports.slotTag = void 0;
const edge_error_1 = require("edge-error");
/**
 * Slot tag is used to define the slots of a given component. Slots cannot be
 * nested and must appear as top level children inside a component.
 */
exports.slotTag = {
    block: true,
    seekable: true,
    tagName: 'slot',
    noNewLine: true,
    compile(_, __, token) {
        throw new edge_error_1.EdgeError('@slot tag must appear as top level tag inside the @component tag', 'E_ORPHAN_SLOT_TAG', {
            line: token.loc.start.line,
            col: token.loc.start.col,
            filename: token.filename,
        });
    },
};
