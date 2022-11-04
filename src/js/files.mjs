"use strict";
import { _paq } from "./matomo.mjs";
import { appData, userData, setUserData, translations } from "../render.js";
import { createModalJail } from "./jail.mjs";
import { focusRow } from "./keyboard.mjs";
import { handleError } from "./helper.mjs";
import { resetFilters } from "./filters.mjs";
import { showOnboarding } from "./onboarding.mjs";

const btnFilesCancel = document.getElementById("btnFilesCancel");
// const btnFilesCreateTodoFile = document.getElementById("btnFilesCreateTodoFile");
// const btnFilesOpenTodoFile = document.getElementById("btnFilesOpenTodoFile");
const btnNoResultContainerResetFilters = document.getElementById("btnNoResultContainerResetFilters");
const fileTabBar = document.getElementById("fileTabBar");
const fileTabBarList = document.querySelector("#fileTabBar ul");
const modalChangeFileTable = document.getElementById("modalChangeFileTable");
const modalFileDrop = document.querySelectorAll(".modalFileDrop");

btnFilesCancel.innerHTML = translations.cancel;

btnNoResultContainerResetFilters.onclick = function() {
  resetFilters(true);
  // trigger matomo event
  if(userData.matomoEvents) _paq.push(["trackEvent", "No Result Container", "Click on reset button"])
}

modalFileDrop.forEach(function(modal) {

  const spanFilesOpenTodoFile = modal.querySelector(".spanFilesOpenTodoFile");
  const spanFilesCreateTodoFile = modal.querySelector(".spanFilesCreateTodoFile");
  const btnFilesOpenTodoFile = modal.querySelector(".btnFilesOpenTodoFile");
  const btnFilesCreateTodoFile = modal.querySelector(".btnFilesCreateTodoFile");
  let modalChangeFileAdd = modal.querySelector(".modalChangeFileAdd");

  spanFilesOpenTodoFile.innerHTML = translations.openFile;
  spanFilesCreateTodoFile.innerHTML = translations.createFile;
  modalChangeFileAdd.innerHTML = translations.dragDropFile;

  btnFilesCreateTodoFile.onclick = function() {
    window.api.send("openOrCreateFile", ["create"]);
    // trigger matomo event
    if(userData.matomoEvents) _paq.push(["trackEvent", "Change-Modal", "Click on Create file"]);
  }

  btnFilesOpenTodoFile.onclick = function() {
    window.api.send("openOrCreateFile", ["open"]);
    // trigger matomo event
    if(userData.matomoEvents) _paq.push(["trackEvent", "Change-Modal", "Click on Open file"]);
  }

  modal.addEventListener("drop", (event) => {
    event.preventDefault();
    event.stopPropagation();
    for(const f of event.dataTransfer.files) {
      window.api.send("openOrCreateFile", ["add", f.path]);
      modal.classList.remove("is-highlighted");
    }
  });
  modal.addEventListener("dragover", (event) => {
    event.preventDefault();
    event.stopPropagation();
    modal.classList.add("is-highlighted");
  });
  modal.addEventListener("dragleave", (event) => {
    event.preventDefault();
    event.stopPropagation();
    modal.classList.remove("is-highlighted");
  });
})

function removeFileFromList(index, removeFile) {
  try {

    // empty tab bar on each run
    fileTabBarList.innerHTML = null;

    // hide tab bar on each run
    fileTabBar.classList.remove("is-active");

    // ******************************************************
    // remove file from files list
    // ******************************************************

    if(removeFile) {

      // remove file from array
      userData.files.splice(index, 1);

      setUserData("files", userData.files).then(response => {
        console.info(response);
      }).catch(error => {
        handleError(error);
      });

      if(userData.files.length === 0) {
        showOnboarding(true).then(response => {
          console.info(response);
        }).catch(error => {
          handleError(error);
        });
        return Promise.resolve("Info: No files available, showing onboarding");
      }
      
    // ******************************************************
    // remove file from tab bar
    // ******************************************************

    } else {

      // remove active flag from file
      userData.files[index][0] = 0;
      // remove tab bar flag from file
      userData.files[index][2] = 0;
    }

    // search for the first file that is suppose to be shown in tab bar
    let newIndex = userData.files.findIndex(file => {
      return file[2] === 1;
    });

    // if no tab bar file is found, the first file in array will be chosen
    if(newIndex === -1) newIndex = 0

    setUserData("files", userData.files).then(response => {
      console.info(response);
    }).catch(error => {
      handleError(error);
    });

    generateFileList(true).then(response => {
      console.info(response);
    }).catch(error => {
      handleError(error);
    });

    window.api.send("startFileWatcher", userData.files[newIndex][1]);

    return Promise.resolve("Success: File removed from tab");

  } catch (error) {
    return Promise.reject(error);
  }
}

function selectFileFromList(index) {
  try {

    // close file changer window
    modalChangeFile.classList.remove("is-active");

    // throw false at this function and current row will be reset
    focusRow(false);
    
    // load new file
    window.api.send("startFileWatcher", userData.files[index][1]);
    
    return Promise.resolve("Success: File selected");
  
  } catch (error) {
    return Promise.reject(error);
  }
}

async function generateFileTabs() {
  try {

    // empty tab bar on each run
    fileTabBarList.innerHTML = null;

    // hide tab bar on each run
    fileTabBar.classList.remove("is-active");

    // cancel function in case no tab bar needs to be built
    if(!userData.fileTabs || userData.files.length <= 1) return Promise.resolve("Info: No tab bar is being built");

    for(let i = 0; i < userData.files.length; i++) {

      // don't build tab
      if(userData.files[i][2] === 0) continue;

      const isActive = userData.files[i][0];
      const listItem = document.createElement("li");

      // extract filename only
      let fileName;
      (appData.os === "windows") ? fileName = userData.files[i][1].split("\\").pop() : fileName = userData.files[i][1].split("/").pop();

      // add file name only to the tab
      listItem.innerHTML = fileName;

      // prepare close icon      
      const closeIcon = document.createElement("i");
      closeIcon.classList.add("fas", "fa-times");
      closeIcon.onclick = function() {
        removeFileFromList(i, false).then(response => {
          console.info(response);
        }).catch(error => {
          handleError(error);
        });
        // trigger matomo event
        if(userData.matomoEvents) _paq.push(["trackEvent", "File-Tab", "Click on remove icon"]);
      }

      // append close icon to tab
      listItem.appendChild(closeIcon);

      // add "highlighting" style
      if(isActive) listItem.classList.add("is-highlighted")

      // add onclick for file selection
      listItem.onclick = function(event) {
        if(event.target.classList.contains("fas")) return false;
        selectFileFromList(i).then(function(response) {
          console.info(response);
        }).catch(function(error) {
          handleError(error);
        });
        // trigger matomo event
        if(userData.matomoEvents) _paq.push(["trackEvent", "File-Tab", "Click on tab"]);
      }

      // apeend item to tab bar
      fileTabBarList.appendChild(listItem);  
    }

    // if tab bar has more than 1 tab, it is shown
    if(fileTabBarList.children.length > 1) fileTabBar.classList.add("is-active")
    
    return Promise.resolve("Success: File tabs have been built");

  } catch (error) {
    return Promise.reject(error);
  }
}

async function generateFileList(show) {
  try {

    // cancel if there are no files
    if(userData.files.length === 0) return Promise.resolve("Info: No files available, no file chooser modal is being shown");
    
    // clean up file modal
    modalChangeFileTable.innerHTML = null;

    // present the modal
    if(show !== false) modalChangeFile.classList.add("is-active");
  
    // loop through all saved files
    for (let i = 0; i < userData.files.length; i++) {

      // build the table
      let row = modalChangeFileTable.insertRow(-1);
      let cell1 = row.insertCell(0);
      let cell2 = row.insertCell(1);
      let cell3 = row.insertCell(2);

      // if file is active the select button will be disabled
      if(userData.files[i][0]===1) {
        cell1.innerHTML = "<button disabled>" + translations.selected + "</button>";
      } else {
        cell1.innerHTML = "<button tabindex=\"0\">" + translations.select + "</button>";
        cell1.onclick = function() {
          selectFileFromList(i).then(function(response) {
            console.info(response);
          }).catch(function(error) {
            handleError(error);
          });
          // trigger matomo event
          if(userData.matomoEvents) _paq.push(["trackEvent", "File-Chooser", "Click on select button"]);
        }
      }

      // add full path and filename to 2nd column
      cell2.innerHTML = userData.files[i][1];

      // add the remove button
      cell3.innerHTML = "<a href=\"#\" tabindex=\"0\"><i class=\"fas fa-minus-circle\"></i></a>";
      cell3.title = translations.delete;
      cell3.onclick = function() {
        
        // remove file from user preferences
        removeFileFromList(i, true).then(response => {
          console.info(response);
        }).catch(error => {
          handleError(error);
        });

        // trigger matomo event
        if(userData.matomoEvents) _paq.push(["trackEvent", "File-Chooser", "Click on remove button"]);
      }
    }

    // create a jail for the modal
    createModalJail(modalChangeFile).then(response => {
      console.info(response);
    }).catch(error => {
      handleError(error);
    });

    return Promise.resolve("Success: File changer modal built and opened");

  } catch (error) {
    return Promise.reject(error);
  }
}

export { generateFileList, generateFileTabs, removeFileFromList };
