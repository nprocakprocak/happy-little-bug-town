import { extractItemFromStack } from "../api/stacks";
import { SerialQueue } from "./serialQueue";

export const extractStackQueue = new SerialQueue(extractItemFromStack);
