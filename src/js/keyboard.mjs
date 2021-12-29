"use strict";
import { isModalOpen, closeTodoContext, setTheme, pasteItemsToClipboard } from "./helper.mjs";
import { show, setDueDate, setThreshold, setPriority } from "./form.mjs";
import { toggle } from "./view.mjs";
import { createTodoContext, setTodoComplete, archiveTodos, items } from "./todos.mjs";
import { userData, translations } from "../render.js";
import { getConfirmation } from "./prompt.mjs";
import { showDrawer } from "./drawer.mjs";
import { onboarding } from "./onboarding.mjs";
import { showContent } from "./content.mjs";
import { resetFilters } from "./filters.mjs";
import { resetModal, handleError } from "./helper.mjs";
import { removeFileFromList } from "./files.mjs";

const 
  autoCompleteContainer = document.getElementById("autoCompleteContainer"),
  modal = document.querySelectorAll(".modal"),
  modalForm = document.getElementById("modalForm"),
  modalFormInput = document.getElementById("modalFormInput"),
  todoTable = document.getElementById("todoTable"),
  todoContext = document.getElementById("todoContext"),
  datePickerContainer = document.querySelector(".datepicker.datepicker-dropdown");
export let 
  currentRow = -1;

export function focusRow(row) {
  if(row >= 0) currentRow = row;
  if(row === -1) return false;
  let todoTableRow = todoTable.querySelectorAll(".todo")[row];
  if(typeof todoTableRow === "object") todoTableRow.focus();
  return false;
}
export function registerShortcuts() {
  try {
    // CMD/metaKey only works on keydown
    window.addEventListener("keydown", async function(event) {
      // close datepicker if it's shown
      if(event.key === "Escape" && datePickerContainer.classList.contains("visible")) {
        datePickerContainer.classList.remove("active");
        datePickerContainer.classList.remove("visible");
        return false;
      }
      // check if any input field is focused
      const isInputFocused = document.activeElement.id==="todoTableSearch" || document.activeElement.id==="filterContextInput" || document.activeElement.id==="modalFormInput";
      const isDrawerOpen = userData.filterDrawer || userData.viewDrawer;
      // navigation in todo list
      if(!isModalOpen() && !isInputFocused && !isDrawerOpen) {
        // move focus down in table list
        if (event.keyCode === 40) {
          // stop if end of todos is reached
          if(currentRow >= todoTable.querySelectorAll(".todo").length-1) {
            focusRow(todoTable.querySelectorAll(".todo").length-1);
            return false;
          }
          currentRow++;
          focusRow(currentRow);
          return false;
        }
        // move focus up in table list
        if (event.keyCode === 38) {
          if(currentRow === 0) {
            focusRow(currentRow);
            return false;
          }
          currentRow--;
          focusRow(currentRow);
          return false;
        }
        // set todo complete
        if (document.activeElement.classList.contains("todo") && event.key === "x") {
          const todoTableRow = todoTable.querySelectorAll(".todo")[currentRow].getAttribute("data-item");
          setTodoComplete(todoTableRow).then(function(response) {
            console.info(response);
          }).catch(function(error) {
            handleError(error);
          });
          return false;
        }
        // open context
        if (event.keyCode === 39) {          
          const todoTableRow = todoTable.querySelectorAll(".todo")[currentRow];
          createTodoContext(todoTableRow);
          return false;
        }
        // open focused element
        if(document.activeElement.classList.contains("todo") && event.keyCode === 13) {
          let todoTableRow = todoTable.querySelectorAll(".todo")[currentRow];
          show(todoTableRow.getAttribute("data-item"));
          return false;
        }
      }
      // open file
      if((event.ctrlKey || event.metaKey) && event.key === "o" && !isInputFocused) {
        window.api.send("openOrCreateFile", "open");
        return false;
      }
      // copy items to clipboard
      if((event.ctrlKey || event.metaKey) && event.key === "c" && !isInputFocused) {
        pasteItemsToClipboard(items.filtered);
        return false;
      }
      // close tab or window
      if((event.ctrlKey || event.metaKey) && event.key === "w") {
        const isTabFound = userData.files.findIndex(file => {
          return file[2] === 1;
        });
        if(isTabFound >= 0) {
          let index = userData.files.findIndex(file => file[0] === 1);
          removeFileFromList(index, 1);
        } else {
          window.api.send("closeWindow");
        }
        return false;
      }
      // cycle through tabs
      if(event.ctrlKey && !event.shiftKey  && event.keyCode === 9) {
        let index = userData.files.findIndex(file => file[0] === 1);
        if(!userData.files[index+1]) {
          window.api.send("startFileWatcher", [userData.files[0][1], 1]);
        } else {
          window.api.send("startFileWatcher", [userData.files[index+1][1], 1]);
        }
        return false;
      }
      if(event.ctrlKey && event.shiftKey && event.keyCode === 9) {
        let index = userData.files.findIndex(file => file[0] === 1);
        if(!userData.files[index-1]) {
          window.api.send("startFileWatcher", [userData.files[userData.files.length-1][1], 1]);
        } else {
          window.api.send("startFileWatcher", [userData.files[index-1][1], 1]);
        }
        return false;
      }
      // escape in context menu
      if(event.key === "Escape" && todoContext.classList.contains("is-active")) {
        closeTodoContext();
        focusRow(currentRow);
        return false;
      }
      // switch files
      if(event.key.match(/^[1-9]+$/) && userData.files.length > 1 && userData.files[event.key-1] && !modalForm.classList.contains("is-active") && !isInputFocused) {
        // remove the onces not in tab bar
        const filesInTabBar = userData.files.filter(function(file) {
          if(file[2] === 1) return file;
        });
        // stop if no entry is found in array
        if(!filesInTabBar[event.key-1]) return false;
        if(filesInTabBar[event.key-1][1]) window.api.send("startFileWatcher", [filesInTabBar[event.key-1][1]]);
        return false;
      }
      // open settings
      if(event.key === "," && !modalForm.classList.contains("is-active") && !isInputFocused) {
        showContent("modalSettings").then(function(response) {
          console.info(response);
        }).catch(function(error) {
          handleError(error);
        });
        return false;
      }
      // open help
      if(event.key === "?" && !modalForm.classList.contains("is-active") && !isInputFocused) {
        showContent("modalHelp").then(function(response) {
          console.info(response);
        }).catch(function(error) {
          handleError(error);
        });
        return false;
      }
      // toggle dark mode
      if(event.key==="d" && !isInputFocused) {
        setTheme(true).then(function(response) {
          console.info(response);
        }).catch(function(error) {
          handleError(error);
        });
        return false;
      }
      // reset filters
      if(event.key==="0" && !modalForm.classList.contains("is-active") && !isInputFocused) {
        // abort when onboarding is shown
        if(onboarding) return false;
        resetFilters(true).then(function(response) {
          console.info(response);
        }).catch(function(error) {
          handleError(error);
        });
        return false;
      }
      // toggle completed todos
      if(event.key==="h" && !modalForm.classList.contains("is-active") && !isInputFocused) {
        // abort when onboarding is shown
        if(onboarding) return false;
        toggle("showCompleted").then(function(response) {
          console.info(response);
        }).catch(function(error) {
          handleError(error);
        });
        return false;
      }
      // toggle deferred todos
      if(event.key==="t" && !modalForm.classList.contains("is-active") && !isInputFocused) {
        // abort when onboarding is shown
        if(onboarding) return false;
        toggle("deferredTodos").then(function(response) {
          console.info(response);
        }).catch(function(error) {
          handleError(error);
        });
        return false;
      }
      // archive todos
      if(event.key==="a" && !modalForm.classList.contains("is-active") && !isInputFocused) {
        // abort when onboarding is shown
        if(onboarding) return false;
        // abort when no completed todos are present
        if(items.complete.length===0) return false;
        // handle user confirmation and pass callback function
        getConfirmation(archiveTodos, translations.archivingPrompt);
        return false;
      }
      // show filter drawer
      if(event.key==="b" && !modalForm.classList.contains("is-active") && !isInputFocused) {
        // abort when onboarding is shown
        if(onboarding) return false;
        showDrawer(document.getElementById("navBtnFilter"), document.getElementById("navBtnFilter").getAttribute("data-drawer")).then(function(result) {
          console.log(result);
        }).catch(function(error) {
          handleError(error);
        });
        return false;
      }
      // reload window
      if((event.key === "." || event.key === "F5") && !modalForm.classList.contains("is-active") && !isInputFocused) {
        location.reload(true);
        return false;
      }
    }, true)
    window.addEventListener("keyup", function(event) {
      const isInputFocused = document.activeElement.id==="todoTableSearch" || document.activeElement.id==="filterContextInput" || document.activeElement.id==="modalFormInput";
      // create new todo
      if(event.key==="n" && !modalForm.classList.contains("is-active") && !isInputFocused) {
        if(onboarding) return false;
        show().then(function(response) {
          console.info(response);
        }).catch(function(error) {
          handleError(error);
        });
        return false;
      }
    }, true)
    // shortcuts for modal form
    modalForm.addEventListener ("keydown", function(event) {
      // priority up
      if(!(event.ctrlKey || event.metaKey) && event.altKey && event.key === "ArrowUp") {
        setPriority("up");
        return false;
      }
      // priority down
      if(!(event.ctrlKey || event.metaKey) && event.altKey && event.key === "ArrowDown") {
        setPriority("down");
        return false;
      }
      // set priority directly
      if(event.altKey && event.metaKey && event.key.length === 1 && event.key.match(/[A-Z]/i)) {
        setPriority(event.key.substr(0,1)).then(response => {
          console.log(response);
        }).catch(error => {
          handleError(error);
        });
        return false;
      }
      // due date plus 1
      if((event.ctrlKey || event.metaKey) && event.altKey && event.key === "ArrowUp") {
        setDueDate(1);
        return false;
      }
      // due date minus 1
      if((event.ctrlKey || event.metaKey) && event.altKey && event.key === "ArrowDown") {
        setDueDate(-1);
        return false;
      }
      // reset due date
      if((event.ctrlKey || event.metaKey) && event.altKey && (event.key === "ArrowRight" || event.key === "ArrowLeft")) {
        setDueDate(0);
        return false;
      }
    });
    // escape in autocomplete container
    autoCompleteContainer.addEventListener ("keyup", function() {
      if(event.key === "Escape") {
        this.classList.remove("is-active");
        modalFormInput.focus();
        return false;
      }
    });
    // todoTable.addEventListener ("keyup", function() {
    //   if(event.key === "Escape") {
    //     focusRow(false);
    //     return false;
    //   }
    // });
    // event for closing modal windows
    modal.forEach(function(element) {
      element.addEventListener("keydown", function(event) {
        if(event.key === "Escape") {
          // close auto complete container
          if(autoCompleteContainer.classList.contains("is-active")) return false;
          if(document.getElementById("recurrencePickerContainer").classList.contains("is-active")) return false;
          if(document.querySelector(".datepicker.datepicker-dropdown").classList.contains("is-active")) return false;
          // reset contents of add/edit window
          resetModal(this).then(function(result) {
            console.log(result);
          }).catch(function(error) {
            handleError(error);
          });
          return false;
        }
      });
    });
    return Promise.resolve("Success: Keyboard shortcuts registered");
  } catch(error) {
    error.functionName = registerShortcuts.name;
    return Promise.reject(error);
  }
}