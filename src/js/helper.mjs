"use strict";
import { appData, userData, setUserData, translations } from "../render.js";
import { generateGroupedObjects, items, generateTodoTxtObject } from "./todos.mjs";
import { isToday, isPast, isTomorrow } from "./date.mjs";
import { generateFileTabs } from "./files.mjs";
import { showGenericMessage } from "./messages.mjs";
import { showOnboarding } from "./onboarding.mjs";
import { _paq } from "./matomo.mjs";
import "../../node_modules/marked/marked.min.js";

const body = document.getElementById("body");
const todoContext = document.getElementById("todoContext");
const addTodoContainer = document.getElementById("addTodoContainer");

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
    return `${text} <a href="${href}" target="_blank"><i class="fas fa-external-link-alt"></i></a>`;
  }
};
marked.use({ renderer });

// TODO: check if this still works
export function jumpToItem(item) {
  try {
    const isInViewport = function(item) {
      const rect = item.getBoundingClientRect();
      return (
        rect.top >= 0 &&
        rect.left >= 0 &&
        rect.bottom <= (window.innerHeight || document.documentElement.clientHeight) &&
        rect.right <= (window.innerWidth || document.documentElement.clientWidth)
      );
    }
    // jump to previously edited or added item
    // only scroll if new item is not in view
    if(!isInViewport(item)) {
      // scroll to view
      item.scrollIntoView({behavior: "smooth", block: "center", inline: "nearest"});
      // trigger a quick background ease in and out
      item.classList.add("is-highlighted");
      setTimeout(() => {
        item.classList.remove("is-highlighted");
        // after scrolling the marker will be removed
        item.removeAttribute("id");
      }, 1000);
    }
  } catch(error) {
    error.functionName = jumpToItem.name;
    return Promise.reject(error);
  }
}
export async function pasteItemToClipboard(item) {
  try {

    window.api.send("copyToClipboard", [item.text]);
    showGenericMessage(translations.todoCopiedToClipboard, 3);

    return Promise.resolve("Success: Todo text pasted to clipboard: " + item.text);

  } catch(error) {
    error.functionName = pasteItemToClipboard.name;
    return Promise.reject(error);
  }
}
export async function pasteItemsToClipboard() {
  try {

    const todos = await import("./todos.mjs");
    const groups = todos.items.grouped;

    let itemsForClipboard;
    itemsForClipboard = "Status\t";
    itemsForClipboard += "Closed\t";
    itemsForClipboard += "Created\t";
    itemsForClipboard += "Priority\t";
    itemsForClipboard += "Started\t";
    itemsForClipboard += "Task\t";
    itemsForClipboard += "Due\t";
    itemsForClipboard += "Recurrence\t";
    itemsForClipboard += "Contexts\t";
    itemsForClipboard += "Projects\n";
    for(let i = 0; i < groups.length; i++) {
        let clipboardItem = "";
        if(groups[i][0] !== "null") {
          clipboardItem += "\n";
          clipboardItem += "-------------------------------------";
          clipboardItem += "\n";
          clipboardItem += groups[i][0];
          clipboardItem += "\n";
          clipboardItem += "-------------------------------------";
          clipboardItem += "\n";
          
        } else {
          clipboardItem += "\n\n\n";
        }
        itemsForClipboard += clipboardItem; 
        for(let j = 0; j < groups[i][1].length; j++) {
            clipboardItem = "";
            groups[i][1][j].complete ? clipboardItem += "Completed" : clipboardItem += "In progress";
            clipboardItem += "\t";
            (groups[i][1][j].completed !== null) ? clipboardItem += groups[i][1][j].completedString() : clipboardItem += "-";
            clipboardItem += "\t";
            (groups[i][1][j].date !== null) ? clipboardItem += groups[i][1][j].dateString() : clipboardItem += "-";
            clipboardItem += "\t";
            (groups[i][1][j].priority !== null) ? clipboardItem += groups[i][1][j].priority.toString() : clipboardItem += "-";
            clipboardItem += "\t";
            (groups[i][1][j].tString !== undefined) ? clipboardItem += groups[i][1][j].tString : clipboardItem += "-";
            clipboardItem += "\t";
            (groups[i][1][j].text !== null) ? clipboardItem += groups[i][1][j].text : clipboardItem += "-";
            clipboardItem += "\t";
            (groups[i][1][j].dueString !== undefined) ? clipboardItem += groups[i][1][j].dueString : clipboardItem += "-";
            clipboardItem += "\t";
            (groups[i][1][j].rec !== null) ? clipboardItem += groups[i][1][j].recString : clipboardItem += "-";
            clipboardItem += "\t";
            (groups[i][1][j].contexts !== null) ? clipboardItem += groups[i][1][j].contexts.toString() : clipboardItem += "-";
            clipboardItem += "\t";
            (groups[i][1][j].projects !== null) ? clipboardItem += groups[i][1][j].projects.toString() : clipboardItem += "-";
            clipboardItem += "\n";
            itemsForClipboard += clipboardItem;
        }
    }
    
    window.api.send("copyToClipboard", [itemsForClipboard]);

    showGenericMessage(translations.visibleTodosCopiedToClipboard, 3).then(function(response) {
      console.info(response);
    }).catch(function(error) {
      handleError(error);
    });

  } catch(error) {
    error.functionName = pasteItemsToClipboard.name;
    return Promise.reject(error);
  }
}
export function getActiveFile() {
  const index = userData.files.findIndex(file => file[0] === 1);
  if(index!==-1) {
    const file = userData.files[index][1];
    return file;
  }
  return false;
}
export function getDoneFile() {
  const activeFile = getActiveFile();
  if(appData.os==="windows") {
    return activeFile.replace(activeFile.split("\\").pop(), activeFile.substr(0, activeFile.lastIndexOf(".")).split("\\").pop() + "_done.txt");
  } else {
    return activeFile.replace(activeFile.split("/").pop(), activeFile.substr(0, activeFile.lastIndexOf(".")).split("/").pop() + "_done.txt");
  }
}
export function getBadgeCount() {
  let count = 0;
  items.objects.forEach((item) => {
    if(!item.complete && item.due && (isToday(item.due) || isPast(item.due))) count++;
  });
  return count;
}
// one time interface setup when app is started
export function initialSetupInterface() {
  try {

    // setup compact view
    (userData.compactView) ? body.classList.add("compact") : body.classList.remove("compact");

    // show or hide specific settings
    if(appData.channel === "AppImage" || appData.os === "mac" && appData.channel !== "Mac App Store") document.getElementById("autoUpdateRow").classList.remove("is-hidden")

    // set scaling factor if default font size has changed
    document.getElementById("html").style.zoom = userData.zoom + "%";
    document.getElementById("zoomStatus").innerHTML = userData.zoom + "%";
    document.getElementById("zoom").value = userData.zoom;
    
    // add version number to about tab in settings modal
    document.getElementById("version").innerHTML = appData.version;

    return Promise.resolve("Success: Initial interface setup completed");

  } catch(error) {
    error.functionName = initialSetupInterface.name;
    return Promise.reject(error);
  }
}
export function setupInterface() {
  try {
    // this happens in view drawer
    // hide sort by container if sorting is according to file
    const viewSortByRow = document.getElementById("viewSortByRow");
    const sortCompletedLastRow = document.getElementById("sortCompletedLastRow");
    if(userData.sortByFile) {
      viewSortByRow.classList.add("is-hidden");
      sortCompletedLastRow.classList.add("is-hidden");
    } else {
      viewSortByRow.classList.remove("is-hidden");
      sortCompletedLastRow.classList.remove("is-hidden");
    }

    // send badge count to main process
    window.api.send("update-badge", getBadgeCount());

    // close file chooser if it's open
    if(modalChangeFile.classList.contains("is-active")) modalChangeFile.classList.remove("is-active");

    // if files are available, (re)generate tabs
    if(userData.files && userData.files.length > 0) {
      generateFileTabs().then(function(response) {
        console.info(response);
      }).catch(function(error) {
        handleError(error);
      });
    }

    // hide onboarding if there is an active file
    if(getActiveFile()) showOnboarding(false)
      
    // configure table view
    const todoTableSearchContainer = document.getElementById("todoTableSearchContainer");
    const noResultContainer = document.getElementById("noResultContainer");
    const todoTable = document.getElementById("todoTable");

    // empty todo file view
    if(items.objects.length === 0) {
      addTodoContainer.classList.add("is-active");
      todoTableSearchContainer.classList.remove("is-active");
      noResultContainer.classList.remove("is-active");
      todoTable.classList.remove("is-active");
      return Promise.resolve("Info: File is empty");

    // no result view
    } else if(items.filtered.length === 0) {
      addTodoContainer.classList.remove("is-active");
      todoTableSearchContainer.classList.add("is-active");
      noResultContainer.classList.add("is-active");
      todoTable.classList.remove("is-active");
      return Promise.resolve("Info: No results");

    // default view
    } else if(items.filtered.length > 0) {
      todoTableSearchContainer.classList.add("is-active");
      addTodoContainer.classList.remove("is-active");
      noResultContainer.classList.remove("is-active");
      todoTable.classList.add("is-active");
      return Promise.resolve("Info: File has content and results are shown");
    }

  } catch(error) {
    error.functionName = setupInterface.name;
    return Promise.reject(error);
  }
}
export function handleError(error) {
  try {

    console.error(error);

    // showGenericMessage(error).then(function(response) {
    //   console.log(response)
    // }).catch(function(error) {
    //   handleError(error);
    // });
    
    // trigger matomo event
    if(userData.matomoEvents) _paq.push(["trackEvent", "Error", error.functionName, error])

  } catch(error) {
    error.functionName = handleError.name;
    return Promise.reject(error);
  }
}
export function generateHash(string) {
  return string.split('').reduce((prevHash, currVal) =>
    (((prevHash << 5) - prevHash) + currVal.charCodeAt(0))|0, 0);
}
// https://davidwalsh.name/javascript-debounce-function
export function debounce(func, wait, immediate) {
  let timeout;
  return function() {
    let
      context = this,
      args = arguments;
    let later = function() {
      timeout = null;
      if (!immediate) func.apply(context, args);
    };
    let callNow = immediate && !timeout;
    clearTimeout(timeout);
    timeout = setTimeout(later, wait);
    if (callNow) func.apply(context, args);
  };
}
export async function setDueDate(days) {
  try {

    const todo = await generateTodoTxtObject(modalFormInput.value).then(response => {
      return response;
    }).catch(error => {
      handleError(error);
    });

    if(days === 0) {
      todo.due = undefined;
      todo.dueString = undefined;
    } else if(days && todo.due) {
      todo.due = new Date(new Date(todo.dueString).setDate(new Date(todo.dueString).getDate() + days));
      todo.dueString = todo.due.toISOString().substr(0, 10);
    // when no due date is available we fallback to todays date
    } else if(days && !todo.due) {
      todo.due = new Date(new Date().setDate(new Date().getDate() + days));
      todo.dueString = todo.due.toISOString().substr(0, 10);
    }

    modalFormInput.value = todo.toString();

    return Promise.resolve("Success: Due date changed to " + todo.dueString)

  } catch(error) {
    error.functionName = setDueDate.name;
    return Promise.reject(error);
  }
}
export function getCaretPosition(element) {
  if((element.selectionStart !== null) && (element.selectionStart !== undefined)) return element.selectionStart;
  return false;
}
export function generateTodoNotification(todo) {
  try {

    // abort if user didn't permit notifications within sleek
    if(!userData.notifications) return Promise.resolve("Info: Notification surpressed (turned off in sleek's settings)");

    // check for necessary permissions
    return navigator.permissions.query({name: "notifications"}).then(function(result) {
    
      // abort if user didn't permit notifications
      if(result.state !== "granted") return Promise.resolve("Info: Notification surpressed (not permitted by OS)");

      // add the offset so a notification shown today with "due tomorrow", will be shown again tomorrow but with "due today"
      const hash = generateHash(todo.toString()) + isToday(todo.due) + isTomorrow(todo.due);

      let title;
      if(isToday(todo.due)) title = translations.dueToday;
      if(isTomorrow(todo.due)) title = translations.dueTomorrow;
      
      // if notification already has been triggered once it will be discarded
      if(userData.dismissedNotifications.includes(hash)) return Promise.resolve("Info: Notification skipped (has already been sent)");

      // set options for notifcation
      const notification = {
        title: title,
        body: todo.text,
        string: todo.toString(),
        timeoutType: "never",
        silent: false,
        actions: [{
          type: "button",
          text: "Show"
        }]
      }
      // once shown, it will be persisted as hash to it won't be shown a second time
      userData.dismissedNotifications.push(hash);

      setUserData("dismissedNotifications", userData.dismissedNotifications);

      window.api.send("showNotification", notification);

      // trigger matomo event
      if(userData.matomoEvents) _paq.push(["trackEvent", "Todo notification", "Shown"]);

      return Promise.resolve("Info: Todo notification successfully sent");

    });

  } catch(error) {
    error.functionName = generateNotification.name;
    return Promise.reject(error);
  }
}
export function generateGenericNotification(title, body) {
  try {
    
    // abort if user didn't permit notifications within sleek
    if(!userData.notifications) return Promise.resolve("Info: Notification surpressed (turned off in sleek's settings)");

    // check for necessary permissions
    return navigator.permissions.query({name: "notifications"}).then(function(result) {
    
      // abort if user didn't permit notifications
      if(result.state !== "granted") return Promise.resolve("Info: Notification surpressed (not permitted by OS)");
    
      const notification = {
        title: title,
        body: body,
        timeoutType: "default",
        silent: true
      }

      // send notification object to main process for execution
      window.api.send("showNotification", notification);

      // trigger matomo event
      if(userData.matomoEvents) _paq.push(["trackEvent", "Generic notification", "Shown"]);

      return Promise.resolve("Info: Generic notification successfully sent");

    });
  } catch(error) {
    error.functionName = generateNotification.name;
    return Promise.reject(error);
  }
}