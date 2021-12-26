import { userData, appData, translations } from "../render.js";
import { showContent } from "./content.mjs";
import { show } from "./form.mjs";
import { _paq } from "./matomo.mjs";

const navBtnAddTodo = document.getElementById("navBtnAddTodo");
const navBtnHelp = document.getElementById("navBtnHelp");
const navBtnSettings = document.getElementById("navBtnSettings");
const navBtnView = document.getElementById("navBtnView");
const versionNumber = document.getElementById("versionNumber");

navBtnHelp.firstElementChild.setAttribute("title", translations.help);
navBtnSettings.firstElementChild.setAttribute("title", translations.settings);
navBtnView.firstElementChild.setAttribute("title", translations.view);
versionNumber.innerHTML = appData.version;
navBtnAddTodo.setAttribute("title", translations.addTodo);
navBtnAddTodo.onclick = function () {
  show();
  // trigger matomo event
  if(userData.matomoEvents) _paq.push(["trackEvent", "Menu", "Click on add todo"]);
}
navBtnHelp.onclick = function () {
  showContent("modalHelp");
  // trigger matomo event
  if(userData.matomoEvents) _paq.push(["trackEvent", "Menu", "Click on Help"]);
}
navBtnSettings.onclick = function () {
  showContent("modalSettings");
  // trigger matomo event
  if(userData.matomoEvents) _paq.push(["trackEvent", "Menu", "Click on Settings"]);
}
