import { describe, expect, it } from "vitest";

import { withSwappedPositions } from "./withSwappedPositions";

describe("swapped positions", () => {
  const entities = [
    { id: "source", x: 1, y: 2, fromX: 8, fromY: 9, label: "source" },
    { id: "target", x: 3, y: 4, label: "target" },
    { id: "other", x: 5, y: 6, label: "other" },
  ];

  it("moves the source to the target and flies the target back from its old cell", () => {
    expect(
      withSwappedPositions(entities, "source", "target", { x: 1, y: 2 }, { x: 3, y: 4 }),
    ).toEqual([
      { id: "source", x: 3, y: 4, fromX: undefined, fromY: undefined, label: "source" },
      { id: "target", x: 1, y: 2, fromX: 3, fromY: 4, label: "target" },
      { id: "other", x: 5, y: 6, label: "other" },
    ]);
  });
});
