import { BugType } from "../types/bugType.js";

const STACK_BUG_CAPACITY = 1;
const STACK_ACCEPTED_BUG_TYPE: BugType = "ant";

interface BugForStackDrop {
  bugType: BugType;
}

interface StackForBugDrop {
  bugs: BugForStackDrop[];
}

export function canDropBugOnStack(
  bug: BugForStackDrop,
  stack: StackForBugDrop,
): boolean {
  return (
    bug.bugType === STACK_ACCEPTED_BUG_TYPE &&
    stack.bugs.length < STACK_BUG_CAPACITY
  );
}
