import { unified } from "unified";
import type {Plugin} from "unified"
import type { Node } from "unified/lib";
import { convert } from "unist-util-is";
import { removePosition } from "unist-util-remove-position";
import type { Root, Element as XMLElement, Text as XMLText } from "xast";
import { fromXml } from "xast-util-from-xml";
import { toXml } from "xast-util-to-xml";

type NodeFromRoot = Root["children"][number] & {value: string};

/**
 * Filter a list of XML nodes to ensure that only elements and text nodes are in the list.
 */
export function onlyElementsAndText(nodes: NodeFromRoot[]): (XMLElement | XMLText)[] {
    return nodes.filter(
        (node) => node.type === "element" || node.type === "text"
    ) as (XMLElement | XMLText)[];
}

/**
 * Create a matcher that matches elements with tagName = `name`
 */
export function elmMatcher<T extends string>(
    name: T
): (e: any) => e is XMLElement & { name: T } {
    return convert<XMLElement>({ type: "element", name } as any) as any;
}

/**
 * Returns whether the node is a XAST element
 */
export const isElement = (node: any): node is XMLElement => {
    if (node == null || typeof node !== "object") {
        return false;
    }
    return node.type === "element";
};

/**
 * Recursively remove `prop` from all objects/sub-objects.
 */
export function filterProp<T extends object>(obj: T, prop: string): T {
    const ret = JSON.parse(JSON.stringify(obj));

    function filterPropMut(obj: any) {
        if (obj == null || typeof obj !== "object") {
            return;
        }
        if (Array.isArray(obj)) {
            obj.forEach(filterPropMut);
            return;
        }

        delete obj[prop];
        Object.values(obj).forEach(filterPropMut);
    }

    filterPropMut(ret);

    return ret;
}

/**
 * Throw unless `elm` has the correct tagname
 */
export function expected<T extends string>(
    elm: any,
    expectedTagName?: T | T[]
): asserts elm is XMLElement & { name: typeof expectedTagName } {
    if (!elm) {
        throw new Error(
            `Expected tag name \`${expectedTagName}\` but got \`${elm}\``
        );
    }
    if (!(elm.type === "element")) {
        throw new Error(
            `Expected element type with tag name \`${expectedTagName}\` but got \`${elm}\``
        );
    }
    if (expectedTagName == null) {
        // If no specific tag was given, we don't check anything else
        return;
    }
    if (
        !(
            elm.name === expectedTagName ||
            (Array.isArray(expectedTagName) &&
                expectedTagName.includes(elm.name))
        )
    ) {
        throw new Error(
            `Expected tag name \`${
                Array.isArray(expectedTagName)
                    ? expectedTagName.join("/")
                    : expectedTagName
            }\` but found element ${elm.name}`
        );
    }
}

export const removePositionPlugin: Plugin<void[], Root, Root> = function () {
    return (tree) => {
        removePosition(tree, {force: true});
    };
};

export type TypeGuard<T> = (a: any) => a is T;

function patchedToXml(tree: Node) : string {
    return toXml(tree as Node & {value:string, type: "raw"}, null)
}

export function unifiedXml() {
    return unified()
        .use(function () {
            this.parser = fromXml;
        })
        .use(function () {
            this.compiler = patchedToXml;
        });
}

