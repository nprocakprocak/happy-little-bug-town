import { describe, expect, it } from "vitest";
import { canDropBugOnStack } from "./bugDrop.js";

describe("dropping a bug on a stack", () => {
  it("accepts a single ant and rejects every other bug or a full stack", () => {
    expect(canDropBugOnStack({ bugType: "ant" }, { bugs: [] })).toBe(true);
    expect(canDropBugOnStack({ bugType: "beetle" }, { bugs: [] })).toBe(false);
    expect(canDropBugOnStack({ bugType: "ant" }, { bugs: [{ bugType: "ant" }] })).toBe(false);
  });
});
