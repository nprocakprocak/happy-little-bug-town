import { Bug } from "./bug";
import { Stack } from "./stack";

export interface MergeStacksResult {
  stack: Stack;
  releasedBugs: Bug[];
}
