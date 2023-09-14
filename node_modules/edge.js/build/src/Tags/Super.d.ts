import { TagContract } from '../Contracts';
/**
 * Super tag is used inside sections to inherit the parent section
 * content.
 *
 * The implementation of super tag is handled by the compiler itself, but we need
 * the tag to exists, so that the lexer can parse it as a tag.
 */
export declare const superTag: TagContract;
