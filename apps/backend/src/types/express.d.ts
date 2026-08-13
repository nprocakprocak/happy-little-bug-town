import type { BugDto } from "./bugDto.js";
import type { ItemDto } from "./itemDto.js";
import type { StackDto } from "./stackDto.js";
import type { StructureDto } from "./structureDto.js";

declare global {
  namespace Express {
    interface Request {
      sessionUserId?: string;
      authorId?: string;
      structure?: StructureDto;
      item?: ItemDto;
      bug?: BugDto;
      stack?: StackDto;
    }
  }
}

export {};
