import { demolishStructure } from "../api/structures";
import { DemolishStructureResult } from "../types/demolishStructureResult";
import { SerialQueue } from "./serialQueue";

export const demolishQueue = new SerialQueue<DemolishStructureResult>(demolishStructure);
