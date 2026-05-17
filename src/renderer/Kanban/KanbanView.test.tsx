import { render, screen, fireEvent } from "@testing-library/react";
import { DateTime } from "luxon";
import KanbanView from "./KanbanView";
import { TodoObject, TodoGroup } from "../../@types";

const makeTodo = (overrides: Partial<TodoObject> = {}): TodoObject => ({
  lineNumber: 1,
  body: "Test todo",
  string: "Test todo",
  complete: false,
  created: null,
  completed: null,
  priority: null,
  contexts: null,
  projects: null,
  due: null,
  dueString: null,
  notify: false,
  t: null,
  tString: null,
  rec: null,
  hidden: false,
  pm: null,
  ...overrides,
});

const makeTodoData = (todos: TodoObject[]) => [
  { title: null, visible: true, todoObjects: todos } as TodoGroup,
];

describe("KanbanView", () => {
  const setTodoObject = vi.fn();
  const setDialogOpen = vi.fn();
  const setContextMenu = vi.fn();
  const setPromptItem = vi.fn();

  const defaultProps = {
    setTodoObject,
    setDialogOpen,
    setContextMenu,
    setPromptItem,
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe("column rendering", () => {
    it("renders all four column headers", () => {
      render(<KanbanView todoData={makeTodoData([])} {...defaultProps} />);

      expect(screen.getByText("Backlog")).toBeInTheDocument();
      expect(screen.getByText("This Week")).toBeInTheDocument();
      expect(screen.getByText("In Progress")).toBeInTheDocument();
      expect(screen.getByText("Done")).toBeInTheDocument();
    });

    it("shows todo count badge for each column", () => {
      const todos = [
        makeTodo({ lineNumber: 1, body: "Task A" }),
        makeTodo({ lineNumber: 2, body: "Task B", complete: true }),
      ];

      render(<KanbanView todoData={makeTodoData(todos)} {...defaultProps} />);

      const counts = screen.getAllByText("1");
      expect(counts).toHaveLength(2);
    });
  });

  describe("todo categorization", () => {
    it("places completed todos in the Done column", () => {
      const todo = makeTodo({ body: "Finished task", complete: true });
      render(<KanbanView todoData={makeTodoData([todo])} {...defaultProps} />);

      expect(screen.getByText("Finished task")).toBeInTheDocument();

      const doneColumn = screen.getByText("Done").closest(".kanban-column");
      expect(doneColumn).toContainElement(screen.getByText("Finished task"));
    });

    it("places wip:1 todos in the In Progress column", () => {
      const todo = makeTodo({
        lineNumber: 2,
        body: "Ongoing task",
        string: "Ongoing task wip:1",
      });
      render(<KanbanView todoData={makeTodoData([todo])} {...defaultProps} />);

      const inProgressColumn = screen
        .getByText("In Progress")
        .closest(".kanban-column");
      expect(inProgressColumn).toContainElement(
        screen.getByText("Ongoing task"),
      );
    });

    it("places todos due within 7 days in the This Week column", () => {
      const dueDate = DateTime.now().plus({ days: 3 }).toISODate()!;
      const todo = makeTodo({
        lineNumber: 3,
        body: "Due soon",
        due: dueDate,
        dueString: dueDate,
      });
      render(<KanbanView todoData={makeTodoData([todo])} {...defaultProps} />);

      const thisWeekColumn = screen
        .getByText("This Week")
        .closest(".kanban-column");
      expect(thisWeekColumn).toContainElement(screen.getByText("Due soon"));
    });

    it("places todos with far future due dates in Backlog", () => {
      const dueDate = DateTime.now().plus({ days: 30 }).toISODate()!;
      const todo = makeTodo({
        lineNumber: 4,
        body: "Future task",
        due: dueDate,
        dueString: dueDate,
      });
      render(<KanbanView todoData={makeTodoData([todo])} {...defaultProps} />);

      const backlogColumn = screen
        .getByText("Backlog")
        .closest(".kanban-column");
      expect(backlogColumn).toContainElement(screen.getByText("Future task"));
    });

    it("places todos without due dates or tags in Backlog", () => {
      const todo = makeTodo({ lineNumber: 5, body: "Undated task" });
      render(<KanbanView todoData={makeTodoData([todo])} {...defaultProps} />);

      const backlogColumn = screen
        .getByText("Backlog")
        .closest(".kanban-column");
      expect(backlogColumn).toContainElement(screen.getByText("Undated task"));
    });
  });

  describe("user interactions", () => {
    it("opens the dialog when a todo card is clicked", () => {
      const todo = makeTodo({ lineNumber: 1, body: "Clickable task" });
      render(<KanbanView todoData={makeTodoData([todo])} {...defaultProps} />);

      fireEvent.click(screen.getByText("Clickable task"));

      expect(setTodoObject).toHaveBeenCalledWith(todo);
      expect(setDialogOpen).toHaveBeenCalledWith(true);
    });

    it("opens the context menu on right-click of a todo card", () => {
      const todo = makeTodo({ lineNumber: 1, body: "Right-click task" });
      render(<KanbanView todoData={makeTodoData([todo])} {...defaultProps} />);

      fireEvent.contextMenu(screen.getByText("Right-click task"));

      expect(setContextMenu).toHaveBeenCalledTimes(1);
      const contextMenuArg = setContextMenu.mock.calls[0][0];
      expect(contextMenuArg).toHaveProperty("items");
      expect(
        contextMenuArg.items.some((item: { id: string }) => item.id === "edit"),
      ).toBe(true);
      expect(
        contextMenuArg.items.some(
          (item: { id: string }) => item.id === "delete",
        ),
      ).toBe(true);
    });

    it("opens a new-todo dialog when the Add button is clicked", () => {
      render(<KanbanView todoData={makeTodoData([])} {...defaultProps} />);

      const addButtons = screen.getAllByTitle("Add new todo");
      fireEvent.click(addButtons[0]);

      expect(setTodoObject).toHaveBeenCalledTimes(1);
      expect(setDialogOpen).toHaveBeenCalledWith(true);
    });

    it("prefills wip:1 tag when adding from the In Progress column", () => {
      render(<KanbanView todoData={makeTodoData([])} {...defaultProps} />);

      const addButtons = screen.getAllByTitle("Add new todo");
      const inProgressColumn = screen
        .getByText("In Progress")
        .closest(".kanban-column")!;
      const inProgressAddBtn = inProgressColumn.querySelector(
        '[title="Add new todo"]',
      )!;
      fireEvent.click(inProgressAddBtn);

      const newTodo = setTodoObject.mock.calls[0][0] as TodoObject;
      expect(newTodo.string).toContain("wip:1");
    });

    it("prefills a due date when adding from the This Week column", () => {
      render(<KanbanView todoData={makeTodoData([])} {...defaultProps} />);

      const thisWeekColumn = screen
        .getByText("This Week")
        .closest(".kanban-column")!;
      const addBtn = thisWeekColumn.querySelector('[title="Add new todo"]')!;
      fireEvent.click(addBtn);

      const newTodo = setTodoObject.mock.calls[0][0] as TodoObject;
      expect(newTodo.string).toMatch(/due:\d{4}-\d{2}-\d{2}/);
    });
  });

  describe("todo card display", () => {
    it("shows priority badge for todos with priority", () => {
      const todo = makeTodo({
        lineNumber: 1,
        body: "Priority task",
        priority: "A",
      });
      render(<KanbanView todoData={makeTodoData([todo])} {...defaultProps} />);

      expect(screen.getByText("(A)")).toBeInTheDocument();
    });

    it("shows due date when present", () => {
      const dueDate = DateTime.now().plus({ days: 2 }).toISODate()!;
      const todo = makeTodo({
        lineNumber: 1,
        body: "Due task",
        due: dueDate,
        dueString: dueDate,
      });
      render(<KanbanView todoData={makeTodoData([todo])} {...defaultProps} />);

      expect(screen.getByText(`Due: ${dueDate}`)).toBeInTheDocument();
    });

    it("shows project tags", () => {
      const todo = makeTodo({
        lineNumber: 1,
        body: "Project task",
        projects: ["myproject"],
      });
      render(<KanbanView todoData={makeTodoData([todo])} {...defaultProps} />);

      expect(screen.getByText("+myproject")).toBeInTheDocument();
    });

    it("shows context tags", () => {
      const todo = makeTodo({
        lineNumber: 1,
        body: "Context task",
        contexts: ["work"],
      });
      render(<KanbanView todoData={makeTodoData([todo])} {...defaultProps} />);

      expect(screen.getByText("@work")).toBeInTheDocument();
    });
  });

  describe("priority sorting", () => {
    it("sorts higher priority todos before lower priority within a column", () => {
      const todos = [
        makeTodo({ lineNumber: 1, body: "Low priority", priority: "C" }),
        makeTodo({ lineNumber: 2, body: "High priority", priority: "A" }),
      ];
      render(<KanbanView todoData={makeTodoData(todos)} {...defaultProps} />);

      const cards = screen.getAllByText(/(High priority|Low priority)/);
      expect(cards[0]).toHaveTextContent("High priority");
      expect(cards[1]).toHaveTextContent("Low priority");
    });
  });
});
