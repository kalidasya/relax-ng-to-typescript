import type { Plugin } from "unified";
import { visit } from "unist-util-visit";
import type { Root, Element } from "xast";
import { x } from "xastscript";
import { elmMatcher } from "../../xast-utils.ts";
import type { TypeGuard } from "../../xast-utils.ts";

/**
 * Simplification steps from https://relaxng.org/spec-20011203.html
 */

/**
 * An optional element is transformed into a choice with empty
 */
export const rule14: Plugin<void[], Root, Root> = function () {
    return (tree) => {
        visit(
            tree,
            elmMatcher("optional") as TypeGuard<Element>,
            (node, file, parent) => {
                if (!parent) {
                    return;
                }
                parent.children = parent.children.flatMap((n) => {
                    if (n === node) {
                        return x("choice", [...node.children, x("empty")]);
                    }
                    return n;
                });
            }
        );
    };
};
