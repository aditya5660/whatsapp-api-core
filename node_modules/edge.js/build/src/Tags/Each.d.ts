import { TagContract } from '../Contracts';
/**
 * Each tag is used to run a foreach loop on arrays and even objects.
 *
 * ```edge
 * @each((user, index) in users)
 *   {{ user }} {{ index }}
 * @endeach
 * ```
 */
export declare const eachTag: TagContract;
