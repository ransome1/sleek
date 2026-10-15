import { expect, describe, it } from "vitest";
import { deleteAttributeValue } from "./AttributeModifier";

describe("deleteAttributeValue", () => {
  it("removes inprogress regardless of the passed value", () => {
    const lines = ["Todo 1 inprogress:1", "Todo 2"];

    const { count } = deleteAttributeValue(lines, "inprogress", "In progress");

    expect(count).toBe(1);
    expect(lines).toEqual(["Todo 1", "Todo 2"]);
  });
});
