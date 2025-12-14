import { visit } from "unist-util-visit";
import { expected } from "../../xast-utils";
import {
    ElementTypeDescriptor,
    extractElementType,
} from "../extract/element-type";
import {
    NGSimpDefine,
    NGSimpGrammar,
    NGSimpRef,
} from "../simplification/simplified-types";
import { normalizeTypeName } from "./normalize-type-name";
import { NGMethod } from "../types";
import nunjucks from "nunjucks"
import { toPascalCase } from "./normalize-type-name"


// Basic XML element names
const env = nunjucks.configure({ autoescape: false, trimBlocks: true });
env.addFilter('json', function (str) {
    return JSON.stringify(str);
});
env.addFilter('getter', function (obj, key) {
    if (Array.isArray(obj)) {
        return obj.map((o) => o[key])
    }
    return obj[key];
});
env.addFilter('normalize', function (name, prefix) {
    let ret = toPascalCase(name);
    ret = ret.replace(/[^a-zA-Z0-9_]/g, "");
    return prefix + ret;
});
env.addFilter('quote', function (attr) {
    if (attr.match(/[^a-zA-Z0-9_]/) || attr.charAt(0).match(/[0-9]/)) {
        return JSON.stringify(attr);
    }
    return attr;
});

export type JSONGrammar = {
    startType: string;
    refs: Record<string, JSONGrammarItem>;
};
export type JSONGrammarItem =
    | { type: "text" }
    | { type: "unknown" }
    | ElementTypeDescriptor;

/**
 * Output all types specified by the grammar in both TypeScript
 * form and JSON form.
 */
export async function makeTypesForGrammar(grammar: NGSimpGrammar, prefix: string): Promise<{
    typescriptStr: string;
    grammar: JSONGrammar;
}> {
    const start = grammar.children[0];
    const allDefs = grammar.children.slice(1) as NGSimpDefine[];
    const startRef = start.children[0];
    let startRefs: NGSimpRef[] = [];
    try {
        expected(startRef, "ref");
    } catch {
        startRefs = findAllElementRefInChoices(startRef as any, prefix);
    }
    const startRefNames = startRefs ? startRefs.map((e) => e.attributes.name) : [(startRef as NGSimpRef).attributes.name]

    const allDefsMap: Record<string, NGSimpDefine> = Object.fromEntries(
        allDefs.map((def) => [def.attributes.name, def])
    );

    // `XMLText` is a special node that we create separately
    const exportedRefs: Record<string, JSONGrammarItem> = {
        XMLText: { type: "text" },
    };
    interface Exports {
        prefix: string;
        startElements: string[];
        refs: ElementTypeDescriptor[];
    }
    const exportedTypes: Exports = {
        prefix: prefix,
        startElements: startRefNames.slice(),
        refs: [],
    }
    const queue: string[] = startRefNames;

    // Recursively export all the types that are needed
    while (queue.length > 0) {
        const refName = queue.pop() || "";
        if (!refName || exportedRefs[refName]) {
            continue;
        }
        const ref = allDefsMap[refName];
        if (!ref) {
            // We encountered a type that doesn't have a definition.
            exportedRefs[refName] = { type: "unknown" };
            continue;
        }
        const elm = ref.children[0];
        const typeDesc = extractElementType(elm, refName, prefix);
        exportedTypes.refs.push(typeDesc);

        const dependsOn = typeDesc.children.map((ref) => normalizeTypeName(ref.ref));
        queue.push(...dependsOn);
        exportedRefs[refName] = typeDesc;
    }
    const res = env.render('src/relax-ng/typescript/types-template.njk', exportedTypes);
    return {
        typescriptStr: res,
        grammar: { startType: (startRef as NGSimpRef).attributes.name, refs: exportedRefs },
    };
}

/**
 * Drill down a `<choice>...</choice>` blocks and find all ref
 * whose initial pattern matches the given `namePrefix`.
 */
function findAllElementRefInChoices(elm: NGMethod, namePrefix: string): NGSimpRef[] {
    const allFlatRefs: NGSimpRef[] = [];
    visit(elm as any, "element", (el) => {
        if (el.name === "ref") allFlatRefs.push(el);
    });

    const ret = allFlatRefs.filter((ref) =>
        ref.attributes.name.startsWith(namePrefix)
    );

    if (ret) {
        return ret;
    }
    throw new Error(`Could not find ref with prefix ${namePrefix}`);
}