import { getStructureSpan, Positionable } from "@happy-little-bug-town/utils";

import { Structure } from "../../types/structure";

export function withStructureSpan(structure: Structure): Structure & Positionable {
  return {
    ...structure,
    span: getStructureSpan(structure.structureType),
  };
}
