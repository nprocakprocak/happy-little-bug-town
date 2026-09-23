import { describe, expect, it } from "vitest";
import { isCraftableBugType } from "./craftable.js";

describe("craftable bug types", () => {
  it("recognises bugs that come from production structures", () => {
    expect(isCraftableBugType("ant")).toBe(true);
    expect(isCraftableBugType("bee")).toBe(true);
    expect(isCraftableBugType("beetle")).toBe(false);
    expect(isCraftableBugType("greenfly")).toBe(false);
    expect(isCraftableBugType("")).toBe(false);
  });
});
