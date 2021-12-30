"use strict";
import { appData, userData, setUserData, translations } from "../render.js";
import { generateGroups, items } from "./todos.mjs";
import { isToday, isPast } from "./date.mjs";
import { generateFileList } from "./files.mjs";
import { showGenericMessage } from "./messages.mjs";
import { showOnboarding } from "./onboarding.mjs";
import { focusRow, currentRow } from "./keyboard.mjs";
import { _paq } from "./matomo.mjs";

const body = document.getElementById("body");
const todoContext = document.getElementById("todoContext");
const addTodoContainer = document.getElementById("addTodoContainer");

export function isModalOpen() {
  // check if any modal is open an return boolean
  let isModalOpen = false;
  document.querySelectorAll(".modal, div[role=menu]").forEach(function(modal) {
    if(modal.classList.contains("is-active")) isModalOpen = true;
  });
  return isModalOpen;
}
export function closeTodoContext() {
  // hide the context menu
  todoContext.classList.remove("is-active");
  todoContext.removeAttribute("data-item");
  // set focus on the last focused row
  focusRow(currentRow);
}
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
export function setTheme(switchTheme) {
  try {
    let theme = userData.theme;
    if(switchTheme) {
      switch (theme) {
        case "dark":
        theme = "light";
        break;
        case "light":
        theme = "dark";
        break;
        default:
        theme = "light";
        break;
      }
      window.api.send("setTheme", theme);
      setUserData("theme", theme);
    }
    switch (theme) {
      case "light":
      body.classList.remove("dark");
      document.getElementById("toggleDarkmode").checked = false;
      break;
      case "dark":
      body.classList.add("dark");
      document.getElementById("toggleDarkmode").checked = true;
      break;
    }
    return Promise.resolve("Success: Theme set to " + theme);
  } catch(error) {
    error.functionName = setTheme.name;
    return Promise.reject(error);
  }
}
export async function pasteItemsToClipboard(items) {
  try {
    let groups = await generateGroups(items);
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
    showGenericMessage(translations.visibleTodosCopiedToClipboard);
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
export function getBadgeCount() {
  let count = 0;
  items.objects.forEach((item) => {
    if(!item.complete && item.due && (isToday(item.due) || isPast(item.due))) count++;
  });
  return count;
}
export function resetModal(modal) {
  try {
    const modalForm = document.getElementById("modalForm");
    
    if(modal) {
      // remove is-active from modal
      modal.classList.remove("is-active");
      // remove any previously set data-item attributes
      modal.removeAttribute("data-item");
    }
    // reset priority setting
    document.getElementById("priorityPicker").selectedIndex = 0;
    // if recurrence picker was open it is now being closed
    document.getElementById("recurrencePickerContainer").classList.remove("is-active");
    // clear previous recurrence selection
    document.getElementById("recurrencePickerInput").value = null;
    // if file chooser was open it is now being closed
    document.getElementById("modalChangeFile").classList.remove("is-active");
    // hide suggestion box if it was open
    document.getElementById("autoCompleteContainer").classList.remove("is-active");
    // remove focus from suggestion container
    document.getElementById("autoCompleteContainer").blur();
    // close
    modalForm.classList.remove("is-active");
    // remove the data item as we don't need it anymore
    //modalForm.removeAttribute("data-item");
    modalForm.setAttribute("data-item", "");
    // clean up the modal
    document.getElementById("modalFormAlert").parentElement.classList.remove("is-active", 'is-warning', 'is-danger');
    // clear the content in the input field as it's not needed anymore
    document.getElementById("modalFormInput").value = null;
    return Promise.resolve("Info: Modal closed and cleaned up");
  } catch (error) {
    error.functionName = resetModal.name;
    return Promise.reject(error);
  }
}
export function configureMainView() {
  try {
    // generate file tabs
    generateFileList();
    // close filterContext if open
    if(document.getElementById("filterContext").classList.contains("is-active")) document.getElementById("filterContext").classList.remove("is-active");
    // set scaling factor if default font size has changed
    if(userData.zoom) {
      document.getElementById("html").style.zoom = userData.zoom + "%";
      document.getElementById("zoomStatus").innerHTML = userData.zoom + "%";
      document.getElementById("zoomRangePicker").value = userData.zoom;
    }
    // check if compact view is suppose to be active
    if(userData.compactView) document.getElementById("body").classList.add("compact");
    // add version number to about tab in settings modal
    document.getElementById("version").innerHTML = appData.version;
    if(typeof items === "object") {
      // jump to previously added item
      if(document.getElementById("previousItem")) {
        //const index 
        document.getElementById("previousItem")
        //helper.jumpToItem(document.getElementById("previousItem"))
        focusRow();
      }
      // remove onboarding
      showOnboarding(false).then(function(response) {
        console.info(response);
      }).catch(function(error) {
        handleError(error);
      });
      
      // configure table view
      const todoTable = document.getElementById("todoTable");
      const todoTableSearchContainer = document.getElementById("todoTableSearchContainer");
      const noResultContainer = document.getElementById("noResultContainer");

      if(items.objects.length===0) {
        addTodoContainer.classList.add("is-active");
        todoTableSearchContainer.classList.remove("is-active");
        todoTable.classList.remove("is-active");
        noResultContainer.classList.remove("is-active");
        return Promise.resolve("Info: File is empty");
      } else if(items.filtered.length===0) {
        addTodoContainer.classList.remove("is-active");
        todoTableSearchContainer.classList.add("is-active");
        noResultContainer.classList.add("is-active");
        return Promise.resolve("Info: No results");
        // TODO explain
      } else if(items.filtered.length>0) {
        todoTableSearchContainer.classList.add("is-active");
        addTodoContainer.classList.remove("is-active");
        noResultContainer.classList.remove("is-active");
        todoTable.classList.add("is-active");
        return Promise.resolve("Info: File has content and results are shown");
      }
    } else {
      showOnboarding(true).then(function(response) {
        console.info(response);
      }).catch(function(error) {
        handleError(error);
      });
      return Promise.resolve("Info: No file defined");
    }
  } catch(error) {
    showOnboarding(true).then(function(response) {
      console.info(response);
    }).catch(function(error) {
      handleError(error);
    });
    error.functionName = configureMainView.name;
    return Promise.reject(error);
  }
}
export function handleError(error) {
  try {
    if(error) {
      console.error(error.name +" in function " + error.functionName + ": " + error.message);
      // trigger matomo event
      if(userData.matomoEvents) _paq.push(["trackEvent", "Error", error.functionName, error])
    }
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

// https://bobbyhadz.com/blog/javascript-format-date-yyyy-mm-dd
export function formatDate(date) {
  const padTo2Digits = function(num) {
    return num.toString().padStart(2, '0');
  }
  if(!!!date) {
    return undefined;
  }
  return [
    date.getFullYear(),
    padTo2Digits(date.getMonth() + 1),
    padTo2Digits(date.getDate()),
  ].join('-');
}
