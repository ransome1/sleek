import { Item } from "jstodotxt";
import { expect, describe, it } from "vitest";
import restorePreviousPriority from "./RestorePreviousPriority";

describe("restorePreviousPriority", () => {
  it("restores priority from pri:C", () => {
    const i = new Item("My Todo pri:C");

    restorePreviousPriority(i);

    expect(i.priority()).toBe("C");
  });

  it("doesn't set priority without pri:", () => {
    const i = new Item("My Todo");

    restorePreviousPriority(i);

    expect(i.priority()).toBe(null);
  });

  it("removes pri:C", () => {
    const i = new Item("My Todo pri:C");

    restorePreviousPriority(i);

    expect(i.extensions().find((e) => e.key == "pri")).toBeUndefined();
  });
});
