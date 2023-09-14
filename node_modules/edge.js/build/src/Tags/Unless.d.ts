import { TagContract } from '../Contracts';
/**
 * Inverse of the `if` condition. The term `unless` is more readable and logical
 * vs using `@if(!expression)`.
 *
 * ```edge
 * @unless(auth.user)
 *   <a href="/login"> Login </a>
 * @endunless
 * ```
 */
export declare const unlessTag: TagContract;
