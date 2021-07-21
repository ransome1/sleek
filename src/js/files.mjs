"use strict";
import { resetFilters, resetModal, handleError, userData, appData, setUserData, translations } from "../render.js";
import { _paq } from "./matomo.mjs";
import { createModalJail } from "../configs/modal.config.mjs";

const btnOpenTodoFile = document.getElementById("btnOpenTodoFile");
const modalChangeFile = document.getElementById("modalChangeFile");
const modalChangeFileTable = document.getElementById("modalChangeFileTable");
const fileTabBarList = document.querySelector("#fileTabBar ul");

function removeFileFromList(isActive, index) {
  try {
    if(isActive && index-1 === -1) {
      userData.files[index+1][0] = 1;
    } else if(isActive && index-1 >= 0) {
      userData.files[index-1][0] = 1;
    }
    userData.files.splice(index, 1);
    setUserData("files", userData.files);
    resetFilters(true).then(function(response) {
      console.info(response);
      index = userData.files.findIndex(file => file[0] === 1);
      window.api.send("startFileWatcher", userData.files[index][1]);
    }).catch(function(error) {
      handleError(error);
    });
    return Promise.resolve("Success: File removed from list");
  } catch (error) {
    return Promise.reject(error);
  }
}

function selectFileFromList(index) {
  try {
    resetFilters(false).then(function(response) {
      console.info(response);
    }).catch(function(error) {
      handleError(error);
    });
    resetModal().then(response => {
      window.api.send("startFileWatcher", userData.files[index][1]);
      console.info(response);
    }).catch(error => {
      handleError(error);
    });
    return Promise.resolve("Success: File selected");
  } catch (error) {
    return Promise.reject(error);
  }
}

function generateFileList() {
  try {
    if(userData.files.length>1 && userData.fileTabs) {
      fileTabBar.classList.add("is-active");
    } else {
      fileTabBar.classList.remove("is-active");
    }
    fileTabBarList.innerHTML = null;
    modalChangeFileTable.innerHTML = null;
    modalChangeFileTable.classList.add("files");
    for (let i = 0; i < userData.files.length; i++) {
      let isActive = userData.files[i][0];
      let fileName = userData.files[i][1].split("/").pop();
      if(appData.os === "windows") fileName = userData.files[i][1].split("\\").pop();
      let listItem = document.createElement("li");
      listItem.innerHTML = fileName;
      listItem.innerHTML += "<i class=\"fas fa-minus-circle\"></i>";
      if(isActive===1) listItem.classList.add("is-highlighted");
      listItem.querySelector("i").onclick = function() {
        removeFileFromList(isActive, i);
        // trigger matomo event
        if(userData.matomoEvents) _paq.push(["trackEvent", "File-Tab", "Click on remove icon"]);
      }
      if(!isActive) {
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
      fileTabBarList.appendChild(listItem);
      let row = modalChangeFileTable.insertRow(-1);
      let cell1 = row.insertCell(0);
      let cell2 = row.insertCell(1);
      let cell3 = row.insertCell(2);
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
      cell2.innerHTML = userData.files[i][1];
      cell3.innerHTML = "<a href=\"#\" tabindex=\"0\"><i class=\"fas fa-minus-circle\"></i></a>";
      cell3.title = translations.delete;
      cell3.onclick = function() {
        removeFileFromList(isActive, i);
        generateFileList().then(response => {
          modalChangeFile.classList.add("is-active");
          modalChangeFile.focus();
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

btnOpenTodoFile.onclick = function() {
  if(typeof userData.files === "object" && userData.files.length>0) {
    generateFileList().then(response => {
      console.info(response);
      modalChangeFile.classList.add("is-active");
      modalChangeFile.focus();
      createModalJail(modalChangeFile);
    }).catch(error => {
      handleError(error);
    });
  } else {
    window.api.send("openOrCreateFile", "open");
  }
  // trigger matomo event
  if(userData.matomoEvents) _paq.push(["trackEvent", "Menu", "Click on Files"]);
}

export { generateFileList, removeFileFromList };
