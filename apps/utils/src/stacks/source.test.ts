import { describe, expect, it } from "vitest";
import { INFINITE_SOURCE_THRESHOLD } from "../constants/game.js";
import { isInfiniteSource } from "./source.js";

describe("infinite source", () => {
  it("treats a count at or above the threshold as infinite", () => {
    expect(isInfiniteSource(INFINITE_SOURCE_THRESHOLD - 1)).toBe(false);
    expect(isInfiniteSource(INFINITE_SOURCE_THRESHOLD)).toBe(true);
    expect(isInfiniteSource(INFINITE_SOURCE_THRESHOLD + 1)).toBe(true);
  });
});
