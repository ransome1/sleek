// Attributes tracks, for each attribute category (priority, projects, contexts, etc.),
// how many todos carry each value — and whether any of those todos trigger a notification.
//
// Shape example:
//   {
//     priority: { A: { count: 3, notify: false, hide: false }, B: { count: 1, notify: false, hide: true } },
//     projects: { work: { count: 5, notify: false, hide: false } },
//     due:      { "2024-01-15": { count: 2, notify: true, hide: false } },
//     ...
//   }
//
// DataRequest populates this in two passes:
//   Pass 1 (reset = true)  — rebuild from the complete todo list so the sidebar
//                            always shows every known attribute value.
//   Pass 2 (reset = false) — update counts to reflect only the filtered/searched
//                            subset so the UI can show match counts per attribute.

type AttributeEntry = { count: number; notify: boolean; hide: boolean };
type AttributeGroup = Record<string, AttributeEntry>;

let attributes: Record<string, AttributeGroup> = {
  priority: {},
  projects: {},
  contexts: {},
  due: {},
  t: {},
  rec: {},
  pm: {},
  created: {},
  completed: {},
};

// Increments (or creates) the count entry for a given attribute value.
// Only records a notification flag for due-date attributes.
// Count is only incremented for visible todos (hidden !== 1).
// hide starts as true and is set to false as soon as one visible todo is seen.
function incrementCount(
  group: AttributeGroup,
  value: string,
  notify: boolean,
  todoHidden: boolean,
): void {
  const previous = group[value]?.count ?? 0;
  // Once a visible todo has been seen for this value, hide is locked to false.
  // A single visible todo is enough to show the attribute in the sidebar.
  const alreadyVisible = group[value]?.hide === false;
  const hide = alreadyVisible ? false : todoHidden;
  group[value] = {
    count: todoHidden ? previous : previous + 1,
    notify,
    hide,
  };
}

// Resets a single attribute group.
// - reset = true:  wipe the group entirely so stale values from deleted todos disappear.
// - reset = false: zero counts only. hide is intentionally preserved from pass 1 —
//                  it reflects h:1 visibility which does not change between passes.
function resetGroup(group: AttributeGroup, reset: boolean): void {
  if (reset) {
    Object.keys(group).forEach((key) => delete group[key]);
  } else {
    Object.keys(group).forEach((key) => {
      group[key].count = 0;
    });
  }
}

// Counts every value of a given attribute across all todos and records it in the group.
function tallyAttribute(
  group: AttributeGroup,
  attributeName: string,
  todoObjects: TodoObject[],
): void {
  for (const todo of todoObjects) {
    const value = todo[attributeName as keyof TodoObject];

    // due is the only attribute whose notify flag is meaningful
    const notify = attributeName === "due" ? !!todo.notify : false;
    const todoHidden = todo.hidden === true;

    if (Array.isArray(value)) {
      // multi-value attributes: projects, contexts
      for (const element of value) {
        if (element !== null) {
          incrementCount(group, element as string, notify, todoHidden);
        }
      }
    } else {
      // single-value attributes: priority, due, t, rec, pm, created, completed
      if (value !== null) {
        incrementCount(group, value as string, notify, todoHidden);
      }
    }
  }
}

// Sorts a group's entries alphabetically by key so the sidebar renders
// attribute values in a consistent order.
function sortGroupKeys(group: AttributeGroup): AttributeGroup {
  return Object.fromEntries(
    Object.entries(group).sort(([a], [b]) => a.localeCompare(b)),
  );
}

// Rebuilds the attributes object from todoObjects.
//
// Called twice per data request:
//   1. reset = true  — before filtering, to capture every attribute value in the file.
//   2. reset = false — after filtering, to update counts for the visible subset.
//
// After counting, the top-level keys are reordered to match the user's sort preference
// so the sidebar renders attribute categories in the same order as the todo list columns.
function updateAttributes(
  todoObjects: TodoObject[],
  sorting: Sorting[],
  reset: boolean,
): void {
  for (const attributeName of Object.keys(attributes)) {
    resetGroup(attributes[attributeName], reset);
    tallyAttribute(attributes[attributeName], attributeName, todoObjects);
    attributes[attributeName] = sortGroupKeys(attributes[attributeName]);
  }

  // Reorder attribute categories to match the user-defined sort order.
  attributes = Object.fromEntries(
    sorting.map((item) => [item.value, attributes[item.value]]),
  );
}

export { attributes, updateAttributes };
