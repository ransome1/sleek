"use strict";
import { userData, appData, handleError, translations, setUserData, _paq } from "../render.js";
import { RecExtension } from "./todotxtExtensions.mjs";
import { categories } from "./filters.mjs";
import { generateRecurrence } from "./recurrences.mjs";
import { convertDate, isToday, isTomorrow, isPast } from "./date.mjs";
import { show } from "./form.mjs";
const modalForm = document.getElementById("modalForm");
const todoTableContainer = document.getElementById("todoTableContainer");
// ########################################################################################################################
// CONFIGURE MARKDOWN PARSER
// ########################################################################################################################
marked.setOptions({
  pedantic: false,
  gfm: true,
  breaks: false,
  sanitize: false,
  sanitizer: false,
  smartLists: false,
  smartypants: false,
  xhtml: false,
  baseUrl: "https://"
});
const renderer = {
  link(href, title, text) {
    // truncate the url
    if(text.length > 40) text = text.slice(0, 40) + " [...] ";
    return `${text} <a href="${href}" target="_blank"><i class="fas fa-external-link-alt"></i></a>`;
  }
};
marked.use({ renderer });
// ########################################################################################################################
// PREPARE TABLE
// ########################################################################################################################
const todoTableItemMore = document.querySelectorAll(".todoTableItemMore");
const tableContainerContent = document.createDocumentFragment();
const todoTableBodyRowTemplate = document.createElement("div");
const todoTableBodyCellCheckboxTemplate  = document.createElement("div");
const todoTableBodyCellTextTemplate = document.createElement("a");
const tableContainerCategoriesTemplate = document.createElement("span");
const todoTableBodyCellMoreTemplate = document.createElement("div");
const todoTableBodyCellPriorityTemplate = document.createElement("div");
const todoTableBodyCellSpacerTemplate = document.createElement("div");
const todoTableBodyCellDueDateTemplate = document.createElement("span");
const todoTableBodyCellRecurrenceTemplate = document.createElement("span");
const item = { previous: "" }
let items;
let visibleRows;
function generateItems(content) {
  try {
    items = { objects: TodoTxt.parse(content, [ new DueExtension(), new RecExtension(), new HiddenExtension() ]) }
    items.objects = items.objects.filter(function(item) {
      if(!item.text) return false;
      return true;
    });
    items.complete = items.objects.filter(function(item) { return item.complete === true });
    items.incomplete = items.objects.filter(function(item) { return item.complete === false });
    items.objects = items.objects.filter(function(item) { return item.toString() != "" });
    return Promise.resolve(items);
  } catch(error) {
    error.functionName = generateItems.name;
    return Promise.reject(error);
  }
}
function generateGroups(items) {
  // after filters have been built a last selection has to be made including the previous filter choices
  items = items.filter(function(item) {
    if(!checkIsTodoVisible(item)) return false;
    return true;
  });
  // build object according to sorting method
  items = items.reduce((object, a) => {
    if(userData.sortCompletedLast && a.complete) {
      object["completed"] = [...object["completed"] || [], a];
    } else if(userData.sortBy==="dueString" && !a.due) {
      object["noDueDate"] = [...object["noDueDate"] || [], a];
    } else {
      object[a[userData.sortBy]] = [...object[a[userData.sortBy]] || [], a];
    }
    //object[a[userData.sortBy]] = [...object[a[userData.sortBy]] || [], a];
    return object;
  }, {});
  // object is converted to a sorted array
  items = Object.entries(items).sort(function(a,b) {
    // when a is null sort it after b
    if(a[0]==="null") return 1;
    // when b is null sort it after a
    if(b[0]==="null") return -1;
    // sort alphabetically
    if(a < b) return -1;
  });
  //
  if(userData.sortCompletedLast) {
    items.sort(function(a,b) {
      // when a is null sort it after b
      if(a[0]==="completed") return 1;
      // when b is null sort it after a
      if(b[0]==="completed") return -1;
      return 0;
    });
  }
  return Promise.resolve(items)
}
function generateTable(groups) {
  // prepare the templates for the table
  return configureTodoTableTemplate().then(function(response) {
    console.info(response);
    visibleRows = 0;
    for (let group in groups) {
      // create a divider row
      // completed todos
      if(userData.sortCompletedLast && groups[group][0]==="completed") {
        tableContainerContent.appendChild(document.createRange().createContextualFragment("<div class=\"flex-table group\" role=\"rowgroup\"><div class=\"flex-row\" role=\"cell\"></div></div>"))
      // for priority, context and project
      } else if(groups[group][0]!="null" && userData.sortBy!="dueString") {
        tableContainerContent.appendChild(document.createRange().createContextualFragment("<div class=\"flex-table " + userData.sortBy + " group\" role=\"rowgroup\"><div class=\"flex-row\" role=\"cell\"><span class=\"button " + groups[group][0] + "\">" + groups[group][0].replace(/,/g, ', ') + "</span></div></div>"))
      // if sorting is by due date
      } else if(userData.sortBy==="dueString" && groups[group][1][0].due) {
        if(isToday(groups[group][1][0].due)) {
          tableContainerContent.appendChild(document.createRange().createContextualFragment("<div class=\"flex-table group due\" role=\"rowgroup\"><div class=\"flex-row isToday\" role=\"cell\"><span class=\"button\">" + translations.today + "</span></div></div>"));
        } else if(isTomorrow(groups[group][1][0].due)) {
          tableContainerContent.appendChild(document.createRange().createContextualFragment("<div class=\"flex-table group due\" role=\"rowgroup\"><div class=\"flex-row isTomorrow\" role=\"cell\"><span class=\"button\">" + translations.tomorrow + "</span></div></div>"));
        } else if(isPast(groups[group][1][0].due)) {
          tableContainerContent.appendChild(document.createRange().createContextualFragment("<div class=\"flex-table group due\" role=\"rowgroup\"><div class=\"flex-row isPast\" role=\"cell\"><span class=\"button\">" + groups[group][0] + "</span></div></div>"));
        } else {
          tableContainerContent.appendChild(document.createRange().createContextualFragment("<div class=\"flex-table group due\" role=\"rowgroup\"><div class=\"flex-row\" role=\"cell\"><span class=\"button\">" + groups[group][0] + "</span></div></div>"))
        }
      // create an empty divider row
      } else {
        tableContainerContent.appendChild(document.createRange().createContextualFragment("<div class=\"flex-table group\" role=\"rowgroup\"><div class=\"flex-row\" role=\"cell\"></div></div>"))
      }
      // sort items within this group
      const sortedGroup = sortTodoData(groups[group][1]);
      //const sortedGroup = groups[group][1];
      // build the fragments per group
      for (let item in sortedGroup) {
        let todo = sortedGroup[item];
        // if this todo is not a recurring one the rec value will be set to null
        if(!todo.rec) {
          todo.rec = null;
        // if item is due today or in the past and has recurrence it will be duplicated
        } else if(todo.due && todo.rec && !todo.complete && (isToday(todo.due) || isPast(todo.due))) {
          generateRecurrence(todo).then(response => {
            console.log(response);
          }).catch(error => {
            handleError(error);
          });
        }
        // incompleted todos with due date
        if (todo.due && !todo.complete) {
          // create notification
          if(isToday(todo.due)) {
            generateNotification(todo, 0).then(response => {
              console.log(response);
            }).catch(error => {
              handleError(error);
            });
          } else if(isTomorrow(todo.due)) {
            generateNotification(todo, 1).then(response => {
              console.log(response);
            }).catch(error => {
              handleError(error);
            });
          }
        }
        tableContainerContent.appendChild(generateTableRow(todo));
      }
      // TODO add a catch
    }
    todoTableContainer.appendChild(tableContainerContent);
    return new Promise(function(resolve) {
      resolve("Success: Todo table generated");
    });
  }).catch(error => {
    handleError(error);
  });
}
function generateTableRow(todo) {
  try {
    visibleRows++;
    // create nodes from templates
    let todoTableBodyRow = todoTableBodyRowTemplate.cloneNode(true);
    let todoTableBodyCellCheckbox = todoTableBodyCellCheckboxTemplate.cloneNode(true);
    let todoTableBodyCellText = todoTableBodyCellTextTemplate.cloneNode(true);
    let tableContainerCategories = tableContainerCategoriesTemplate.cloneNode(true);
    let todoTableBodyCellMore = todoTableBodyCellMoreTemplate.cloneNode(true);
    let todoTableBodyCellPriority = todoTableBodyCellPriorityTemplate.cloneNode(true);
    let todoTableBodyCellSpacer = todoTableBodyCellSpacerTemplate.cloneNode(true);
    let todoTableBodyCellDueDate = todoTableBodyCellDueDateTemplate.cloneNode(true);
    let todoTableBodyCellRecurrence = todoTableBodyCellRecurrenceTemplate.cloneNode(true);
    // if new item was saved, row is being marked
    if(todo.toString()==item.previous) {
      todoTableBodyRow.setAttribute("id", "previousItem");
      item.previous = null;
    }
    // start with the individual config of the items
    if(todo.complete==true) {
      todoTableBodyRow.setAttribute("class", "flex-table completed");
    }
    todoTableBodyRow.setAttribute("data-item", todo.toString());
    // add the priority marker or a white spacer
    if(todo.priority && userData.sortBy==="priority") {
      todoTableBodyCellPriority.setAttribute("class", "flex-row priority " + todo.priority);
      todoTableBodyRow.appendChild(todoTableBodyCellPriority);
    } else if(!todo.priority && userData.sortBy==="priority") {
      todoTableBodyCellSpacer.setAttribute("class", "flex-row spacer");
      todoTableBodyRow.appendChild(todoTableBodyCellSpacer);
    }
    // add the checkbox
    if(todo.complete==true) {
      todoTableBodyCellCheckbox.setAttribute("title", translations.inProgress);
      todoTableBodyCellCheckbox.innerHTML = "<a href=\"#\"><i class=\"fas fa-check-circle\"></i></a>";
    } else {
      todoTableBodyCellCheckbox.setAttribute("title", translations.done);
      todoTableBodyCellCheckbox.innerHTML = "<a href=\"#\"><i class=\"far fa-circle\"></i></a>";
    }
    // add a listener on the checkbox to call the completeItem function
    todoTableBodyCellCheckbox.onclick = function() {
      // passing the data-item attribute of the parent tag to complete function
      setTodoComplete(this.parentElement.getAttribute('data-item')).then(response => {
         console.log(response);
      }).catch(error => {
        handleError(error);
      });
      // trigger matomo event
      if(userData.matomoEvents) _paq.push(["trackEvent", "Todo-Table", "Click on Checkbox"]);
    }
    todoTableBodyRow.appendChild(todoTableBodyCellCheckbox);
    // creates cell for the text
    if(todo.text) {
      if(todo.priority && userData.sortBy!="priority") todoTableBodyCellText.innerHTML = "<span class=\"priority\"><span class=\"button " + todo.priority + "\">" + todo.priority + "</span></span>";
      // parse text string through markdown parser
      todoTableBodyCellText.innerHTML +=  marked.parseInline(todo.text);
      //todoTableBodyCellText.innerHTML =  todo.text;
      // replace line feed replacement character with a space
      todoTableBodyCellText.innerHTML = todoTableBodyCellText.innerHTML.replaceAll(String.fromCharCode(16)," ");
      // add a spacer to divide text (and link) and categories
      todoTableBodyCellText.innerHTML += " ";
    }
    // event listener for the click on the text
    todoTableBodyCellText.onclick = function() {
      // if the clicked item is not the external link icon, show(true) will be called
      if(!event.target.classList.contains('fa-external-link-alt')) {
        show(this.parentElement.getAttribute('data-item'));
        // trigger matomo event
        if(userData.matomoEvents) _paq.push(["trackEvent", "Todo-Table", "Click on Todo item"]);
      }
    }
      // cell for the categories
      categories.forEach(category => {
        if(todo[category] && category!="priority") {
          todo[category].forEach(el => {
            let todoTableBodyCellCategory = document.createElement("span");
            todoTableBodyCellCategory.setAttribute("class", "tag " + category);
            todoTableBodyCellCategory.innerHTML = el;
            tableContainerCategories.appendChild(todoTableBodyCellCategory);
          });
        }
      });
      // only add the categories to text cell if it has child nodes
      if(tableContainerCategories.hasChildNodes()) todoTableBodyCellText.appendChild(tableContainerCategories);
    // check for and add a given due date
    if(todo.due) {
      var tag = convertDate(todo.due);
      if(isToday(todo.due)) {
        todoTableBodyCellDueDate.classList.add("isToday");
        tag = translations.today;
      } else if(isTomorrow(todo.due)) {
        todoTableBodyCellDueDate.classList.add("isTomorrow");
        tag = translations.tomorrow;
      } else if(isPast(todo.due)) {
        todoTableBodyCellDueDate.classList.add("isPast");
      }
      todoTableBodyCellDueDate.innerHTML = `
        <i class="far fa-clock"></i>
        <div class="tags has-addons">
          <span class="tag">` + translations.due + `</span><span class="tag is-dark">` + tag + `</span>
        </div>
        <i class="fas fa-sort-down"></i>
      `;
      // append the due date to the text item
      todoTableBodyCellText.appendChild(todoTableBodyCellDueDate);
    }
    // add recurrence icon
    if(todo.rec) {
      todoTableBodyCellRecurrence.innerHTML = "<i class=\"fas fa-redo\"></i>";
      // append the due date to the text item
      todoTableBodyCellText.appendChild(todoTableBodyCellRecurrence);
    }
    // add the text cell to the row
    todoTableBodyRow.appendChild(todoTableBodyCellText);

    // click on three-dots-icon to open more menu
    todoTableBodyCellMore.firstElementChild.firstElementChild.onclick = function() {
      // only if this element was highlighted before, we will hide instead of show the dropdown
      if(this.parentElement.parentElement.classList.contains("is-active")) {
        this.parentElement.parentElement.classList.remove("is-active");
      } else {
        // on click we close all other active more buttons and dropdowns
        todoTableItemMore.forEach(function(item) {
          item.classList.remove("is-active");
        });
        // if this element was hidden before, we will show it now
        this.parentElement.parentElement.classList.add("is-active");
        // trigger matomo event
        if(userData.matomoEvents) _paq.push(["trackEvent", "Todo-Table", "Click on More"]);
        // click on edit
        todoTableBodyCellMore.firstElementChild.lastElementChild.firstElementChild.children[1].onclick = function() {
          show(todoTableBodyCellMore.parentElement.getAttribute('data-item'));
          // trigger matomo event
          if(userData.matomoEvents) _paq.push(["trackEvent", "Todo-Table-More", "Click on Edit"]);
        }
        // click on delete
        todoTableBodyCellMore.firstElementChild.lastElementChild.firstElementChild.children[2].onclick = function() {
          // passing the data-item attribute of the parent tag to complete function
          setTodoDelete(todoTableBodyRow.getAttribute('data-item')).then(response => {
            console.log(response);
          }).catch(error => {
            handleError(error);
          });
          // trigger matomo event
          if(userData.matomoEvents) _paq.push(["trackEvent", "Todo-Table-More", "Click on Delete"]);
        }
        // click on use as template option
        todoTableBodyCellMore.firstElementChild.lastElementChild.firstElementChild.children[0].onclick = function() {
          show(todoTableBodyCellMore.parentElement.getAttribute('data-item'), true);
          // trigger matomo event
          if(userData.matomoEvents) _paq.push(["trackEvent", "Todo-Table-More", "Click on Use as template"]);
        }
      }
    }
    // add more container to row
    todoTableBodyRow.appendChild(todoTableBodyCellMore);
    // return the fully built row
    return todoTableBodyRow;
  } catch(error) {
    error.functionName = generateTableRow.name;
    return Promise.reject(error);
  }
}
function sortTodoData(group) {
  try {
    // first sort by priority
    group = group.sort(function(a, b) {
      // most recent or already past todo will be sorted to the top
      if (a.priority < b.priority) {
        return -1;
      } else if (a.priority > b.priority) {
        return 1;
      } else {
        // if all fail, no change to sort order
        return 0;
      }
    });
    // second sort by due date
    group = group.sort(function(a, b) {
      // when a is smaller than b it, a is put after b
      if(a.priority===b.priority && a.due < b.due) return -1
      // when a is is undefined but b is not, b is put before a
      if(a.priority===b.priority && !a.due && b.due) return 1
      // when b is is undefined but a is not, a is put before b
      if(a.priority===b.priority && a.due && !b.due) return -1
      // if all fail, no change to sort order
      return 0;
    });
    return group;
  } catch(error) {
    error.functionName = sortTodoData.name;
    return Promise.reject(error);
  }
}
function setTodoComplete(todo) {
  try {
    // in case edit form is open, text has changed and complete button is pressed, we do not fall back to the initial value of todo but instead choose input value
    if(modalForm.elements[0].value) todo = modalForm.elements[0].value;
    // first convert the string to a todo.txt object
    todo = new TodoTxtItem(todo, [ new DueExtension(), new RecExtension(), new HiddenExtension() ]);
    // get index of todo
    const index = items.objects.map(function(item) {return item.toString(); }).indexOf(todo.toString());
    // mark item as in progress
    if(todo.complete) {
      // if item was already completed we set complete to false and the date to null
      todo.complete = false;
      todo.completed = null;
      // delete old item from array and add the new one at it's position
      items.objects.splice(index, 1, todo);
    // Mark item as complete
    } else if(!todo.complete) {
      if(todo.due) {
        const date = convertDate(todo.due);
        // if set to complete it will be removed from persisted notifcations
        if(userData.dismissedNotifications) {
          // the one set for today
          userData.dismissedNotifications = userData.dismissedNotifications.filter(e => e !== generateHash(date + todo.text)+0);
          // the one set for tomorrow
          userData.dismissedNotifications = userData.dismissedNotifications.filter(e => e !== generateHash(date + todo.text)+1);
          setUserData("dismissedNotifications", userData.dismissedNotifications);
        }
      }
      todo.complete = true;
      todo.completed = new Date();
      // delete old todo from array and add the new one at it's position
      items.objects.splice(index, 1, todo);
      // if recurrence is set start generating the recurring todo
      if(todo.rec) generateRecurrence(todo)
    }
    //write the data to the file
    window.api.send("writeToFile", [items.objects.join("\n").toString() + "\n", userData.file]);
    return Promise.resolve("Success: Changes written to file: " + userData.file);
  } catch(error) {
    error.functionName = setTodoComplete.name;
    return Promise.reject(error);
  }
}
function setTodoDelete(todo) {
  try {
    // in case edit form is open, text has changed and complete button is pressed, we do not fall back to the initial value of todo but instead choose input value
    if(modalForm.elements[0].value) todo = modalForm.elements[0].value;
    // first convert the string to a todo.txt object
    todo = new TodoTxtItem(todo, [ new DueExtension(), new RecExtension(), new HiddenExtension() ]);
    // get index of todo
    const index = items.objects.map(function(item) {return item.toString(); }).indexOf(todo.toString());
    // Delete item
    if(todo.due) {
      var date = convertDate(todo.due);
      // if deleted it will be removed from persisted notifcations
      if(userData.dismissedNotifications) {
        // the one set for today
        userData.dismissedNotifications = userData.dismissedNotifications.filter(e => e !== generateHash(date + todo.text)+0);
        // the one set for tomorrow
        userData.dismissedNotifications = userData.dismissedNotifications.filter(e => e !== generateHash(date + todo.text)+1);
        setUserData("dismissedNotifications", userData.dismissedNotifications);
      }
    }
    items.objects.splice(index, 1);
    //write the data to the file
    window.api.send("writeToFile", [items.objects.join("\n").toString() + "\n", userData.file]);
    return Promise.resolve("Success: Changes written to file: " + userData.file);
  } catch(error) {
    error.functionName = setTodoDelete.name;
    return Promise.reject(error);
  }
}
async function archiveTodos() {
  try {
    // cancel operation if there are no completed todos
    if(items.complete.length===0) return Promise.resolve("Info: No completed todos found, nothing will be archived")
    // if user archives within done.txt file, operating is canceled
    if(userData.file.includes("_done.")) return Promise.resolve("Info: Current file seems to be a done.txt file, won't archive")
    // define path to done.txt
    let doneFile = function() {
      if(appData.os==="windows") {
        return userData.file.replace(userData.file.split("\\").pop(), userData.file.substr(0, userData.file.lastIndexOf(".")).split("\\").pop() + "_done.txt");
      } else {
        return userData.file.replace(userData.file.split("/").pop(), userData.file.substr(0, userData.file.lastIndexOf(".")).split("/").pop() + "_done.txt");
      }
    }
    const getContentFromDoneFile = new Promise(function(resolve, reject) {
      window.api.send("getContent", doneFile());
      return window.api.receive("getContent", (content) => {
        //resolve(TodoTxt.parse(content, [ new DueExtension(), new HiddenExtension(), new RecExtension() ]));
        resolve(content);
      });
    });
    let contentFromDoneFile = await getContentFromDoneFile;
    let contentForDoneFile = items.complete;
    if(contentFromDoneFile) {
      // create array from done file
      contentFromDoneFile = contentFromDoneFile.split("\n");
      //combine the two arrays
      contentForDoneFile  = contentFromDoneFile.concat(items.complete.toString().split(","));
      // use Set function to remove the duplicates: https://www.javascripttutorial.net/array/javascript-remove-duplicates-from-array/
      contentForDoneFile= [...new Set(contentForDoneFile)];
      // remove empty entries
      contentForDoneFile = contentForDoneFile.filter(function(element) {
        return element;
      });
    }
    //write completed items to done file
    window.api.send("writeToFile", [contentForDoneFile.join("\n").toString() + "\n", doneFile()]);
    // write incompleted items to todo file
    window.api.send("writeToFile", [items.incomplete.join("\n").toString() + "\n", userData.file]);
    return Promise.resolve("Success: Completed todos appended to: " + doneFile())
  } catch(error) {
    error.functionName = archiveTodos.name;
    return Promise.reject(error);
  }
}
function checkIsTodoVisible(todo) {
  if(!userData.showHidden && todo.h) return false
  if(!todo.text) return false
  for(let category in userData.hideFilterCategories) {
    if(todo[userData.hideFilterCategories[category]]) return false
  }
  return true;
}
function configureTodoTableTemplate() {
  try {
    todoTableContainer.innerHTML = "";
    todoTableBodyCellMoreTemplate.setAttribute("class", "flex-row todoTableItemMore");
    todoTableBodyCellMoreTemplate.setAttribute("role", "cell");
    todoTableBodyCellMoreTemplate.innerHTML = `
      <div class="dropdown is-right">
        <div class="dropdown-trigger">
          <a href="#"><i class="fas fa-ellipsis-v"></i></a>
        </div>
        <div class="dropdown-menu" role="menu">
          <div class="dropdown-content">
            <a class="dropdown-item">` + translations.useAsTemplate + `</a>
            <a href="#" class="dropdown-item">` + translations.edit + `</a>
            <a class="dropdown-item">` + translations.delete + `</a>
          </div>
        </div>
      </div>
    `;
    todoTableBodyRowTemplate.setAttribute("role", "rowgroup");
    todoTableBodyRowTemplate.setAttribute("class", "flex-table");
    todoTableBodyCellCheckboxTemplate.setAttribute("class", "flex-row checkbox");
    todoTableBodyCellCheckboxTemplate.setAttribute("role", "cell");
    todoTableBodyCellTextTemplate.setAttribute("class", "flex-row text");
    todoTableBodyCellTextTemplate.setAttribute("role", "cell");
    todoTableBodyCellTextTemplate.setAttribute("tabindex", 0);
    todoTableBodyCellTextTemplate.setAttribute("href", "#");

    todoTableBodyCellTextTemplate.setAttribute("title", translations.editTodo);

    tableContainerCategoriesTemplate.setAttribute("class", "categories");
    todoTableBodyCellPriorityTemplate.setAttribute("role", "cell");
    todoTableBodyCellSpacerTemplate.setAttribute("role", "cell");
    todoTableBodyCellDueDateTemplate.setAttribute("class", "flex-row itemDueDate");
    todoTableBodyCellDueDateTemplate.setAttribute("role", "cell");
    todoTableBodyCellRecurrenceTemplate.setAttribute("class", "flex-row recurrence");
    todoTableBodyCellRecurrenceTemplate.setAttribute("role", "cell");
    return Promise.resolve("Success: Table templates set up");
  } catch(error) {
    error.functionName = configureTodoTableTemplate.name;
    return Promise.reject(error);
  }
}
function generateNotification(todo, offset) {
  try {
    let notifications = userData.notifications;
    let dismissedNotifications = userData.dismissedNotifications;
    // abort if user didn't permit notifications within sleek
    if(!notifications) return Promise.resolve("Info: Notification surpressed (turned off in sleek's settings)");
    // check for necessary permissions
    return navigator.permissions.query({name: 'notifications'}).then(function(result) {
      // abort if user didn't permit notifications
      if(result.state!="granted") return Promise.resolve("Info: Notification surpressed (not permitted by OS)");
      // add the offset so a notification shown today with "due tomorrow", will be shown again tomorrow but with "due today"
      const hash = generateHash(todo.due.toISOString().slice(0, 10) + todo.text) + offset;
      let title;
      switch (offset) {
        case 0:
          title = translations.dueToday;
          break;
        case 1:
          title = translations.dueTomorrow;
          break;
      }
      // if notification already has been triggered once it will be discarded
      if(dismissedNotifications.includes(hash)) return Promise.resolve("Info: Notification skipped (has already been sent)");
      // set options for notifcation
      const config = {
        title: title,
        body: todo.text,
        silent: false,
        string: todo.toString(),
        hasReply: false,
        timeoutType: 'never',
        urgency: 'critical',
        closeButtonText: 'Close',
        actions: [ {
          type: 'button',
          text: 'Show Button'
        }]
      }
      // send notification object to main process for execution
      window.api.send("showNotification", config);
      // once shown, it will be persisted as hash to it won't be shown a second time
      dismissedNotifications.push(hash);
      setUserData("dismissedNotifications", dismissedNotifications);
      // trigger matomo event
      if(userData.matomoEvents) _paq.push(["trackEvent", "Notification", "Shown"]);
      return Promise.resolve("Info: Notification successfully sent");
    });
  } catch(error) {
    error.functionName = generateNotification.name;
    return Promise.reject(error);
  }
}
function generateHash(str) {
  return str.split('').reduce((prevHash, currVal) =>
    (((prevHash << 5) - prevHash) + currVal.charCodeAt(0))|0, 0);
}

export { generateItems, generateGroups, generateTable, items, item, visibleRows, setTodoComplete, archiveTodos };
