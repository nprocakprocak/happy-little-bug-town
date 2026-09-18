import { extractOccupant } from "../api/structures";
import { SerialQueue } from "./serialQueue";

export const extractOccupantQueue = new SerialQueue(extractOccupant);
