"use strict";
import { userData, appData, handleError, translations, setUserData, startBuilding } from "../render.js";
import { _paq } from "./matomo.mjs";
import { categories } from "./filters.mjs";
import { generateRecurrence } from "./recurrences.mjs";
import { convertDate, isToday, isTomorrow, isPast } from "./date.mjs";
import { show } from "./form.mjs";
import { RecExtension, SugarDueExtension } from "./todotxtExtensions.mjs";
import "../../node_modules/marked/marked.min.js";

import "../../node_modules/jstodotxt/jsTodoExtensions.js";
import "../../node_modules/jstodotxt/jsTodoTxt.js";

const modalForm = document.getElementById("modalForm");
const todoContext = document.getElementById("todoContext");
const todoContextDelete = document.getElementById("todoContextDelete");
const todoContextEdit = document.getElementById("todoContextEdit");
const todoContextUseAsTemplate = document.getElementById("todoContextUseAsTemplate");
const todoTableContainer = document.getElementById("todoTableContainer");
const todoTableWrapper = document.getElementById("todoTableWrapper");

todoContextUseAsTemplate.innerHTML = translations.useAsTemplate;
todoContextEdit.innerHTML = translations.edit;
todoContextDelete.innerHTML = translations.delete;
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
const tableContainerContent = document.createDocumentFragment();
const todoTableBodyRowTemplate = document.createElement("div");
const todoTableBodyCellCheckboxTemplate  = document.createElement("div");
const todoTableBodyCellTextTemplate = document.createElement("a");
const tableContainerCategoriesTemplate = document.createElement("span");
const todoTableBodyCellPriorityTemplate = document.createElement("div");
const todoTableBodyCellSpacerTemplate = document.createElement("div");
const todoTableBodyCellDueDateTemplate = document.createElement("span");
const todoTableBodyCellRecurrenceTemplate = document.createElement("span");
const item = { previous: "" }
let
  items,
  clusterCounter,
  clusterSize = Math.ceil(window.innerHeight/30), // 35 being the pixel height of one todo in compact mode
  clusterThreshold = 0,
  stopBuilding = false,
  visibleRows = 0;

todoTableWrapper.addEventListener("scroll", function(event) {
  if(Math.floor(event.target.scrollHeight - event.target.scrollTop) <= event.target.clientHeight && visibleRows<items.filtered.length) {
    stopBuilding = false;
    startBuilding(true);
  }
});
todoContext.addEventListener("keyup", function(event) {
  if(event.key==="Escape") this.classList.remove("is-active");
});

function configureTodoTableTemplate(append) {
  try {
    if(!append) {
      todoTableContainer.innerHTML = "";
      visibleRows = 0;
      clusterThreshold = 0;
      stopBuilding = false;
    }
    todoTableBodyRowTemplate.setAttribute("class", "todo");
    todoTableBodyCellCheckboxTemplate.setAttribute("class", "cell checkbox");
    todoTableBodyCellTextTemplate.setAttribute("class", "cell text");
    todoTableBodyCellTextTemplate.setAttribute("tabindex", 0);
    todoTableBodyCellTextTemplate.setAttribute("href", "#");
    todoTableBodyCellTextTemplate.setAttribute("title", translations.editTodo);
    tableContainerCategoriesTemplate.setAttribute("class", "categories");
    todoTableBodyCellDueDateTemplate.setAttribute("class", "cell itemDueDate");
    todoTableBodyCellRecurrenceTemplate.setAttribute("class", "cell recurrence");
    return Promise.resolve("Success: Table templates set up");
  } catch(error) {
    error.functionName = configureTodoTableTemplate.name;
    return Promise.reject(error);
  }
}
function generateItems(content) {
  try {
    items = { objects: TodoTxt.parse(content, [ new SugarDueExtension(), new RecExtension(), new HiddenExtension() ]) }
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
  // sort the items within the groups
  items.forEach((group) => {
    group[1] = sortTodoData(group[1]);
  });
  return Promise.resolve(items)
}
function generateTable(groups, append) {
  // prepare the templates for the table
  return configureTodoTableTemplate(append).then(function(response) {
    clusterCounter = 0;
    console.info(response);
    for (let group in groups) {
      if(stopBuilding) {
        stopBuilding = false;
        break;
      }
      // create a divider row
      let dividerRow;
      // completed todos
      if(userData.sortCompletedLast && groups[group][0]==="completed") {
        dividerRow = document.createRange().createContextualFragment("<div id=\"" + userData.sortBy + groups[group][0] + "\" class=\"group " + userData.sortBy + " " + groups[group][0] + "\"><div class=\"cell\"></div></div>")
      // for priority, context and project
      } else if(groups[group][0]!="null" && userData.sortBy!="dueString") {
        dividerRow = document.createRange().createContextualFragment("<div id=\"" + userData.sortBy + groups[group][0] + "\" class=\"group " + userData.sortBy + " " + groups[group][0] + "\"><div class=\"cell\"><span class=\"button " + groups[group][0] + "\">" + groups[group][0].replace(/,/g, ', ') + "</span></div></div>")
      // if sorting is by due date
      } else if(userData.sortBy==="dueString" && groups[group][1][0].due) {
        if(isToday(groups[group][1][0].due)) {
          dividerRow= document.createRange().createContextualFragment("<div id=\"" + userData.sortBy + groups[group][0] + "\" class=\"group due\"><div class=\"cell isToday\"><span class=\"button\">" + translations.today + "</span></div></div>")
        } else if(isTomorrow(groups[group][1][0].due)) {
          dividerRow = document.createRange().createContextualFragment("<div id=\"" + userData.sortBy + groups[group][0] + "\" class=\"group due\"><div class=\"cell isTomorrow\"><span class=\"button\">" + translations.tomorrow + "</span></div></div>")
        } else if(isPast(groups[group][1][0].due)) {
          dividerRow = document.createRange().createContextualFragment("<div id=\"" + userData.sortBy + groups[group][0] + "\" class=\"group due\"><div class=\"cell isPast\"><span class=\"button\">" + groups[group][0] + "</span></div></div>")
        } else {
          dividerRow = document.createRange().createContextualFragment("<div id=\"" + userData.sortBy + groups[group][0] + "\" class=\"group due\"><div class=\"cell\"><span class=\"button\">" + groups[group][0] + "</span></div></div>")
        }
      // create an empty divider row
      } else {
        dividerRow = document.createRange().createContextualFragment("<div class=\"group\"></div>")
      }
      // add divider row only if it doesn't exist yet
      if(!append && !document.getElementById(userData.sortBy + groups[group][0]) && dividerRow) tableContainerContent.appendChild(dividerRow);
      for (let item in groups[group][1]) {
        let todo = groups[group][1][item];
        // if this todo is not a recurring one the rec value will be set to null
        if(!todo.rec) todo.rec = null;
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
        //
        if(clusterCounter<clusterThreshold) {
          clusterCounter++;
          continue;
        } else if((visibleRows===clusterSize+clusterThreshold) || visibleRows===items.filtered.length ) {
          clusterThreshold = visibleRows;
          stopBuilding = true;
          break;
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
    clusterCounter++;
    visibleRows++;
    // create nodes from templates
    let todoTableBodyRow = todoTableBodyRowTemplate.cloneNode(true);
    let todoTableBodyCellCheckbox = todoTableBodyCellCheckboxTemplate.cloneNode(true);
    let todoTableBodyCellText = todoTableBodyCellTextTemplate.cloneNode(true);
    let tableContainerCategories = tableContainerCategoriesTemplate.cloneNode(true);
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
      todoTableBodyRow.setAttribute("class", "todo completed");
    }
    todoTableBodyRow.setAttribute("data-item", todo.toString());
    // add the priority marker or a white spacer
    if(todo.priority && userData.sortBy==="priority") {
      todoTableBodyCellPriority.setAttribute("class", "cell priority " + todo.priority);
      todoTableBodyRow.appendChild(todoTableBodyCellPriority);
    } else if(!todo.priority && userData.sortBy==="priority") {
      todoTableBodyCellSpacer.setAttribute("class", "cell spacer");
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
      setTodoComplete(this.parentElement.getAttribute("data-item")).then(response => {
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
      todoTableBodyCellText.innerHTML +=  "<span class=\"text\">" + marked.parseInline(todo.text) + "</span>";
      // replace line feed character with a space
      todoTableBodyCellText.innerHTML = todoTableBodyCellText.innerHTML.replaceAll(String.fromCharCode(16)," ");
      // add a spacer to divide text (and link) and categories
      todoTableBodyCellText.innerHTML += " ";
    }
    // click on the text
    todoTableBodyCellText.onclick = function() {
      // if the clicked item is not the external link icon, show(true) will be called
      if(!event.target.classList.contains('fa-external-link-alt')) {
        show(this.parentElement.getAttribute("data-item"));
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

    todoTableBodyRow.addEventListener("contextmenu", event => {
      todoContext.focus();
      todoContext.style.left = event.x + "px";
      todoContext.style.top = event.y + "px";
      todoContext.classList.toggle("is-active");

      todoContext.setAttribute("data-item", todo.toString())

      // click on use as template option
      todoContext.firstElementChild.children[0].onclick = function() {
        show(this.parentElement.parentElement.getAttribute('data-item'), true);
        todoContext.classList.toggle("is-active");
        todoContext.removeAttribute("data-item");
        // trigger matomo event
        if(userData.matomoEvents) _paq.push(["trackEvent", "Todo-Table-Context", "Click on Use as template"]);
      }
      todoContext.firstElementChild.children[1].onclick = function() {
        show(this.parentElement.parentElement.getAttribute('data-item'));
        todoContext.classList.toggle("is-active");
        todoContext.removeAttribute("data-item");
        // trigger matomo event
        if(userData.matomoEvents) _paq.push(["trackEvent", "Todo-Table-Context", "Click on Edit"]);
      }
      // click on delete
      todoContext.firstElementChild.children[2].onclick = function() {
        // passing the data-item attribute of the parent tag to complete function
        setTodoDelete(this.parentElement.parentElement.getAttribute('data-item')).then(response => {
          console.log(response);
          todoContext.classList.toggle("is-active");
          todoContext.removeAttribute("data-item");
        }).catch(error => {
          handleError(error);
        });
        // trigger matomo event
        if(userData.matomoEvents) _paq.push(["trackEvent", "Todo-Table-Context", "Click on Delete"]);
      }
    });

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
      if(a.priority===null && b.priority===null) {
        return 0;
      } else if(a.priority===null) {
        return 1;
      } else if(a.priority!==null && b.priority===null) {
        return -1;
      } else if(a.priority > b.priority) {
        return 1;
      } else if(a.priority < b.priority) {
        return -1;
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
    //if(modalForm.elements[0].value) todo = modalForm.elements[0].value;
    // first convert the string to a todo.txt object
    todo = new TodoTxtItem(todo, [ new SugarDueExtension(), new RecExtension(), new HiddenExtension() ]);
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
    todo = new TodoTxtItem(todo, [ new SugarDueExtension(), new RecExtension(), new HiddenExtension() ]);
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
    const getContentFromDoneFile = new Promise(function(resolve) {
      window.api.send("getContent", doneFile());
      return window.api.receive("getContent", (content) => {
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
    // send notifcation on success
    generateNotification(null, null, translations.archivingCompletedTitle, translations.archivingCompletedBody + doneFile());

    return Promise.resolve("Success: Completed todos appended to: " + doneFile())
  } catch(error) {
    error.functionName = archiveTodos.name;
    return Promise.reject(error);
  }
}
function checkIsTodoVisible(todo) {
  if(!userData.showHidden && todo.h) return false
  if(!todo.text) return false
  return true;
}
function generateNotification(todo, offset, customTitle, customBody) {
  try {
    // abort if user didn't permit notifications within sleek
    if(!userData.notifications) return Promise.resolve("Info: Notification surpressed (turned off in sleek's settings)");
    // check for necessary permissions
    return navigator.permissions.query({name: "notifications"}).then(function(result) {
      // abort if user didn't permit notifications
      if(result.state!="granted") return Promise.resolve("Info: Notification surpressed (not permitted by OS)");
      let notification;
      if(todo) {
        // add the offset so a notification shown today with "due tomorrow", will be shown again tomorrow but with "due today"
        //const hash = generateHash(todo.due.toISOString().slice(0, 10) + todo.text) + offset;
        const hash = generateHash(todo.toString()) + offset;
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
        if(userData.dismissedNotifications.includes(hash)) return Promise.resolve("Info: Notification skipped (has already been sent)");
        // set options for notifcation
        notification = {
          title: title,
          body: todo.text,
          string: todo.toString(),
          timeoutType: "never",
          silent: false,
          actions: [{
            type: "button",
            text: "Show Button"
          }]
        }
        // once shown, it will be persisted as hash to it won't be shown a second time
        userData.dismissedNotifications.push(hash);
        setUserData("dismissedNotifications", userData.dismissedNotifications);
      } else {
        notification = {
          title: customTitle,
          body: customBody,
          timeoutType: "default",
          silent: true
        }
      }
      // send notification object to main process for execution
      window.api.send("showNotification", notification);
      // trigger matomo event
      if(userData.matomoEvents) _paq.push(["trackEvent", "Notification", "Shown"]);
      return Promise.resolve("Info: Notification successfully sent");
    });
  } catch(error) {
    error.functionName = generateNotification.name;
    return Promise.reject(error);
  }
}
function generateHash(string) {
  return string.split('').reduce((prevHash, currVal) =>
    (((prevHash << 5) - prevHash) + currVal.charCodeAt(0))|0, 0);
}

export { generateItems, generateGroups, generateTable, items, item, visibleRows, setTodoComplete, archiveTodos };
