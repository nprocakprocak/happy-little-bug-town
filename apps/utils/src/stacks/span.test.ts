import { describe, expect, it } from "vitest";
import { STACK_SPAN } from "../constants/game.js";
import { getStackSpan } from "./span.js";

describe("stack span", () => {
  it("returns the shared stack footprint", () => {
    expect(getStackSpan()).toBe(STACK_SPAN);
    expect(getStackSpan()).toBe(2);
  });
});
