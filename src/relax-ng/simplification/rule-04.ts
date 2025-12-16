import type { Plugin } from "unified";
import { visit } from "unist-util-visit";
import type { Root, Element } from "xast";
import { elmMatcher  } from "../../xast-utils.ts";
import type { TypeGuard  } from "../../xast-utils.ts";

function isNotWhitespace(c: Root["children"][number]): boolean {
    if (c.type === "text" && c.value.trim() === "") {
        return false;
    }
    return true;
}

/**
 * For any value element that does not have a type attribute, a type attribute
 * is added with value token and the value of the datatypeLibrary attribute is changed to the empty string.
 */
export const rule4: Plugin<void[], Root, Root> = function () {
    return (tree) => {
        tree.children = tree.children.filter(isNotWhitespace);
        visit(tree, elmMatcher("value") as TypeGuard<Element>, (node) => {
            if (!node.attributes?.type) {
                node.attributes = node.attributes || {};
                node.attributes.type = "token";
            }
            if (node.attributes?.datatypeLibrary) {
                node.attributes.datatypeLibrary = "";
            }
        });
    };
};
