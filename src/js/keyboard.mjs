"use strict";
import {setTodoComplete, archiveTodos, items, deleteTodo, generateTodoTxtObject} from "./todos.mjs";
import { getConfirmation } from "./prompt.mjs";
import {pasteItemsToClipboard, setDueDate, setPriority} from "./helper.mjs";
import { removeFileFromList } from "./files.mjs";
import { resetFilters } from "./filters.mjs";
import { handleError, getActiveFile } from "./helper.mjs";
import {show, setModalPriority, resetForm, setModalDueDate} from "./form.mjs";
import { showDrawer } from "./drawer.mjs";
import { showModal } from "./content.mjs";
import { triggerToggle } from "./toggles.mjs";
import { appData, userData, translations } from "../render.js";

const 
  autoCompleteContainer = document.getElementById("autoCompleteContainer"),
  modalWindows = document.querySelectorAll(".modal"),
  todoContext = document.getElementById("todoContext"),
  todoTable = document.getElementById("todoTable"),
  todoTableSearch = document.getElementById("todoTableSearch");
  
export let currentRow = 0;

export function focusRow(row, dontFocus) {
  if(!row) currentRow = 0;
  if(row >= 0) currentRow = row;
  if(row === -1) return false;
  let todoTableRow = todoTable.querySelectorAll(".todo")[row];
  if(typeof todoTableRow === "object") {
    todoTableRow.onkeydown = todoTableRowEventHandler;
    if (!dontFocus) {
      todoTableRow.focus({preventScroll: true});
      todoTableRow.scrollIntoView({behavior: "smooth", block: "center", inline: "start"});
    }
  }
  else { todoTableSearch.focus(); } // e.g. when you press enter while the last to-do is selected
  return false;
}

async function todoTableRowEventHandler(event) {
  // intended to be used for todoTableRow.onkeydown
  const todoRows = todoTable.querySelectorAll(".todo");
  const todoItem = todoRows[currentRow];

  async function setterWrapper(setter, arg) {
    // uses a setter function to set and update a to-do property
    const todoText = todoItem.getAttribute("data-item");
    const index = items.objects.map(function(object) { return object.raw; }).indexOf(todoText);
    const textObject = await generateTodoTxtObject(todoText);
    setter(textObject, arg);

    window.api.send("writeToFile", [textObject.toString(), index]);

    // wait for window.api.send to deselect the to-do:
    await new Promise(r => setTimeout(r, 100));
    focusRow(currentRow);
  }

  if (event.ctrlKey || event.metaKey) {
    const setDate = (days) => setterWrapper(setDueDate, days);

    // due date plus 1
    if(event.key === "ArrowUp") {
      await setDate(1);
    }
    // due date minus 1
    else if(event.key === "ArrowDown") {
      await setDate(-1);
    }
    // reset due date
    else if(event.key === "ArrowRight" || event.key === "ArrowLeft") {
      await setDate(0);
    }
  }
  else if (event.altKey) {
    const setPri = (priority) => setterWrapper(setPriority, priority);

    // alt + up: increase priority
    if(event.key === "ArrowUp") {
      await setPri(1);
    }
    // alt + down: decrease priority
    else if(event.key === "ArrowDown") {
      await setPri(-1);
    }
    // alt + right/left: remove priority
    else if(event.key === "ArrowRight" || event.key === "ArrowLeft") {
      // i could make this right to raise to max, left to remove
      await setPri(false);
    }
    // alt + any letter: set priority directly
    // if you change this shortcut, please update the if statement
    // in window.addEventListener("keydown", ...)
    // regex: string is exactly one alphabet character
    else if(/^[a-zA-Z]$/.test(event.key)) {
      event.preventDefault(); // prevent default alt+letter shortcuts from triggering
      await setPri(event.key);
    }
  }
  else {
    // x or enter: mark as complete
    if (event.key === "x" || event.key === "Enter") {
      const todoTableRow = todoItem.getAttribute("data-item");
      await setTodoComplete(todoTableRow).then(function (response) {
        console.info(response);
      }).catch(function (error) {
        handleError(error);
      });

      // idk what it is, but something deselects the row after this keydown event handler.
      // i think it's related to window.api.send(...) in setTodoComplete
      // so this "await new Promise" and "focusRow" is necessary.
      await new Promise(r => setTimeout(r, 100));
      focusRow(currentRow)
    }

    // space: open editor modal
    else if (event.key === " ") {
      event.preventDefault(); // prevents a space from being typed into the modal
      await show(todoItem.getAttribute("data-item"), undefined, true);
    }

    // delete: delete selected to-do
    else if (event.key === "Delete") {
      const index = await items.objects.map((obj) => obj.raw).indexOf(todoItem.getAttribute("data-item"));
      await deleteTodo(index);

      // deleteTodo has a call to window.api.send, so this promise is needed
      await new Promise(r => setTimeout(r, 100));
      focusRow(currentRow)
    }
  }
}

function handleFocusRow(key) {
  let focusSearchBox = false;
  let newRow = currentRow;

  if (document.activeElement.id==="todoTableSearch") {
    if (key === "ArrowDown") {
      newRow = 0;
    } else if (key === "ArrowUp") {
      newRow = todoTable.querySelectorAll(".todo").length - 1;
    }
  } else if (!isRowFocused()) {
    // if no row currently selected, start at previously selected row
    newRow = currentRow;
  } else {
    switch(key) {
      case "ArrowUp":
        if (currentRow <= 0) {
          focusSearchBox = true;
        } else {
          newRow = currentRow - 1;
        }
        break;
      case "ArrowDown":
        const lastRow = todoTable.querySelectorAll(".todo").length - 1;
        if (currentRow >= lastRow) {
          focusSearchBox = true;
          newRow = 0;
        } else {
          newRow = currentRow + 1;
        }
        break;
      case "ArrowLeft":
        newRow = 0;
        break;
      case "ArrowRight":
        newRow = todoTable.querySelectorAll(".todo").length - 1;
        break;
    }
  }

  if (focusSearchBox) {
    todoTableSearch.focus()
  } else {
    focusRow(newRow);
  }
}

// ******************************************************
// check if any input field is focused
// ******************************************************

export const isInputFocused = () => { return document.activeElement.id==="todoTableSearch" || document.activeElement.id==="filterContextInput" || document.activeElement.id==="modalFormInput"; }
export const isRowFocused = () => { return document.activeElement.classList.contains("todo"); }
export const isModalOpen = () => {
  for(let i = 0; i < modalWindows.length; i++) {
    if(modalWindows[i].classList.contains("is-active")) return true;
  }
  return false;
}
const isDrawerOpen = () => { return userData.filterDrawer || userData.viewDrawer; }
const isOnboardingOpen = () => { return document.getElementById("onboardingContainer").classList.contains("is-active"); }
const isContextOpen = () => { return todoContext.classList.contains("is-active"); }

export async function registerShortcuts() {
  try {

    window.addEventListener("keyup", async function(event) {

        // ******************************************************
        // setup escape key
        // ******************************************************

        if(event.key === "Escape") {

          // if search is focused, lose focus on escape
          // hide add todo button
          if(document.activeElement.id==="todoTableSearch") {
            todoTableSearch.blur();
            document.getElementById("todoTableSearchAddTodo").classList.remove("is-active");
            return false;
          }
          // if 'add as todo' is focused, return to search
          if(document.activeElement.id==="todoTableSearchAddTodo") {
            document.getElementById("todoTableSearch").focus();
            return false;
          }


          // if a datepicker container is detected interrupt, datepicker destruction is handled in module
          if(document.querySelector(".datepicker")) return false;

          // close autocomplete container

          if(autoCompleteContainer.classList.contains("is-active")) {
            autoCompleteContainer.classList.remove("is-active");
            autoCompleteContainer.innerHTML = null;
            document.getElementById("modalFormInput").focus();
            return false;
          }

          // if recurrence container is detected interrupt, closing is handled in module

          if(recurrencePickerContainer.classList.contains("is-active")) {
            recurrencePickerContainer.classList.remove("is-active");
            return false;
          }

          // close todo context

          if(todoContext.classList.contains("is-active")) {
            todoContext.classList.remove("is-active");
            focusRow(currentRow);
            return false;
          }

          if(filterContext.classList.contains("is-active")) {
            filterContext.classList.remove("is-active");
            return false;
          }

          if(modalPrompt.classList.contains("is-active")) {
            modalPrompt.classList.remove("is-active");
            return false;
          }

          // close modal windows

          if(isModalOpen()) {

            modalWindows.forEach((modal) => {
              if(modal.classList.contains("is-active")) {
                // hide modal
                modal.classList.remove("is-active");
                // in case modal is form it needs to be cleared
                if(modal.id === "modalForm") {
                  resetForm().then(function(response) {
                    console.info(response);
                  }).catch(function(error) {
                    handleError(error);
                  });
                }
              }
            });
            return false;
          }

          // close filter drawer

          if(document.getElementById("filterDrawer").classList.contains("is-active") || document.getElementById("viewDrawer").classList.contains("is-active")) {
            showDrawer().then(function(result) {
              console.log(result);
            }).catch(function(error) {
              handleError(error);
            });
            return false;
          }

        }

        // ******************************************************
        // if modal is open
        // ******************************************************

        if(isModalOpen()) {

        // due date plus 1
        if((event.ctrlKey || event.metaKey) && event.key === "ArrowUp") {
          setModalDueDate(1).then(response => {
            console.log(response);
          }).catch(error => {
            handleError(error);
          });
          return false;
        }

        // due date minus 1
        if((event.ctrlKey || event.metaKey) && event.key === "ArrowDown") {
          setModalDueDate(-1).then(response => {
            console.log(response);
          }).catch(error => {
            handleError(error);
          });
          return false;
        }

        // reset due date

        if((event.ctrlKey || event.metaKey) && (event.key === "ArrowRight" || event.key === "ArrowLeft")) {
          setModalDueDate(0).then(response => {
            console.log(response);
          }).catch(error => {
            handleError(error);
          });
          return false;
        }

      // ******************************************************
      // if modal is closed
      // ******************************************************

      } else {

        // ******************************************************
        // tab through tabs
        // ******************************************************

        if(event.ctrlKey && !event.shiftKey && event.key === "Tab") {
          let index = userData.files.findIndex(file => file[0] === 1);
          if(!userData.files[index+1]) {
            window.api.send("startFileWatcher", userData.files[0][1]);
          } else {
            window.api.send("startFileWatcher", userData.files[index+1][1]);
          }
          return false;
        }

        if(event.ctrlKey && event.shiftKey && event.key === "Tab") {
          let index = userData.files.findIndex(file => file[0] === 1);
          if(!userData.files[index-1]) {
            window.api.send("startFileWatcher", userData.files[userData.files.length-1][1]);
          } else {
            window.api.send("startFileWatcher", userData.files[index-1][1]);
          }
          return false;
        }
        
        // ******************************************************
        // switch files using 1-9
        // ******************************************************

        if(event.key.match(/^[1-9]+$/) && userData.files.length > 1 && userData.files[event.key-1] && !isInputFocused()) {
          // remove the onces not in tab bar
          const filesInTabBar = userData.files.filter(function(file) {
            if(file[2] === 1) return file;
          });
          // stop if no entry is found in array
          if(!filesInTabBar[event.key-1]) return false;
          if(filesInTabBar[event.key-1][1]) {
            // throw false at this function and current row will be reset
            focusRow(false);
            //
            window.api.send("startFileWatcher", filesInTabBar[event.key-1][1]);
          }
          return false;
        }

        // ******************************************************
        // open settings
        // ******************************************************

        if(event.key === "," && !isInputFocused()) {
          showModal("modalSettings").then(function(response) {
            console.info(response);
          }).catch(function(error) {
            handleError(error);
          });
          return false;
        }

        // ******************************************************
        // open help
        // ******************************************************     

        if((event.key === "?" || event.key === "/") && !isInputFocused()) {
          showModal("modalHelp").then(function(response) {
            console.info(response);
          }).catch(function(error) {
            handleError(error);
          });
          return false;
        }

        // ******************************************************
        // focus search field
        // ******************************************************

        if(event.key==="f" && !isInputFocused()) {
          document.getElementById("todoTableSearch").focus();
          return false;
        }

        // ******************************************************
        // reset filters
        // ******************************************************

        if(event.key==="0" && !isInputFocused()) {
          // abort when onboarding is shown
          if(isOnboardingOpen()) return false;
          resetFilters(true).then(function(response) {
            console.info(response);
          }).catch(function(error) {
            handleError(error);
          });
          return false;
        }

        // ******************************************************
        // show filter drawer
        // ******************************************************
        
        if(event.key==="b" && !isInputFocused()) {
          // abort when onboarding is shown
          if(isOnboardingOpen()) return false;
          
          showDrawer(document.getElementById("navBtnFilter")).then(function(result) {
            console.log(result);
          }).catch(function(error) {
            handleError(error);
          });
          return false;
        }

        // ******************************************************
        // open modal to create new to-do
        // ******************************************************

        if(event.key==="n" && !isInputFocused() && !isOnboardingOpen()) {
          show().then(function(response) {
            console.info(response);
          }).catch(function(error) {
            handleError(error);
          });
          return false;
        }

      }

    }, true)

    // ******************************************************
    // combinations with metaKey only work on keydown
    // ******************************************************

    window.addEventListener("keydown", async function(event) {

      // disable scrolling so that you can select and edit todos with these keys
      if(["Space","ArrowUp","ArrowDown"].includes(event.key)) {
        event.preventDefault();
      }

      // hacky fix, prevents multiple things from happening when
      // alt+letters shortcut in todoTableRowEventHandler is used
      // regex: string is exactly one alphabet character
      if (event.altKey && isRowFocused() && /^[a-zA-Z]$/.test(event.key))
        return false;

      // ******************************************************
      // setup arrow keys for selecting and to-do items
      // ******************************************************

      if((!isInputFocused() || document.activeElement.id==="todoTableSearch") && !isContextOpen()) {
        // move focus up/down in table list
        if (["ArrowUp", "ArrowDown", "ArrowLeft", "ArrowRight"].includes(event.key)) {
          if ((event.ctrlKey || event.metaKey || event.altKey) && isRowFocused()) {
            // hacky fix. ctrl/meta/alt + arrows are handled in todoTableRowEventHandler
            return false;
          }

          handleFocusRow(event.key);
          return false;
        }
      }

      // ******************************************************
      // open new file
      // ******************************************************

      if((event.ctrlKey || event.metaKey) && event.key === "o") {
        window.api.send("openOrCreateFile", "open");
        return false;
      }

      // ******************************************************
      // copy file content to clipboard
      // ******************************************************

      if((event.ctrlKey || event.metaKey && userData.files) && event.key === "c" && !isInputFocused()) {
        if(!getActiveFile()) return false;
        pasteItemsToClipboard();
        return false;
      }

      // ******************************************************
      // close file tab or window
      // ******************************************************

      if((event.ctrlKey || event.metaKey) && event.key === "w") {

        // if only 1 tab element is visible, if won't be removed and instead the browser window is being closed
        const visibleTabs = userData.files.filter(file => file[2] === 1);
        if(visibleTabs.length === 1) { 
          window.api.send("closeWindow");
          return false;
        }

        // get active tab
        const index = userData.files.findIndex(file => file[0] === 1);

        // remove active file from tab bar
        removeFileFromList(index, false).then(function(response) {
          console.info(response);
        }).catch(function(error) {
          handleError(error);
        });

        return false;
      }

      if(isModalOpen()) {

        // priority up

        if(event.altKey && event.key === "ArrowUp") {
          setModalPriority(1).then(function(result) {
            console.log(result);
          }).catch(function(error) {
            handleError(error);
          });
          return false;
        }

        // priority down

        if(event.altKey && event.key === "ArrowDown") {
          setModalPriority(-1).then(function(result) {
            console.log(result);
          }).catch(function(error) {
            handleError(error);
          });
          return false;
        }          

        // set priority directly
        
        if(event.altKey && event.key.length === 1) {

          if(!"abcdefghijklmnopqrstuvwyxz".includes(event.key)) return false

          setModalPriority(event.key.toUpperCase()).then(response => {
            console.log(response);
          }).catch(error => {
            handleError(error);
          });

          return false;
        }

        // remove priority
        
        if(event.altKey && (event.key === "ArrowRight" || event.key === "ArrowLeft")) {

          setModalPriority(false).then(response => {
            console.log(response);
          }).catch(error => {
            handleError(error);
          });

          return false;
        }

      } else {

        // reload window
        
        if((event.key === "." || event.key === "F5") && !isInputFocused()) {
          location.reload(true);
          return false;
        }

        // toggle completed todos
        
        if(event.key==="h" && !isInputFocused()) {
          // abort when onboarding is shown
          if(isOnboardingOpen()) return false;

          const showCompleted = document.getElementById("showCompleted");
          triggerToggle(showCompleted, true).then(function(response) {
            console.info(response);
          }).catch(function(error) {
            handleError(error);
          });
          return false;
        }
        
        // toggle deferred todos

        if(event.key==="t" && !isInputFocused()) {
          // abort when onboarding is shown
          if(isOnboardingOpen()) return false;
          triggerToggle(document.getElementById("deferredTodos"), true).then(function(response) {
            console.info(response);
          }).catch(function(error) {
            handleError(error);
          });
          return false;
        }

        // toggle appearance

        if(event.key==="d" && !isInputFocused()) {
          window.api.send("setTheme")
          return false;
        }

        // archive todos

        if(event.key==="a" && !isInputFocused()) {
          // abort when onboarding is shown
          if(isOnboardingOpen()) return false;
          
          // TODO: add archiving on MAS build
          if(appData.channel === "Mac App Store") return false;

          // handle user confirmation and pass callback function
          getConfirmation(archiveTodos, translations.archivingPrompt);
          return false;
        }

      }
    });

    return Promise.resolve("Success: Keyboard shortcuts registered");

  } catch(error) {
    error.functionName = registerShortcuts.name;
    return Promise.reject(error);
  }
}