import type { Plugin } from "unified";
import type { Root } from "xast";
import { rule1 } from "./rule-01.ts";
import { rule2 } from "./rule-02.ts";
import { rule3 } from "./rule-03.ts";
import { rule4 } from "./rule-04.ts";
import { rule5 } from "./rule-05.ts";
import { rule6 } from "./rule-06.ts";
import { rule7 } from "./rule-07.ts";
import { rule8 } from "./rule-08.ts";
import { rule9 } from "./rule-09.ts";
import { rule10 } from "./rule-10.ts";
import { rule11 } from "./rule-11.ts";
import { rule12 } from "./rule-12.ts";
import { rule13 } from "./rule-13.ts";
import { rule14 } from "./rule-14.ts";
import { rule15 } from "./rule-15.ts";
import { rule16 } from "./rule-16.ts";
import { rule17 } from "./rule-17.ts";
import { rule18 } from "./rule-18.ts";
import { rule19 } from "./rule-19.ts";
import { rule20 } from "./rule-20.ts";
import { rule21 } from "./rule-21.ts";
import type { NGSimpRoot } from "./simplified-types.ts";

/**
 * Apply simplification rules defined in https://relaxng.org/spec-20011203.html
 *
 * Note: Rules related to XML namespaces are skipped.
 */
export const doSimplificationPlugin: Plugin<never[], Root, NGSimpRoot> =
    function () {
        this.use(rule1)
            .use(rule2)
            .use(rule3)
            .use(rule4)
            .use(rule5)
            .use(rule6)
            .use(rule7)
            .use(rule8)
            .use(rule9)
            .use(rule10)
            .use(rule11)
            .use(rule12)
            .use(rule13)
            .use(rule14)
            .use(rule15)
            .use(rule16)
            .use(rule17)
            .use(rule18)
            .use(rule19)
            .use(rule20)
            .use(rule21);
    };
