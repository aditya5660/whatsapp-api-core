import { Parser } from 'edge-parser';
import { TagContract } from '../Contracts';
/**
 * List of expressions allowed for the include tag
 */
export declare const ALLOWED_EXPRESSION: ("Identifier" | "MemberExpression" | "CallExpression" | "Literal" | "TemplateLiteral" | "ConditionalExpression" | "LogicalExpression")[];
/**
 * Returns the expression for rendering the partial
 */
export declare function getRenderExpression(parser: Parser, parsedExpression: any): string;
/**
 * Include tag is used to include partials in the same scope of the parent
 * template.
 *
 * ```edge
 * @include('partials.header')
 * ```
 */
export declare const includeTag: TagContract;
