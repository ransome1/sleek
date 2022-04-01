const { _electron: electron } = require("playwright");
const { test, expect } = require("@playwright/test");
const waitForAppToLoad = 1000;
let 
	app, 
	page;

test.describe("Onboarding", () => {
	test.beforeAll(async () => {
		app = await electron.launch({ 
			args: ["src/main.js"],
			env: {
				"NODE_ENV": "testing"
			}
		});
		page = await app.firstWindow();
		
		await page.waitForTimeout(waitForAppToLoad);
	});

	test.afterAll(() => {
		app.close();
	});

	test("is title 'sleek'?", async () => {  
		await expect(await page.title()).toBe("sleek");
	})

	test("Are onboarding elements visible?", async () => {
		// check if there are two messages shown in default setting
		const messageCount = await page.locator("#messages .message.is-active").count();
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

	test("Button in 1st message opens settings and Escape closes it", async () => {
		await page.locator("#btnMessageLogging").click();
		await expect(page.locator("#modalSettings")).toBeVisible();	
		await page.keyboard.press("Escape");
	})

	test("Messages can be closed", async () => {
		await page.locator(":nth-match(#messages .message.is-active [role='cancel'], 1)").click();
		let messageCount = await page.locator("#messages .message.is-active").count();
		await expect(messageCount).toBe(1);
		await page.locator(":nth-match(#messages .message.is-active [role='cancel'], 1)").click();
		messageCount = await page.locator("#messages .message.is-active").count();
		await expect(messageCount).toBe(0);
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
		
		await page.waitForTimeout(waitForAppToLoad);
	});

	test.afterAll(() => {
		app.close();
	});

	test("Table shows 18 rows", async () => {
		const rows = await page.locator("#todoTable .todo").count();
		await expect(rows).toBe(18);
	});

	test("Fourth row can be clicked and shows modal, which input field contains a specfic value", async () => {
		await page.locator(":nth-match(#todoTable .todo, 4) > .text").click();
		const value = await page.inputValue("#modalFormInput");
		await expect(value).toBe("(B) Call Mom 2011-03-02 this task has no creation date  Call Mom multiple projects and contexts     Email SoAndSo at soandso@example.com this task has no context due:2023-04-09 +Family +PeaceLoveAndHappiness @iphone @phone");

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
		
		await page.waitForTimeout(waitForAppToLoad);
	});

	test.afterAll(() => {
		app.close();
	});

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

	test("Number of buttons is 5", async () => {
		// count items in context
		const rows = await page.locator("#todoContext .dropdown-item").count();
		await expect(rows).toBe(5);
	});

	test("Context container has the correct 'data-item' attribute", async () => {
		// check if data item has desired value
		const todoContext = await page.locator("#todoContext");
		const dataItem = await todoContext.getAttribute("data-item");
		await expect(dataItem).toBe("(A) Thank Mom for the meatballs  x 2021-04-07 (B) Schedule Goodwill pickup   Eskimo pies  Really gotta call Mom this task has no priority (A)   (b) Get back to the boss this task has no priority due:2023-06-10 +GarageSale @phone @phone @GroceryStore @phone @someday");
	});

	test("Click on 'Use as template' shows desired input value", async () => {
		await page.locator(":nth-match(#todoContext .dropdown-item, 3)").click();
		//const value = await page.inputValue("#modalFormInput");
		await expect(page.locator("#modalFormInput")).toHaveValue(/____________/);
		
		// close modal
		await page.locator("#btnCancel").click();
	});

	// TODO: does not actually check clpboard
	test("Click on 'Copy' will copy todo text to clipboard", async () => {
		const row = page.locator(":nth-match(#todoTable .todo, 2) > .text");
		await row.click({
			"button": "right",
			"position": {
				"x": 10,
				"y": 10
			}
		});
		await page.locator(":nth-match(#todoContext .dropdown-item, 4)").click();
		await expect(page.locator("#messageGenericContainer")).toBeVisible();
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
		
		await page.waitForTimeout(waitForAppToLoad);
	});

	test.afterAll(() => {
		app.close();
	});

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
		await page.locator(":nth-match(#todoContext .dropdown-item, 5)").click();
		await page.waitForSelector("#btnAddTodoContainer");
	});

	test("Add new todo, mark it complete and archive it", async () => {
		await page.locator("#btnAddTodoContainer").click();
		await page.locator("#modalFormInput").fill("This is a test todo that needs to be archived");
		await page.locator("#btnSave").click();
		const row = await page.locator(":nth-match(#todoTable .todo, 1)");
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
		await page.keyboard.press("Enter");

		const row = await page.locator(":nth-match(#todoTable .todo, 1) > .text");
		await row.click({
			"button": "right",
			"position": {
				"x": 10,
				"y": 10
			}
		});
		await page.locator(":nth-match(#todoContext .dropdown-item, 3)").click();
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
		await page.locator(":nth-match(#todoContext .dropdown-item, 5)").click();
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
		
		await page.waitForTimeout(waitForAppToLoad);
	});

	test.afterAll(() => {
		app.close();
	});

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
		await expect(page.locator("#modalFormInput")).not.toHaveValue(/due:/);
		await expect(page.locator("#datePickerInput")).toHaveValue("");

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
		
		await page.waitForTimeout(waitForAppToLoad);
	});

	test.afterAll(() => {
		app.close();
	});

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

	test("Recurrence picker will be closed if an outside element is clicked", async () => {
		await page.locator("#recurrencePickerInput").click();
		await expect(page.locator("#recurrencePickerContainer")).toBeVisible();
		await page.locator("#datePickerInput").click();
		await expect(page.locator("#recurrencePickerContainer")).not.toBeVisible();
	});
	
});

test.describe("Priority picker", () => {

	test.beforeAll(async () => {
		app = await electron.launch({ 
			args: ["src/main.js"],
			env: {
				"NODE_ENV": "testing",
				"SLEEK_CUSTOM_FILE": "test/todo.txt"
			}
		});
		page = await app.firstWindow();
		
		await page.waitForTimeout(waitForAppToLoad);
	});

	test.afterAll(() => {
		app.close();
	});

	test("Priority picker will select priority C and add it to the input field", async () => {
		await page.locator("#navBtnAddTodo").click();
		await page.fill("#modalFormInput", "This is a test todo");
		await expect(await page.locator("#modalFormInput").inputValue()).toBe("This is a test todo");
		await page.locator("#priorityPicker").click();
		await page.selectOption("select#priorityPicker", "C");
		await expect(await page.locator("#modalFormInput").inputValue()).toBe("(C) This is a test todo");
	});

	test("Priority picker will select priority - and add it will remove priority of the input field", async () => {
		await page.locator("#priorityPicker").click();
		await page.selectOption("select#priorityPicker", { index: 0 });
		await expect(await page.locator("#modalFormInput").inputValue()).toBe("This is a test todo");
		await page.locator("#btnCancel").click();
	});

	test("Priority picker input will be prefilled with priority B", async () => {
		const row = page.locator(":nth-match(#todoTable .todo, 5) > .text");
		await row.click();
		const value = await page.inputValue("#modalFormInput");
		await expect(value).toBe("(B) ->Submit TPS report this task has no priority");
		const priority = await page.inputValue("#priorityPicker");
		await expect(priority).toBe("B");
	});	
});

test.describe("Input element switch", () => {

	test.beforeAll(async () => {
		app = await electron.launch({ 
			args: ["src/main.js"],
			env: {
				"NODE_ENV": "testing",
				"SLEEK_CUSTOM_FILE": "test/todo.txt"
			}
		});
		page = await app.firstWindow();
		
		await page.waitForTimeout(waitForAppToLoad);
	});

	test.afterAll(() => {
		app.close();
	});

	test("Check if multi line items are displayed correctly", async () => {
		const row = page.locator(":nth-match(#todoTable .todo, 7) > .text");
		await row.click({
			"position": {
				"x": 50,
				"y": 10
			}
		});

		await expect(await page.locator("#modalFormInput").inputValue()).toBe("This is a multi line taskcreated withinSleek due:2023-05-01 +todotxt @test");
		await page.locator("#modalFormInputResize").click();
		await expect(await page.locator("#modalFormInput").inputValue()).toBe(`This is a 
multi line task
created within
Sleek due:2023-05-01 +todotxt @test`);
	});
});

test.describe("Navigation elements", () => {
	test.beforeAll(async () => {
		app = await electron.launch({ 
			args: ["src/main.js"],
			env: {
				"NODE_ENV": "testing",
				"SLEEK_CUSTOM_FILE": "test/todo.txt"
			}
		});
		page = await app.firstWindow();
		
		await page.waitForTimeout(waitForAppToLoad);
	});

	test.afterAll(() => {
		app.close();
	});

	test("Click add todo button and check if input field is focused", async () => {
		await page.locator("#navBtnAddTodo").click();
		await page.waitForSelector("#modalForm");
		await expect(page.locator("#modalFormInput")).toBeFocused();
		await page.locator("#btnCancel").click();
	})

	test("Filter sidebar is being opened and closed", async () => {
		await page.locator("#navBtnFilter").click();
		await page.waitForSelector("#filterDrawer");
		await page.locator("#navBtnFilter").click();
		await expect(page.locator("#filterDrawer")).toBeHidden();
	})

	test("File changer modal is being opened", async () => {
		await page.locator("#navBtnOpenTodoFile").click();
		await expect(page.locator("#modalChangeFile")).toBeVisible();
		await page.locator(":nth-match(#modalChangeFile .card-footer button, 3)").click();
	})

	test("Settings modal is being opened and closed using Escape key", async () => {
		await page.locator("#navBtnSettings").click();
		await expect(page.locator("#modalSettings")).toBeVisible();
		await page.keyboard.press("Escape");
		await expect(page.locator("#modalSettings")).toBeHidden();
	})

	test("Help modal is being opened and closed using close button", async () => {
		await page.locator("#navBtnHelp").click();
		await expect(page.locator("#modalHelp")).toBeVisible();
		await page.locator("#modalHelp .modal-close").click();
		await expect(page.locator("#modalHelp")).toBeHidden();
	})

	test("Hover on settings button will present version number", async () => {
		await page.locator(":nth-match(nav ul, 2)").hover();
		await expect(page.locator("#versionNumber")).toBeVisible();
	})

});

test.describe("Filter drawer", () => {

	test.beforeAll(async () => {
		let rows;
		app = await electron.launch({ 
			args: ["src/main.js"],
			env: {
				"NODE_ENV": "testing",
				"SLEEK_CUSTOM_FILE": "test/todo.txt"
			}
		});
		page = await app.firstWindow();
		
		await page.waitForTimeout(waitForAppToLoad);
	});

	test.afterAll(() => {
		app.close();
	});

	test("Filter sidebar is being opened and a project is being selected which reduces the table rows to 1 result. Filter is removed and filter drawer is being closed.", async () => {
		
		await page.locator("#navBtnFilter").click();

		await page.waitForSelector("#filterDrawer");
		
		const filterButton = await page.locator(":nth-match(#filterDrawer section.projects a.button, 2)");
		
		await filterButton.click();

		const rows = await page.locator("#todoTable .todo").count();
		await expect(rows).toBe(1);

		const filterResetButton = await page.locator("#btnFiltersResetFilters").click();
		
		await page.locator("#navBtnFilter").click();		
		await expect(page.locator("#filterDrawer")).toBeHidden();

	})

	test("Filter sidebar is being opened and a context and a project is being selected and filter reset button removes selection", async () => {
		await page.locator("#navBtnFilter").click();
		await page.waitForSelector("#filterDrawer");
		const priorityButton = await page.locator(":nth-match(#filterDrawer #todoFilters a.button, 1)");
		await priorityButton.click();
		const contextButton = await page.locator(":nth-match(#filterDrawer #todoFilters a.button, 7)");
		await contextButton.click();
		const projectButton = await page.locator(":nth-match(#filterDrawer #todoFilters a.button, 11)");
		await projectButton.click();
		rows = await page.locator("#todoTable .todo").count();
		await expect(rows).toBe(1);
		const filterResetButton = await page.locator("#btnFiltersResetFilters").click();
		rows = await page.locator("#todoTable .todo").count();
		await expect(rows).not.toBe(1);
		await expect(page.locator("#filterDrawer")).toBeVisible();
	})

	test("Project headline is being clicked, which reduces results to 14", async () => {
		await page.locator("#filterDrawer #todoFilters .projects h4").click();
		rows = await page.locator("#todoTable .todo").count();
		await expect(rows).toBe(14);
		const filterResetButton = await page.locator("#btnFiltersResetFilters").click();
		rows = await page.locator("#todoTable .todo").count();
		await expect(rows).toBe(18);
		await expect(page.locator("#filterDrawer")).toBeVisible();
	})

	test("Click on drawer close button hides filter drawer", async () => {
		await page.locator("#drawerClose").click();
		await expect(page.locator("#filterDrawer")).toBeHidden();
	})

});

// TODO: Toggles don't work with Playwright
test.describe("View drawer", () => {

	test.beforeAll(async () => {
		app = await electron.launch({ 
			args: ["src/main.js"],
			env: {
				"NODE_ENV": "testing",
				"SLEEK_CUSTOM_FILE": "test/todo.txt"
			}
		});
		page = await app.firstWindow();
		
		await page.waitForTimeout(waitForAppToLoad);
	});

	test.afterAll(() => {
		app.close();
	});

	test("View sidebar is being opened and closed", async () => {
		await page.locator("#navBtnView").click();
		await page.waitForSelector("#viewDrawer");
		await page.locator("#navBtnView").click();
		await expect(page.locator("#viewDrawer")).toBeHidden();
	})

	// test("Sort by file", async () => {
	// 	await page.locator("#navBtnView").click();

	// 	await page.waitForSelector("#viewDrawer");
		
	// 	//const sortByFile = await page.locator("#sortByFile");
	// 	//await page.locator("#sortByFile").click();
	// 	//await sortByFile.click();

	// 	await page.waitForSelector("#sortByFile");
	// 	await page.locator("#sortByFile").focus();

	// 	await page.waitForTimeout(999999)
		
	// })

});

test.describe("Jail", () => {

	test.beforeAll(async () => {
		app = await electron.launch({ 
			args: ["src/main.js"],
			env: {
				"NODE_ENV": "testing",
				"SLEEK_CUSTOM_FILE": "test/empty.txt"
			}
		});
		page = await app.firstWindow();
		
		await page.waitForTimeout(waitForAppToLoad);
	});

	test.afterAll(() => {
		app.close();
	});

	test("Add/Edit window is being opened and while tabbing, focus never leaves window", async () => {
		await page.locator("#navBtnAddTodo").click();
		await page.waitForSelector("#modalForm");
		await page.keyboard.press("Tab");
		await page.keyboard.press("Tab");
		await page.keyboard.press("Tab");
		await page.keyboard.press("Tab");
		await page.keyboard.press("Tab");
		await page.keyboard.press("Tab");
		await page.keyboard.press("Tab");
		// if jail is working, seven tabs should focus datepicker
		await expect(page.locator("#datePickerInput")).toBeFocused();
	})

});

// TODO
test.describe("Keyboard shortcuts", () => {

	test.beforeAll(async () => {
		app = await electron.launch({ 
			args: ["src/main.js"],
			env: {
				"NODE_ENV": "testing",
				"SLEEK_CUSTOM_FILE": "test/todo.txt"
			}
		});
		page = await app.firstWindow();
		
		await page.waitForTimeout(waitForAppToLoad);
	});

	test.afterAll(() => {
		app.close();
	});

	test("A: Trigger archive function", async () => {
		await page.keyboard.press("Escape");
		await page.keyboard.press("a");
		//const modalPrompt = await page.locator("#modalPrompt");
		await expect(page.locator("#modalPrompt")).toBeVisible();
	})

	test("Meta/Ctrl + c: Copy list to clipboard", async () => {
		await expect(page.locator("#messageGenericContainer")).not.toBeVisible();
		// on Windows and Linux
		await page.keyboard.press("Control+c");
		// on macOS
		await page.keyboard.press("Meta+c");
		await expect(page.locator("#messageGenericContainer")).toBeVisible();
	})

});

// TODO: Toggles don't work with Playwright
test.describe("Settings modal", () => {

	test.beforeAll(async () => {
		app = await electron.launch({ 
			args: ["src/main.js"],
			env: {
				"NODE_ENV": "testing",
				"SLEEK_CUSTOM_FILE": "test/empty.txt"
			}
		});
		page = await app.firstWindow();
		
		await page.waitForTimeout(waitForAppToLoad);
	});

	test.afterAll(() => {
		app.close();
	});

	test("Check if friendly language names are available and can be selected", async () => {
		await page.locator("#navBtnSettings").click();
		await expect(page.locator("#modalSettings")).toBeVisible();
		await expect(page.locator("#language")).toBeVisible();

		const languageCount = await page.locator("#language option").count();
		await expect(languageCount).toBe(12);

		const fifthLanguage = await page.locator(":nth-match(#language option, 5)").innerHTML();
		await expect(fifthLanguage).toBe("Français");

		await page.selectOption("#language", "pl");
		await expect(page.locator("#modalPrompt")).toBeVisible();
		await page.keyboard.press("Escape");
	})

	// test("Do the Toggles", async () => {
	// 	await page.locator("#navBtnSettings").click();
	// 	await expect(page.locator("#modalSettings")).toBeVisible();
	// 	await page.focus('input#notifications');
	// 	await page.waitForTimeout(50000);
	// })

	test("Close settings modal by click on x button", async () => {
		const button = await page.locator("#modalSettings button[role=cancel]");
		await button.click();
		await expect(page.locator("#modalSettings")).not.toBeVisible();
	})

	// TODO: Add undo test case -> maybe a problem because of the style in html tag
	test("Set zoom to 81%", async () => {
		await page.locator("#navBtnSettings").click();
		const zoom = await page.locator("input#zoom");
		await zoom.click({
			position: {
				x: 20,
				y: 2
			}
		});
		await expect(zoom).toHaveValue("81");
	})

});

test.describe("Help modal", () => {

	test.beforeAll(async () => {
		app = await electron.launch({ 
			args: ["src/main.js"],
			env: {
				"NODE_ENV": "testing",
			}
		});
		page = await app.firstWindow();
		
		await page.waitForTimeout(waitForAppToLoad);
	});

	test.afterAll(() => {
		app.close();
	});

	test("Check if tabs are clickable", async () => {
		await page.locator("#navBtnHelp").click();
		await expect(page.locator("#modalHelp")).toBeVisible();
		
		const tabs = await page.locator("#modalHelp .tabs ul li").count();
		await expect(tabs).toBe(6);

	})

	test("4 times tabbing and pressing enter select the 4th card", async () => {
		await page.keyboard.press("Tab");
		await page.keyboard.press("Tab");
		await page.keyboard.press("Tab");
		await page.keyboard.press("Enter");
		const tab = page.locator(":nth-match(#modalHelp .tabs ul li, 4)");
		await expect(tab).toHaveClass(/is-active/);
	})

	test("Escape closes window", async () => {
		await page.keyboard.press("Escape");
		await expect(page.locator("#modalHelp")).toBeHidden();

	})

});

test.describe("Search", () => {

	test.beforeAll(async () => {
		app = await electron.launch({ 
			args: ["src/main.js"],
			env: {
				"NODE_ENV": "testing",
				"SLEEK_CUSTOM_FILE": "test/todo.txt"
			}
		});
		page = await app.firstWindow();
		
		await page.waitForTimeout(waitForAppToLoad);
	});

	test.afterAll(() => {
		app.close();
	});

	test("Add string to search input and expect 2 results", async () => {
		await page.fill("#todoTableSearch", "@phone");
		await page.waitForTimeout(waitForAppToLoad);
		const rows = await page.locator("#todoTable .todo").count();
		await expect(rows).toBe(2);
		await page.fill("#todoTableSearch", "");
	})

	test("Add advanced search string with two filter parameters and expect 1 result", async () => {
		await page.fill("#todoTableSearch", "@phone AND +Garagesale");
		await page.waitForTimeout(waitForAppToLoad);
		const rows = await page.locator("#todoTable .todo").count();
		await expect(rows).toBe(1);

		const dataItem = await page.locator(":nth-match(#todoTable .todo, 1)").getAttribute("data-item");
		await expect(dataItem).toBe("(A) Thank Mom for the meatballs  x 2021-04-07 (B) Schedule Goodwill pickup   Eskimo pies  Really gotta call Mom this task has no priority (A)   (b) Get back to the boss this task has no priority due:2023-06-10 +GarageSale @phone @phone @GroceryStore @phone @someday");
	})

	test("Add advanced search string to exclude all todos that are completed and contain a project", async () => {
		await page.fill("#todoTableSearch", "not complete and !+");
		await page.waitForTimeout(waitForAppToLoad);
		const rows = await page.locator("#todoTable .todo").count();
		await expect(rows).toBe(13);
	})

	test("Search query produces 0 results and reset button will restore all todos", async () => {
		await page.locator("#todoTableSearch").fill("This will produce 0 results");
		await page.waitForTimeout(waitForAppToLoad);
		let rows = await page.locator("#todoTable .todo").count();
		await expect(rows).toBe(0);
		await page.locator("#btnNoResultContainerResetFilters").click();
		await page.waitForTimeout(waitForAppToLoad);
		rows = await page.locator("#todoTable .todo").count();
		await expect(rows).toBe(18);
	});

});

test.describe("File chooser", () => {

	test.beforeAll(async () => {
		app = await electron.launch({ 
			args: ["src/main.js"],
			env: {
				"NODE_ENV": "testing",
				"SLEEK_CUSTOM_FILE": "test/todo.txt"
			}
		});
		page = await app.firstWindow();
		
		await page.waitForTimeout(waitForAppToLoad);
	});

	test.afterAll(() => {
		app.close();
	});

	test("Click in navigation opens file chooser", async () => {
		await page.locator("#navBtnOpenTodoFile").click();
		await expect(page.locator("#modalChangeFile")).toBeVisible();
	})

	test("Select button is disabled and all other buttons are enabled", async () => {
		await expect(await page.locator("#modalChangeFileTable tr td button")).toBeDisabled();
		await expect(await page.locator("#modalChangeFileTable tr td i")).toBeEnabled();
		await expect(await page.locator("#btnFilesOpenTodoFile")).toBeEnabled();
		await expect(await page.locator("#btnFilesCreateTodoFile")).toBeEnabled();
		await expect(await page.locator("#btnFilesCancel")).toBeEnabled();
	})

	test("Count one existing file in list", async () => {
		const files = await page.locator("#modalChangeFileTable tr").count();
		await expect(files).toBe(1);
	})

});

// TODO
// test.describe("Drawer handle", () => {

// 	test.beforeAll(async () => {
// 		app = await electron.launch({ 
// 			args: ["src/main.js"],
// 			env: {
// 				"NODE_ENV": "testing",
// 				"SLEEK_CUSTOM_FILE": "test/todo.txt"
// 			}
// 		});
// 		page = await app.firstWindow();
// 		
// 		await page.waitForTimeout(waitForAppToLoad);
// 	});

// 	test.afterAll(() => {
// 		app.close();
// 	});

// 	test("Click in navigation opens file chooser", async () => {
// 		await page.locator("#navBtnFilter").click();
// 		await expect(page.locator("#filterDrawer")).toBeVisible();

// 		const handle = await page.locator("#handle");
// 		await handle.dragTo("#todoTable", {
// 			"targetPosition": {
// 				"x": 1000,
// 				"y": 1
// 			}
// 		});

// 		await page.waitForTimeout(100000);
// 	})

// });