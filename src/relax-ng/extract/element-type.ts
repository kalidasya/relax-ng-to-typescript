import type { NGSimpElement } from "../simplification/simplified-types.ts";
import { extractAttributes } from "./extract-attributes.ts";
import { extractRefs, textChildrenAllowed } from "./extract-children.ts";
import { extractName } from "./extract-name.ts";
import { normalizeTypeName } from "../typescript/normalize-type-name.ts";

const XML_ELM = { ref: "XMLText" };

export function extractElementType(elm: NGSimpElement, refName: string, prefix: string) {
    const name = extractName(elm) || "";
    const attributes = extractAttributes(elm);
    let children = extractRefs(elm.children[1]).map((ref) => ({
        ref: ref.attributes.name,
    }));
    children.sort((a, b) => a.ref.localeCompare(b.ref));
    // Filter out multiple copies of the same child.
    const childRefs: Set<string> = new Set([]);
    children = children.filter((n) => {
        if (childRefs.has(n.ref)) {
            return false;
        }
        childRefs.add(n.ref);
        return true;
    });

    const textChildren = textChildrenAllowed(elm.children[1]);
    if (textChildren) {
        children.push(XML_ELM);
    }
    return {
        type: "element",
        name: name,
        refName: refName ? refName : normalizeTypeName(name, prefix),
        attributes,
        children,
        textChildrenAllowed: textChildren,
        anyAttributes: name === "anyName",
        hasAttributes: Object.keys(attributes).length > 0,
    };
}

export type ElementTypeDescriptor = ReturnType<typeof extractElementType>;
