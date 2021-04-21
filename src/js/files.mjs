"use strict";
import { _paq } from "./matomo.mjs";
import { appData, userData, getUserData, setUserData, translations } from "../render.js";
import { createModalJail } from "./jail.mjs";
import { focusRow } from "./keyboard.mjs";
import { resetFilters } from "./filters.mjs";
import { resetModal, handleError } from "./helper.mjs";
import { showOnboarding } from "./onboarding.mjs";

const fileTabBar = document.getElementById("fileTabBar");
const fileTabBarList = document.querySelector("#fileTabBar ul");
const modalChangeFile = document.getElementById("modalChangeFile");
const modalChangeFileCreate = document.getElementById("modalChangeFileCreate");
const modalChangeFileOpen = document.getElementById("modalChangeFileOpen");
const modalChangeFileTable = document.getElementById("modalChangeFileTable");

modalChangeFileCreate.innerHTML = translations.createFile;
modalChangeFileOpen.innerHTML = translations.openFile;

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
    if(newIndex === -1) {
      newIndex = 0;
    }

    // add active flag from file
    //userData.files[newIndex][0] = 1;
    // add tab bar flag from file
    //userData.files[newIndex][2] = 1;

    setUserData("files", userData.files).then(response => {
      console.info(response);
    }).catch(error => {
      handleError(error);
    });

    window.api.send("startFileWatcher", [userData.files[newIndex][1], 1]);

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
    window.api.send("startFileWatcher", [userData.files[index][1], 1]);
    
    return Promise.resolve("Success: File selected");
  
  } catch (error) {
    return Promise.reject(error);
  }
}

function generateFileTabs() {
  try {

    // empty tab bar on each run
    fileTabBarList.innerHTML = null;

    // hide tab bar on each run
    fileTabBar.classList.remove("is-active");

    const filesForTabBar = userData.files.filter(file => {
      return file[2] === 1;
    });

    // cancel function in case no tab bar needs to be built
    if(!userData.fileTabs || filesForTabBar.length <= 1) return Promise.resolve("Info: No tab bar is being built");

    // show tab bar if there is more than 1 file
    fileTabBar.classList.add("is-active");
    for (let i = 0; i < filesForTabBar.length; i++) {

      const isActive = filesForTabBar[i][0];
      const listItem = document.createElement("li");
      // extract filename only
      let fileName;
      (appData.os === "windows") ? fileName = filesForTabBar[i][1].split("\\").pop() : fileName = filesForTabBar[i][1].split("/").pop();

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
      if(isActive) {
       listItem.classList.add("is-highlighted");
      } else {
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
      }

      // apeend item to tab bar
      fileTabBarList.appendChild(listItem);
      
    }
    
    return Promise.resolve("Success: File tabs have been built");

  } catch (error) {
    return Promise.reject(error);
  }
}

async function generateFileList() {
  try {

    // cancel if there are no files
    if(userData.files.length === 0) return Promise.resolve("Info: No files available, no file chooser modal is being shown");
    
    // clean up file modal
    modalChangeFileTable.innerHTML = null;

    // present the modal
    modalChangeFile.classList.add("is-active");

    // create a jail for the modal
    createModalJail(modalChangeFile).then(response => {
      console.info(response);
    }).catch(error => {
      handleError(error);
    });
    
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

    return Promise.resolve("Success: File changer modal built and opened");

  } catch (error) {
    return Promise.reject(error);
  }
}

export { generateFileList, generateFileTabs, removeFileFromList };
