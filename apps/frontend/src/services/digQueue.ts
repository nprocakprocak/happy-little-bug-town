import { dig } from "../api/structures";
import { Bug } from "../types/bug";
import { Item } from "../types/item";
import { SerialQueue } from "./serialQueue";

export const digQueue = new SerialQueue<Item | Bug>(dig);
