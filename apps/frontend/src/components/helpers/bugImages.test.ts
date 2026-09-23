import { describe, expect, it } from "vitest";

import { allBugSpriteSrcs, bugToImage, bugTypeToImage } from "./bugImages";

describe("bug images", () => {
  it("uses a hungry sprite only for an unfed greenfly", () => {
    expect(bugTypeToImage("beetle")).toBe("/bugs/beetle.webp");
    expect(bugTypeToImage("greenfly", true)).toBe("/bugs/greenfly.webp");
    expect(bugTypeToImage("greenfly", false)).toBe("/bugs/greenfly-hungry.webp");
  });

  it("picks the sprite from how fed the bug is", () => {
    expect(bugToImage({ bugType: "greenfly", items: [] })).toBe("/bugs/greenfly-hungry.webp");
    expect(
      bugToImage({
        bugType: "greenfly",
        items: [{ itemType: "leaf_part" }, { itemType: "leaf_part" }],
      }),
    ).toBe("/bugs/greenfly.webp");
  });

  it("lists every sprite, including both greenfly states", () => {
    const sprites = allBugSpriteSrcs();

    expect(sprites).toContain("/bugs/greenfly.webp");
    expect(sprites).toContain("/bugs/greenfly-hungry.webp");
    expect(sprites).toHaveLength(9);
  });
});
