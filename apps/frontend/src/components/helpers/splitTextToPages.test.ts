// @vitest-environment jsdom

import { describe, expect, it } from "vitest";

import { splitTextToPages } from "./splitTextToPages";

function measureElement(fits: (text: string) => boolean): HTMLDivElement {
  const element = document.createElement("div");
  Object.defineProperty(element, "clientWidth", { get: () => 200 });
  Object.defineProperty(element, "clientHeight", { get: () => 40 });
  Object.defineProperty(element, "scrollHeight", {
    get: () => (fits(element.textContent ?? "") ? 40 : 80),
  });
  return element;
}

describe("split text to pages", () => {
  it("returns a blank page for empty text", () => {
    expect(splitTextToPages("", document.createElement("div"), 2)).toEqual([""]);
  });

  it("returns the whole text when the measure box has no size", () => {
    const element = document.createElement("div");
    element.style.height = "12px";
    element.style.overflow = "visible";

    expect(splitTextToPages("hello", element, 2)).toEqual(["hello"]);
    expect(element.style.height).toBe("12px");
    expect(element.style.overflow).toBe("visible");
  });

  it("keeps text that fits on one page and clears the measure element", () => {
    const element = measureElement(() => true);
    element.style.height = "8px";

    expect(splitTextToPages("hello world", element, 2)).toEqual(["hello world"]);
    expect(element.textContent).toBe("");
    expect(element.style.height).toBe("8px");
    expect(element.style.overflow).toBe("");
  });

  it("breaks a long page on the last word that fits", () => {
    const element = measureElement((text) => text.length <= 5);

    expect(splitTextToPages("hello world", element, 2)).toEqual(["hello", "world"]);
  });

  it("splits a word that is longer than the page one step at a time", () => {
    const element = measureElement((text) => text.length <= 3);

    expect(splitTextToPages("abcdef", element, 2)).toEqual(["abc", "def"]);
  });
});
