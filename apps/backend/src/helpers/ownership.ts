import { AppError } from "../errors/AppError.js";
import { isUuid } from "./isUuid.js";

export function parseUuidOrThrow(value: unknown, fieldName: string): string {
  if (typeof value !== "string" || !isUuid(value)) {
    throw new AppError(400, `Invalid ${fieldName}`);
  }
  return value;
}

interface OwnedEntity {
  authorId: string;
}

export async function loadOwnedOr404<T extends OwnedEntity>(
  load: (id: string) => Promise<T | null>,
  id: string,
  authorId: string,
): Promise<T> {
  const entity = await load(id);
  if (!entity || entity.authorId !== authorId) {
    throw new AppError(404, "Not found");
  }
  return entity;
}
