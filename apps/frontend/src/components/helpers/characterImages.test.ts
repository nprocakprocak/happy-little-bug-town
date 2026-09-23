import { describe, expect, it } from "vitest";

import { bugTypeToBustSrc, hasDialogueBust } from "./characterImages";

describe("dialogue busts", () => {
  it("has a bust for the speaking bugs", () => {
    expect(hasDialogueBust("beetle")).toBe(true);
    expect(hasDialogueBust("bee")).toBe(true);
    expect(bugTypeToBustSrc("ladybug")).toBe("/dialogues/ladybug.webp");
  });

  it("rejects bugs that do not appear in dialogue", () => {
    expect(hasDialogueBust("fly")).toBe(false);
    expect(hasDialogueBust("greenfly")).toBe(false);
    expect(() => bugTypeToBustSrc("fly")).toThrow("Unknown bug type for dialogue: fly");
  });
});
