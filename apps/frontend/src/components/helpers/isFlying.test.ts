import { describe, expect, it } from "vitest";

import { isFlying } from "./isFlying";

describe("flying entities", () => {
  it("requires both flight coordinates", () => {
    expect(isFlying({ fromX: 1, fromY: 2 })).toBe(true);
    expect(isFlying({ fromX: 1 })).toBe(false);
    expect(isFlying({ fromY: 2 })).toBe(false);
    expect(isFlying({})).toBe(false);
  });
});
