import { describe, it } from "vitest";
import fs from "node:fs/promises";
import util from "node:util";
import { unifiedXml, removePositionPlugin } from "../src/xast-utils.ts";
import { doSimplificationPlugin } from "../src/relax-ng/simplification/do-simplification-plugin.ts";
import { makeTypesForGrammar } from "../src/relax-ng/typescript/make-type.ts";
import type { Root } from "xast";

// Make console.log pretty-print by default
const origLog = console.log;
console.log = (...args) => {
    origLog(...args.map((x) => util.inspect(x, false, 10, true)));
};


describe("relax-ng-parse", () => {
    it("can parse RELAX-NG XML", async () => {
        const processor = unifiedXml()
            .use(removePositionPlugin)
            .use(doSimplificationPlugin);
        const source = await fs.readFile("./resources/pretext.rng", "utf-8");
        const parsed = processor.parse(source) as Root;
        const ast = processor.runSync(parsed);

        //const parsed = (parseRelaxNgBasic(source));
        console.log(makeTypesForGrammar(ast.children[0], ""));

        //const formatted = Prettier.format(toXml(parsed.children[0]!.children[2]), {"parser": "html"})
        //origLog(formatted)
    });
});
