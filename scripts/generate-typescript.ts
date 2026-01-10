#!/usr/bin/env node
/**
 * Create TypeScript files for a RELAX-NG grammar.
 *
 * To run:
 * node --experimental-specifier-resolution=node --loader ts-node/esm scripts/generate-typescript
 */

import fs from "node:fs/promises";
import process from "node:process";
import util from "node:util";
import path from "node:path";
import yargs from "yargs/yargs";
import { toXml } from "xast-util-to-xml";
import Prettier from "prettier";
import { removePositionPlugin, unifiedXml } from "../src/xast-utils.ts";
import { doSimplificationPlugin } from "../src/relax-ng/simplification/do-simplification-plugin.ts";
import { makeTypesForGrammar } from "../src/relax-ng/typescript/make-type.ts";
import { renameRefsPlugin } from "../src/relax-ng/typescript/rename-refs-plugin.ts";
import chalk from "chalk";
import type { Root } from "xast";

// Make console.log pretty-print by default
const origLog = console.log;
console.log = (...args) => {
    origLog(...args.map((x) => util.inspect(x, false, 20, true)));
};

const parser = yargs(process.argv.slice(2))
    .option("grammar", {
        alias: "g",
        type: "string",
        description: "RELAX-NG input grammar file (must be XML format)",
        required: true,
    })
    .option("out-dir", {
        alias: "o",
        type: "string",
        description: "Directory to output generated typescript file(s)",
        required: true,
    })
    .option("ts-file-name", {
        alias: "t",
        type: "string",
        description: "Filename of the generated typescript file",
        default: "generated-types.ts",
        required: false,
    })
    .option("createGrammar", {
        alias: "c",
        type: "boolean",
        description: "Create json grammar",
        required: false,
        default: false,
    })
    .option("prefix", {
        alias: "p",
        type: "string",
        default: "Element",
        description: "Prefix to use for all types",
        required: false,
    })
    .help()
    .alias("help", "h");

async function main(settings: ReturnType<typeof parser.parseSync>) {
    const { grammar: grammarFile, outDir, tsFileName, createGrammar } = settings
    let prefix = settings.prefix
    // outDir: string, 
    // prefix: string
    // .grammar, args["out-dir"], args.prefix
    const processor = unifiedXml()
        .use(removePositionPlugin)
        .use(doSimplificationPlugin);
    origLog(chalk.red("Reading grammar from", grammarFile));
    if (prefix && !prefix.endsWith("_")) {
        prefix = prefix + "_"
    }
    const source = await fs.readFile(grammarFile, "utf-8");
    const parsed = processor.parse(source);
    let ast = processor.runSync(parsed as any as Root);
    ast = unifiedXml().use(renameRefsPlugin(prefix)).runSync(ast);

    // Write out the intermediate (simplified) XML
    const formattedXml = await Prettier.format(toXml(ast as any as Root), {
        parser: "xml",
        plugins: ["@prettier/plugin-xml"],
    });
    const xmlOutFile = path.join(outDir, "simplified-grammar.xml");
    origLog(chalk.red("Writing simplified grammar to", xmlOutFile));
    await fs.writeFile(xmlOutFile, formattedXml, "utf-8");

    const grammarTypes = await makeTypesForGrammar(ast.children[0], prefix);

    // Generate types
    const tsOutFile = path.join(outDir, tsFileName);
    origLog(chalk.red("Writing generated types to", tsOutFile));
    const tsOut = await Prettier.format(grammarTypes.typescriptStr, {
        trailingComma: "none",
        parser: "typescript",
    });
    await fs.writeFile(tsOutFile, tsOut, "utf-8");

    // Generate JSON grammar
    if (createGrammar) {
        const jsonOutFile = path.join(outDir, "generated-grammar.ts");
        origLog(chalk.red("Writing JSON grammar to", jsonOutFile));
        const jsonOut = `export const jsonGrammar = ${JSON.stringify(
            grammarTypes.grammar,
            null,
            4,
        )}`;
        await fs.writeFile(jsonOutFile, jsonOut, "utf-8");
    }
}

(async () => {
    const argv = await parser.parse();
    await main(argv);
})();
