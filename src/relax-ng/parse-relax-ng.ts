import { unified } from "unified";
import type { Root } from "xast";
import { fromXml } from "xast-util-from-xml";
import { filterProp } from "../xast-utils.ts";
import { simplifiedGrammarToJson } from "./relax-ng-normalize.ts";
import { doSimplificationPlugin } from "./simplification/do-simplification-plugin.ts";

export function parseRelaxNgBasic(input: string) {
    const processor = unified()
        .use(function () {
            this.Parser = fromXml;
        })
        .use(doSimplificationPlugin);

    let parsed = processor.parse(input) as Root;
    // Remove all position information. We don't care about it and it clutters our output
    parsed = filterProp(parsed, "position");
    parsed = processor.runSync(parsed) as any as Root;

    const postProcessor = unified().use(simplifiedGrammarToJson);
    return postProcessor.runSync(parsed);
}
