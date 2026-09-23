import { describe, expect, it, vi } from "vitest";

import { AppError } from "../errors/AppError.js";
import { loadOwnedOr404, parseUuidOrThrow } from "./ownership.js";

const VALID_UUID = "123e4567-e89b-12d3-a456-426614174000";

function catchError(run: () => unknown): unknown {
  try {
    run();
    return undefined;
  } catch (error) {
    return error;
  }
}

describe("parseUuidOrThrow", () => {
  it("returns a valid uuid", () => {
    expect(parseUuidOrThrow(VALID_UUID, "itemId")).toBe(VALID_UUID);
  });

  it("rejects a missing or malformed id", () => {
    const missing = catchError(() => parseUuidOrThrow(1, "itemId"));
    const malformed = catchError(() => parseUuidOrThrow("nope", "bugId"));

    expect(missing).toMatchObject({ status: 400, message: "Invalid itemId" });
    expect(malformed).toBeInstanceOf(AppError);
    expect(malformed).toMatchObject({ status: 400, message: "Invalid bugId" });
  });
});

describe("loadOwnedOr404", () => {
  const entity = { authorId: "author-1", id: "entity-1" };

  it("returns the entity when it belongs to the author", async () => {
    const load = vi.fn(async () => entity);

    await expect(loadOwnedOr404(load, "entity-1", "author-1")).resolves.toBe(entity);
    expect(load).toHaveBeenCalledWith("entity-1");
  });

  it("hides missing and foreign entities", async () => {
    await expect(loadOwnedOr404(async () => null, "entity-1", "author-1")).rejects.toMatchObject({
      status: 404,
      message: "Not found",
    });
    await expect(loadOwnedOr404(async () => entity, "entity-1", "author-2")).rejects.toMatchObject({
      status: 404,
      message: "Not found",
    });
  });
});
