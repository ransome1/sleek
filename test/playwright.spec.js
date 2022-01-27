const { _electron: electron } = require("playwright");
const { test, expect } = require("@playwright/test");
let 
	app, 
	page;

test.describe("Onboarding", () => {
	test.beforeAll(async () => {
		app = await electron.launch({ 
			args: ["src/main.js"],
			env: {
				"NODE_ENV": "testing",
				"SLEEK_CUSTOM_FILE": undefined
			}
		});
		page = await app.firstWindow();
		// wait for 500ms to let the window built up fully
		await page.waitForTimeout(500);
	});

	test.afterAll(() => {
		app.close();
	});

	test("is title 'sleek'?", async () => {  
		await expect(await page.title()).toBe("sleek");
	})

	test("Are onboarding elements visible?", async () => {
		// check if there are two messages shown in default setting
		const messageCount = await page.locator("#messages .message").count();
		await expect(messageCount).toBe(2);
		// check if all relevant onboarding elements are visible
		await page.waitForSelector("#onboardingContainer");
		await page.waitForSelector("#welcomeToSleek");
		await page.waitForSelector("#onboardingContainerSubtitle");
		await page.waitForSelector("#btnOnboardingOpenTodoFile");
		await page.waitForSelector("#btnOnboardingCreateTodoFile");
		await page.waitForSelector("#navBtnSettings");
		await page.waitForSelector("#navBtnSettings");
	})

	test("Are non-onboarding elements hidden?", async () => {
		// check if all relevant onboarding elements are hidden
		await expect(page.locator("#navBtnAddTodo")).toBeHidden();
		await expect(page.locator("#navBtnFilter")).toBeHidden();
		await expect(page.locator("#navBtnView")).toBeHidden();
	})

});

test.describe("Todo table", () => {

	test.beforeAll(async () => {
		app = await electron.launch({ 
			args: ["src/main.js"],
			env: {
				"NODE_ENV": "testing",
				"SLEEK_CUSTOM_FILE": "test/todo.txt"
			}
		});
		page = await app.firstWindow();
		// wait for 500ms to let the window built up fully
		await page.waitForTimeout(500);
	});

	test.afterAll(() => {
		app.close();
	});

	test("is title 'todo.txt - sleek'?", async () => {  
		await expect(await page.title()).toBe("todo.txt - sleek");
	})

	test("Table shows 19 rows", async () => {
		const rows = await page.locator("#todoTable .todo").count();
		await expect(rows).toBe(17);
	});

	test("Fourth row can be clicked and shows modal, which input field contains a specfic value", async () => {
		await page.locator(":nth-match(#todoTable .todo, 3)").click();
		const value = await page.inputValue("#modalFormInput");
		await expect(value).toBe("(A) Thank Mom for the meatballs  x 2021-04-07 (B) Schedule Goodwill pickup   Eskimo pies  Really gotta call Mom this task has no priority (A)   (b) Get back to the boss this task has no priority due:2023-06-10 +GarageSale @phone @phone @GroceryStore @phone @someday");
	});

});

test.describe("Todo context", () => {

	test.beforeAll(async () => {
		app = await electron.launch({ 
			args: ["src/main.js"],
			env: {
				"NODE_ENV": "testing",
				"SLEEK_CUSTOM_FILE": "test/todo.txt"
			}
		});
		page = await app.firstWindow();
		// wait for 500ms to let the window built up fully
		await page.waitForTimeout(500);
	});

	test.afterAll(() => {
		app.close();
	});

	test("is title 'todo.txt - sleek'?", async () => {  
		await expect(await page.title()).toBe("todo.txt - sleek");
	})

	test("Second row can be right clicked and shows context", async () => {
		await page.waitForSelector("#todoTable");
		// right click on row to open context
		const row = page.locator(":nth-match(#todoTable .todo, 2)");
		await row.click({
			"button": "right",
			"position": {
				"x": 10,
				"y": 10
			}
		});
		// check if context menu is visible
		const todoContext = await page.locator("#todoContext");
		await expect(todoContext).toBeVisible();
	});

	test("Number of buttons is 3", async () => {
		// count items in context
		const rows = await page.locator("#todoContext .dropdown-item").count();
		await expect(rows).toBe(3);
	});

	test("Context container has the correct 'data-item' attribute", async () => {
		// check if data item has desired value
		const todoContext = await page.locator("#todoContext");
		const dataItem = await todoContext.getAttribute("data-item");
		await expect(dataItem).toBe("(A) Call Mom 2011-03-02 this task has no creation date  Call Mom multiple projects and contexts     Email SoAndSo at soandso@example.com this task has no context due:2023-04-09 +Family +PeaceLoveAndHappiness @iphone @phone");
	});

	test("Click on 'Use as template' shows desired input value", async () => {
		await page.locator(":nth-match(#todoContext .dropdown-item, 1)").click();
		//const value = await page.inputValue("#modalFormInput");
		await expect(page.locator("#modalFormInput")).toHaveValue(/____________/);
		
		// close modal
		await page.locator("#btnCancel").click();
	});

	test("Click on 'Edit' shows desired input value", async () => {
		const row = page.locator(":nth-match(#todoTable .todo, 5)");
		await row.click({
			"button": "right",
			"position": {
				"x": 10,
				"y": 10
			}
		});
		await page.locator(":nth-match(#todoContext .dropdown-item, 2)").click();
		const value = await page.inputValue("#modalFormInput");
		await expect(value).toBe("(B) ->Submit TPS report this task has no priority");
		// close modal
		await page.locator("#btnCancel").click();
	});

});

test.describe("Creating todos", () => {

	test.beforeAll(async () => {
		app = await electron.launch({ 
			args: ["src/main.js"],
			env: {
				"NODE_ENV": "testing",
				"SLEEK_CUSTOM_FILE": "test/empty.txt"
			}
		});
		page = await app.firstWindow();
		// wait for 500ms to let the window built up fully
		await page.waitForTimeout(500);
	});

	test.afterAll(() => {
		app.close();
	});

	test("is title 'empty.txt - sleek'?", async () => {  
		await expect(await page.title()).toBe("empty.txt - sleek");
	})

	test("Add a new todo and delete it", async () => {
		await page.locator("#btnAddTodoContainer").click();
		await page.locator("#modalFormInput").fill("This is a test todo that needs to be cleaned up");
		await page.locator("#btnSave").click();
		const countedRows = await page.locator("#todoTable").count();
		await expect(countedRows).toBe(1);

		const row = await page.locator(":nth-match(#todoTable .todo, 1)");
		await row.click({
			"button": "right",
			"position": {
				"x": 10,
				"y": 10
			}
		});
		await page.locator(":nth-match(#todoContext .dropdown-item, 3)").click();
		await page.waitForSelector("#btnAddTodoContainer");
	});

	test("Add new todo, mark it complete and archive it", async () => {
		await page.locator("#btnAddTodoContainer").click();
		await page.locator("#modalFormInput").fill("This is a test todo that needs to be archived");
		await page.locator("#btnSave").click();
		const row = page.locator(":nth-match(#todoTable .todo, 1)");
		const checkbox = await row.locator(".checkbox");
		await checkbox.click();
		const archiveButton = await row.locator(".archive");
		await archiveButton.click();
		await page.locator("#modalPromptConfirm").click();
		await page.waitForSelector("#btnAddTodoContainer");
	});

	test("Add new todo and use it as a template to create another one", async () => {
		await page.locator("#btnAddTodoContainer").click();
		await page.locator("#modalFormInput").fill("This is a test todo that will be used as a template +testing @testing");
		await page.locator("#btnSave").click();

		const row = await page.locator(":nth-match(#todoTable .todo, 1)");
		await row.click({
			"button": "right",
			"position": {
				"x": 10,
				"y": 10
			}
		});
		await page.locator(":nth-match(#todoContext .dropdown-item, 1)").click();
		await expect(page.locator("#modalFormInput")).toHaveValue(/____________/);
		// close modal
		await page.locator("#btnCancel").click();
		await row.click({
			"button": "right",
			"position": {
				"x": 10,
				"y": 10
			}
		});
		await page.locator(":nth-match(#todoContext .dropdown-item, 3)").click();
		await page.waitForSelector("#btnAddTodoContainer");
	});

});

test.describe("Due date picker", () => {

	test.beforeAll(async () => {
		app = await electron.launch({ 
			args: ["src/main.js"],
			env: {
				"NODE_ENV": "testing",
				"SLEEK_CUSTOM_FILE": "test/empty.txt"
			}
		});
		page = await app.firstWindow();
		// wait for 500ms to let the window built up fully
		await page.waitForTimeout(500);
	});

	test.afterAll(() => {
		app.close();
	});

	test("is title 'empty.txt - sleek'?", async () => {  
		await expect(await page.title()).toBe("empty.txt - sleek");
	})

	test("Use due date picker and check if 'due:' is added to inputs' value", async () => {
		await page.locator("#btnAddTodoContainer").click();
		await page.locator("#modalFormInput").fill("This is a test todo that contains a due date");
		await page.locator("#datePickerInput").click();
		const datepickerCell = await page.locator(":nth-match(div.datepicker .datepicker-cell, 14)");
		await datepickerCell.click();
		// check if todo input value includes "due:"
		await expect(page.locator("#modalFormInput")).toHaveValue(/due:/);
		// check if date picker input has been filled with a value
		await expect(page.locator("#datePickerInput")).not.toHaveValue("");
	});

	test("Use due date picker and remove previous due date", async () => {

		await page.locator("#datePickerInput").click();
		await page.locator("div.datepicker .datepicker-footer .button.clear-btn").click();
		await expect(page.locator("#modalFormInput")).toHaveValue("This is a test todo that contains a due date");

	});
	
});

test.describe("Recurrence picker", () => {

	test.beforeAll(async () => {
		app = await electron.launch({ 
			args: ["src/main.js"],
			env: {
				"NODE_ENV": "testing",
				"SLEEK_CUSTOM_FILE": "test/empty.txt"
			}
		});
		page = await app.firstWindow();
		// wait for 500ms to let the window built up fully
		await page.waitForTimeout(500);
	});

	test.afterAll(() => {
		app.close();
	});

	test("is title 'empty.txt - sleek'?", async () => {  
		await expect(await page.title()).toBe("empty.txt - sleek");
	})

	test("Use recurrence picker and check if 'rec:' is added to inputs' value", async () => {
		await page.locator("#btnAddTodoContainer").click();
		await page.locator("#modalFormInput").fill("This is a test todo that contains a recurrence");
		await page.locator("#recurrencePickerInput").click();
		// count up three times to four
		await page.locator("#recurrencePickerIncrease").click();
		await page.locator("#recurrencePickerIncrease").click();
		await page.locator("#recurrencePickerIncrease").click();
		// click on week option
		await page.locator(":nth-match(#recurrencePickerContainer .options .radio, 3)").click();
		// check if input field contains substring "rec:4w"
		await expect(page.locator("#modalFormInput")).toHaveValue(/rec:4w/);
		// check if recurrence picker input has been filled with a value
		await expect(page.locator("#recurrencePickerInput")).not.toHaveValue("");
	});

	test("Use recurrence picker and remove previous recurrence", async () => {

		await page.locator("#recurrencePickerInput").click();
		await page.locator("#recurrencePickerNoRecurrence").click();
		await expect(page.locator("#modalFormInput")).toHaveValue("This is a test todo that contains a recurrence");

	});
	
});

test.describe("Navigation", () => {
	test.beforeAll(async () => {
		app = await electron.launch({ 
			args: ["src/main.js"],
			env: {
				"NODE_ENV": "testing",
				"SLEEK_CUSTOM_FILE": "todo.txt"
			}
		});
		page = await app.firstWindow();
		// wait for 500ms to let the window built up fully
		await page.waitForTimeout(500);
	});

	test.afterAll(() => {
		app.close();
	});

	test("is title 'sleek'?", async () => {  
		await expect(await page.title()).toBe("todo.txt - sleek");
	})

	test("Click add todo button", async () => {
		await page.locator("#navBtnAddTodo a").click();
		await page.locator("#modalForm").waitForVisible();
	})

});