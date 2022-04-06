"use strict"; 
import "../../node_modules/sugar/dist/sugar.min.js";
import "../../node_modules/jstodotxt/jsTodoExtensions.js";

import { _paq } from "./matomo.mjs"; 
import { userData, appData, translations, buildTable } from "../render.js";
import { categories, selectFilter } from "./filters.mjs";
import { convertDate, isToday, isTomorrow, isPast } from "./date.mjs";
import { createModalJail } from "./jail.mjs";
import { focusRow } from "./keyboard.mjs";
import { showRecurrences, setInput } from "./recurrencePicker.mjs";
import { getActiveFile, getDoneFile, handleError, pasteItemToClipboard, generateGenericNotification, generateTodoNotification } from "./helper.mjs";
import { getConfirmation } from "./prompt.mjs";
import { show } from "./form.mjs"; 
import { SugarDueExtension, RecExtension, ThresholdExtension } from "./todotxtExtensions.mjs";

const item = { previous: "" }
const items = { objects: {} }
const resultStats = document.getElementById("resultStats");
const tableContainerCategoriesTemplate = document.createElement("div");
const todoContext = document.getElementById("todoContext");
const todoContextDelete = document.getElementById("todoContextDelete");
const todoContextCopy = document.getElementById("todoContextCopy");
const todoContextUseAsTemplate = document.getElementById("todoContextUseAsTemplate");
const todoContextPriorityIncrease = document.getElementById("todoContextPriorityIncrease");
const todoContextPriorityDecrease = document.getElementById("todoContextPriorityDecrease");
const todoTable = document.getElementById("todoTable");
const todoTableBodyCellArchiveTemplate = document.createElement("span");
const todoTableBodyCellCheckboxTemplate  = document.createElement("div");
const todoTableBodyCellDueDateTemplate = document.createElement("span");
const todoTableBodyCellTDateTemplate = document.createElement("span");
const todoTableBodyCellHiddenTemplate = document.createElement("span");
const todoTableBodyCellPriorityTemplate = document.createElement("div");
const todoTableBodyCellRecurrenceTemplate = document.createElement("span");
const todoTableBodyCellTextTemplate = document.createElement("div");
const todoTableBodyRowTemplate = document.createElement("div");
const todoTableWrapper = document.getElementById("todoTableWrapper");
let
  clusterCounter = 0,
  clusterSize = Math.ceil(window.innerHeight/32), // 32 being the pixel height of one todo in compact mode
  clusterThreshold = clusterSize;

todoContextDelete.innerHTML = translations.delete;
todoContextCopy.innerHTML = translations.copy;
todoContextUseAsTemplate.innerHTML = translations.useAsTemplate;

tableContainerCategoriesTemplate.setAttribute("class", "cell categories");
todoTableBodyCellCheckboxTemplate.setAttribute("class", "cell checkbox");
todoTableBodyCellDueDateTemplate.setAttribute("class", "cell hint itemDueDate");
todoTableBodyCellTDateTemplate.setAttribute("class", "cell");
todoTableBodyCellRecurrenceTemplate.setAttribute("class", "cell hint");
todoTableBodyCellTextTemplate.setAttribute("class", "cell text");
todoTableBodyCellTextTemplate.setAttribute("href", "#");
todoTableBodyRowTemplate.setAttribute("class", "todo");
todoTableBodyRowTemplate.setAttribute("tabindex", "0");

todoTableWrapper.onscroll = function(event) {
  // abort if all todos are shown already
  if(todoTable.children.length === items.filtered.length) return false;

  // if the end of the page is reached start building
  if(Math.floor(event.target.scrollHeight - event.target.scrollTop) <= event.target.clientHeight) {
    // each time user hits view bottom, the clusterThreshold is being enhanced by clusterSize
    clusterThreshold = clusterThreshold + clusterSize;
    
    buildTable().then(function(response) {
      console.info(response);
    }).catch(function(error) {
      handleError(error);
    });
  }
}

async function generateTodoTxtObjects(fileContent) {
  try {

    // create todo.txt objects
    if(fileContent !== undefined) items.objects = await TodoTxt.parse(fileContent, [ new SugarDueExtension(), new HiddenExtension(), new RecExtension(), new ThresholdExtension() ])

    // empty lines will be filtered
    items.objects = items.objects.filter(function(item) { return item.toString() !== "" });

    return Promise.resolve("Success: New todo object created");

  } catch(error) {
    error.functionName = generateTodoTxtObjects.name;
    return Promise.reject(error);
  }
}
function generateTodoTxtObject(string) {
  try {
    const todo = new TodoTxtItem(string, [ new SugarDueExtension(), new HiddenExtension(), new RecExtension(), new ThresholdExtension() ]);
    return Promise.resolve(todo);
  } catch(error) {
    error.functionName = editTodo.name;
    return Promise.reject(error);
  }
}
function generateTable(loadAll) {
  try {

    const sortBy = userData.sortBy[0];
    
    // TODO: rather append next batch of todos instead of erasing the table each time
    // cleans the table
    todoTable.textContent = "";

    // show todo stats
    showResultStats();

    // first a group headline is being built
    // second all group items will be built
    for(let group in items.grouped) {

      // break the loop if cluster threshold is reached
      // loadAll skips this break and forces everything to be built
      if(!loadAll && clusterCounter === clusterThreshold) break;

      // this creates a whutespace used to separate groups
      let groupHeadline = "";

      // create the group name
      if(items.grouped[group][0] !== "null" && items.grouped[group][0] !== "completed") groupHeadline = items.grouped[group][0].replace(/,/g, ', ');

      // this adds css classes for formatting
      let groupFormattingClass = groupHeadline;

      // in case a group headline is in fact a date
      // add color coding for today, tomorrow and past and translations for today and tomorrow headlines
      if(sortBy === "due" && !isNaN(Date.parse(groupHeadline))) {
        const date = convertDate(groupHeadline);
        if(isToday(date)) {
          groupHeadline = translations.today; 
          groupFormattingClass = "today";
        } else if(isTomorrow(date)) {
          groupHeadline = translations.tomorrow;
          groupFormattingClass = "tomorrow";
        } else if(isPast(date)) {
          groupFormattingClass = "past";
        }
      }

      // builds the groups button
      if(groupHeadline) groupHeadline = `<a href="#" tabindex="-1" class="button ${groupFormattingClass} ${sortBy}">${groupHeadline}</a>`;

      // append group headline to table
      todoTable.appendChild(
        document
          .createRange()
          .createContextualFragment(`
          <div class="group ${sortBy}">
            <div class="cell">${groupHeadline}</div>
          </div>`)
      );

      // loop through items in group
      for (let item in items.grouped[group][1]) {

        // when todo is added counter moves +1
        clusterCounter++;

        // break the loop if cluster threshold is reached
        // loadAll skips this break and forces everything to be built
        if(!loadAll && clusterCounter === clusterThreshold) break;

        const todo = items.grouped[group][1][item];

        // incompleted todos with due date for today or tomorrow will trigger notifications
        if(todo.due && (isToday(todo.due) || isTomorrow(todo.due)) && !todo.complete) {
          
          generateTodoNotification(todo).then(response => {
            console.log(response);
          }).catch(error => {
            handleError(error);
          });

        }

        // add a generated row to collecting array
        todoTable.appendChild(generateTableRow(todo));
      }
    }

    // reset cluster counter
    clusterCounter = 0;
    
    return Promise.resolve("Success: Table has been built");

  } catch(error) {
    error.functionName = generateTable.name;
    return Promise.reject(error);
  }
}
// based on items.filtered a grouped object is being appended to items object
function generateGroupedObjects() {
  try {
    // sortByFile will create an empty group and add all items to it
    if(userData.sortByFile) {
      items.grouped = new Array;
      items.grouped[0] = new Array;
      items.grouped[0].push("null", items.filtered);

      // invert sorting if needed
      if(userData.invertSorting) items.grouped[0][1] = items.grouped[0][1].reverse();

      return Promise.resolve("Success: No groups being built due to sortByFile setting");
    }

    const sortBy = userData.sortBy[0];

    // build object according to sorting method
    items.grouped = items.filtered.reduce((object, a) => {

      // grouping of completed todos
      if(userData.sortCompletedLast && a.complete) {
        object["completed"] = [...object["completed"] || [], a];

      // in case key is a date object it will be converted to todo.txt date string (xxxx-xx-xx)
      } else if(a[sortBy] instanceof Date) {
        object[convertDate(a[sortBy])] = [...object[convertDate(a[sortBy])] || [], a];

      // group for whatever sortBy has been defined: priority, context, project
      // or in case value for sortBy key is empty, group will be null
      } else {
        (a[sortBy]) ? object[a[sortBy]] = [...object[a[sortBy]] || [], a] : object[null] = [...object[null] || [], a];
      }

      return object;

    }, {});

    // // object is converted to a sorted array
    items.grouped = Object.entries(items.grouped).sort(function(a,b) {
      // when a is null sort it after b
      if(a[0] === "null") {
        if(userData.invertSorting) return -1;
        return 1;
      }
      // when b is null sort it after a
      if(b[0] === "null") {
        if(userData.invertSorting) return 1;
        return -1;
      }
      // sort the rest alphabetically
      if(a[0] < b[0]) {
        return -1;
      }
    });

    // sort completed todo to the end of the list
    if(userData.sortCompletedLast) {
      items.grouped.sort(function(a, b) {
        // when a is null sort it after b
        if(a[0]==="completed") return 1;
        // when b is null sort it after a
        if(b[0]==="completed") return -1;
        return 0;
      });
    }

    // sort the items within the groups
    items.grouped.forEach(async (group) => {
      group[1] = await sortTodosInGroup(group[1]).then(function(response) {
        return response;
      }).catch(function(error) {
        handleError(error);
      });
    });

    // invert sorting
    if(userData.invertSorting) items.grouped = items.grouped.reverse();

    return Promise.resolve("Success: Todos have been grouped and sorted");

  } catch(error) {
    error.functionName = generateGroupedObjects.name;
    return Promise.reject(error);
  }
}
function generateTableRow(todo) {
  try {

    // create nodes from templates
    let todoTableBodyRow = todoTableBodyRowTemplate.cloneNode(true);
    let todoTableBodyCellCheckbox = todoTableBodyCellCheckboxTemplate.cloneNode(true);
    let todoTableBodyCellText = todoTableBodyCellTextTemplate.cloneNode(true);
    let tableContainerCategories = tableContainerCategoriesTemplate.cloneNode(true);
    let todoTableBodyCellPriority = todoTableBodyCellPriorityTemplate.cloneNode(true);
    let todoTableBodyCellDueDate = todoTableBodyCellDueDateTemplate.cloneNode(true);
    let todoTableBodyCellTDate = todoTableBodyCellTDateTemplate.cloneNode(true);
    let todoTableBodyCellRecurrence = todoTableBodyCellRecurrenceTemplate.cloneNode(true);
    let todoTableBodyCellArchive = todoTableBodyCellArchiveTemplate.cloneNode(true);
    let todoTableBodyCellHidden = todoTableBodyCellHiddenTemplate.cloneNode(true);
    
    const sortBy = userData.sortBy[0];

    // if new item was saved, row is being marked
    // previous object is emptied
    if(item.previous && todo.toString() === item.previous.toString()) {
      todoTableBodyRow.setAttribute("id", "previousItem");
      item.previous = null;
    }

    // start with the individual config of the items
    if(todo.complete) todoTableBodyRow.setAttribute("class", "todo completed")

    // add todo string to data-item attribute
    todoTableBodyRow.setAttribute("data-item", todo.toString());

    // add the priority marker or a white spacer
    if(todo.priority && (sortBy === "priority" && !userData.sortByFile)) {
      todoTableBodyCellPriority.setAttribute("class", "cell priority " + todo.priority);
      todoTableBodyRow.appendChild(todoTableBodyCellPriority);
    }

    // add the checkbox
    if(todo.complete) {
      todoTableBodyCellCheckbox.setAttribute("title", translations.inProgress);
      todoTableBodyCellCheckbox.innerHTML = "<i class=\"fas fa-check-square\"></i>";
      todoTableBodyRow.appendChild(todoTableBodyCellCheckbox);

      todoTableBodyCellArchive.setAttribute("class", "cell archive");
      todoTableBodyCellArchive.innerHTML = "<a href=\"#\"><i class=\"fas fa-archive\"></i></a>";
      todoTableBodyCellArchive.onclick = function() {

        // ask for confirmation before triggering archiving
        getConfirmation(archiveTodos, translations.archivingPrompt);
        
        // trigger matomo event
        if(userData.matomoEvents) _paq.push(["trackEvent", "Todo-Table", "Click on Archive button"]);
      }

      // append the due date to the text item
      
    } else {
      todoTableBodyCellCheckbox.setAttribute("title", translations.done);
      todoTableBodyCellCheckbox.innerHTML = "<i class=\"far fa-square\"></i>";
      
    }

    todoTableBodyRow.appendChild(todoTableBodyCellCheckbox);
    if(appData.channel !== "Mac App Store") todoTableBodyRow.appendChild(todoTableBodyCellArchive);

    // add a listener on the checkbox to call the completeItem function
    todoTableBodyCellCheckbox.onclick = function() {
      
      // passing the todo object to complete function
      setTodoComplete(todo).then(response => {
         console.log(response);
      }).catch(error => {
        handleError(error);
      });

      // trigger matomo event
      if(userData.matomoEvents) _paq.push(["trackEvent", "Todo-Table", "Click on Checkbox"]);
    }
    
    // add hidden icon
    if(todo.h) {
      todoTableBodyRow.setAttribute("class", "todo is-greyed-out");
      todoTableBodyCellHidden.setAttribute("class", "cell");
      todoTableBodyCellHidden.innerHTML = "<i class=\"far fa-eye-slash\"></i>";
      todoTableBodyRow.appendChild(todoTableBodyCellHidden);
    }

    // creates cell for the text
    if(todo.text) {

      // adds priority to the text cell
      if(todo.priority && (sortBy !== "priority" || userData.sortByFile)) todoTableBodyCellText.innerHTML = `<a class="priority button ${todo.priority}">${todo.priority}</a>`;

      // parse text string through markdown parser
      todoTableBodyCellText.innerHTML +=  "<span class=\"text\">" + marked.parseInline(todo.text) + "</span>";

      // replace line feed character with a space
      todoTableBodyCellText.innerHTML = todoTableBodyCellText.innerHTML.replaceAll(String.fromCharCode(16)," ");

      todoTableBodyRow.appendChild(todoTableBodyCellText);
    }

    // click on the text
    todoTableBodyCellText.onclick = function(event) {
      // if the clicked item is not the external link icon, show(true) will be called
      if(!event.target.classList.contains("fa-external-link-alt")) {
        show(this.parentElement.getAttribute("data-item")).then(response => {
          console.log(response);
        }).catch(error => {
          handleError(error);
        });
        // trigger matomo event
        if(userData.matomoEvents) _paq.push(["trackEvent", "Todo-Table", "Click on Todo item"]);
      }
    }
    
    // check for and add a given due date
    if(todo.due) {
      let dateFieldContent = convertDate(todo.due);
      
      if(isToday(todo.due)) {
        todoTableBodyCellDueDate.classList.add("today");
        dateFieldContent = translations.today;
      } else if(isTomorrow(todo.due)) {
        todoTableBodyCellDueDate.classList.add("tomorrow");
        dateFieldContent = translations.tomorrow;
      } else if(isPast(todo.due)) {
        todoTableBodyCellDueDate.classList.add("past");
      }

      todoTableBodyCellDueDate.innerHTML = `
        <i class="fa-solid fa-clock"></i>
        <div class="tags has-addons">
          <span class="tag">due:</span><span class="tag is-dark">${dateFieldContent}</span>
        </div>
        <i class="fas fa-sort-down"></i>`;

      // ugly workaround so datepicker does not fallback to inline mode
      const todoTableBodyCellDueDateHiddenInput = document.createElement("input");
      todoTableBodyCellDueDateHiddenInput.type = "button"
      todoTableBodyCellDueDateHiddenInput.setAttribute("tabindex", "-1");
      todoTableBodyCellDueDateHiddenInput.classList.add("transparentInput")
      todoTableBodyCellDueDateHiddenInput.onclick = async function(event) {
        
        // prevent body event listener to be triggered
        event.stopPropagation();

        // retrieve datepicker function
        const datePicker = await import("./datePicker.mjs");

        // create datepicker and attach it to hidden input
        datePicker.createDatepickerInstance(this, false, "due", todo).then(response => {
          console.log(response)
        }).catch(error => {
          handleError(error);
        });

      }
      todoTableBodyCellDueDate.appendChild(todoTableBodyCellDueDateHiddenInput);
      todoTableBodyRow.appendChild(todoTableBodyCellDueDate);
    }

    // add threshold date icon
    if(todo.t) {
      todoTableBodyCellTDate.innerHTML = `<i class="fa-regular fa-clock"></i>`
      todoTableBodyRow.appendChild(todoTableBodyCellTDate);
    }

    // TODO: Add recurrence picker function
    // add recurrence icon
    if(todo.rec) {

      const recLabel = (setInput(todo.rec)) ? setInput(todo.rec) : todo.rec

      todoTableBodyCellRecurrence.innerHTML = `
        <i class="fa-solid fa-repeat"></i>
        <div class="tags has-addons">
          <span class="tag">rec:</span><span class="tag is-dark">${recLabel}</span>
        </div>
        <i class="fas fa-sort-down"></i>`;
      todoTableBodyCellRecurrence.onclick = function(event) {
    
        // prevent body event listener to be triggered
        event.stopPropagation();

        // create datepicker and attach it to hidden input
        showRecurrences(event.target, todo);

      }
      todoTableBodyRow.appendChild(todoTableBodyCellRecurrence);
    }

    // cell for the categories
    categories.forEach(category => {

      if(todo[category] && category !== "priority") {

        todo[category].forEach(element => {
          let todoTableBodyCellCategory = document.createElement("a");
          todoTableBodyCellCategory.classList.add("tag", category)
          todoTableBodyCellCategory.onclick = function() {
            selectFilter(element, category).then(response => {
              console.log(response)
            }).catch(error => {
              handleError(error);
            });
          }
          todoTableBodyCellCategory.innerHTML = element;

          // selected filters are empty, unless they were persisted
          if(userData.selectedFilters && userData.selectedFilters.length > 0) {
            JSON.parse(userData.selectedFilters).forEach(function(filter) {
              if(JSON.stringify(filter) === '["' + element + '","' + category + '"]') todoTableBodyCellCategory.classList.toggle("is-dark")
            });
          }

          tableContainerCategories.appendChild(todoTableBodyCellCategory);
        });
      }
    });
    
    todoTableBodyRow.oncontextmenu = function() {
      createTodoContext(todoTableBodyRow).then(response => {
        console.log(response);
      }).catch(error => {
        handleError(error);
      });

      const index = Array.prototype.indexOf.call(todoTable.querySelectorAll(".todo"), todoTableBodyRow);
      focusRow(index);
    }

    todoTableBodyRow.onfocus = function() {
      const index = Array.prototype.indexOf.call(todoTable.querySelectorAll(".todo"), todoTableBodyRow);
      focusRow(index);
    }
    
    // only add the categories to text cell if it has child nodes
    if(tableContainerCategories.hasChildNodes()) todoTableBodyRow.appendChild(tableContainerCategories);

    // return the fully built row
    return todoTableBodyRow;

  } catch(error) {
    error.functionName = generateTableRow.name;
    return Promise.reject(error);
  }
}
async function createTodoContext(todoTableRow) {
  try {

    // get index of todo
    let index = await items.objects.map(function(object) {return object.toString(); }).indexOf(todoTableRow.getAttribute("data-item"));
    // retrieve todo object
    const todo = items.objects[index]

    const useAsTemplate = function() {
      show(todo.toString(), true).then(response => {
        console.log(response);
      }).catch(error => {
        handleError(error);
      });

      todoContext.classList.toggle("is-active");
      todoContext.removeAttribute("data-item");

      // trigger matomo event
      if(userData.matomoEvents) _paq.push(["trackEvent", "Todo-Table-Context", "Click on Use as template"]);
    }
    const copyTodo = async function() {
      pasteItemToClipboard(todo).then(response => {
        console.log(response);
      }).catch(error => {
        handleError(error);
      });

      todoContext.classList.toggle("is-active");
      todoContext.removeAttribute("data-item");

      // trigger matomo event
      if(userData.matomoEvents) _paq.push(["trackEvent", "Todo-Table-Context", "Click on Copy"]);
    }
    const deleteTodo = async function() {
      // remove item at index  
      items.objects.splice(index, 1);
      
      //write the data to the file
      window.api.send("writeToFile", [items.objects.join("\n").toString() + "\n"]);      
      
      todoContext.classList.remove("is-active");
      todoContext.removeAttribute("data-item");
      
      // trigger matomo event
      if(userData.matomoEvents) _paq.push(["trackEvent", "Todo-Table-Context", "Click on Delete"]);
    }
    const changePriority = function(direction) {

      let nextIndex = 97;

      // in case a todo has no priority and the 1st grouping method is priority
      if(!items.objects[index].priority && userData.sortBy[0] === "priority") {
        const index = items.grouped.length - 2;
        // this receives the lowest available priority group
        (index >= 0) ? nextIndex = items.grouped[index][0].toLowerCase().charCodeAt(0) : nextIndex = 97
      // change priority based on current priority
      } else if(items.objects[index].priority) {
        const currentPriority = items.objects[index].priority.toLowerCase().charCodeAt(0)
        nextIndex = currentPriority + direction;
      }

      if(nextIndex <= 96 || nextIndex >= 123) return false

      items.objects[index].priority = String.fromCharCode(nextIndex).toUpperCase();

      //write the data to the file
      window.api.send("writeToFile", [items.objects.join("\n").toString() + "\n"]);

      todoContext.classList.remove("is-active");
      todoContext.removeAttribute("data-item");

      // trigger matomo event
      if(userData.matomoEvents) _paq.push(["trackEvent", "Todo-Table-Context", "Click on Priority changer"]);

    }

    todoContext.setAttribute("data-item", todoTableRow.getAttribute("data-item"))
    todoContext.setAttribute("data-item", todoTableRow.getAttribute("data-item"))
  
    // click on increse priority option
    todoContextPriorityIncrease.onclick = function() {
      changePriority(-1);
    }
    todoContextPriorityIncrease.onkeypress = function(event) {
      if(event.key !== "Enter") return false;
      changePriority(-1);
    }
    // click on decrease priority option
    todoContextPriorityDecrease.onclick = function() {
      changePriority(1);
    }
    todoContextPriorityDecrease.onkeypress = function(event) {
      if(event.key !== "Enter") return false;
      changePriority(1);
    }
    // click on use as template option
    todoContextUseAsTemplate.onclick = function() {
      useAsTemplate();
    }
    todoContextUseAsTemplate.onkeypress = function(event) {
      if(event.key !== "Enter") return false;
      useAsTemplate();
    }
    // click on copy
    todoContextCopy.onclick = function() {
      copyTodo();
    }
    todoContextCopy.onkeypress = function(event) {
      if(event.key !== "Enter") return false;
      copyTodo();
    }
    // click on delete
    todoContextDelete.onclick = function() {
      deleteTodo();
    }
    todoContextDelete.onkeypress = function(event) {
      if(event.key !== "Enter") return false;
      deleteTodo();
    }

    todoContext.classList.add("is-active");

    if(!event.x && !event.y) {
      const box = todoTableRow.getBoundingClientRect();
      todoContext.style.left = box.right - todoContext.offsetWidth + "px";
      todoContext.style.top = box.top + "px";
    } else {
      todoContext.style.left = event.x + "px";
      todoContext.style.top = event.y + "px";
    }
    
    // ugly but neccessary: if triggered to fast arrow right will do a first row change in jail 
    setTimeout(function() {
      createModalJail(todoContext).then(response => {
        console.log(response);
      }).catch(error => {
        handleError(error);
      });
    }, 10);

    return Promise.resolve("Success: Context opened");

  } catch(error) {
    error.functionName = createTodoContext.name;
    return Promise.reject(error);
  }
}
function sortTodosInGroup(group) {
  try {
    // start at 1 to skip sorting method used for 1st level grouping
    const l = userData.sortBy.length;
    for(let i = 1; i < l; i++) {
      group.sort(function(a, b) {

        // only continue if the two items have the same filters from all previous iterations
        if(JSON.stringify(a[userData.sortBy[i-4]]) !== JSON.stringify(b[userData.sortBy[i-4]])) return
        if(JSON.stringify(a[userData.sortBy[i-3]]) !== JSON.stringify(b[userData.sortBy[i-3]])) return
        if(JSON.stringify(a[userData.sortBy[i-2]]) !== JSON.stringify(b[userData.sortBy[i-2]])) return
        if(JSON.stringify(a[userData.sortBy[i-1]]) !== JSON.stringify(b[userData.sortBy[i-1]])) return

        const
          item1 = a[userData.sortBy[i]],
          item2 = b[userData.sortBy[i]];

        // if first item is empty it will be sorted after second item
        if(!item1 || (item1 > item2)) return 1;
        // if second item is empty it will be sorted before first item
        if(!item2 || (item1 < item2)) return -1;
        
      });
    }

    return Promise.resolve(group);

  } catch(error) {
    error.functionName = sortTodosInGroup.name;
    return Promise.reject(error);
  }
}
// TODO: Save seen notifications and messages somewhere else
async function setTodoComplete(todo) {
  try {

    if(typeof todo === "string") todo = await generateTodoTxtObject(todo)

    // get index of todo
    const index = await items.objects.map(function(item) {return item.toString(); }).indexOf(todo.toString());

    // mark item as in progress
    if(todo.complete) {
      // if item was already completed we set complete to false and the date to null
      todo.complete = false;
      todo.completed = null;

    // Mark item as complete
    } else if(!todo.complete) {
      todo.complete = true;
      // add completed date which is today
      todo.completed = new Date();

      // if recurrence is set start generating the recurring todo
      if(todo.rec) await generateRecurrence(todo).then(function(response) {
        console.log(response);
      }).catch(function(error) {
        handleError(error);
      });
      
      if(todo.priority) {
        // and preserve prio
        todo.text += " pri:" + todo.priority
        // finally remove priority
        todo.priority = null;
      }

    }

    // delete old todo from array and add the new one at it's position
    items.objects.splice(index, 1, todo);

    //write the data to the file and advice to focus the row after reload
    window.api.send("writeToFile", [items.objects.join("\n").toString() + "\n"]);

    return Promise.resolve("Success: Changes written to file: " + getActiveFile());

  } catch(error) {
    error.functionName = setTodoComplete.name;
    return Promise.reject(error);
  }
}
// creates todo object and appends it to the file
async function addTodo(todo) {
  try {

    todo = await generateTodoTxtObject(todo).then(response => {
      return response;
    }).catch(error => {
      handleError(error);
    });

    // abort if there is no text
    if(!todo.text && !todo.h) return Promise.resolve("Info: Text is missing, no todo is written");

    // we add the current date to the start date attribute of the todo.txt object
    if(userData.appendStartDate) todo.date = new Date();

    // get index of todo
    const index = items.objects.map(function(item) { return item.toString(); }).indexOf(todo.toString());
    
    if(index === -1) {
      // we build the array
      items.objects.push(todo);
      //write the data to the file
      // a newline character is added to prevent other todo.txt apps to append new todos to the last line
      window.api.send("writeToFile", [items.objects.join("\n").toString() + "\n"]);

      return Promise.resolve("Success: New todo added to file: " + getActiveFile());

    } else {
      return Promise.resolve("Info: Todo already in file, nothing will be written");
    }
  } catch (error) {
    return Promise.reject(error);
  }
}
function editTodo(index, todo) {
  try {
    // put changed todo at old position
    items.objects.splice(index, 1, todo);

    // save to file
    window.api.send("writeToFile", [items.objects.join("\n").toString() + "\n"]);

    return Promise.resolve("Success: Todo edited");

  } catch(error) {
    error.functionName = editTodo.name;
    return Promise.reject(error);
  }
}
function showResultStats() {
  resultStats.firstElementChild.innerHTML = translations.visibleTodos + "&nbsp;<strong>" + items.filtered.length + " </strong>&nbsp;" + translations.of + "&nbsp;<strong>" + items.objects.length + "</strong>";
  (items.filtered.length !== items.objects.length) ? resultStats.classList.add("is-active") : resultStats.classList.remove("is-active")
}
async function archiveTodos() {
  try {

    const activeFile = getActiveFile();
    const doneFile = getDoneFile();

    let completeTodos = await items.objects.filter(function(item) { return item.complete === true });
    let incompleteTodos = await items.objects.filter(function(item) { return item.complete === false });

    // if user archives within done.txt file, operating is canceled
    if(activeFile.includes("_done.")) return Promise.resolve("Info: Current file seems to be a done.txt file, won't archive")
    
    let contentFromDoneFile = await new Promise(function(resolve) {
      window.api.send("getContent", doneFile);
      return window.api.receive("getContent", (content) => {
        resolve(content);
      });
    });

    if(contentFromDoneFile) {
      // create array from done file
      contentFromDoneFile = contentFromDoneFile.split("\n");

      //combine the two arrays
      completeTodos = contentFromDoneFile.concat(completeTodos.toString().split(","));

      // use Set function to remove the duplicates: https://www.javascripttutorial.net/array/javascript-remove-duplicates-from-array/
      completeTodos = [...new Set(completeTodos)];

      // remove empty entries
      completeTodos = completeTodos.filter(function(element) { return element });
    }

    //write completed items to done file
    window.api.send("writeToFile", [completeTodos.join("\n").toString() + "\n", doneFile]);

    // write incompleted items to todo file
    window.api.send("writeToFile", [incompleteTodos.join("\n").toString() + "\n", activeFile]);

    // send notifcation on success
    generateGenericNotification(translations.archivingCompletedTitle, translations.archivingCompletedBody + doneFile).then(function(response) {
      console.log(response);
    }).catch(function(error) {
      handleError(error);
    });

    return Promise.resolve("Success: Completed todos appended to: " + doneFile);

  } catch(error) {
    error.functionName = archiveTodos.name;
    return Promise.reject(error);
  }
}

export { generateTodoTxtObjects, generateGroupedObjects, generateTable, items, item, setTodoComplete, archiveTodos, addTodo, editTodo, show, createTodoContext, generateTodoTxtObject };
