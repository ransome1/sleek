"use strict";
import { _paq } from "./matomo.mjs";
import { generateFileList } from "./files.mjs";
import { handleError } from "./helper.mjs";
import { show } from "./form.mjs";
import { showDrawer } from "./drawer.mjs";
import { showModal } from "./content.mjs";
import { userData, appData, translations } from "../render.js";

const navBtnAddTodo = document.getElementById("navBtnAddTodo");
const navBtnFilter = document.getElementById("navBtnFilter");
const navBtnHelp = document.getElementById("navBtnHelp");
const navBtnOpenTodoFile = document.getElementById("navBtnOpenTodoFile");
const navBtnSettings = document.getElementById("navBtnSettings");
const navBtnView = document.getElementById("navBtnView");
const versionNumber = document.getElementById("versionNumber");

navBtnAddTodo.setAttribute("title", translations.addTodo);
navBtnFilter.firstElementChild.setAttribute("title", translations.toggleFilter);
navBtnHelp.firstElementChild.setAttribute("title", translations.help);
navBtnSettings.firstElementChild.setAttribute("title", translations.settings);
navBtnView.firstElementChild.setAttribute("title", translations.view);
navBtnOpenTodoFile.firstElementChild.setAttribute("title", translations.openFile);
versionNumber.innerHTML = appData.version;

navBtnAddTodo.onclick = function () {
  show().then(function(response) {
    console.info(response);
  }).catch(function(error) {
    handleError(error);
  });
  // trigger matomo event
  if(userData.matomoEvents) _paq.push(["trackEvent", "Menu", "Click on add todo"]);
}

navBtnFilter.onclick = function() {
  showDrawer(this).then(function(response) {
    console.log(response);
  }).catch(function(error) {
    handleError(error);
  });
  // trigger matomo event
  if(userData.matomoEvents) _paq.push(["trackEvent", "Menu", "Click on filter"]);
}

navBtnView.onclick = function() {
  showDrawer(this).then(function(response) {
    console.log(response);
  }).catch(function(error) {
    handleError(error);
  });
  // trigger matomo event
  if(userData.matomoEvents) _paq.push(["trackEvent", "Menu", "Click on view"]);
}

navBtnOpenTodoFile.onclick = function() {
  if(typeof userData.files === "object" && userData.files.length > 0) {
    generateFileList(true).then(response => {
      console.info(response);
    }).catch(error => {
      handleError(error);
    });
  } else {
    window.api.send("openOrCreateFile", ["open"]);
  }
  // trigger matomo event
  if(userData.matomoEvents) _paq.push(["trackEvent", "Menu", "Click on Files"]);
}

navBtnSettings.onclick = function() {
  showModal("modalSettings").then(function(response) {
    console.info(response);
  }).catch(function(error) {
    handleError(error);
  });
  // trigger matomo event
  if(userData.matomoEvents) _paq.push(["trackEvent", "Menu", "Click on Settings"]);
}

navBtnHelp.onclick = function() {
  showModal("modalHelp").then(function(response) {
    console.info(response);
  }).catch(function(error) {
    handleError(error);
  });
  // trigger matomo event
  if(userData.matomoEvents) _paq.push(["trackEvent", "Menu", "Click on Help"]);
}