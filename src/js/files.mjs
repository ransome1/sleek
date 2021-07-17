"use strict";
import { resetFilters, resetModal, handleError, userData, setUserData, translations, getConfirmation } from "../render.js";
import { _paq } from "./matomo.mjs";
import { createModalJail } from "../configs/modal.config.mjs";

const btnOpenTodoFile = document.getElementById("btnOpenTodoFile");
const modalChangeFile = document.getElementById("modalChangeFile");
const modalChangeFileTable = document.getElementById("modalChangeFileTable");
const fileTabBarList = document.querySelector("#fileTabBar ul");

function removeFileFromList(filePath, files) {
  try {
    // remove file from files array
    files = files.filter(function(file) {
      return file[1] != filePath;
    });
    // persist new files array
    setUserData("files", files);
    // reset everything and load again
    resetFilters().then(function(response) {
      console.info(response);
    }).catch(function(error) {
      handleError(error);
    });
    return Promise.resolve("Success: File removed from list: " + filePath);
  } catch (error) {
    return Promise.reject(error);
  }
}

function selectFileFromList(file) {
  try {
    resetFilters().then(function(response) {
      console.info(response);
    }).catch(function(error) {
      handleError(error);
    });
    resetModal().then(response => {
      window.api.send("startFileWatcher", file);
      console.info(response);
    }).catch(error => {
      handleError(error);
    });
    return Promise.resolve("Success: File selected from list: " + file);
  } catch (error) {
    return Promise.reject(error);
  }
}

function generateFileTabs() {
  let files = userData.files;
  if(files.length>1 && userData.fileTabs) {
    fileTabBar.classList.add("is-active");
  } else {
    fileTabBar.classList.remove("is-active");
    return false;
  }
  fileTabBarList.innerHTML = null;
  for (let file in files) {
    const isActive = files[file][0];
    const filePath = files[file][1];
    const fileName = files[file][1].split("/").pop();
    let listItem = document.createElement("li");
    listItem.innerHTML = fileName;
    listItem.innerHTML += "<i class=\"fas fa-minus-circle\"></i>";
    if(isActive===1) {
      listItem.classList.add("is-highlighted");
    } else {
      // only add remove button to not selected ones to reduce complexity
      listItem.querySelector("i").onclick = function() {
        getConfirmation(removeFileFromList, translations.fileRemovalPrompt, filePath, files);
      }
    }
    listItem.onclick = function(event) {
      // if click was on minus circle function is aborted
      if(event.target.classList.contains("fas")) return false;
      // just send the new file to filewatcher
      selectFileFromList(filePath).then(function(response) {
        console.info(response);
      }).catch(function(error) {
        handleError(error);
      });
      // trigger matomo event
      if(userData.matomoEvents) _paq.push(["trackEvent", "File-Tab", "Click on tab"]);
    }
    fileTabBarList.appendChild(listItem);
  }
}

function showFiles() {
  try {
    let files = userData.files;
    modalChangeFile.classList.add("is-active");
    modalChangeFile.focus();
    modalChangeFileTable.innerHTML = null;
    modalChangeFileTable.classList.add("files");
    for (let file in files) {
      // skip if file doesn't exist
      let row = modalChangeFileTable.insertRow(-1);
      let cell1 = row.insertCell(0);
      let cell2 = row.insertCell(1);
      let cell3 = row.insertCell(2);
      row.setAttribute("data-path", files[file][1]);
      if(files[file][0]===1) {
        cell1.innerHTML = "<button disabled>" + translations.selected + "</button>";
      } else {
        cell1.innerHTML = "<button tabindex=\"0\">" + translations.select + "</button>";
        cell1.onclick = function() {
          // just send the new file to filewatcher
          selectFileFromList(this.parentElement.getAttribute("data-path")).then(function(response) {
            console.info(response);
          }).catch(function(error) {
            handleError(error);
          });
          // trigger matomo event
          if(userData.matomoEvents) _paq.push(["trackEvent", "File", "Click on select button"]);
        }
        cell3.innerHTML = "<a href=\"#\" tabindex=\"0\"><i class=\"fas fa-minus-circle\"></i></a>";
        cell3.title = translations.delete;
        cell3.onclick = async function() {
          await getConfirmation(removeFileFromList, translations.fileRemovalPrompt, this.parentElement.getAttribute("data-path"), files);
          showFiles().then(response => {
            console.info(response);
          }).catch(error => {
            handleError(error);
          });
        }
      }
      cell2.innerHTML = files[file][1];
    }
    // create the modal jail, so tabbing won't leave modal
    createModalJail(modalChangeFile);
    return Promise.resolve("Success: File changer modal built and opened");
  } catch (error) {
    return Promise.reject(error);
  }
}

btnOpenTodoFile.onclick = function() {
  if(typeof userData.files === "object" && userData.files.length>0) {
    showFiles().then(response => {
      console.info(response);
    }).catch(error => {
      handleError(error);
    });
  } else {
    window.api.send("openOrCreateFile", "open");
  }
  // trigger matomo event
  if(userData.matomoEvents) _paq.push(["trackEvent", "Menu", "Click on Files"]);
}

export { generateFileTabs };
