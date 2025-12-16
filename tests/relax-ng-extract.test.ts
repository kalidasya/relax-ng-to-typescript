import { describe, it, expect } from "vitest";
import util from "node:util";
import Prettier from "prettier";
import { doSimplificationPlugin } from "../src/relax-ng/simplification/do-simplification-plugin.ts";
import { unifiedXml, removePositionPlugin } from "../src/xast-utils.ts";
import { find } from "unist-util-find";
import { extractElementType } from "../src/relax-ng/extract/element-type.ts";
import type { NGSimpElement } from "../src/relax-ng/simplification/simplified-types.ts";
import type { Root } from "xast";

// Make console.log pretty-print by default
const origLog = console.log;
console.log = (...args) => {
  origLog(...args.map((x) => util.inspect(x, false, 10, true)));
};

describe("relax-ng-extract", () => {
  it("can extract element type", async () => {
    const processor = unifiedXml()
      .use(removePositionPlugin)
      .use(doSimplificationPlugin);
    const source = `<grammar><start>
        <element name="ol">
          <optional>
            <attribute name="cols">
             <choice>
               <value>1</value>
               <value>2</value>
               <value>3</value>
               <value>4</value>
               <value>5</value>
             </choice>
            </attribute>
          </optional>
          <optional>
            <attribute name="marker"/>
          </optional>
          <oneOrMore>
            <element name="li">
              <ref name="MetaDataTarget"/>
              <choice>
                <ref name="TextParagraph"/>
                <oneOrMore>
                  <ref name="BlockText"/>
                </oneOrMore>
              </choice>
            </element>
          </oneOrMore>
          <optional>
          <element name="mag">
            <text/>
          </element>
        </optional>
        <zeroOrMore>
          <element name="unit">
            <ref name="UnitSpecification"/>
          </element>
        </zeroOrMore>
        <zeroOrMore>
          <element name="per">
            <ref name="UnitSpecification"/>
          </element>
        </zeroOrMore>
        </element>
        </start>
</grammar>`;
    const parsed = processor.parse(source) as Root;
    const ast = processor.runSync(parsed);

    const ol: NGSimpElement | undefined = find(ast as any, {
      name: "element",
    });
    expect(extractElementType(ol!, "ol", "")).toEqual({
      anyAttributes: false,
      name: "ol",
      type: "element",
      attributes: {
        cols: {
          optional: true,
          type: ['"1"', '"2"', '"3"', '"4"', '"5"'],
        },
        marker: { optional: true, type: ["string"] },
      },
      children: [
        { ref: "li" },
        { ref: "mag" },
        { ref: "per" },
        { ref: "unit" },
      ],
      textChildrenAllowed: false,
      hasAttributes: true,
      refName: "ol",
    });
  });

  it("can create type", async () => {
    const processor = unifiedXml()
      .use(removePositionPlugin)
      .use(doSimplificationPlugin);
    const source = `<grammar><start>
        <element name="ol">
          <optional>
            <attribute name="cols">
             <choice>
               <value>1</value>
               <value>2</value>
               <value>3</value>
               <value>4</value>
               <value>5</value>
             </choice>
            </attribute>
          </optional>
          <optional>
            <attribute name="marker"/>
          </optional>
          <oneOrMore>
              <choice>
                <text />
                <oneOrMore>
                  <ref name="BlockText"/>
                </oneOrMore>
              </choice>
          </oneOrMore>
          <optional>
          <element name="mag">
            <text/>
          </element>
        </optional>
        <zeroOrMore>
          <element name="unit">
            <ref name="UnitSpecification"/>
          </element>
        </zeroOrMore>
        <zeroOrMore>
          <element name="per">
            <ref name="UnitSpecification"/>
          </element>
        </zeroOrMore>
        </element>
        </start>
</grammar>`;
    const parsed = processor.parse(source) as Root;
    const ast = processor.runSync(parsed);
    const processed = String(processor.stringify(ast));

    const formatted = Prettier.format(processed, { parser: "html" });
    //origLog(formatted);
    expect(formatted).toMatchSnapshot();
  });
});
