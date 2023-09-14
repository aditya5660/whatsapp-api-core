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
exports.sectionTag = void 0;
/**
 * Section tag is used to define the sections on a given template. Sections cannot be
 * nested and must appear as top level children inside a component.
 */
exports.sectionTag = {
    block: true,
    seekable: true,
    tagName: 'section',
    compile(parser, buffer, token) {
        token.children.forEach((child) => parser.processToken(child, buffer));
    },
};
