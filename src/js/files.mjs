"use strict";
import { resetFilters, resetModal, handleError, userData, setUserData, translations } from "../render.js";
import { _paq } from "./matomo.mjs";
import { createModalJail } from "../configs/modal.config.mjs";

const btnOpenTodoFile = document.getElementById("btnOpenTodoFile");
const modalChangeFile = document.getElementById("modalChangeFile");
const modalChangeFileTable = document.getElementById("modalChangeFileTable");

function showFiles() {
  try {
    let files = userData.files;
    modalChangeFile.classList.add("is-active");
    modalChangeFile.focus();
    modalChangeFileTable.innerHTML = null;
    for (let file in files) {
      // skip if file doesn't exist
      modalChangeFileTable.classList.add("files");
      let row = modalChangeFileTable.insertRow(0);
      let cell1 = row.insertCell(0);
      let cell2 = row.insertCell(1);
      let cell3 = row.insertCell(2);
      row.setAttribute("data-path", files[file][1]);
      if(files[file][0]===1) {
        cell1.innerHTML = "<button disabled>" + translations.selected + "</button>";
      } else {
        cell1.innerHTML = "<button tabindex=\"0\">" + translations.select + "</button>";
        cell1.onclick = function() {
          resetFilters().then(function(response) {
            console.info(response);
          }).catch(function(error) {
            handleError(error);
          });
          resetModal().then(response => {
            window.api.send("startFileWatcher", this.parentElement.getAttribute("data-path"));
            console.info(response);
          }).catch(error => {
            handleError(error);
          });
          // trigger matomo event
          if(userData.matomoEvents) _paq.push(["trackEvent", "File", "Click on select button"]);
        }
        cell3.innerHTML = "<a href=\"#\" tabindex=\"0\"><i class=\"fas fa-minus-circle\"></i></a>";
        cell3.title = translations.delete;
        cell3.onclick = function() {
          let path = this.parentElement.getAttribute("data-path");
          // remove file from files array
          files = files.filter(function(file) {
            return file[1] != path;
          });
          // persist new files array
          setUserData("files", files);
          // after array is updated, open the modal again
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
