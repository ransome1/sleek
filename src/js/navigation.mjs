"use strict";
import { userData, appData, translations } from "../render.js";
import { showModal } from "./content.mjs";
import { showDrawer } from "./drawer.mjs";
import { show } from "./form.mjs";
import { _paq } from "./matomo.mjs";
import { handleError } from "./helper.mjs";

const navBtnAddTodo = document.getElementById("navBtnAddTodo");
const navBtnFilter = document.getElementById("navBtnFilter");
const navBtnView = document.getElementById("navBtnView");
const navBtnSettings = document.getElementById("navBtnSettings");
const navBtnHelp = document.getElementById("navBtnHelp");
const versionNumber = document.getElementById("versionNumber");

navBtnAddTodo.setAttribute("title", translations.addTodo);
navBtnHelp.firstElementChild.setAttribute("title", translations.help);
navBtnSettings.firstElementChild.setAttribute("title", translations.settings);
navBtnFilter.firstElementChild.setAttribute("title", translations.filter);
navBtnView.firstElementChild.setAttribute("title", translations.view);
versionNumber.innerHTML = appData.version;

// define the click events for all navigation elements
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
  showDrawer(this, this.getAttribute("data-drawer")).then(function(result) {
    console.log(result);
  }).catch(function(error) {
    handleError(error);
  });
  // trigger matomo event
  if(userData.matomoEvents) _paq.push(["trackEvent", "Menu", "Click on filter"]);
}
navBtnView.onclick = function() {
  showDrawer(this, this.getAttribute("data-drawer")).then(function(result) {
    console.log(result);
  }).catch(function(error) {
    handleError(error);
  });
  // trigger matomo event
  if(userData.matomoEvents) _paq.push(["trackEvent", "Menu", "Click on view"]);
}
navBtnSettings.onclick = function () {
  showModal("modalSettings").then(function(response) {
    console.info(response);
  }).catch(function(error) {
    handleError(error);
  });
  // trigger matomo event
  if(userData.matomoEvents) _paq.push(["trackEvent", "Menu", "Click on Settings"]);
}
navBtnHelp.onclick = function () {
  showModal("modalHelp").then(function(response) {
    console.info(response);
  }).catch(function(error) {
    handleError(error);
  });
  // trigger matomo event
  if(userData.matomoEvents) _paq.push(["trackEvent", "Menu", "Click on Help"]);
}