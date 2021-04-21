"use strict";
import { createTodoContext, setTodoComplete, archiveTodos, items } from "./todos.mjs";
import { getConfirmation } from "./prompt.mjs";
import { pasteItemsToClipboard } from "./helper.mjs";
import { removeFileFromList } from "./files.mjs";
import { resetFilters } from "./filters.mjs";
import { resetModal, handleError } from "./helper.mjs";
import { show, setDueDate, setPriority } from "./form.mjs";
import { showDrawer } from "./drawer.mjs";
import { showModal } from "./content.mjs";
import { triggerToggle } from "./toggles.mjs";
import { userData, translations } from "../render.js";

const 
  autoCompleteContainer = document.getElementById("autoCompleteContainer"),
  modalForm = document.getElementById("modalForm"),
  modalWindows = document.querySelectorAll(".modal"),
  todoContext = document.getElementById("todoContext"),
  todoTable = document.getElementById("todoTable");
  
export let 
  currentRow = -1;

export function focusRow(row) {
  if(!row) currentRow = 0;
  if(row >= 0) currentRow = row;
  if(row === -1) return false;
  let todoTableRow = todoTable.querySelectorAll(".todo")[row];
  if(typeof todoTableRow === "object") todoTableRow.focus();
  return false;
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

        // if a datepicker container is detected interrupt, datepicker destruction is handled in module
        if(document.querySelector(".datepicker")) return false;

        // close autocomplete container

        if(autoCompleteContainer.classList.contains("is-active")) {
          autoCompleteContainer.classList.remove("is-active");
          document.getElementById("modalFormInput").focus();
          return false;
        }

        // if recurrence container is detected interrupt, closing is handled in module

        if(recurrencePickerContainer.classList.contains("is-active")) return false;

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
              modal.classList.remove("is-active");
              resetModal();  
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

        // priority up

        if((!event.ctrlKey && !event.metaKey) && event.altKey && event.key === "ArrowUp") {
          setPriority("up");
          return false;
        }

        // priority down

        if((!event.ctrlKey && !event.metaKey) && event.altKey && event.key === "ArrowDown") {
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

      // ******************************************************
      // if modal is closed
      // ******************************************************

      } else {

        // ******************************************************
        // setup arrow up and down keys
        // ******************************************************

        // make sure no input or drawer is opened

        if(!isInputFocused() && !isDrawerOpen() && !isContextOpen()) {

          // move focus down in table list

          if(event.key === "ArrowDown") {

            // stop if end of todos is reached

            if(currentRow >= todoTable.querySelectorAll(".todo").length - 1) {
              focusRow(todoTable.querySelectorAll(".todo").length - 1);
              return false;
            }
            currentRow++;
            focusRow(currentRow);
            return false;
          }

          // move focus up in table list

          if(event.key === "ArrowUp") {
            if(currentRow === 0) {
              focusRow(currentRow);
              return false;
            }
            currentRow--;
            focusRow(currentRow);
            return false;
          }

          // ******************************************************
          // setup x key
          // ******************************************************

          if (isRowFocused() && event.key === "x") {
            const todoTableRow = todoTable.querySelectorAll(".todo")[currentRow].getAttribute("data-item");
            setTodoComplete(todoTableRow).then(function(response) {
              console.info(response);
            }).catch(function(error) {
              handleError(error);
            });
            return false;
          }
          
          // ******************************************************
          // setup arrow right
          // ******************************************************

          if(isRowFocused() && event.keyCode === 39) {
            const todoTableRow = todoTable.querySelectorAll(".todo")[currentRow];
            createTodoContext(todoTableRow);
            return false;
          }
          
          // ******************************************************
          // setup enter key
          // ******************************************************

          if(isRowFocused() && event.key === "Enter") {
            let todoTableRow = todoTable.querySelectorAll(".todo")[currentRow];
            show(todoTableRow.getAttribute("data-item"));
            return false;
          }
        }

        // ******************************************************
        // tab through tabs
        // ******************************************************

        if(event.ctrlKey && !event.shiftKey && event.keyCode === 9) {
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
            window.api.send("startFileWatcher", [filesInTabBar[event.key-1][1]]);
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

        if(event.key === "?" && !isInputFocused()) {
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
        // toggle dark mode
        // ******************************************************

        if(event.key==="d" && !isInputFocused()) {
          triggerToggle(document.getElementById("darkmode"), true).then(function(response) {
            console.info(response);
          }).catch(function(error) {
            handleError(error);
          });
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
        // toggle completed todos
        // ******************************************************
        
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
        
        // ******************************************************
        // toggle deferred todos
        // ******************************************************

        if(event.key==="t" && !isInputFocused()) {
          // abort when onboarding is shown
          if(isOnboardingOpen()) return false;
          triggerToggle("deferredTodos").then(function(response) {
            console.info(response);
          }).catch(function(error) {
            handleError(error);
          });
          return false;
        }

        // ******************************************************
        // archive todos
        // ******************************************************

        if(event.key==="a" && !isInputFocused()) {
          // abort when onboarding is shown
          if(isOnboardingOpen()) return false;
          // abort when no completed todos are present
          if(items.complete.length===0) return false;
          // handle user confirmation and pass callback function
          getConfirmation(archiveTodos, translations.archivingPrompt);
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
        // reload window
        // ******************************************************

        if((event.key === "." || event.key === "F5") && !isInputFocused()) {
          location.reload(true);
          return false;
        }        

        // ******************************************************
        // open form
        // ******************************************************

        if(event.key==="n" && !isInputFocused() && !isOnboardingOpen()) {
          //if(isOnboardingOpen()) return false;
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

        if((event.ctrlKey || event.metaKey) && event.key === "c" && !isInputFocused()) {
          pasteItemsToClipboard(items.filtered);
          return false;
        }

        // ******************************************************
        // close file tab or window
        // ******************************************************

        if((event.ctrlKey || event.metaKey) && event.key === "w") {

          // get active file
          const index = userData.files.findIndex(file => file[0] === 1);

          // if all files are removed from tab bar, window will be closed
          if(index < 1) window.api.send("closeWindow");

          // remove active file from tab bar
          removeFileFromList(index, false).then(function(response) {
            console.info(response);
          }).catch(function(error) {
            handleError(error);
          });
          
          return false;
        }        

    });

    return Promise.resolve("Success: Keyboard shortcuts registered");

  } catch(error) {
    error.functionName = registerShortcuts.name;
    return Promise.reject(error);
  }
}