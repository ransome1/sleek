"use strict";
import { modal, userData, _paq } from "../render.js";

function showTab(tab) {
  contentTabsCards.forEach(function(el) {
    el.classList.remove("is-active");
  });
  document.getElementById(tab).classList.add("is-active");
}
function showContent(section) {
  try {
    // in case a content window was open, it will be closed
    modal.forEach(function(el) {
      el.classList.remove("is-active");
    });
    contentTabs.forEach(function(el) {
      el.classList.remove("is-active");
    });
    contentTabsCards.forEach(function(el) {
      el.classList.remove("is-active");
    });
    let firstTab = section.querySelector(".tabs");
    firstTab.firstElementChild.firstElementChild.classList.add("is-active");
    let firstSection = section.querySelector("section");
    firstSection.classList.add("is-active");
    section.classList.add("is-active");
    section.focus();
    return Promise.resolve("Info: Content is shown");
  } catch(error) {
    error.functionName = showContent.name;
    return Promise.reject(error);
  }
}
const contentTabs = document.querySelectorAll('.modal.content ul li');
const contentTabsCards = document.querySelectorAll('.modal.content section');
contentTabs.forEach(el => el.addEventListener("click", function() {
  contentTabs.forEach(function(el) {
    el.classList.remove("is-active");
  });
  this.classList.add("is-active");
  showTab(this.classList[0]);
  // trigger matomo event
  if(userData.matomoEvents) _paq.push(["trackEvent", "Content", "Click on " + this.firstElementChild.innerHTML, this.classList[0]]);
}));

export { showContent };
