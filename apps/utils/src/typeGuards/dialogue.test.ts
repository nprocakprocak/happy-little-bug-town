import { describe, expect, it } from "vitest";
import { isOnceDialogueId } from "./dialogue.js";

describe("dialogue ids", () => {
  it("recognises one-time dialogue ids", () => {
    expect(isOnceDialogueId("welcome")).toBe(true);
    expect(isOnceDialogueId("beehive")).toBe(true);
    expect(isOnceDialogueId("missing")).toBe(false);
    expect(isOnceDialogueId(1)).toBe(false);
  });
});
