import { expect, describe, it } from "vitest";
import { deleteAttributeValue } from "./AttributeModifier";

describe("deleteAttributeValue", () => {
  it("removes only the inprogress extension with the passed value", () => {
    const lines = ["Todo 1 inprogress:1", "Todo 2 inprogress:2", "Todo 3"];

    const { count } = deleteAttributeValue(lines, "inprogress", "1");

    expect(count).toBe(1);
    expect(lines).toEqual(["Todo 1", "Todo 2 inprogress:2", "Todo 3"]);
  });
});
