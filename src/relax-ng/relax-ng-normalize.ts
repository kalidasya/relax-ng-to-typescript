import { Plugin, Transformer } from "unified";
import { EXIT, visit } from "unist-util-visit";
import { Root } from "xast";
import { elmMatcher, expected } from "../xast-utils";
import { NGGrammar } from "./types";
import {
    NGSimpGrammar,
} from "./simplification/simplified-types";

/**
 * Turn a REACT-NG grammar that already has the `simplification` steps run
 * into an `NGGrammar`
 */
export const simplifiedGrammarToJson: Plugin<void[], Root, NGGrammar> =
    function (): Transformer<Root, NGGrammar> {
        return (tree) => {
            let grammar: NGSimpGrammar | null = null as NGSimpGrammar | null;
            visit(tree, elmMatcher("grammar"), (node) => {
                grammar = node as any as NGSimpGrammar;
                return EXIT;
            });
            if (!grammar) {
                throw new Error(`Could not find <grammar> element`);
            }

            const start = grammar.children[0];
            expected(start, "start");
            const startRef = start.children[0];
            expected(startRef, "ref");

            return tree as unknown as NGGrammar;
        };
    };
