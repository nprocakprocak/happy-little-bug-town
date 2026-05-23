import { Bug } from "../prisma/prisma/client.js";

export type BugDto = Pick<Bug, "id" | "bugType" | "x" | "y" | "authorId" | "structureId">;

export type UpdateBugData = Partial<Pick<Bug, "x" | "y" | "structureId">>;

export type BugOnGridDto = Pick<Bug, "id" | "bugType"> & { x: number, y: number };
